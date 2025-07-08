"""
Main conftest.py file for easemyresearch.com test framework
Contains shared fixtures, configurations, and test setup/teardown
"""

import os
import json
import yaml
import pytest
import logging
from datetime import datetime
from typing import Dict, Any, Generator
from selenium import webdriver
from selenium.webdriver.chrome.options import Options as ChromeOptions
from selenium.webdriver.firefox.options import Options as FirefoxOptions
from selenium.webdriver.edge.options import Options as EdgeOptions
from webdriver_manager.chrome import ChromeDriverManager
from webdriver_manager.firefox import GeckoDriverManager
from webdriver_manager.microsoft import EdgeChromiumDriverManager
from selenium.webdriver.chrome.service import Service as ChromeService
from selenium.webdriver.firefox.service import Service as FirefoxService
from selenium.webdriver.edge.service import Service as EdgeService

# Import utilities
from utilities.browser_manager import BrowserManager
from utilities.test_data_manager import TestDataManager
from utilities.api_client import APIClient
from utilities.screenshot_manager import ScreenshotManager

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/test_execution.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Configuration loading
def load_config() -> Dict[str, Any]:
    """Load test configuration from YAML files"""
    config_path = os.path.join(os.path.dirname(__file__), 'config', 'test_config.yaml')
    with open(config_path, 'r') as file:
        return yaml.safe_load(file)

def load_environment_config(environment: str = None) -> Dict[str, Any]:
    """Load environment-specific configuration"""
    env_config_path = os.path.join(os.path.dirname(__file__), 'config', 'environments.yaml')
    with open(env_config_path, 'r') as file:
        env_configs = yaml.safe_load(file)
    
    if environment is None:
        environment = env_configs.get('default_environment', 'development')
    
    return env_configs['environments'].get(environment, env_configs['environments']['development'])

def load_test_data() -> Dict[str, Any]:
    """Load test data from JSON file"""
    test_data_path = os.path.join(os.path.dirname(__file__), 'config', 'test_data.json')
    with open(test_data_path, 'r') as file:
        return json.load(file)

# Global configuration
CONFIG = load_config()
TEST_DATA = load_test_data()

def pytest_addoption(parser):
    """Add command line options for pytest"""
    parser.addoption(
        "--environment", 
        action="store", 
        default="development",
        help="Test environment: development, staging, qa, production, local"
    )
    parser.addoption(
        "--browser", 
        action="store", 
        default="chrome",
        help="Browser to run tests: chrome, firefox, edge, safari"
    )
    parser.addoption(
        "--headless", 
        action="store_true", 
        default=False,
        help="Run tests in headless mode"
    )
    parser.addoption(
        "--capture-screenshots", 
        action="store_true", 
        default=True,
        help="Capture screenshots on test failure"
    )
    parser.addoption(
        "--base-url", 
        action="store", 
        help="Base URL for the application under test"
    )

@pytest.fixture(scope="session")
def test_config():
    """Provide test configuration"""
    return CONFIG

@pytest.fixture(scope="session")
def environment_config(request):
    """Provide environment-specific configuration"""
    environment = request.config.getoption("--environment")
    return load_environment_config(environment)

@pytest.fixture(scope="session")
def test_data():
    """Provide test data"""
    return TEST_DATA

@pytest.fixture(scope="session")
def base_url(request, environment_config):
    """Get base URL for testing"""
    # Command line option takes precedence
    base_url = request.config.getoption("--base-url")
    if base_url:
        return base_url
    
    # Fall back to environment configuration
    return environment_config['app']['base_url']

@pytest.fixture(scope="session")
def api_base_url(environment_config):
    """Get API base URL for testing"""
    return environment_config['app']['api_base_url']

@pytest.fixture(scope="function")
def browser_manager(request, test_config, environment_config):
    """Provide browser manager instance"""
    browser_name = request.config.getoption("--browser")
    headless = request.config.getoption("--headless")
    
    # Override headless setting based on environment
    env_browser_config = environment_config.get('browser_configs', {}).get(
        request.config.getoption("--environment"), {}
    )
    if 'headless' in env_browser_config:
        headless = env_browser_config['headless']
    
    manager = BrowserManager(
        browser_name=browser_name,
        headless=headless,
        config=test_config
    )
    
    yield manager
    
    # Cleanup
    manager.quit()

@pytest.fixture(scope="function")
def driver(browser_manager):
    """Provide WebDriver instance"""
    return browser_manager.get_driver()

@pytest.fixture(scope="session")
def api_client(api_base_url, test_config):
    """Provide API client instance"""
    return APIClient(base_url=api_base_url, config=test_config)

@pytest.fixture(scope="function")
def screenshot_manager(request):
    """Provide screenshot manager for test failures"""
    manager = ScreenshotManager()
    yield manager
    
    # Capture screenshot on test failure
    if request.node.rep_call.failed:
        if hasattr(request, 'driver'):
            manager.capture_failure_screenshot(
                driver=request.driver,
                test_name=request.node.name
            )

@pytest.fixture(scope="function")
def test_data_manager():
    """Provide test data manager"""
    return TestDataManager()

@pytest.fixture(scope="function")
def authenticated_user(api_client, test_data):
    """Provide authenticated user session"""
    user_data = test_data['test_users']['valid_users'][0]
    response = api_client.login(user_data['email'], user_data['password'])
    
    if response.status_code == 200:
        return {
            'user_data': user_data,
            'session': response.json(),
            'api_client': api_client
        }
    else:
        pytest.skip(f"Failed to authenticate test user: {response.status_code}")

@pytest.fixture(scope="function")
def admin_user(api_client, test_data):
    """Provide authenticated admin user session"""
    admin_data = test_data['test_users']['valid_users'][1]  # Admin user
    response = api_client.login(admin_data['email'], admin_data['password'])
    
    if response.status_code == 200:
        return {
            'user_data': admin_data,
            'session': response.json(),
            'api_client': api_client
        }
    else:
        pytest.skip(f"Failed to authenticate admin user: {response.status_code}")

@pytest.fixture(autouse=True)
def setup_test_environment(request):
    """Setup test environment before each test"""
    logger.info(f"Starting test: {request.node.name}")
    
    # Create necessary directories
    os.makedirs('logs', exist_ok=True)
    os.makedirs('reports', exist_ok=True)
    os.makedirs('screenshots', exist_ok=True)
    
    yield
    
    logger.info(f"Completed test: {request.node.name}")

@pytest.fixture(scope="session", autouse=True)
def setup_test_session():
    """Setup test session"""
    logger.info("Starting test session")
    start_time = datetime.now()
    
    yield
    
    end_time = datetime.now()
    duration = end_time - start_time
    logger.info(f"Test session completed in {duration}")

def pytest_configure(config):
    """Configure pytest"""
    # Create test results directory
    os.makedirs('reports', exist_ok=True)
    os.makedirs('logs', exist_ok=True)

def pytest_runtest_setup(item):
    """Setup before each test item"""
    logger.info(f"Setting up test: {item.name}")

def pytest_runtest_teardown(item):
    """Teardown after each test item"""
    logger.info(f"Tearing down test: {item.name}")

@pytest.hookimpl(tryfirst=True, hookwrapper=True)
def pytest_runtest_makereport(item, call):
    """Make test report with additional information"""
    outcome = yield
    rep = outcome.get_result()
    setattr(item, "rep_" + rep.when, rep)

def pytest_html_report_title(report):
    """Customize HTML report title"""
    report.title = "EaseMyResearch Test Report"

def pytest_html_results_summary(prefix, summary, postfix):
    """Customize HTML report summary"""
    prefix.extend([
        "<h2>Test Environment Information</h2>",
        f"<p>Base URL: {CONFIG.get('app', {}).get('base_url', 'Not specified')}</p>",
        f"<p>Test Run Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>"
    ])

# Custom markers for test categorization
pytest_plugins = ["pytest_html"]