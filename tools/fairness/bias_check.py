"""
Bias Check Wrapper for basic fairness metrics.

Drop-in module to compute group fairness metrics given labels/predictions and a sensitive attribute.

Usage (Python):
    from bias_check import BiasReport
    report = BiasReport.from_arrays(
        y_true=[0,1,1,0,1,0,1,0],
        y_pred=[0,1,0,0,1,0,1,1],
        sensitive=["A","A","B","B","A","B","A","B"],
        positive_label=1,
    )
    print(report.to_pretty())

Usage (CLI):
    python bias_check.py --csv data.csv --y_true col_true --y_pred col_pred --sensitive col_group

If your model produced scores/probabilities instead of hard predictions, pass --y_score and a --threshold.

Notes:
- Works with any number of sensitive groups (binary or multi-group).
- Handles division-by-zero edge cases gracefully.
- No heavy dependencies; requires numpy and pandas only.
- Designed to be easy to slot into CI or notebooks. Outputs JSON for machines and pretty tables for humans.

Intended for contribution to https://github.com/Hyraze/collective-ai-tools as a small, focused utility.
"""
from __future__ import annotations

import argparse
import json
from dataclasses import dataclass, field
from typing import Any, Dict, Iterable, List, Mapping, Optional

import numpy as np
import pandas as pd


# -----------------------------
# Helpers
# -----------------------------

def _safe_div(n: float, d: float) -> float:
    return float(n) / float(d) if float(d) != 0 else float("nan")


def _as_series(x: Iterable[Any], name: str) -> pd.Series:
    s = pd.Series(list(x), name=name)
    return s


# -----------------------------
# Core per-group metrics
# -----------------------------

@dataclass
class GroupMetrics:
    group: Any
    count: int
    positive_rate: float  # P(ŷ=1|G)
    tpr: float            # recall on positives: P(ŷ=1|Y=1,G)
    fpr: float            # false positive rate: P(ŷ=1|Y=0,G)
    ppv: float            # precision: P(Y=1|ŷ=1,G)
    tnr: float            # specificity: P(ŷ=0|Y=0,G)
    fnr: float            # miss rate: P(ŷ=0|Y=1,G)

    def as_dict(self) -> Dict[str, Any]:
        return {
            "group": self.group,
            "count": self.count,
            "selection_rate": self.positive_rate,
            "tpr": self.tpr,
            "fpr": self.fpr,
            "ppv": self.ppv,
            "tnr": self.tnr,
            "fnr": self.fnr,
        }


@dataclass
class SummaryMetrics:
    demographic_parity_difference: float  # max(sel) - min(sel)
    disparate_impact_ratio: float         # min(sel) / max(sel)
    equal_opportunity_difference: float   # max(TPR) - min(TPR)
    equalized_odds_difference: float      # max( |TPR_g - TPR_h|, |FPR_g - FPR_h| ) over g,h
    predictive_parity_difference: float   # max(PPV) - min(PPV)

    def as_dict(self) -> Dict[str, Any]:
        return {
            "demographic_parity_difference": self.demographic_parity_difference,
            "disparate_impact_ratio": self.disparate_impact_ratio,
            "equal_opportunity_difference": self.equal_opportunity_difference,
            "equalized_odds_difference": self.equalized_odds_difference,
            "predictive_parity_difference": self.predictive_parity_difference,
        }


@dataclass
class BiasReport:
    by_group: List[GroupMetrics] = field(default_factory=list)
    summary: SummaryMetrics = field(default=None)  # type: ignore
    metadata: Dict[str, Any] = field(default_factory=dict)

    # ---- Construction ----
    @classmethod
    def from_arrays(
        cls,
        y_true: Iterable[Any],
        y_pred: Optional[Iterable[Any]] = None,
        sensitive: Iterable[Any] = (),
        *,
        y_score: Optional[Iterable[float]] = None,
        threshold: Optional[float] = None,
        positive_label: Any = 1,
        group_order: Optional[List[Any]] = None,
        dropna_groups: bool = False,
    ) -> "BiasReport":
        """Build a report from arrays.

        Args:
            y_true: ground truth labels.
            y_pred: predicted labels (if already thresholded). If not provided, you must pass y_score+threshold.
            sensitive: sensitive attribute per sample (e.g., gender, race, etc.).
            y_score: predicted score/probability for the positive class.
            threshold: threshold to convert score→label (required if y_score is provided and y_pred is not).
            positive_label: which value counts as the positive class.
            group_order: optional explicit order of groups in outputs.
            dropna_groups: if True, drop rows where sensitive is missing/NaN.
        """
        y_true = _as_series(y_true, "y_true")
        if y_pred is None:
            if y_score is None or threshold is None:
                raise ValueError("Provide either y_pred, or y_score+threshold.")
            y_pred = (pd.Series(y_score, name="y_score") >= float(threshold)).astype(int)
        else:
            y_pred = _as_series(y_pred, "y_pred")
        sensitive = _as_series(sensitive, "sensitive")

        if len(y_true) != len(y_pred) or len(y_true) != len(sensitive):
            raise ValueError("y_true, y_pred/y_score, and sensitive must have the same length")

        df = pd.concat([y_true, y_pred, sensitive], axis=1)
        if dropna_groups:
            df = df[df["sensitive"].notna()]

        # Normalize to binary 0/1 wrt positive_label
        y = (df["y_true"] == positive_label).astype(int)
        yhat = (df["y_pred"] == positive_label).astype(int)
        g = df["sensitive"].astype("category")

        if group_order is not None:
            g = g.cat.set_categories(group_order, ordered=True)

        groups = list(g.cat.categories)
        by_group: List[GroupMetrics] = []

        for grp in groups:
            mask = g == grp
            n = int(mask.sum())
            if n == 0:
                continue
            yt = y[mask]
            yp = yhat[mask]

            pos_rate = _safe_div(yp.sum(), n)
            # Confusion components
            tp = int(((yp == 1) & (yt == 1)).sum())
            fp = int(((yp == 1) & (yt == 0)).sum())
            tn = int(((yp == 0) & (yt == 0)).sum())
            fn = int(((yp == 0) & (yt == 1)).sum())

            tpr = _safe_div(tp, tp + fn)
            fpr = _safe_div(fp, fp + tn)
            ppv = _safe_div(tp, tp + fp)
            tnr = _safe_div(tn, tn + fp)
            fnr = _safe_div(fn, fn + tp)

            by_group.append(GroupMetrics(
                group=grp,
                count=n,
                positive_rate=pos_rate,
                tpr=tpr,
                fpr=fpr,
                ppv=ppv,
                tnr=tnr,
                fnr=fnr,
            ))

        # Summary metrics across groups
        def span(metric: str) -> float:
            vals = np.array([getattr(m, metric) for m in by_group], dtype=float)
            if len(vals) == 0:
                return float("nan")
            return float(np.nanmax(vals) - np.nanmin(vals))

        def di_ratio() -> float:
            vals = np.array([m.positive_rate for m in by_group], dtype=float)
            if len(vals) == 0:
                return float("nan")
            mx = np.nanmax(vals)
            mn = np.nanmin(vals)
            return float(_safe_div(mn, mx))

        # Equalized odds: take the worse of TPR span and FPR span.
        eod = max(span("tpr"), span("fpr"))

        summary = SummaryMetrics(
            demographic_parity_difference=span("positive_rate"),
            disparate_impact_ratio=di_ratio(),
            equal_opportunity_difference=span("tpr"),
            equalized_odds_difference=eod,
            predictive_parity_difference=span("ppv"),
        )

        meta = {
            "n_samples": int(len(df)),
            "n_groups": int(len(by_group)),
            "positive_label": positive_label,
        }

        return cls(by_group=by_group, summary=summary, metadata=meta)

    # ---- Serialization / display ----
    def to_json(self, indent: Optional[int] = 2) -> str:
        payload = {
            "by_group": [m.as_dict() for m in self.by_group],
            "summary": self.summary.as_dict() if self.summary else None,
            "metadata": self.metadata,
        }
        return json.dumps(payload, indent=indent, default=str)

    def to_pretty(self) -> str:
        # Human-readable summary table
        rows = [m.as_dict() for m in self.by_group]
        if not rows:
            return "<no groups>"
        df = pd.DataFrame(rows)
        # Order columns for readability
        cols = [
            "group", "count", "selection_rate", "tpr", "fpr", "ppv", "tnr", "fnr",
        ]
        df = df[cols]
        with pd.option_context("display.max_rows", None, "display.max_columns", None):
            table = df.to_string(index=False, float_format=lambda v: f"{v:.4f}" if pd.notna(v) else "nan")
        summ = self.summary.as_dict() if self.summary else {}
        summ_lines = "\n".join(
            f"  - {k}: {v:.4f}" if isinstance(v, (int, float)) and not np.isnan(v) else f"  - {k}: {v}"
            for k, v in summ.items()
        )
        return (
            "Group metrics:\n" + table +
            "\n\nSummary metrics:\n" + summ_lines +
            f"\n\n(metadata: {self.metadata})"
        )


# -----------------------------
# CLI
# -----------------------------

def _cli(argv: Optional[List[str]] = None) -> int:
    p = argparse.ArgumentParser(description="Bias check wrapper: basic group fairness metrics.")
    p.add_argument("--csv", type=str, required=True, help="Path to CSV with columns.")
    p.add_argument("--y_true", type=str, required=True, help="Column with ground truth labels.")
    pred_group = p.add_mutually_exclusive_group(required=True)
    pred_group.add_argument("--y_pred", type=str, help="Column with predicted labels.")
    pred_group.add_argument("--y_score", type=str, help="Column with predicted scores/probabilities (0..1).")
    p.add_argument("--threshold", type=float, help="Threshold for scores → label (required with --y_score).")
    p.add_argument("--sensitive", type=str, required=True, help="Column with sensitive attribute (group).")
    p.add_argument("--positive_label", type=str, default="1", help="Value to treat as positive label (default '1').")
    p.add_argument("--dropna_groups", action="store_true", help="Drop rows with NaN sensitive attribute.")
    p.add_argument("--json", action="store_true", help="Output JSON instead of pretty table.")

    args = p.parse_args(argv)

    df = pd.read_csv(args.csv)
    y_true = df[args.y_true]
    y_pred = None
    y_score = None

    if args.y_pred is not None:
        y_pred = df[args.y_pred]
    else:
        if args.threshold is None:
            p.error("--threshold is required when using --y_score")
        y_score = df[args.y_score]

    sensitive = df[args.sensitive]

    # Try to coerce positive_label type to match y_true dtype where possible
    pos_label: Any = args.positive_label
    if y_true.dtype.kind in {"i", "u", "f"}:
        try:
            pos_label = type(y_true.dropna().iloc[0])(float(pos_label))
        except Exception:
            pass

    report = BiasReport.from_arrays(
        y_true=y_true,
        y_pred=y_pred,
        y_score=y_score,
        threshold=args.threshold,
        sensitive=sensitive,
        positive_label=pos_label,
        dropna_groups=bool(args.dropna_groups),
    )

    if args.json:
        print(report.to_json())
    else:
        print(report.to_pretty())

    return 0


if __name__ == "__main__":
    raise SystemExit(_cli())
