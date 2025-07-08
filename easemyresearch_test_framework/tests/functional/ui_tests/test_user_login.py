"""Test cases for user login functionality"""

import pytest
from page_objects.login_page import LoginPage

@pytest.mark.authentication
@pytest.mark.ui
class TestUserLogin:
    """Test suite for user login functionality"""
    
    def test_valid_login(self, driver, base_url, test_data):
        """Test login with valid credentials"""
        login_page = LoginPage(driver, base_url)
        login_page.navigate_to_login()
        
        valid_user = test_data['test_users']['valid_users'][0]
        login_page.login(valid_user['email'], valid_user['password'])
        
        # Verify successful login (this depends on actual implementation)
        assert login_page.is_login_successful() or "dashboard" in login_page.get_current_url()
    
    def test_invalid_email_login(self, driver, base_url):
        """Test login with invalid email"""
        login_page = LoginPage(driver, base_url)
        login_page.navigate_to_login()
        
        login_page.login("invalid@email.com", "password123")
        
        error_message = login_page.get_error_message()
        assert error_message != ""
        assert "invalid" in error_message.lower() or "not found" in error_message.lower()
    
    def test_empty_credentials_login(self, driver, base_url):
        """Test login with empty credentials"""
        login_page = LoginPage(driver, base_url)
        login_page.navigate_to_login()
        
        login_page.login("", "")
        
        error_message = login_page.get_error_message()
        assert error_message != ""
    
    def test_forgot_password_link(self, driver, base_url):
        """Test forgot password functionality"""
        login_page = LoginPage(driver, base_url)
        login_page.navigate_to_login()
        
        login_page.click_forgot_password()
        
        # Verify we're redirected to forgot password page
        current_url = login_page.get_current_url()
        assert "forgot" in current_url.lower() or "reset" in current_url.lower()
