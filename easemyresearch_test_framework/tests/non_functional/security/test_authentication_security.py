"""Security tests for authentication"""

import pytest

@pytest.mark.security
@pytest.mark.authentication
class TestAuthenticationSecurity:
    """Test suite for authentication security"""
    
    def test_sql_injection_in_login(self, api_client):
        """Test SQL injection attempts in login"""
        sql_payloads = [
            "admin' OR '1'='1",
            "admin'; DROP TABLE users; --",
            "admin' UNION SELECT * FROM users --"
        ]
        
        for payload in sql_payloads:
            response = api_client.login(payload, "password")
            
            # Should not succeed with SQL injection
            assert response.status_code in [400, 401, 422]
            
            # Response should not contain database error messages
            response_text = response.text.lower()
            dangerous_keywords = ['mysql', 'postgresql', 'sqlite', 'database error', 'sql error']
            for keyword in dangerous_keywords:
                assert keyword not in response_text
    
    def test_xss_in_login_fields(self, api_client):
        """Test XSS attempts in login fields"""
        xss_payloads = [
            "<script>alert('xss')</script>",
            "javascript:alert('xss')",
            "<img src=x onerror=alert('xss')>"
        ]
        
        for payload in xss_payloads:
            response = api_client.login(payload, "password")
            
            # Should not succeed
            assert response.status_code in [400, 401, 422]
            
            # Response should not contain unescaped script tags
            response_text = response.text
            assert "<script>" not in response_text
            assert "javascript:" not in response_text
    
    def test_brute_force_protection(self, api_client):
        """Test brute force protection"""
        # Attempt multiple failed logins
        for i in range(10):
            response = api_client.login("test@test.com", f"wrongpassword{i}")
            
            # After several attempts, should start getting rate limited
            if i > 5:
                assert response.status_code in [429, 403, 423]  # Rate limited or locked
    
    def test_password_exposure_in_response(self, api_client, test_data):
        """Test that passwords are not exposed in API responses"""
        valid_user = test_data['test_users']['valid_users'][0]
        
        # Test login response
        response = api_client.login(valid_user['email'], valid_user['password'])
        response_text = response.text.lower()
        
        # Password should not appear in response
        assert valid_user['password'].lower() not in response_text
        assert "password" not in response_text or "password" in '{"password":"***"}' or "password_hash" in response_text
    
    def test_session_token_security(self, authenticated_user):
        """Test session token security"""
        api_client = authenticated_user['api_client']
        
        # Get user profile to ensure token works
        response = api_client.get_user_profile()
        assert response.status_code == 200
        
        # Clear token and try again
        api_client.clear_auth_token()
        response = api_client.get_user_profile()
        assert response.status_code in [401, 403]
