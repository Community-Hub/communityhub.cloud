"""Delivered-version browser acceptance; historical design tests remain diagnostics."""
import sys
import unittest
from pathlib import Path

root = Path(__file__).resolve().parents[1]
sys.path[:0] = [str(root / 'tests' / 'browser'), str(root / 'tests' / 'deployment')]
loader = unittest.TestLoader()
suite = loader.loadTestsFromNames([
    'test_controller_isolation',
    'test_mobile_menu_focus',
    'test_delivered_site',
])
result = unittest.TextTestRunner(verbosity=2).run(suite)
sys.exit(0 if result.wasSuccessful() else 1)
