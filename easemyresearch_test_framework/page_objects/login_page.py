"""Login Page Object"""

from selenium.webdriver.common.by import By
from .base_page import BasePage

class LoginPage(BasePage):
    """Page object for the login page"""
    
    # Locators
    EMAIL_INPUT = (By.ID, "email")
    PASSWORD_INPUT = (By.ID, "password")
    LOGIN_BUTTON = (By.CSS_SELECTOR, "button[type='submit']")
    FORGOT_PASSWORD_LINK = (By.LINK_TEXT, "Forgot Password?")
    ERROR_MESSAGE = (By.CSS_SELECTOR, ".error-message")
    SUCCESS_MESSAGE = (By.CSS_SELECTOR, ".success-message")
    
    def __init__(self, driver, base_url):
        super().__init__(driver, base_url)
    
    def navigate_to_login(self):
        """Navigate to the login page"""
        self.navigate_to("/login")
        self.wait_for_page_load()
    
    def login(self, email: str, password: str):
        """Perform login with email and password"""
        self.enter_text(self.EMAIL_INPUT, email)
        self.enter_text(self.PASSWORD_INPUT, password)
        self.click_element(self.LOGIN_BUTTON)
    
    def click_forgot_password(self):
        """Click forgot password link"""
        self.click_element(self.FORGOT_PASSWORD_LINK)
    
    def get_error_message(self) -> str:
        """Get error message text"""
        if self.is_element_visible(self.ERROR_MESSAGE):
            return self.get_text(self.ERROR_MESSAGE)
        return ""
    
    def is_login_successful(self) -> bool:
        """Check if login was successful"""
        return self.is_element_visible(self.SUCCESS_MESSAGE)
