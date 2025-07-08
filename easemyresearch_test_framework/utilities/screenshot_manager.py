"""Screenshot Manager utility for capturing and managing screenshots"""

import os
import logging
from datetime import datetime
from typing import Optional
from selenium import webdriver

logger = logging.getLogger(__name__)

class ScreenshotManager:
    """Manages screenshot capture and storage"""
    
    def __init__(self, screenshot_dir: str = "screenshots"):
        self.screenshot_dir = screenshot_dir
        self.logger = logging.getLogger(__name__)
        self._ensure_directory_exists()
    
    def _ensure_directory_exists(self):
        """Ensure screenshot directory exists"""
        os.makedirs(self.screenshot_dir, exist_ok=True)
    
    def capture_screenshot(self, driver: webdriver.Remote, filename: str = None) -> str:
        """Capture screenshot with given driver"""
        if filename is None:
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            filename = f"screenshot_{timestamp}.png"
        
        filepath = os.path.join(self.screenshot_dir, filename)
        
        try:
            driver.save_screenshot(filepath)
            self.logger.info(f"Screenshot saved: {filepath}")
            return filepath
        except Exception as e:
            self.logger.error(f"Failed to capture screenshot: {e}")
            raise
    
    def capture_failure_screenshot(self, driver: webdriver.Remote, test_name: str) -> str:
        """Capture screenshot for test failure"""
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"failure_{test_name}_{timestamp}.png"
        return self.capture_screenshot(driver, filename)
    
    def capture_element_screenshot(self, element, filename: str = None) -> str:
        """Capture screenshot of specific element"""
        if filename is None:
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            filename = f"element_{timestamp}.png"
        
        filepath = os.path.join(self.screenshot_dir, filename)
        
        try:
            element.screenshot(filepath)
            self.logger.info(f"Element screenshot saved: {filepath}")
            return filepath
        except Exception as e:
            self.logger.error(f"Failed to capture element screenshot: {e}")
            raise
