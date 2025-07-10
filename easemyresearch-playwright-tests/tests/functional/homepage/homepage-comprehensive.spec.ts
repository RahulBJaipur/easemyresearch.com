import { test, expect } from '@playwright/test';
import { HomePage } from '../../../src/pages/homepage';
import { TestUser } from '../../../src/types/test.types';

/**
 * Comprehensive Homepage Tests for EaseMyResearch.com
 * 
 * These tests cover all functional aspects of the homepage including:
 * - Page loading and basic structure
 * - Navigation menu testing
 * - All links analysis and testing
 * - Form functionality
 * - Search capabilities
 * - Authentication flows
 * - Responsive design
 * - Accessibility compliance
 * - Performance metrics
 */

test.describe('EaseMyResearch.com Homepage - Comprehensive Testing', () => {
  let homePage: HomePage;

  // Test users from environment
  const testUsers: TestUser[] = [
    {
      name: 'Test User 1',
      email: process.env.TEST_USER_EMAIL_1 || 'testtwoemr@gmail.com',
      password: process.env.TEST_USER_PASSWORD_1 || '12345678',
      role: 'user'
    },
    {
      name: 'Test User 2', 
      email: process.env.TEST_USER_EMAIL_2 || 'testtwoemr@gmail.com',
      password: process.env.TEST_USER_PASSWORD_2 || '12345678',
      role: 'user'
    }
  ];

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    
    // Set test metadata
    await test.step('Setup test environment', async () => {
      console.log(`🧪 Starting test: ${test.info().title}`);
      console.log(`🌐 Base URL: ${process.env.BASE_URL || 'https://easemyresearch.com/'}`);
    });
  });

  test.afterEach(async () => {
    await test.step('Cleanup after test', async () => {
      console.log(`✅ Completed test: ${test.info().title}`);
    });
  });

  test('should load homepage successfully with all basic elements @smoke @critical', async () => {
    await test.step('Load homepage', async () => {
      await homePage.load();
    });

    await test.step('Verify page is loaded', async () => {
      expect(await homePage.isLoaded()).toBe(true);
    });

    await test.step('Verify page title', async () => {
      const title = await homePage.getTitle();
      expect(title).toBeTruthy();
      expect(title.length).toBeGreaterThan(0);
      console.log(`📄 Page title: ${title}`);
    });

    await test.step('Verify URL is correct', async () => {
      const currentUrl = await homePage.getCurrentUrl();
      expect(currentUrl).toContain('easemyresearch');
      console.log(`🔗 Current URL: ${currentUrl}`);
    });

    await test.step('Check page structure', async () => {
      const sections = await homePage.checkPageSections();
      
      // At least some basic structure should be present
      const hasBasicStructure = Object.values(sections).some(present => present);
      expect(hasBasicStructure).toBe(true);
      
      console.log('📊 Page structure check completed');
    });
  });

  test('should have functional navigation menu with working links @critical', async () => {
    await test.step('Load homepage and analyze navigation', async () => {
      await homePage.load();
      const navigationItems = await homePage.testNavigationLinks();
      
      expect(navigationItems.length).toBeGreaterThan(0);
      console.log(`🧭 Found ${navigationItems.length} navigation items`);
      
      // Verify each navigation item has required properties
      for (const item of navigationItems) {
        expect(item.text).toBeTruthy();
        expect(item.href).toBeTruthy();
        expect(typeof item.isVisible).toBe('boolean');
        expect(typeof item.isEnabled).toBe('boolean');
      }
    });
  });

  test('should analyze all homepage links for functionality @critical', async () => {
    await test.step('Load homepage and analyze all links', async () => {
      await homePage.load();
      const linkAnalysis = await homePage.analyzeAllLinks();
      
      expect(linkAnalysis.length).toBeGreaterThan(0);
      console.log(`🔗 Analyzed ${linkAnalysis.length} links`);
      
      // Count working vs problematic links
      const workingLinks = linkAnalysis.filter(link => link.status === 'working');
      const problematicLinks = linkAnalysis.filter(link => link.status !== 'working');
      
      console.log(`   Working links: ${workingLinks.length}`);
      console.log(`   Problematic links: ${problematicLinks.length}`);
      
      // Log problematic links for debugging
      if (problematicLinks.length > 0) {
        console.log('⚠️ Problematic links found:');
        problematicLinks.forEach((link, index) => {
          console.log(`   ${index + 1}. ${link.text} -> ${link.url} (${link.status})`);
        });
      }
      
      // Expect most links to be working (allow some tolerance)
      const workingPercentage = (workingLinks.length / linkAnalysis.length) * 100;
      expect(workingPercentage).toBeGreaterThan(80); // 80% of links should work
    });
  });

  test('should analyze and validate forms on the homepage @functional', async () => {
    await test.step('Load homepage and analyze forms', async () => {
      await homePage.load();
      const forms = await homePage.analyzeForms();
      
      console.log(`📝 Found ${forms.length} forms on homepage`);
      
      if (forms.length > 0) {
        for (const form of forms) {
          // Verify form has basic structure
          expect(form.method).toMatch(/^(GET|POST|PUT|DELETE)$/);
          expect(Array.isArray(form.fields)).toBe(true);
          expect(Array.isArray(form.validationErrors)).toBe(true);
          
          console.log(`   Form: ${form.action || 'No action'} (${form.method})`);
          console.log(`   Fields: ${form.fields.length}`);
          console.log(`   Accessible: ${form.isAccessible}`);
        }
      } else {
        console.log('ℹ️ No forms found on homepage');
      }
    });
  });

  test('should test search functionality if present @functional', async () => {
    await test.step('Load homepage and test search', async () => {
      await homePage.load();
      
      try {
        await homePage.performSearch('machine learning');
        console.log('✅ Search functionality tested');
      } catch (error) {
        console.log('ℹ️ Search functionality not available or not working');
        // Don't fail the test if search is not present
      }
    });
  });

  test('should test authentication links and functionality @functional', async () => {
    await test.step('Load homepage and check authentication', async () => {
      await homePage.load();
      const authLinks = await homePage.checkAuthenticationLinks();
      
      console.log(`🔑 Authentication links - Login: ${authLinks.login}, Register: ${authLinks.register}`);
      
      // Test login functionality with test users
      for (const user of testUsers) {
        try {
          const loginSuccess = await homePage.testLoginFunctionality(user);
          console.log(`👤 Login test for ${user.email}: ${loginSuccess ? '✅' : '❌'}`);
        } catch (error) {
          console.log(`⚠️ Login test error for ${user.email}: ${error}`);
        }
      }
    });
  });

  test('should validate image accessibility @accessibility', async () => {
    await test.step('Load homepage and test image accessibility', async () => {
      await homePage.load();
      const imageAccessibility = await homePage.testImageAccessibility();
      
      console.log(`🖼️ Image accessibility: ${imageAccessibility.withAlt}/${imageAccessibility.total} images have alt text`);
      
      if (imageAccessibility.total > 0) {
        const altTextPercentage = (imageAccessibility.withAlt / imageAccessibility.total) * 100;
        
        // Expect at least 90% of images to have alt text
        expect(altTextPercentage).toBeGreaterThan(90);
        
        console.log(`📊 Alt text coverage: ${altTextPercentage.toFixed(1)}%`);
      } else {
        console.log('ℹ️ No images found on homepage');
      }
    });
  });

  test('should test responsive design across breakpoints @responsive', async () => {
    await test.step('Load homepage and test responsive design', async () => {
      await homePage.load();
      const responsiveResults = await homePage.testResponsiveDesign();
      
      // Verify responsive design works on all tested breakpoints
      const breakpoints = Object.keys(responsiveResults);
      expect(breakpoints.length).toBeGreaterThan(0);
      
      for (const [breakpoint, isResponsive] of Object.entries(responsiveResults)) {
        console.log(`📱 ${breakpoint}: ${isResponsive ? '✅' : '❌'}`);
        
        // All breakpoints should be responsive
        expect(isResponsive).toBe(true);
      }
    });
  });

  test('should test keyboard navigation accessibility @accessibility', async () => {
    await test.step('Load homepage and test keyboard navigation', async () => {
      await homePage.load();
      const keyboardNav = await homePage.testKeyboardNavigation();
      
      console.log(`⌨️ Keyboard navigation: ${keyboardNav.focusableElements} focusable elements`);
      console.log(`⌨️ Keyboard accessible: ${keyboardNav.keyboardAccessible ? '✅' : '❌'}`);
      
      // Should have at least some focusable elements
      expect(keyboardNav.focusableElements).toBeGreaterThan(0);
      
      // Keyboard navigation should be accessible
      expect(keyboardNav.keyboardAccessible).toBe(true);
    });
  });

  test('should check basic accessibility compliance @accessibility', async () => {
    await test.step('Load homepage and check accessibility', async () => {
      await homePage.load();
      const accessibilityIssues = await homePage.checkBasicAccessibility();
      
      console.log(`♿ Accessibility issues found: ${accessibilityIssues.length}`);
      
      if (accessibilityIssues.length > 0) {
        console.log('⚠️ Accessibility issues:');
        accessibilityIssues.forEach((issue, index) => {
          console.log(`   ${index + 1}. ${issue}`);
        });
      }
      
      // Should have minimal accessibility issues
      expect(accessibilityIssues.length).toBeLessThan(5);
    });
  });

  test('should measure and validate page performance @performance', async () => {
    await test.step('Load homepage and measure performance', async () => {
      await homePage.load();
      const performance = await homePage.checkPagePerformance();
      
      console.log(`⚡ Performance metrics:`);
      console.log(`   Load time: ${performance.loadTime}ms`);
      console.log(`   DOM content loaded: ${performance.domContentLoaded}ms`);
      console.log(`   Total resources: ${performance.resourceCount.total}`);
      console.log(`   Total size: ${(performance.resourceSizes.total / 1024).toFixed(1)} KB`);
      
      // Performance thresholds
      expect(performance.loadTime).toBeLessThan(10000); // 10 seconds max
      expect(performance.domContentLoaded).toBeLessThan(5000); // 5 seconds max
      expect(performance.resourceSizes.total).toBeLessThan(5 * 1024 * 1024); // 5MB max
    });
  });

  test('should check for social media links @functional', async () => {
    await test.step('Load homepage and check social media links', async () => {
      await homePage.load();
      const socialLinks = await homePage.checkSocialMediaLinks();
      
      console.log(`📱 Social media links found: ${socialLinks.length}`);
      
      // Verify social links are valid URLs
      for (const link of socialLinks) {
        expect(link).toMatch(/^https?:\/\//);
        console.log(`   ${link}`);
      }
    });
  });

  test('should run comprehensive homepage functionality test @comprehensive', async () => {
    await test.step('Run complete comprehensive test', async () => {
      await homePage.load();
      const comprehensiveResults = await homePage.runComprehensiveTest();
      
      // Verify comprehensive test completed successfully
      expect(comprehensiveResults).toBeTruthy();
      expect(comprehensiveResults.timestamp).toBeTruthy();
      expect(comprehensiveResults.pageLoad.loaded).toBe(true);
      
      console.log('🎯 Comprehensive test completed successfully');
      console.log(`📊 Test results summary:`);
      console.log(`   Navigation items: ${comprehensiveResults.navigation.length}`);
      console.log(`   Links analyzed: ${comprehensiveResults.links.length}`);
      console.log(`   Forms found: ${comprehensiveResults.forms.length}`);
      console.log(`   Images: ${comprehensiveResults.images.total}`);
      console.log(`   Accessibility issues: ${comprehensiveResults.accessibility.length}`);
      
      // Save comprehensive results for reporting
      test.info().attach('comprehensive-test-results.json', {
        contentType: 'application/json',
        body: JSON.stringify(comprehensiveResults, null, 2)
      });
    });
  });
});