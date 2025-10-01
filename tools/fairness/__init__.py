"""
Fairness tools module.

This package provides utilities for evaluating group fairness in ML models.
Currently included:
- BiasReport: a wrapper for computing basic fairness metrics from labels/predictions.
"""

from .bias_check import BiasReport

__all__ = [
    "BiasReport",
]
