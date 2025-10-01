# README.md (for fairness tool)


## Bias Check Wrapper


This tool provides quick checks for **basic fairness metrics** across sensitive groups in ML predictions. It is designed to be lightweight (only depends on `numpy` and `pandas`) and easy to integrate into CI pipelines or Jupyter notebooks.


### Installation
```bash
pip install -r requirements.txt
```


### Python API Usage
```python
from tools.fairness import BiasReport


# Example data
y_true = [0,1,1,0,1,0,1,0]
y_pred = [0,1,0,0,1,0,1,1]
groups = ["A","A","B","B","A","B","A","B"]


report = BiasReport.from_arrays(
y_true=y_true,
y_pred=y_pred,
sensitive=groups,
positive_label=1,
)


print(report.to_pretty())
# Or for machine-readable format:
print(report.to_json())
```


### CLI Usage
```bash
python tools/fairness/bias_check.py \
--csv examples/data.csv \
--y_true actual_label \
--y_pred predicted_label \
--sensitive group_column \
--positive_label 1
```


Output will be a **pretty table** by default, or JSON if you pass `--json`.


### Metrics included
- **Per-group metrics:** selection rate, TPR, FPR, PPV, TNR, FNR
- **Summary metrics:** demographic parity difference, disparate impact ratio, equal opportunity difference, equalized odds difference, predictive parity difference


### Notes
- Works with binary or multi-group sensitive attributes.
- Handles missing groups and division-by-zero safely.
- Intended as a first step in fairness checks, not a full fairness audit.


---
