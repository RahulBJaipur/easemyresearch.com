"""Homepage Page Object"""

from selenium.webdriver.common.by import By
from .base_page import BasePage

class HomePage(BasePage):
    """Page object for the home page"""
    
    # Locators
    LOGO = (By.CSS_SELECTOR, ".logo")
    NAVIGATION_MENU = (By.CSS_SELECTOR, ".navbar")
    SEARCH_BOX = (By.ID, "search-input")
    SEARCH_BUTTON = (By.CSS_SELECTOR, "button[type='submit']")
    LOGIN_LINK = (By.LINK_TEXT, "Login")
    REGISTER_LINK = (By.LINK_TEXT, "Register")
    FEATURED_RESEARCH = (By.CSS_SELECTOR, ".featured-research")
    HERO_SECTION = (By.CSS_SELECTOR, ".hero")
    
    def __init__(self, driver, base_url):
        super().__init__(driver, base_url)
    
    def navigate_to_homepage(self):
        """Navigate to the homepage"""
        self.navigate_to("/")
        self.wait_for_page_load()
    
    def search_research(self, query: str):
        """Search for research using the search box"""
        self.enter_text(self.SEARCH_BOX, query)
        self.click_element(self.SEARCH_BUTTON)
    
    def click_login(self):
        """Click the login link"""
        self.click_element(self.LOGIN_LINK)
    
    def click_register(self):
        """Click the register link"""
        self.click_element(self.REGISTER_LINK)
    
    def is_logo_visible(self) -> bool:
        """Check if logo is visible"""
        return self.is_element_visible(self.LOGO)
    
    def is_navigation_visible(self) -> bool:
        """Check if navigation menu is visible"""
        return self.is_element_visible(self.NAVIGATION_MENU)
    
    def get_featured_research_count(self) -> int:
        """Get count of featured research items"""
        elements = self.find_elements(self.FEATURED_RESEARCH)
        return len(elements)
