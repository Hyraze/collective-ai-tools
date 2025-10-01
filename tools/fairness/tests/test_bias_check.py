import pandas as pd
from tools.fairness.bias_check import BiasReport

def test_simple_binary_groups():
    y_true = [0,1,1,0,1,0,1,0]
    y_pred = [0,1,0,0,1,0,1,1]
    g = ["A","A","B","B","A","B","A","B"]
    rep = BiasReport.from_arrays(y_true=y_true, y_pred=y_pred, sensitive=g)
    assert rep.metadata["n_samples"] == 8
    assert len(rep.by_group) == 2
    # sanity: selection rates in [0,1]
    for m in rep.by_group:
        assert 0.0 <= m.positive_rate <= 1.0
