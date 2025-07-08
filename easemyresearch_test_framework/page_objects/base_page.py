"""Base Page Object class for all page objects"""

import logging
from typing import List, Optional, Any
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.action_chains import ActionChains
from selenium.common.exceptions import TimeoutException, NoSuchElementException

logger = logging.getLogger(__name__)

class BasePage:
    """Base page object class with common functionality"""
    
    def __init__(self, driver: webdriver.Remote, base_url: str = ""):
        self.driver = driver
        self.base_url = base_url
        self.wait = WebDriverWait(driver, 20)
        self.logger = logging.getLogger(self.__class__.__name__)
    
    def navigate_to(self, url: str = ""):
        """Navigate to specified URL"""
        full_url = f"{self.base_url}{url}" if url else self.base_url
        self.logger.info(f"Navigating to: {full_url}")
        self.driver.get(full_url)
    
    def find_element(self, locator: tuple, timeout: int = 20):
        """Find element with explicit wait"""
        try:
            return WebDriverWait(self.driver, timeout).until(
                EC.presence_of_element_located(locator)
            )
        except TimeoutException:
            self.logger.error(f"Element not found: {locator}")
            raise
    
    def find_elements(self, locator: tuple) -> List:
        """Find multiple elements"""
        return self.driver.find_elements(*locator)
    
    def click_element(self, locator: tuple, timeout: int = 20):
        """Click element with explicit wait"""
        try:
            element = WebDriverWait(self.driver, timeout).until(
                EC.element_to_be_clickable(locator)
            )
            element.click()
            self.logger.info(f"Clicked element: {locator}")
        except TimeoutException:
            self.logger.error(f"Element not clickable: {locator}")
            raise
    
    def enter_text(self, locator: tuple, text: str, clear_first: bool = True):
        """Enter text into element"""
        element = self.find_element(locator)
        if clear_first:
            element.clear()
        element.send_keys(text)
        self.logger.info(f"Entered text '{text}' into element: {locator}")
    
    def get_text(self, locator: tuple) -> str:
        """Get text from element"""
        element = self.find_element(locator)
        return element.text
    
    def get_attribute(self, locator: tuple, attribute: str) -> str:
        """Get attribute value from element"""
        element = self.find_element(locator)
        return element.get_attribute(attribute)
    
    def is_element_present(self, locator: tuple) -> bool:
        """Check if element is present"""
        try:
            self.driver.find_element(*locator)
            return True
        except NoSuchElementException:
            return False
    
    def is_element_visible(self, locator: tuple, timeout: int = 10) -> bool:
        """Check if element is visible"""
        try:
            WebDriverWait(self.driver, timeout).until(
                EC.visibility_of_element_located(locator)
            )
            return True
        except TimeoutException:
            return False
    
    def wait_for_page_load(self, timeout: int = 30):
        """Wait for page to load completely"""
        try:
            WebDriverWait(self.driver, timeout).until(
                lambda driver: driver.execute_script("return document.readyState") == "complete"
            )
        except TimeoutException:
            self.logger.warning("Page load timeout")
    
    def scroll_to_element(self, locator: tuple):
        """Scroll to element"""
        element = self.find_element(locator)
        self.driver.execute_script("arguments[0].scrollIntoView();", element)
    
    def get_page_title(self) -> str:
        """Get current page title"""
        return self.driver.title
    
    def get_current_url(self) -> str:
        """Get current URL"""
        return self.driver.current_url
