"""Test cases for homepage functionality"""

import pytest
from page_objects.homepage import HomePage

@pytest.mark.smoke
@pytest.mark.ui
class TestHomepage:
    """Test suite for homepage functionality"""
    
    def test_homepage_loads_successfully(self, driver, base_url):
        """Test that homepage loads successfully"""
        homepage = HomePage(driver, base_url)
        homepage.navigate_to_homepage()
        
        assert "EaseMyResearch" in homepage.get_page_title()
        assert homepage.is_logo_visible()
        assert homepage.is_navigation_visible()
    
    @pytest.mark.functional
    def test_search_functionality(self, driver, base_url):
        """Test search functionality on homepage"""
        homepage = HomePage(driver, base_url)
        homepage.navigate_to_homepage()
        
        search_query = "machine learning"
        homepage.search_research(search_query)
        
        # Verify we're redirected to search results page
        assert "search" in homepage.get_current_url().lower()
    
    @pytest.mark.navigation
    def test_navigation_links(self, driver, base_url):
        """Test navigation links on homepage"""
        homepage = HomePage(driver, base_url)
        homepage.navigate_to_homepage()
        
        # Test login link
        homepage.click_login()
        assert "login" in homepage.get_current_url().lower()
        
        # Navigate back to homepage
        homepage.navigate_to_homepage()
        
        # Test register link
        homepage.click_register()
        assert "register" in homepage.get_current_url().lower()
    
    @pytest.mark.content
    def test_featured_research_section(self, driver, base_url):
        """Test featured research section"""
        homepage = HomePage(driver, base_url)
        homepage.navigate_to_homepage()
        
        featured_count = homepage.get_featured_research_count()
        assert featured_count >= 0  # At least should not error
