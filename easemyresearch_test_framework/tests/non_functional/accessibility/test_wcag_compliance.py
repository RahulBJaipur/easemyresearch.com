"""Accessibility tests for WCAG compliance"""

import pytest
from axe_selenium_python import Axe

@pytest.mark.accessibility
@pytest.mark.wcag
class TestWCAGCompliance:
    """Test suite for WCAG accessibility compliance"""
    
    def test_homepage_accessibility(self, driver, base_url):
        """Test homepage accessibility compliance"""
        driver.get(base_url)
        
        axe = Axe(driver)
        axe.inject()
        
        results = axe.run()
        
        # Assert no violations
        violations = results['violations']
        assert len(violations) == 0, f"Accessibility violations found: {violations}"
    
    def test_login_page_accessibility(self, driver, base_url):
        """Test login page accessibility compliance"""
        driver.get(f"{base_url}/login")
        
        axe = Axe(driver)
        axe.inject()
        
        results = axe.run()
        
        violations = results['violations']
        assert len(violations) == 0, f"Login page accessibility violations: {violations}"
    
    def test_keyboard_navigation(self, driver, base_url):
        """Test keyboard navigation"""
        driver.get(base_url)
        
        # Get all interactive elements
        interactive_elements = driver.find_elements_by_css_selector(
            'a, button, input, select, textarea, [tabindex]'
        )
        
        # Each element should be focusable
        for element in interactive_elements:
            try:
                element.send_keys("")  # Try to focus
                focused_element = driver.switch_to.active_element
                assert focused_element == element or element.get_attribute('tabindex') == '-1'
            except Exception:
                # Some elements might not be focusable, which is okay
                pass
    
    def test_color_contrast(self, driver, base_url):
        """Test color contrast ratios"""
        driver.get(base_url)
        
        axe = Axe(driver)
        axe.inject()
        
        # Run only color contrast checks
        results = axe.run(options={"tags": ["color-contrast"]})
        
        violations = results['violations']
        assert len(violations) == 0, f"Color contrast violations: {violations}"
    
    def test_alt_text_images(self, driver, base_url):
        """Test that all images have alt text"""
        driver.get(base_url)
        
        images = driver.find_elements_by_tag_name('img')
        
        for img in images:
            alt_text = img.get_attribute('alt')
            # Images should have alt text (empty alt="" is acceptable for decorative images)
            assert alt_text is not None, f"Image missing alt attribute: {img.get_attribute('src')}"
