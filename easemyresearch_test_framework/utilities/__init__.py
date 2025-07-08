"""Utilities package for EaseMyResearch test framework"""

from .browser_manager import BrowserManager
from .api_client import APIClient
from .test_data_manager import TestDataManager
from .screenshot_manager import ScreenshotManager
from .report_generator import ReportGenerator

__all__ = [
    'BrowserManager',
    'APIClient', 
    'TestDataManager',
    'ScreenshotManager',
    'ReportGenerator'
]
