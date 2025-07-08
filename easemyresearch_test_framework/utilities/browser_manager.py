"""
Browser Manager utility for handling different browsers and configurations
"""

import os
import logging
from typing import Dict, Any, Optional
from selenium import webdriver
from selenium.webdriver.chrome.options import Options as ChromeOptions
from selenium.webdriver.firefox.options import Options as FirefoxOptions
from selenium.webdriver.edge.options import Options as EdgeOptions
from selenium.webdriver.safari.options import Options as SafariOptions
from selenium.webdriver.chrome.service import Service as ChromeService
from selenium.webdriver.firefox.service import Service as FirefoxService
from selenium.webdriver.edge.service import Service as EdgeService
from webdriver_manager.chrome import ChromeDriverManager
from webdriver_manager.firefox import GeckoDriverManager
from webdriver_manager.microsoft import EdgeChromiumDriverManager
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities
from selenium.common.exceptions import WebDriverException

logger = logging.getLogger(__name__)

class BrowserManager:
    """
    Manages browser instances and configurations for testing
    """
    
    def __init__(self, browser_name: str = "chrome", headless: bool = False, config: Dict[str, Any] = None):
        """
        Initialize browser manager
        
        Args:
            browser_name: Name of browser (chrome, firefox, edge, safari)
            headless: Whether to run in headless mode
            config: Test configuration dictionary
        """
        self.browser_name = browser_name.lower()
        self.headless = headless
        self.config = config or {}
        self.driver: Optional[webdriver.Remote] = None
        self._setup_logging()
        
    def _setup_logging(self):
        """Setup logging for browser manager"""
        self.logger = logging.getLogger(f"{__name__}.{self.browser_name}")
        
    def get_driver(self) -> webdriver.Remote:
        """
        Get WebDriver instance for the specified browser
        
        Returns:
            WebDriver instance
        """
        if self.driver is None:
            self.driver = self._create_driver()
        return self.driver
    
    def _create_driver(self) -> webdriver.Remote:
        """
        Create WebDriver instance based on browser configuration
        
        Returns:
            WebDriver instance
        """
        try:
            if self.browser_name == "chrome":
                return self._create_chrome_driver()
            elif self.browser_name == "firefox":
                return self._create_firefox_driver()
            elif self.browser_name == "edge":
                return self._create_edge_driver()
            elif self.browser_name == "safari":
                return self._create_safari_driver()
            else:
                raise ValueError(f"Unsupported browser: {self.browser_name}")
        except Exception as e:
            self.logger.error(f"Failed to create {self.browser_name} driver: {str(e)}")
            raise
    
    def _create_chrome_driver(self) -> webdriver.Chrome:
        """Create Chrome WebDriver instance"""
        chrome_options = ChromeOptions()
        
        # Basic options
        if self.headless:
            chrome_options.add_argument("--headless=new")
        
        # Common Chrome options for testing
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--disable-gpu")
        chrome_options.add_argument("--disable-web-security")
        chrome_options.add_argument("--allow-running-insecure-content")
        chrome_options.add_argument("--disable-extensions")
        chrome_options.add_argument("--disable-plugins")
        chrome_options.add_argument("--disable-images")
        chrome_options.add_argument("--disable-javascript")
        chrome_options.add_argument("--disable-default-apps")
        
        # Window size
        window_size = self.config.get('browser', {}).get('window_size', '1920,1080')
        chrome_options.add_argument(f"--window-size={window_size}")
        
        # User agent
        chrome_options.add_argument("--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
        
        # Performance optimizations
        chrome_options.add_argument("--memory-pressure-off")
        chrome_options.add_argument("--max_old_space_size=4096")
        
        # Disable logging
        chrome_options.add_argument("--log-level=3")
        chrome_options.add_experimental_option("excludeSwitches", ["enable-logging"])
        chrome_options.add_experimental_option('useAutomationExtension', False)
        
        # Download settings
        prefs = {
            "profile.default_content_setting_values": {
                "notifications": 2,
                "geolocation": 2,
                "media_stream": 2,
            },
            "profile.default_content_settings.popups": 0,
            "profile.managed_default_content_settings.images": 2
        }
        chrome_options.add_experimental_option("prefs", prefs)
        
        try:
            service = ChromeService(ChromeDriverManager().install())
            driver = webdriver.Chrome(service=service, options=chrome_options)
        except Exception as e:
            self.logger.warning(f"Failed to use ChromeDriverManager, trying system chrome: {e}")
            driver = webdriver.Chrome(options=chrome_options)
        
        self._configure_driver(driver)
        return driver
    
    def _create_firefox_driver(self) -> webdriver.Firefox:
        """Create Firefox WebDriver instance"""
        firefox_options = FirefoxOptions()
        
        if self.headless:
            firefox_options.add_argument("--headless")
        
        # Firefox specific options
        firefox_options.add_argument("--no-sandbox")
        firefox_options.add_argument("--disable-dev-shm-usage")
        
        # Window size
        window_size = self.config.get('browser', {}).get('window_size', '1920,1080')
        width, height = window_size.split(',')
        firefox_options.add_argument(f"--width={width}")
        firefox_options.add_argument(f"--height={height}")
        
        # Firefox preferences
        firefox_options.set_preference("dom.webnotifications.enabled", False)
        firefox_options.set_preference("media.navigator.permission.disabled", True)
        firefox_options.set_preference("permissions.default.image", 2)
        firefox_options.set_preference("permissions.default.stylesheet", 2)
        
        try:
            service = FirefoxService(GeckoDriverManager().install())
            driver = webdriver.Firefox(service=service, options=firefox_options)
        except Exception as e:
            self.logger.warning(f"Failed to use GeckoDriverManager, trying system firefox: {e}")
            driver = webdriver.Firefox(options=firefox_options)
        
        self._configure_driver(driver)
        return driver
    
    def _create_edge_driver(self) -> webdriver.Edge:
        """Create Edge WebDriver instance"""
        edge_options = EdgeOptions()
        
        if self.headless:
            edge_options.add_argument("--headless")
        
        # Edge specific options (similar to Chrome)
        edge_options.add_argument("--no-sandbox")
        edge_options.add_argument("--disable-dev-shm-usage")
        edge_options.add_argument("--disable-gpu")
        
        # Window size
        window_size = self.config.get('browser', {}).get('window_size', '1920,1080')
        edge_options.add_argument(f"--window-size={window_size}")
        
        try:
            service = EdgeService(EdgeChromiumDriverManager().install())
            driver = webdriver.Edge(service=service, options=edge_options)
        except Exception as e:
            self.logger.warning(f"Failed to use EdgeChromiumDriverManager, trying system edge: {e}")
            driver = webdriver.Edge(options=edge_options)
        
        self._configure_driver(driver)
        return driver
    
    def _create_safari_driver(self) -> webdriver.Safari:
        """Create Safari WebDriver instance"""
        if os.name != 'posix' or os.uname().sysname != 'Darwin':
            raise WebDriverException("Safari driver is only available on macOS")
        
        safari_options = SafariOptions()
        driver = webdriver.Safari(options=safari_options)
        self._configure_driver(driver)
        return driver
    
    def _configure_driver(self, driver: webdriver.Remote):
        """
        Configure common driver settings
        
        Args:
            driver: WebDriver instance to configure
        """
        # Set timeouts
        browser_config = self.config.get('browser', {})
        page_load_timeout = browser_config.get('page_load_timeout', 30)
        implicit_wait = browser_config.get('implicit_wait', 10)
        
        driver.set_page_load_timeout(page_load_timeout)
        driver.implicitly_wait(implicit_wait)
        
        # Maximize window if not headless
        if not self.headless:
            try:
                driver.maximize_window()
            except Exception as e:
                self.logger.warning(f"Failed to maximize window: {e}")
        
        self.logger.info(f"Successfully created and configured {self.browser_name} driver")
    
    def quit(self):
        """Quit the WebDriver instance"""
        if self.driver:
            try:
                self.driver.quit()
                self.logger.info(f"Successfully quit {self.browser_name} driver")
            except Exception as e:
                self.logger.error(f"Error quitting {self.browser_name} driver: {e}")
            finally:
                self.driver = None
    
    def restart(self) -> webdriver.Remote:
        """
        Restart the WebDriver instance
        
        Returns:
            New WebDriver instance
        """
        self.quit()
        return self.get_driver()
    
    def get_browser_info(self) -> Dict[str, Any]:
        """
        Get browser information
        
        Returns:
            Dictionary with browser information
        """
        if not self.driver:
            return {"error": "No driver instance available"}
        
        try:
            caps = self.driver.capabilities
            return {
                "browser_name": caps.get("browserName"),
                "browser_version": caps.get("browserVersion") or caps.get("version"),
                "platform": caps.get("platformName") or caps.get("platform"),
                "driver_version": caps.get("chrome", {}).get("chromedriverVersion", "Unknown")
            }
        except Exception as e:
            self.logger.error(f"Failed to get browser info: {e}")
            return {"error": str(e)}
    
    def take_screenshot(self, filename: str = None) -> str:
        """
        Take screenshot with the current driver
        
        Args:
            filename: Optional filename for the screenshot
            
        Returns:
            Path to the saved screenshot
        """
        if not self.driver:
            raise WebDriverException("No driver instance available for screenshot")
        
        if filename is None:
            from datetime import datetime
            filename = f"screenshot_{datetime.now().strftime('%Y%m%d_%H%M%S')}.png"
        
        # Ensure screenshots directory exists
        os.makedirs("screenshots", exist_ok=True)
        filepath = os.path.join("screenshots", filename)
        
        try:
            self.driver.save_screenshot(filepath)
            self.logger.info(f"Screenshot saved: {filepath}")
            return filepath
        except Exception as e:
            self.logger.error(f"Failed to take screenshot: {e}")
            raise