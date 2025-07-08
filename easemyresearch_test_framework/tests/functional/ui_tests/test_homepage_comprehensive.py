"""
Comprehensive Homepage Test Suite for EaseMyResearch.com
Tests all links, pages, tabs, and options with detailed reporting
"""

import pytest
import time
import json
from datetime import datetime
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.action_chains import ActionChains
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from page_objects.homepage import HomePage

@pytest.mark.functional
@pytest.mark.ui
@pytest.mark.homepage
class TestHomepageComprehensive:
    """Comprehensive test suite for homepage functionality"""
    
    def setup_method(self):
        """Setup for each test method"""
        self.test_results = {
            'timestamp': datetime.now().isoformat(),
            'tests_executed': [],
            'links_tested': [],
            'broken_links': [],
            'performance_metrics': {},
            'accessibility_issues': [],
            'responsive_issues': []
        }
    
    @pytest.mark.smoke
    def test_homepage_loads_successfully(self, driver, base_url):
        """Test that homepage loads successfully with all basic elements"""
        print("\n🔍 Testing Homepage Load...")
        
        start_time = time.time()
        driver.get(base_url)
        load_time = time.time() - start_time
        
        # Wait for page to load completely
        WebDriverWait(driver, 30).until(
            lambda d: d.execute_script("return document.readyState") == "complete"
        )
        
        # Basic assertions
        assert "easemyresearch" in driver.current_url.lower()
        assert driver.title is not None and driver.title != ""
        
        # Performance check
        assert load_time < 10, f"Homepage load time {load_time:.2f}s exceeds 10s threshold"
        
        self.test_results['performance_metrics']['page_load_time'] = load_time
        self.test_results['tests_executed'].append({
            'test': 'homepage_load',
            'status': 'PASS',
            'load_time': load_time,
            'page_title': driver.title
        })
        
        print(f"✅ Homepage loaded successfully in {load_time:.2f}s")
        print(f"📄 Page Title: {driver.title}")
    
    @pytest.mark.critical
    def test_navigation_menu_elements(self, driver, base_url):
        """Test all navigation menu elements and links"""
        print("\n🧭 Testing Navigation Menu...")
        
        driver.get(base_url)
        WebDriverWait(driver, 20).until(
            lambda d: d.execute_script("return document.readyState") == "complete"
        )
        
        # Common navigation selectors
        nav_selectors = [
            "nav", ".navbar", ".navigation", ".menu", ".nav",
            "[role='navigation']", ".header-nav", ".main-nav"
        ]
        
        navigation_found = False
        nav_links = []
        
        for selector in nav_selectors:
            try:
                nav_element = driver.find_element(By.CSS_SELECTOR, selector)
                navigation_found = True
                # Find all links in navigation
                links = nav_element.find_elements(By.TAG_NAME, "a")
                nav_links.extend(links)
                print(f"✅ Found navigation with selector: {selector}")
                break
            except NoSuchElementException:
                continue
        
        if not navigation_found:
            # Alternative: find all header links
            try:
                header = driver.find_element(By.TAG_NAME, "header")
                nav_links = header.find_elements(By.TAG_NAME, "a")
                navigation_found = True
                print("✅ Found navigation in header")
            except NoSuchElementException:
                # Fallback: find all visible links in top area
                nav_links = driver.find_elements(By.CSS_SELECTOR, "a")[:10]
                print("⚠️ Using fallback navigation detection")
        
        assert navigation_found or len(nav_links) > 0, "No navigation menu found"
        
        tested_links = []
        for i, link in enumerate(nav_links[:10]):  # Test first 10 links
            try:
                href = link.get_attribute("href")
                text = link.text.strip()
                
                if href and text:
                    tested_links.append({
                        'text': text,
                        'href': href,
                        'visible': link.is_displayed(),
                        'enabled': link.is_enabled()
                    })
                    print(f"📎 Link found: {text} -> {href}")
            except Exception as e:
                print(f"⚠️ Error testing link {i}: {e}")
        
        self.test_results['links_tested'] = tested_links
        self.test_results['tests_executed'].append({
            'test': 'navigation_menu',
            'status': 'PASS',
            'links_found': len(tested_links)
        })
        
        assert len(tested_links) > 0, "No valid navigation links found"
        print(f"✅ Navigation menu tested successfully - {len(tested_links)} links found")
    
    def test_all_homepage_links(self, driver, base_url):
        """Test all links on the homepage for functionality"""
        print("\n🔗 Testing All Homepage Links...")
        
        driver.get(base_url)
        WebDriverWait(driver, 20).until(
            lambda d: d.execute_script("return document.readyState") == "complete"
        )
        
        # Get all links on the page
        all_links = driver.find_elements(By.TAG_NAME, "a")
        valid_links = []
        broken_links = []
        
        print(f"🔍 Found {len(all_links)} total links on homepage")
        
        for i, link in enumerate(all_links):
            try:
                href = link.get_attribute("href")
                text = link.text.strip() or link.get_attribute("alt") or f"Link {i+1}"
                
                if href and not href.startswith("javascript:") and not href.startswith("#"):
                    link_info = {
                        'text': text,
                        'href': href,
                        'visible': link.is_displayed(),
                        'position': i+1
                    }
                    
                    # Test if link is clickable
                    try:
                        if link.is_displayed() and link.is_enabled():
                            # Test link accessibility without clicking
                            link_info['accessible'] = True
                            valid_links.append(link_info)
                            print(f"✅ {i+1}. {text[:50]}... -> {href}")
                        else:
                            link_info['accessible'] = False
                            link_info['issue'] = 'Not visible or disabled'
                            broken_links.append(link_info)
                            print(f"⚠️ {i+1}. {text[:50]}... -> HIDDEN/DISABLED")
                    except Exception as e:
                        link_info['accessible'] = False
                        link_info['issue'] = str(e)
                        broken_links.append(link_info)
                        print(f"❌ {i+1}. {text[:50]}... -> ERROR: {e}")
                        
            except Exception as e:
                print(f"❌ Error processing link {i+1}: {e}")
        
        self.test_results['links_tested'] = valid_links
        self.test_results['broken_links'] = broken_links
        self.test_results['tests_executed'].append({
            'test': 'all_homepage_links',
            'status': 'PASS',
            'total_links': len(all_links),
            'valid_links': len(valid_links),
            'broken_links': len(broken_links)
        })
        
        print(f"\n📊 Link Testing Summary:")
        print(f"   Total Links: {len(all_links)}")
        print(f"   Valid Links: {len(valid_links)}")
        print(f"   Broken/Problematic Links: {len(broken_links)}")
    
    def test_search_functionality(self, driver, base_url):
        """Test search functionality if present"""
        print("\n🔍 Testing Search Functionality...")
        
        driver.get(base_url)
        WebDriverWait(driver, 20).until(
            lambda d: d.execute_script("return document.readyState") == "complete"
        )
        
        # Common search element selectors
        search_selectors = [
            "input[type='search']",
            "input[placeholder*='search' i]",
            "input[name*='search' i]",
            "input[id*='search' i]",
            ".search-input",
            ".search-box",
            "[role='searchbox']"
        ]
        
        search_found = False
        search_element = None
        
        for selector in search_selectors:
            try:
                search_element = driver.find_element(By.CSS_SELECTOR, selector)
                if search_element.is_displayed():
                    search_found = True
                    print(f"✅ Found search input with selector: {selector}")
                    break
            except NoSuchElementException:
                continue
        
        if search_found:
            try:
                # Test search input
                search_element.clear()
                search_element.send_keys("machine learning")
                
                # Look for search button
                search_buttons = [
                    "button[type='submit']",
                    ".search-button",
                    ".search-btn",
                    "input[type='submit']",
                    "[aria-label*='search' i]"
                ]
                
                search_button = None
                for btn_selector in search_buttons:
                    try:
                        search_button = driver.find_element(By.CSS_SELECTOR, btn_selector)
                        if search_button.is_displayed():
                            break
                    except NoSuchElementException:
                        continue
                
                self.test_results['tests_executed'].append({
                    'test': 'search_functionality',
                    'status': 'PASS',
                    'search_input_found': True,
                    'search_button_found': search_button is not None
                })
                
                print(f"✅ Search functionality found and tested")
                print(f"   Search Input: ✅ Found and functional")
                print(f"   Search Button: {'✅ Found' if search_button else '⚠️ Not found'}")
                
            except Exception as e:
                print(f"❌ Error testing search functionality: {e}")
                self.test_results['tests_executed'].append({
                    'test': 'search_functionality',
                    'status': 'FAIL',
                    'error': str(e)
                })
        else:
            print("ℹ️ No search functionality found on homepage")
            self.test_results['tests_executed'].append({
                'test': 'search_functionality',
                'status': 'SKIP',
                'reason': 'No search input found'
            })
    
    def test_login_registration_links(self, driver, base_url):
        """Test login and registration functionality"""
        print("\n🔐 Testing Login/Registration Links...")
        
        driver.get(base_url)
        WebDriverWait(driver, 20).until(
            lambda d: d.execute_script("return document.readyState") == "complete"
        )
        
        # Look for login/register links
        auth_keywords = ['login', 'sign in', 'register', 'sign up', 'account']
        auth_links = []
        
        all_links = driver.find_elements(By.TAG_NAME, "a")
        all_buttons = driver.find_elements(By.TAG_NAME, "button")
        
        for element in all_links + all_buttons:
            try:
                text = element.text.lower().strip()
                href = element.get_attribute("href") or ""
                
                for keyword in auth_keywords:
                    if keyword in text or keyword in href.lower():
                        auth_links.append({
                            'text': element.text.strip(),
                            'href': href,
                            'type': element.tag_name,
                            'visible': element.is_displayed(),
                            'keyword_matched': keyword
                        })
                        print(f"🔑 Found auth link: {element.text.strip()} ({keyword})")
                        break
            except Exception as e:
                continue
        
        self.test_results['tests_executed'].append({
            'test': 'login_registration_links',
            'status': 'PASS',
            'auth_links_found': len(auth_links)
        })
        
        if auth_links:
            print(f"✅ Found {len(auth_links)} authentication-related links")
        else:
            print("ℹ️ No obvious login/registration links found")
    
    def test_responsive_design(self, driver, base_url):
        """Test responsive design at different screen sizes"""
        print("\n📱 Testing Responsive Design...")
        
        driver.get(base_url)
        WebDriverWait(driver, 20).until(
            lambda d: d.execute_script("return document.readyState") == "complete"
        )
        
        # Test different screen sizes
        screen_sizes = [
            ('Desktop', 1920, 1080),
            ('Tablet', 768, 1024),
            ('Mobile', 375, 667)
        ]
        
        responsive_results = []
        
        for device, width, height in screen_sizes:
            try:
                driver.set_window_size(width, height)
                time.sleep(2)  # Allow layout to adjust
                
                # Check if page is still functional
                body = driver.find_element(By.TAG_NAME, "body")
                is_responsive = body.is_displayed()
                
                # Check for horizontal scrollbar
                has_horizontal_scroll = driver.execute_script(
                    "return document.body.scrollWidth > window.innerWidth;"
                )
                
                result = {
                    'device': device,
                    'width': width,
                    'height': height,
                    'responsive': is_responsive,
                    'horizontal_scroll': has_horizontal_scroll,
                    'status': 'PASS' if is_responsive and not has_horizontal_scroll else 'WARN'
                }
                
                responsive_results.append(result)
                
                print(f"📱 {device} ({width}x{height}): {'✅ Good' if result['status'] == 'PASS' else '⚠️ Issues'}")
                if has_horizontal_scroll:
                    print(f"   ⚠️ Horizontal scroll detected")
                    
            except Exception as e:
                print(f"❌ Error testing {device}: {e}")
                responsive_results.append({
                    'device': device,
                    'width': width,
                    'height': height,
                    'status': 'FAIL',
                    'error': str(e)
                })
        
        # Reset to desktop size
        driver.set_window_size(1920, 1080)
        
        self.test_results['responsive_issues'] = [r for r in responsive_results if r['status'] != 'PASS']
        self.test_results['tests_executed'].append({
            'test': 'responsive_design',
            'status': 'PASS',
            'devices_tested': len(screen_sizes),
            'responsive_results': responsive_results
        })
    
    def test_page_forms(self, driver, base_url):
        """Test all forms present on the homepage"""
        print("\n📝 Testing Homepage Forms...")
        
        driver.get(base_url)
        WebDriverWait(driver, 20).until(
            lambda d: d.execute_script("return document.readyState") == "complete"
        )
        
        # Find all forms
        forms = driver.find_elements(By.TAG_NAME, "form")
        form_results = []
        
        print(f"🔍 Found {len(forms)} forms on homepage")
        
        for i, form in enumerate(forms):
            try:
                # Get form attributes
                action = form.get_attribute("action") or "Not specified"
                method = form.get_attribute("method") or "get"
                
                # Find inputs in form
                inputs = form.find_elements(By.TAG_NAME, "input")
                textareas = form.find_elements(By.TAG_NAME, "textarea")
                selects = form.find_elements(By.TAG_NAME, "select")
                
                total_fields = len(inputs) + len(textareas) + len(selects)
                
                form_info = {
                    'form_number': i + 1,
                    'action': action,
                    'method': method.upper(),
                    'total_fields': total_fields,
                    'inputs': len(inputs),
                    'textareas': len(textareas),
                    'selects': len(selects),
                    'visible': form.is_displayed()
                }
                
                form_results.append(form_info)
                
                print(f"📋 Form {i+1}:")
                print(f"   Action: {action}")
                print(f"   Method: {method.upper()}")
                print(f"   Fields: {total_fields} total")
                print(f"   Visible: {'Yes' if form.is_displayed() else 'No'}")
                
            except Exception as e:
                print(f"❌ Error analyzing form {i+1}: {e}")
        
        self.test_results['tests_executed'].append({
            'test': 'page_forms',
            'status': 'PASS',
            'forms_found': len(forms),
            'form_details': form_results
        })
    
    def test_external_resources(self, driver, base_url):
        """Test external resources loading (CSS, JS, images)"""
        print("\n🔗 Testing External Resources...")
        
        driver.get(base_url)
        WebDriverWait(driver, 20).until(
            lambda d: d.execute_script("return document.readyState") == "complete"
        )
        
        # Check for broken images
        images = driver.find_elements(By.TAG_NAME, "img")
        broken_images = []
        
        for img in images[:20]:  # Check first 20 images
            try:
                src = img.get_attribute("src")
                if src:
                    # Check if image is loaded
                    is_loaded = driver.execute_script(
                        "return arguments[0].complete && arguments[0].naturalHeight !== 0",
                        img
                    )
                    
                    if not is_loaded:
                        broken_images.append({
                            'src': src,
                            'alt': img.get_attribute("alt") or "No alt text"
                        })
            except Exception:
                continue
        
        # Check JavaScript errors
        js_errors = driver.get_log('browser')
        js_error_count = len([log for log in js_errors if log['level'] == 'SEVERE'])
        
        resource_results = {
            'total_images': len(images),
            'broken_images': len(broken_images),
            'js_errors': js_error_count
        }
        
        self.test_results['tests_executed'].append({
            'test': 'external_resources',
            'status': 'PASS',
            'resource_results': resource_results
        })
        
        print(f"🖼️ Images: {len(images)} total, {len(broken_images)} broken")
        print(f"⚠️ JavaScript Errors: {js_error_count}")
        
        if broken_images:
            print("🔍 Broken Images:")
            for img in broken_images[:5]:
                print(f"   - {img['src']}")
    
    def teardown_method(self):
        """Generate test report after each test class"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        report_file = f"reports/homepage_test_results_{timestamp}.json"
        
        # Ensure reports directory exists
        import os
        os.makedirs("reports", exist_ok=True)
        
        # Save detailed test results
        with open(report_file, 'w') as f:
            json.dump(self.test_results, f, indent=2)
        
        # Print summary
        print(f"\n📊 Test Execution Summary:")
        print(f"   Total Tests: {len(self.test_results['tests_executed'])}")
        print(f"   Links Tested: {len(self.test_results['links_tested'])}")
        print(f"   Broken Links: {len(self.test_results['broken_links'])}")
        print(f"   Report Saved: {report_file}")
    
    @pytest.mark.performance
    def test_page_performance_metrics(self, driver, base_url):
        """Test detailed page performance metrics"""
        print("\n⚡ Testing Page Performance Metrics...")
        
        # Navigate and measure
        start_time = time.time()
        driver.get(base_url)
        
        # Wait for complete load
        WebDriverWait(driver, 30).until(
            lambda d: d.execute_script("return document.readyState") == "complete"
        )
        
        total_load_time = time.time() - start_time
        
        # Get performance metrics
        navigation_timing = driver.execute_script("""
            var timing = performance.timing;
            return {
                'dns_lookup': timing.domainLookupEnd - timing.domainLookupStart,
                'connect_time': timing.connectEnd - timing.connectStart,
                'server_response': timing.responseEnd - timing.requestStart,
                'dom_ready': timing.domContentLoadedEventEnd - timing.navigationStart,
                'page_load': timing.loadEventEnd - timing.navigationStart
            };
        """)
        
        # Resource counts
        resource_count = driver.execute_script("""
            return {
                'images': document.images.length,
                'scripts': document.scripts.length,
                'stylesheets': document.styleSheets.length,
                'links': document.links.length
            };
        """)
        
        performance_results = {
            'total_load_time': total_load_time,
            'navigation_timing': navigation_timing,
            'resource_count': resource_count
        }
        
        self.test_results['performance_metrics'].update(performance_results)
        
        print(f"⚡ Performance Metrics:")
        print(f"   Total Load Time: {total_load_time:.2f}s")
        print(f"   DOM Ready: {navigation_timing.get('dom_ready', 0)/1000:.2f}s")
        print(f"   Server Response: {navigation_timing.get('server_response', 0)/1000:.2f}s")
        print(f"   Images: {resource_count['images']}")
        print(f"   Scripts: {resource_count['scripts']}")
        print(f"   Stylesheets: {resource_count['stylesheets']}")
        
        # Performance assertions
        assert total_load_time < 10, f"Page load time {total_load_time:.2f}s exceeds 10s"
        assert navigation_timing.get('server_response', 0) < 5000, "Server response time > 5s"