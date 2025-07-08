"""Performance tests for load testing"""

import time
import pytest
from locust import HttpUser, task, between

@pytest.mark.performance
@pytest.mark.slow
class TestLoadPerformance:
    """Test suite for load performance testing"""
    
    def test_homepage_load_time(self, driver, base_url):
        """Test homepage load time"""
        start_time = time.time()
        
        driver.get(base_url)
        
        # Wait for page to load completely
        driver.execute_script("return document.readyState") == "complete"
        
        load_time = time.time() - start_time
        
        # Assert load time is under 5 seconds
        assert load_time < 5.0, f"Homepage load time {load_time:.2f}s exceeds 5s threshold"
    
    def test_search_api_response_time(self, api_client):
        """Test search API response time"""
        start_time = time.time()
        
        response = api_client.search("machine learning")
        
        response_time = time.time() - start_time
        
        assert response.status_code == 200
        assert response_time < 2.0, f"Search API response time {response_time:.2f}s exceeds 2s threshold"
    
    def test_login_api_response_time(self, api_client, test_data):
        """Test login API response time"""
        valid_user = test_data['test_users']['valid_users'][0]
        
        start_time = time.time()
        
        response = api_client.login(valid_user['email'], valid_user['password'])
        
        response_time = time.time() - start_time
        
        assert response.status_code == 200
        assert response_time < 1.0, f"Login API response time {response_time:.2f}s exceeds 1s threshold"


class EaseMyResearchUser(HttpUser):
    """Locust user class for load testing"""
    
    wait_time = between(1, 3)
    
    @task(3)
    def browse_homepage(self):
        """Browse homepage"""
        self.client.get("/")
    
    @task(2)
    def search_research(self):
        """Search for research"""
        self.client.post("/api/search", json={
            "query": "machine learning",
            "filters": {}
        })
    
    @task(1)
    def view_about_page(self):
        """View about page"""
        self.client.get("/about")
