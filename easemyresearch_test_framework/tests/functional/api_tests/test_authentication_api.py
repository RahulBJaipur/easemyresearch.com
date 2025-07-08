"""Test cases for authentication API"""

import pytest
import json

@pytest.mark.api
@pytest.mark.authentication
class TestAuthenticationAPI:
    """Test suite for authentication API endpoints"""
    
    def test_login_api_valid_credentials(self, api_client, test_data):
        """Test login API with valid credentials"""
        valid_user = test_data['test_users']['valid_users'][0]
        
        response = api_client.login(valid_user['email'], valid_user['password'])
        
        assert response.status_code == 200
        response_data = response.json()
        assert 'token' in response_data or 'access_token' in response_data
        assert 'user' in response_data
    
    def test_login_api_invalid_credentials(self, api_client):
        """Test login API with invalid credentials"""
        response = api_client.login("invalid@email.com", "wrongpassword")
        
        assert response.status_code in [400, 401, 422]
        response_data = response.json()
        assert 'error' in response_data or 'message' in response_data
    
    def test_login_api_empty_credentials(self, api_client):
        """Test login API with empty credentials"""
        response = api_client.login("", "")
        
        assert response.status_code in [400, 422]
        response_data = response.json()
        assert 'error' in response_data or 'message' in response_data
    
    def test_user_profile_with_authentication(self, authenticated_user):
        """Test user profile API with authentication"""
        api_client = authenticated_user['api_client']
        
        response = api_client.get_user_profile()
        
        assert response.status_code == 200
        response_data = response.json()
        assert 'email' in response_data
        assert response_data['email'] == authenticated_user['user_data']['email']
    
    def test_user_profile_without_authentication(self, api_client):
        """Test user profile API without authentication"""
        response = api_client.get_user_profile()
        
        assert response.status_code in [401, 403]
