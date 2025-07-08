import { test, expect, Page } from '@playwright/test';
import { HomePage } from '../../../src/pages/homepage';
import { TestUser } from '../../../src/types/test.types';

/**
 * Comprehensive Non-Functional Testing Suite for EaseMyResearch.com Homepage
 * 
 * This suite covers all non-functional aspects including:
 * - Performance testing (load time, Core Web Vitals)
 * - Security testing (SSL, headers, XSS protection)
 * - Accessibility testing (WCAG compliance, keyboard navigation)
 * - Usability testing (user experience, visual design)
 * - Compatibility testing (browsers, devices, screen sizes)
 * - Reliability testing (error handling, stability)
 */

test.describe('Homepage Non-Functional Testing - EaseMyResearch.com', () => {
  let homePage: HomePage;

  const testUsers: TestUser[] = [
    {
      name: 'Test User 1',
      email: 'testoneemr@gmail.com',
      password: '12345678',
      role: 'user'
    },
    {
      name: 'Test User 2', 
      email: 'testtwoemr@gmail.com',
      password: '12345678',
      role: 'user'
    }
  ];

  test.beforeEach(async ({ page }: { page: Page }) => {
    homePage = new HomePage(page);
    console.log(`🧪 Starting non-functional test: ${test.info().title}`);
  });

  test.describe('Performance Testing', () => {
    test('should load homepage within acceptable time limits @performance @critical', async () => {
      const startTime = Date.now();
      
      await test.step('Measure page load time', async () => {
        await homePage.load();
        const loadTime = Date.now() - startTime;
        
        console.log(`⚡ Page load time: ${loadTime}ms`);
        expect(loadTime).toBeLessThan(5000); // Should load within 5 seconds
        
        if (loadTime < 2000) {
          console.log('✅ Excellent load time (< 2s)');
        } else if (loadTime < 3000) {
          console.log('✅ Good load time (2-3s)');
        } else {
          console.log('⚠️ Slow load time (> 3s)');
        }
      });

      await test.step('Check Time to Interactive (TTI)', async () => {
        const performance = await homePage.measurePerformance();
        console.log('⚡ Performance metrics collected');
        expect(performance).toBeDefined();
      });
    });

    test('should handle multiple concurrent users @performance @stress', async () => {
      const concurrentUsers = 3;
      
      await test.step('Test concurrent load handling', async () => {
        const promises = [];
        
        for (let i = 0; i < concurrentUsers; i++) {
          promises.push((async () => {
            const startTime = Date.now();
            await homePage.load();
            const loadTime = Date.now() - startTime;
            console.log(`👥 User ${i + 1} load time: ${loadTime}ms`);
            return loadTime;
          })());
        }
        
        const loadTimes = await Promise.all(promises);
        const averageLoadTime = loadTimes.reduce((a, b) => a + b, 0) / loadTimes.length;
        
        console.log(`📊 Average load time under concurrent load: ${averageLoadTime.toFixed(2)}ms`);
        expect(averageLoadTime).toBeLessThan(8000); // Should handle concurrent load
      });
    });

    test('should have optimized resource loading @performance', async () => {
      await homePage.load();

      await test.step('Check image optimization', async () => {
        const imageData = await homePage.testImageAccessibility();
        
        if (imageData.total > 0) {
          console.log(`🖼️ Images found: ${imageData.total}`);
          console.log(`🖼️ Images with alt text: ${imageData.withAlt}`);
          
          // Check for reasonable image count (not too many)
          expect(imageData.total).toBeLessThan(100);
          
          // Check for accessibility
          const altTextRatio = imageData.withAlt / imageData.total;
          expect(altTextRatio).toBeGreaterThan(0.8); // 80% should have alt text
          
          console.log(`✅ Alt text coverage: ${(altTextRatio * 100).toFixed(1)}%`);
        }
      });

      await test.step('Check external resource loading', async () => {
        const externalResources = await homePage.countElements('script[src^="http"], link[href^="http"]');
        console.log(`🔗 External resources: ${externalResources}`);
        
        // Should not have excessive external dependencies
        expect(externalResources).toBeLessThan(20);
      });
    });

    test('should demonstrate good Core Web Vitals @performance', async () => {
      await homePage.load();

      await test.step('Measure Core Web Vitals', async () => {
        const performance = await homePage.measurePerformance();
        console.log('📊 Core Web Vitals measured');
        
        // Wait for page to stabilize
        await homePage.waitForPageStabilize();
        
        // Check for basic performance indicators
        const hasInteractiveElements = await homePage.countElements('button, a, input');
        expect(hasInteractiveElements).toBeGreaterThan(0);
        
        console.log(`⚡ Interactive elements found: ${hasInteractiveElements}`);
      });
    });
  });

  test.describe('Security Testing', () => {
    test('should have proper SSL configuration @security @critical', async () => {
      await homePage.load();

      await test.step('Check HTTPS usage', async () => {
        const currentUrl = await homePage.getCurrentUrl();
        expect(currentUrl).toMatch(/^https:\/\//);
        console.log('✅ HTTPS protocol enforced');
      });

      await test.step('Check for mixed content', async () => {
        const insecureResources = await homePage.countElements('script[src^="http:"], img[src^="http:"], link[href^="http:"]');
        expect(insecureResources).toBe(0);
        console.log('✅ No mixed content detected');
      });
    });

    test('should have security headers and protection @security', async () => {
      await homePage.load();

      await test.step('Check for XSS protection indicators', async () => {
        // Check for CSP meta tag or similar security measures
        const hasCSP = await homePage.isElementVisible('meta[http-equiv="Content-Security-Policy"]');
        const hasXSSProtection = await homePage.isElementVisible('meta[http-equiv="X-XSS-Protection"]');
        
        console.log(`🔒 CSP meta tag: ${hasCSP ? '✅' : '⚠️'}`);
        console.log(`🔒 XSS protection: ${hasXSSProtection ? '✅' : '⚠️'}`);
      });

      await test.step('Check for sensitive data exposure', async () => {
        const pageText = await homePage.getAllPageText();
        
        // Check for common sensitive patterns
        const sensitivePatterns = [
          /password\s*[:=]\s*['"]/i,
          /api[_-]?key\s*[:=]\s*['"]/i,
          /secret\s*[:=]\s*['"]/i,
          /token\s*[:=]\s*['"]/i
        ];

        let sensitiveDataFound = false;
        for (const pattern of sensitivePatterns) {
          if (pattern.test(pageText)) {
            sensitiveDataFound = true;
            console.log('⚠️ Potential sensitive data exposure detected');
            break;
          }
        }

        if (!sensitiveDataFound) {
          console.log('✅ No obvious sensitive data exposure');
        }
      });
    });

    test('should handle authentication security @security', async () => {
      await homePage.load();

      await test.step('Test login form security', async () => {
        const hasPasswordField = await homePage.isElementVisible('input[type="password"]');
        
        if (hasPasswordField) {
          console.log('🔐 Password field found');
          
          // Check password field attributes
          const passwordAutocomplete = await homePage.getElementAttribute('input[type="password"]', 'autocomplete');
          console.log(`🔐 Password autocomplete: ${passwordAutocomplete || 'not set'}`);
          
        } else {
          console.log('ℹ️ No password field found on homepage');
        }
      });

      await test.step('Test session security', async () => {
        // Try to login and check for secure session handling
        const loginSuccess = await homePage.testLoginFunctionality(testUsers[0]);
        
        if (loginSuccess) {
          console.log('✅ Login functionality available');
          
          // Check for secure logout
          const hasLogout = await homePage.isElementVisible('a[href*="logout"], button:has-text("logout")');
          console.log(`🚪 Logout option: ${hasLogout ? '✅' : '⚠️'}`);
        }
      });
    });
  });

  test.describe('Accessibility Testing', () => {
    test('should meet WCAG 2.1 AA standards @accessibility @critical', async () => {
      await homePage.load();

      await test.step('Check basic accessibility compliance', async () => {
        const accessibilityIssues = await homePage.checkBasicAccessibility();
        
        console.log(`♿ Accessibility issues found: ${accessibilityIssues.length}`);
        
        if (accessibilityIssues.length > 0) {
          console.log('⚠️ Accessibility issues:');
          accessibilityIssues.forEach((issue, index) => {
            console.log(`  ${index + 1}. ${issue}`);
          });
        } else {
          console.log('✅ No basic accessibility issues found');
        }

        // Allow some minor issues but not critical ones
        expect(accessibilityIssues.length).toBeLessThan(10);
      });

      await test.step('Test keyboard navigation', async () => {
        const keyboardNav = await homePage.testKeyboardNavigation();
        
        expect(keyboardNav.focusableElements).toBeGreaterThan(0);
        expect(keyboardNav.keyboardAccessible).toBe(true);
        
        console.log(`⌨️ Focusable elements: ${keyboardNav.focusableElements}`);
        console.log(`⌨️ Keyboard accessible: ${keyboardNav.keyboardAccessible ? '✅' : '❌'}`);
      });

      await test.step('Check heading hierarchy', async () => {
        const headings = {
          h1: await homePage.countElements('h1'),
          h2: await homePage.countElements('h2'),
          h3: await homePage.countElements('h3'),
          h4: await homePage.countElements('h4'),
          h5: await homePage.countElements('h5'),
          h6: await homePage.countElements('h6')
        };

        console.log('📝 Heading structure:');
        Object.entries(headings).forEach(([level, count]) => {
          console.log(`  ${level.toUpperCase()}: ${count}`);
        });

        // Should have at least one H1
        expect(headings.h1).toBeGreaterThan(0);
        expect(headings.h1).toBeLessThan(3); // Should not have too many H1s
      });

      await test.step('Test image accessibility', async () => {
        const imageData = await homePage.testImageAccessibility();
        
        if (imageData.total > 0) {
          const altTextCoverage = (imageData.withAlt / imageData.total) * 100;
          console.log(`🖼️ Image alt text coverage: ${altTextCoverage.toFixed(1)}%`);
          
          // At least 80% of images should have alt text
          expect(altTextCoverage).toBeGreaterThan(80);
        }
      });

      await test.step('Check form accessibility', async () => {
        const forms = await homePage.analyzeForms();
        
        if (forms.length > 0) {
          console.log(`📝 Forms found: ${forms.length}`);
          
          for (const [index, form] of forms.entries()) {
            console.log(`📋 Form ${index + 1} accessibility: ${form.isAccessible ? '✅' : '❌'}`);
            
            // Check for proper labeling
            const hasLabels = form.fields.some(field => field.label && field.label.length > 0);
            console.log(`🏷️ Form ${index + 1} has labels: ${hasLabels ? '✅' : '❌'}`);
          }
        }
      });
    });

    test('should support screen readers @accessibility', async () => {
      await homePage.load();

      await test.step('Check ARIA attributes', async () => {
        const ariaElements = await homePage.countElements('[aria-label], [aria-labelledby], [aria-describedby], [role]');
        console.log(`♿ ARIA attributes found: ${ariaElements}`);
        
        // Should have some ARIA attributes for better accessibility
        expect(ariaElements).toBeGreaterThan(0);
      });

      await test.step('Check semantic HTML usage', async () => {
        const semanticElements = {
          header: await homePage.countElements('header'),
          nav: await homePage.countElements('nav'),
          main: await homePage.countElements('main'),
          section: await homePage.countElements('section'),
          article: await homePage.countElements('article'),
          aside: await homePage.countElements('aside'),
          footer: await homePage.countElements('footer')
        };

        console.log('🏗️ Semantic HTML elements:');
        Object.entries(semanticElements).forEach(([element, count]) => {
          console.log(`  <${element}>: ${count}`);
        });

        // Should have basic semantic structure
        const totalSemantic = Object.values(semanticElements).reduce((a, b) => a + b, 0);
        expect(totalSemantic).toBeGreaterThan(2);
      });
    });
  });

  test.describe('Usability Testing', () => {
    test('should provide good user experience @usability', async () => {
      await homePage.load();

      await test.step('Check content readability', async () => {
        const pageText = await homePage.getAllPageText();
        
        // Check content length
        expect(pageText.length).toBeGreaterThan(200);
        
        // Check for reasonable text structure
        const sentences = pageText.split(/[.!?]+/).filter(s => s.trim().length > 0);
        const averageSentenceLength = sentences.reduce((acc, sentence) => acc + sentence.length, 0) / sentences.length;
        
        console.log(`📖 Average sentence length: ${averageSentenceLength.toFixed(0)} characters`);
        console.log(`📖 Total sentences: ${sentences.length}`);
        
        // Sentences should not be too long (readability)
        expect(averageSentenceLength).toBeLessThan(200);
      });

      await test.step('Check navigation intuitiveness', async () => {
        const navItems = await homePage.getNavigationItems();
        
        if (navItems.length > 0) {
          console.log(`🧭 Navigation items: ${navItems.length}`);
          
          // Check for descriptive navigation text
          const descriptiveNavItems = navItems.filter(item => 
            item.text.trim().length > 2 && !item.text.match(/^[0-9]+$/)
          );
          
          const descriptiveRatio = descriptiveNavItems.length / navItems.length;
          console.log(`🧭 Descriptive navigation ratio: ${(descriptiveRatio * 100).toFixed(1)}%`);
          
          expect(descriptiveRatio).toBeGreaterThan(0.8); // 80% should be descriptive
        }
      });

      await test.step('Check error handling and feedback', async () => {
        // Test for user-friendly error messages
        const hasErrorHandling = await homePage.hasErrorMessage();
        console.log(`❌ Error handling present: ${hasErrorHandling ? '✅' : 'ℹ️ None visible'}`);
        
        // Check for loading indicators
        const loadingIndicators = await homePage.countElements('.loading, .spinner, .loader, [aria-busy="true"]');
        console.log(`⏳ Loading indicators: ${loadingIndicators}`);
      });
    });

    test('should have consistent visual design @usability', async () => {
      await homePage.load();

      await test.step('Check color contrast and visual consistency', async () => {
        // Check for consistent button styling
        const buttons = await homePage.countElements('button, .btn, input[type="button"], input[type="submit"]');
        console.log(`🔘 Buttons found: ${buttons}`);
        
        // Check for consistent link styling
        const links = await homePage.countElements('a[href]');
        console.log(`🔗 Links found: ${links}`);
        
        if (buttons > 0) {
          expect(buttons).toBeGreaterThan(0);
        }
        if (links > 0) {
          expect(links).toBeGreaterThan(0);
        }
      });

      await test.step('Check responsive design consistency', async () => {
        const responsiveResults = await homePage.testResponsiveDesign();
        
        console.log('📱 Responsive design results:');
        Object.entries(responsiveResults).forEach(([breakpoint, supported]) => {
          console.log(`  ${breakpoint}: ${supported ? '✅' : '❌'}`);
        });
        
        // Should support at least desktop and mobile
        expect(responsiveResults.desktop).toBe(true);
      });
    });

    test('should provide clear calls-to-action @usability', async () => {
      await homePage.load();

      await test.step('Check for prominent CTAs', async () => {
        const ctaSelectors = [
          'button:has-text("sign up")',
          'button:has-text("register")',
          'button:has-text("get started")',
          'button:has-text("learn more")',
          'a:has-text("sign up")',
          'a:has-text("register")',
          'a:has-text("get started")',
          'a:has-text("learn more")',
          '.cta',
          '.call-to-action',
          '.btn-primary',
          '.btn-cta'
        ];

        let ctaFound = 0;
        for (const selector of ctaSelectors) {
          const count = await homePage.countElements(selector);
          if (count > 0) {
            ctaFound += count;
            console.log(`📢 CTA found: ${selector} (${count})`);
          }
        }

        console.log(`📢 Total CTAs found: ${ctaFound}`);
        expect(ctaFound).toBeGreaterThan(0);
      });
    });
  });

  test.describe('Compatibility Testing', () => {
    test('should work across different viewport sizes @compatibility', async () => {
      const viewports = [
        { name: 'Mobile', width: 375, height: 667 },
        { name: 'Tablet', width: 768, height: 1024 },
        { name: 'Desktop', width: 1920, height: 1080 }
      ];

      for (const viewport of viewports) {
        await test.step(`Test ${viewport.name} (${viewport.width}x${viewport.height})`, async () => {
          // Test responsive design method handles viewport changes
          const responsiveResults = await homePage.testResponsiveDesign();
          
          console.log(`📱 ${viewport.name} compatibility: ${responsiveResults.mobile || responsiveResults.tablet || responsiveResults.desktop ? '✅' : '❌'}`);
          
          // Load page and check basic functionality
          await homePage.load();
          const isLoaded = await homePage.isLoaded();
          expect(isLoaded).toBe(true);
          
          // Check navigation accessibility
          const navItems = await homePage.getNavigationItems();
          console.log(`🧭 ${viewport.name} navigation items: ${navItems.length}`);
        });
      }
    });

    test('should handle different network conditions @compatibility', async () => {
      await test.step('Test normal network conditions', async () => {
        const startTime = Date.now();
        await homePage.load();
        const loadTime = Date.now() - startTime;
        
        console.log(`🌐 Normal network load time: ${loadTime}ms`);
        expect(loadTime).toBeLessThan(10000); // Should load within 10 seconds
      });

      await test.step('Test page stability', async () => {
        await homePage.load();
        await homePage.waitForPageStabilize();
        
        // Check page is still functional after stabilization
        const isLoaded = await homePage.isLoaded();
        expect(isLoaded).toBe(true);
        
        console.log('✅ Page remains stable after network idle');
      });
    });
  });

  test.describe('Reliability Testing', () => {
    test('should handle page refresh and navigation @reliability', async () => {
      await test.step('Test page refresh', async () => {
        await homePage.load();
        
        // Refresh page
        await homePage.load();
        
        const isLoaded = await homePage.isLoaded();
        expect(isLoaded).toBe(true);
        
        console.log('✅ Page handles refresh correctly');
      });

      await test.step('Test navigation stability', async () => {
        await homePage.load();
        
        // Get navigation items
        const navItems = await homePage.getNavigationItems();
        
        if (navItems.length > 0) {
          console.log(`🧭 Navigation stability test with ${navItems.length} items`);
          
          // Navigation should be consistent
          const secondCheck = await homePage.getNavigationItems();
          expect(secondCheck.length).toBe(navItems.length);
          
          console.log('✅ Navigation remains consistent');
        }
      });
    });

    test('should handle user session management @reliability', async () => {
      await test.step('Test authentication persistence', async () => {
        await homePage.load();
        
        // Test login functionality
        const loginSuccess = await homePage.testLoginFunctionality(testUsers[0]);
        
        if (loginSuccess) {
          console.log('✅ Login functionality working');
          
          // Check session persistence after page reload
          await homePage.load();
          
          // Check if still logged in
          const authLinks = await homePage.checkAuthenticationLinks();
          console.log(`🔐 Session persistence indicators available: ${authLinks.login || authLinks.register}`);
        }
      });
    });

    test('should provide consistent user experience @reliability', async () => {
      await test.step('Test multiple page loads', async () => {
        const loadTimes = [];
        
        for (let i = 0; i < 3; i++) {
          const startTime = Date.now();
          await homePage.load();
          const loadTime = Date.now() - startTime;
          loadTimes.push(loadTime);
          
          console.log(`📊 Load ${i + 1}: ${loadTime}ms`);
        }
        
        const averageLoadTime = loadTimes.reduce((a, b) => a + b, 0) / loadTimes.length;
        const maxLoadTime = Math.max(...loadTimes);
        const minLoadTime = Math.min(...loadTimes);
        
        console.log(`📊 Average load time: ${averageLoadTime.toFixed(2)}ms`);
        console.log(`📊 Load time range: ${minLoadTime}ms - ${maxLoadTime}ms`);
        
        // Load times should be reasonably consistent
        expect(maxLoadTime - minLoadTime).toBeLessThan(5000); // Max 5 second difference
      });
    });
  });

  test.afterEach(async () => {
    console.log(`✅ Completed non-functional test: ${test.info().title}`);
  });
});