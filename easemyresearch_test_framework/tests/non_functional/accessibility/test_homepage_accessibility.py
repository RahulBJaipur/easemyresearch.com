"""
Homepage Accessibility Testing Suite for EaseMyResearch.com
Comprehensive accessibility testing including WCAG compliance, keyboard navigation, and screen reader compatibility
"""

import pytest
import time
import json
from datetime import datetime
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException

@pytest.mark.accessibility
@pytest.mark.non_functional
class TestHomepageAccessibility:
    """Accessibility test suite for homepage"""
    
    def setup_method(self):
        """Setup accessibility tracking"""
        self.accessibility_results = {
            'timestamp': datetime.now().isoformat(),
            'url_tested': '',
            'wcag_violations': [],
            'keyboard_navigation_issues': [],
            'screen_reader_issues': [],
            'color_contrast_issues': [],
            'semantic_issues': []
        }
    
    def test_semantic_html_structure(self, driver, base_url):
        """Test proper semantic HTML structure"""
        print("\n🏗️ Testing Semantic HTML Structure...")
        
        driver.get(base_url)
        WebDriverWait(driver, 20).until(
            lambda d: d.execute_script("return document.readyState") == "complete"
        )
        
        self.accessibility_results['url_tested'] = base_url
        
        # Check for proper semantic elements
        semantic_elements = driver.execute_script("""
            return {
                'has_header': document.querySelector('header') !== null,
                'has_nav': document.querySelector('nav') !== null,
                'has_main': document.querySelector('main') !== null,
                'has_footer': document.querySelector('footer') !== null,
                'has_h1': document.querySelector('h1') !== null,
                'heading_count': {
                    'h1': document.querySelectorAll('h1').length,
                    'h2': document.querySelectorAll('h2').length,
                    'h3': document.querySelectorAll('h3').length,
                    'h4': document.querySelectorAll('h4').length,
                    'h5': document.querySelectorAll('h5').length,
                    'h6': document.querySelectorAll('h6').length
                },
                'has_skip_link': document.querySelector('a[href="#main"], a[href="#content"]') !== null,
                'lang_attribute': document.documentElement.lang || 'missing'
            };
        """)
        
        # Check heading hierarchy
        headings = driver.execute_script("""
            const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
            return headings.map(h => ({
                'tag': h.tagName.toLowerCase(),
                'text': h.textContent.trim(),
                'level': parseInt(h.tagName.charAt(1))
            }));
        """)
        
        # Validate heading hierarchy
        hierarchy_issues = []
        if headings:
            current_level = 0
            for heading in headings:
                level = heading['level']
                if current_level == 0:
                    if level != 1:
                        hierarchy_issues.append(f"First heading should be h1, found {heading['tag']}")
                elif level > current_level + 1:
                    hierarchy_issues.append(f"Heading level jumps from h{current_level} to h{level}")
                current_level = level
        
        print(f"🏗️ Semantic Structure:")
        print(f"   Header: {'✅' if semantic_elements['has_header'] else '❌'}")
        print(f"   Navigation: {'✅' if semantic_elements['has_nav'] else '❌'}")
        print(f"   Main Content: {'✅' if semantic_elements['has_main'] else '❌'}")
        print(f"   Footer: {'✅' if semantic_elements['has_footer'] else '❌'}")
        print(f"   H1 Present: {'✅' if semantic_elements['has_h1'] else '❌'}")
        print(f"   Language Attribute: {semantic_elements['lang_attribute']}")
        print(f"   Skip Link: {'✅' if semantic_elements['has_skip_link'] else '❌'}")
        
        if hierarchy_issues:
            print(f"⚠️ Heading Hierarchy Issues:")
            for issue in hierarchy_issues:
                print(f"   - {issue}")
            self.accessibility_results['semantic_issues'].extend(hierarchy_issues)
        
        # Basic semantic assertions
        assert semantic_elements['has_h1'], "Page must have an H1 heading"
        assert semantic_elements['lang_attribute'] != 'missing', "HTML must have lang attribute"
    
    def test_keyboard_navigation(self, driver, base_url):
        """Test keyboard navigation functionality"""
        print("\n⌨️ Testing Keyboard Navigation...")
        
        driver.get(base_url)
        WebDriverWait(driver, 20).until(
            lambda d: d.execute_script("return document.readyState") == "complete"
        )
        
        # Get all focusable elements
        focusable_elements = driver.execute_script("""
            const focusableSelectors = [
                'a[href]',
                'button:not([disabled])',
                'input:not([disabled])',
                'select:not([disabled])',
                'textarea:not([disabled])',
                '[tabindex]:not([tabindex="-1"])'
            ];
            
            const elements = [];
            focusableSelectors.forEach(selector => {
                document.querySelectorAll(selector).forEach(el => {
                    if (el.offsetWidth > 0 && el.offsetHeight > 0) {
                        elements.push({
                            'tag': el.tagName.toLowerCase(),
                            'type': el.type || '',
                            'text': el.textContent.trim() || el.alt || el.value || 'No text',
                            'tabindex': el.tabIndex,
                            'id': el.id,
                            'class': el.className
                        });
                    }
                });
            });
            
            return elements;
        """)
        
        print(f"⌨️ Found {len(focusable_elements)} focusable elements")
        
        # Test keyboard navigation
        navigation_issues = []
        try:
            # Start from body
            body = driver.find_element(By.TAG_NAME, "body")
            body.click()
            
            # Test Tab navigation
            previous_element = None
            tab_count = 0
            max_tabs = min(10, len(focusable_elements))  # Test first 10 elements
            
            for i in range(max_tabs):
                body.send_keys(Keys.TAB)
                time.sleep(0.5)
                
                try:
                    current_element = driver.switch_to.active_element
                    tag_name = current_element.tag_name.lower()
                    
                    # Check if focus is visible
                    is_focused = driver.execute_script("""
                        const el = arguments[0];
                        const style = window.getComputedStyle(el);
                        return el === document.activeElement && 
                               (style.outline !== 'none' || style.outlineWidth !== '0px' || 
                                style.boxShadow !== 'none' || el.style.outline !== 'none');
                    """, current_element)
                    
                    if not is_focused and tag_name in ['a', 'button', 'input', 'select', 'textarea']:
                        navigation_issues.append(f"Element {tag_name} lacks visible focus indicator")
                    
                    tab_count += 1
                    previous_element = current_element
                    
                except Exception as e:
                    navigation_issues.append(f"Tab navigation error at step {i+1}: {str(e)}")
            
            print(f"   Successfully navigated {tab_count} elements")
            
        except Exception as e:
            navigation_issues.append(f"Keyboard navigation test failed: {str(e)}")
        
        # Test Enter key on buttons and links
        try:
            buttons = driver.find_elements(By.TAG_NAME, "button")[:3]  # Test first 3 buttons
            for i, button in enumerate(buttons):
                if button.is_displayed() and button.is_enabled():
                    button.click()  # Focus the button
                    # Note: We don't actually press Enter to avoid navigation
                    print(f"   Button {i+1}: Focusable and clickable")
        except Exception as e:
            navigation_issues.append(f"Button interaction test failed: {str(e)}")
        
        if navigation_issues:
            print(f"⚠️ Keyboard Navigation Issues:")
            for issue in navigation_issues:
                print(f"   - {issue}")
            self.accessibility_results['keyboard_navigation_issues'].extend(navigation_issues)
        else:
            print("✅ Keyboard navigation appears functional")
    
    def test_images_accessibility(self, driver, base_url):
        """Test image accessibility (alt text, etc.)"""
        print("\n🖼️ Testing Image Accessibility...")
        
        driver.get(base_url)
        WebDriverWait(driver, 20).until(
            lambda d: d.execute_script("return document.readyState") == "complete"
        )
        
        # Analyze images
        image_analysis = driver.execute_script("""
            const images = document.querySelectorAll('img');
            const analysis = {
                'total_images': images.length,
                'images_with_alt': 0,
                'images_without_alt': [],
                'images_with_empty_alt': 0,
                'decorative_images': 0,
                'complex_images': []
            };
            
            images.forEach((img, index) => {
                const alt = img.alt;
                const src = img.src;
                
                if (alt !== undefined && alt !== null) {
                    analysis.images_with_alt++;
                    if (alt === '') {
                        analysis.decorative_images++;
                    } else if (alt.length > 100) {
                        analysis.complex_images.push({
                            'src': src,
                            'alt_length': alt.length,
                            'index': index
                        });
                    }
                } else {
                    analysis.images_without_alt.push({
                        'src': src,
                        'index': index
                    });
                }
            });
            
            return analysis;
        """)
        
        print(f"🖼️ Image Accessibility:")
        print(f"   Total Images: {image_analysis['total_images']}")
        print(f"   Images with Alt Text: {image_analysis['images_with_alt']}")
        print(f"   Images without Alt: {len(image_analysis['images_without_alt'])}")
        print(f"   Decorative Images (empty alt): {image_analysis['decorative_images']}")
        print(f"   Complex Images (long alt): {len(image_analysis['complex_images'])}")
        
        # Check for accessibility issues
        if image_analysis['images_without_alt']:
            print(f"❌ Images missing alt text:")
            for img in image_analysis['images_without_alt'][:5]:  # Show first 5
                print(f"   - {img['src']}")
            self.accessibility_results['wcag_violations'].append({
                'type': 'missing_alt_text',
                'count': len(image_analysis['images_without_alt']),
                'severity': 'high'
            })
        
        # Accessibility assertions
        if image_analysis['total_images'] > 0:
            alt_percentage = (image_analysis['images_with_alt'] / image_analysis['total_images']) * 100
            assert alt_percentage >= 95, f"Only {alt_percentage:.1f}% of images have alt text (minimum 95%)"
    
    def test_form_accessibility(self, driver, base_url):
        """Test form accessibility (labels, fieldsets, etc.)"""
        print("\n📝 Testing Form Accessibility...")
        
        driver.get(base_url)
        WebDriverWait(driver, 20).until(
            lambda d: d.execute_script("return document.readyState") == "complete"
        )
        
        # Analyze form accessibility
        form_analysis = driver.execute_script("""
            const forms = document.querySelectorAll('form');
            const inputs = document.querySelectorAll('input, select, textarea');
            
            const analysis = {
                'total_forms': forms.length,
                'total_inputs': inputs.length,
                'inputs_with_labels': 0,
                'inputs_without_labels': [],
                'inputs_with_placeholders': 0,
                'required_fields': 0,
                'fieldsets': document.querySelectorAll('fieldset').length
            };
            
            inputs.forEach((input, index) => {
                const id = input.id;
                const name = input.name;
                const type = input.type;
                const placeholder = input.placeholder;
                const required = input.required;
                
                // Check for associated label
                let hasLabel = false;
                if (id) {
                    hasLabel = document.querySelector('label[for="' + id + '"]') !== null;
                }
                
                // Check for aria-label or aria-labelledby
                if (!hasLabel) {
                    hasLabel = input.hasAttribute('aria-label') || input.hasAttribute('aria-labelledby');
                }
                
                // Check for wrapping label
                if (!hasLabel) {
                    hasLabel = input.closest('label') !== null;
                }
                
                if (hasLabel) {
                    analysis.inputs_with_labels++;
                } else {
                    analysis.inputs_without_labels.push({
                        'type': type,
                        'name': name,
                        'id': id,
                        'index': index
                    });
                }
                
                if (placeholder) {
                    analysis.inputs_with_placeholders++;
                }
                
                if (required) {
                    analysis.required_fields++;
                }
            });
            
            return analysis;
        """)
        
        print(f"📝 Form Accessibility:")
        print(f"   Total Forms: {form_analysis['total_forms']}")
        print(f"   Total Inputs: {form_analysis['total_inputs']}")
        print(f"   Inputs with Labels: {form_analysis['inputs_with_labels']}")
        print(f"   Inputs without Labels: {len(form_analysis['inputs_without_labels'])}")
        print(f"   Required Fields: {form_analysis['required_fields']}")
        print(f"   Fieldsets: {form_analysis['fieldsets']}")
        
        # Check for form accessibility issues
        if form_analysis['inputs_without_labels']:
            print(f"❌ Form inputs missing labels:")
            for input_info in form_analysis['inputs_without_labels'][:5]:
                print(f"   - {input_info['type']} (name: {input_info['name']})")
            self.accessibility_results['wcag_violations'].append({
                'type': 'missing_form_labels',
                'count': len(form_analysis['inputs_without_labels']),
                'severity': 'high'
            })
        
        # Form accessibility assertions
        if form_analysis['total_inputs'] > 0:
            label_percentage = (form_analysis['inputs_with_labels'] / form_analysis['total_inputs']) * 100
            assert label_percentage >= 90, f"Only {label_percentage:.1f}% of form inputs have labels"
    
    def test_color_contrast(self, driver, base_url):
        """Test color contrast ratios"""
        print("\n🎨 Testing Color Contrast...")
        
        driver.get(base_url)
        WebDriverWait(driver, 20).until(
            lambda d: d.execute_script("return document.readyState") == "complete"
        )
        
        # Basic color contrast analysis
        # Note: This is a simplified check. Full contrast analysis requires specialized tools
        contrast_issues = driver.execute_script("""
            const elements = document.querySelectorAll('*');
            const issues = [];
            let checkedElements = 0;
            
            for (let i = 0; i < Math.min(elements.length, 50); i++) {
                const el = elements[i];
                const style = window.getComputedStyle(el);
                const text = el.textContent.trim();
                
                if (text && text.length > 0 && el.offsetWidth > 0 && el.offsetHeight > 0) {
                    const color = style.color;
                    const bgColor = style.backgroundColor;
                    const fontSize = parseFloat(style.fontSize);
                    
                    // Basic checks for obvious issues
                    if (color === bgColor) {
                        issues.push({
                            'element': el.tagName.toLowerCase(),
                            'text': text.substring(0, 50),
                            'issue': 'Same text and background color',
                            'color': color,
                            'backgroundColor': bgColor
                        });
                    }
                    
                    // Check for very light text on light background (basic check)
                    if (color.includes('rgb(') && bgColor.includes('rgb(')) {
                        // This is a simplified check - real contrast checking requires more complex calculations
                        checkedElements++;
                    }
                }
            }
            
            return {
                'issues': issues,
                'elements_checked': checkedElements
            };
        """)
        
        print(f"🎨 Color Contrast Analysis:")
        print(f"   Elements Checked: {contrast_issues['elements_checked']}")
        print(f"   Obvious Issues Found: {len(contrast_issues['issues'])}")
        
        if contrast_issues['issues']:
            print(f"⚠️ Color Contrast Issues:")
            for issue in contrast_issues['issues'][:3]:  # Show first 3
                print(f"   - {issue['element']}: {issue['issue']}")
            self.accessibility_results['color_contrast_issues'].extend(contrast_issues['issues'])
    
    def test_aria_attributes(self, driver, base_url):
        """Test ARIA attributes and roles"""
        print("\n🔍 Testing ARIA Attributes...")
        
        driver.get(base_url)
        WebDriverWait(driver, 20).until(
            lambda d: d.execute_script("return document.readyState") == "complete"
        )
        
        # Analyze ARIA usage
        aria_analysis = driver.execute_script("""
            const elements = document.querySelectorAll('*');
            const analysis = {
                'elements_with_role': 0,
                'elements_with_aria_label': 0,
                'elements_with_aria_labelledby': 0,
                'elements_with_aria_describedby': 0,
                'landmarks': 0,
                'aria_hidden_count': 0,
                'interactive_elements_without_labels': []
            };
            
            elements.forEach(el => {
                if (el.hasAttribute('role')) analysis.elements_with_role++;
                if (el.hasAttribute('aria-label')) analysis.elements_with_aria_label++;
                if (el.hasAttribute('aria-labelledby')) analysis.elements_with_aria_labelledby++;
                if (el.hasAttribute('aria-describedby')) analysis.elements_with_aria_describedby++;
                if (el.hasAttribute('aria-hidden')) analysis.aria_hidden_count++;
                
                const role = el.getAttribute('role');
                if (role && ['banner', 'navigation', 'main', 'contentinfo', 'complementary'].includes(role)) {
                    analysis.landmarks++;
                }
                
                // Check interactive elements without proper labels
                const tagName = el.tagName.toLowerCase();
                if (['button', 'a', 'input'].includes(tagName) && el.offsetWidth > 0) {
                    const hasLabel = el.hasAttribute('aria-label') || 
                                   el.hasAttribute('aria-labelledby') ||
                                   el.textContent.trim() ||
                                   (tagName === 'input' && (el.placeholder || document.querySelector('label[for="' + el.id + '"]')));
                    
                    if (!hasLabel) {
                        analysis.interactive_elements_without_labels.push({
                            'tag': tagName,
                            'type': el.type || '',
                            'id': el.id || '',
                            'class': el.className || ''
                        });
                    }
                }
            });
            
            return analysis;
        """)
        
        print(f"🔍 ARIA Analysis:")
        print(f"   Elements with Role: {aria_analysis['elements_with_role']}")
        print(f"   Elements with aria-label: {aria_analysis['elements_with_aria_label']}")
        print(f"   Elements with aria-labelledby: {aria_analysis['elements_with_aria_labelledby']}")
        print(f"   ARIA Landmarks: {aria_analysis['landmarks']}")
        print(f"   Interactive Elements without Labels: {len(aria_analysis['interactive_elements_without_labels'])}")
        
        if aria_analysis['interactive_elements_without_labels']:
            print(f"⚠️ Interactive elements without proper labels:")
            for el in aria_analysis['interactive_elements_without_labels'][:3]:
                print(f"   - {el['tag']} (id: {el['id']}, class: {el['class']})")
    
    def teardown_method(self):
        """Save accessibility test results"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        report_file = f"reports/homepage_accessibility_results_{timestamp}.json"
        
        import os
        os.makedirs("reports", exist_ok=True)
        
        with open(report_file, 'w') as f:
            json.dump(self.accessibility_results, f, indent=2)
        
        print(f"\n♿ Accessibility Test Summary:")
        print(f"   WCAG Violations: {len(self.accessibility_results['wcag_violations'])}")
        print(f"   Keyboard Navigation Issues: {len(self.accessibility_results['keyboard_navigation_issues'])}")
        print(f"   Color Contrast Issues: {len(self.accessibility_results['color_contrast_issues'])}")
        print(f"   Semantic Issues: {len(self.accessibility_results['semantic_issues'])}")
        print(f"   Accessibility Report: {report_file}")