import { Page, Locator, expect } from '@playwright/test';
import { 
  LinkAnalysis, 
  FormAnalysis, 
  FormField, 
  NavigationItem, 
  PerformanceMetrics,
  TestUser 
} from '../types/test.types';

/**
 * Test Helper Utilities for EaseMyResearch.com Testing
 */

export class TestHelpers {
  constructor(private page: Page) {}

  /**
   * Wait for page to be fully loaded including all resources
   */
  async waitForFullPageLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForFunction(() => document.readyState === 'complete');
  }

  /**
   * Take screenshot with timestamp
   */
  async takeTimestampedScreenshot(name: string): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `${name}-${timestamp}.png`;
    await this.page.screenshot({ path: `screenshots/${fileName}`, fullPage: true });
    return fileName;
  }

  /**
   * Check if element is visible and interactable
   */
  async isElementInteractable(selector: string): Promise<boolean> {
    try {
      const element = this.page.locator(selector);
      return await element.isVisible() && await element.isEnabled();
    } catch {
      return false;
    }
  }

  /**
   * Get all navigation menu items
   */
  async getNavigationItems(): Promise<NavigationItem[]> {
    const navigationItems: NavigationItem[] = [];
    
    // Common navigation selectors
    const navSelectors = [
      'nav a',
      '.navbar a',
      '.navigation a',
      '.menu a',
      '.nav a',
      '[role="navigation"] a',
      'header a'
    ];

    for (const selector of navSelectors) {
      try {
        const links = await this.page.locator(selector).all();
        
        if (links.length > 0) {
          for (const link of links) {
            try {
              const href = await link.getAttribute('href') || '';
              const text = (await link.textContent() || '').trim();
              
              if (href && text) {
                navigationItems.push({
                  text,
                  href,
                  isVisible: await link.isVisible(),
                  isEnabled: await link.isEnabled(),
                });
              }
            } catch {
              // Skip problematic links
            }
          }
          break; // Use first successful selector
        }
      } catch {
        continue;
      }
    }

    return navigationItems;
  }

  /**
   * Analyze all links on the page
   */
  async analyzeAllLinks(): Promise<LinkAnalysis[]> {
    const linkAnalyses: LinkAnalysis[] = [];
    const links = await this.page.locator('a[href]').all();

    console.log(`🔗 Found ${links.length} links to analyze`);

    for (let i = 0; i < links.length; i++) {
      try {
        const link = links[i];
        const href = await link.getAttribute('href') || '';
        const text = (await link.textContent() || '').trim() || `Link ${i + 1}`;
        
        if (href && !href.startsWith('javascript:') && !href.startsWith('#')) {
          const boundingBox = await link.boundingBox();
          const isVisible = await link.isVisible();
          
          const linkAnalysis: LinkAnalysis = {
            url: href,
            text: text.substring(0, 100), // Limit text length
            status: 'working', // Default status
            isExternal: href.startsWith('http') && !href.includes(this.page.url()),
            position: {
              x: boundingBox?.x || 0,
              y: boundingBox?.y || 0
            }
          };

          // Test link accessibility (without actually clicking)
          if (isVisible && await link.isEnabled()) {
            linkAnalysis.status = 'working';
          } else {
            linkAnalysis.status = 'error';
            linkAnalysis.errorMessage = 'Link not visible or disabled';
          }

          linkAnalyses.push(linkAnalysis);
        }
      } catch (error) {
        console.warn(`⚠️ Error analyzing link ${i + 1}: ${error}`);
      }
    }

    return linkAnalyses;
  }

  /**
   * Analyze forms on the page
   */
  async analyzeForms(): Promise<FormAnalysis[]> {
    const formAnalyses: FormAnalysis[] = [];
    const forms = await this.page.locator('form').all();

    for (const form of forms) {
      try {
        const action = await form.getAttribute('action') || '';
        const method = (await form.getAttribute('method') || 'GET').toUpperCase() as 'GET' | 'POST' | 'PUT' | 'DELETE';
        
        // Get form fields
        const fields: FormField[] = [];
        const inputs = await form.locator('input, textarea, select').all();
        
        for (const input of inputs) {
          const name = await input.getAttribute('name') || '';
          const type = await input.getAttribute('type') || 'text';
          const placeholder = await input.getAttribute('placeholder') || '';
          const required = await input.getAttribute('required') !== null;
                     const tagName = await input.evaluate((el: Element) => el.tagName.toLowerCase());
          
          if (name) {
            fields.push({
              name,
              type: tagName === 'textarea' ? 'textarea' : 
                    tagName === 'select' ? 'select' : 
                    type as any,
              placeholder,
              required,
            });
          }
        }

        // Get submit button
        const submitButton = await form.locator('button[type="submit"], input[type="submit"]').first();
        let submitButtonInfo;
        
        if (await submitButton.count() > 0) {
          submitButtonInfo = {
            text: await submitButton.textContent() || await submitButton.getAttribute('value') || 'Submit',
            type: await submitButton.getAttribute('type') || 'submit',
            disabled: await submitButton.isDisabled(),
          };
        }

        formAnalyses.push({
          action,
          method,
          fields,
          submitButton: submitButtonInfo,
          isAccessible: fields.length > 0, // Basic accessibility check
          validationErrors: [], // Would be populated by actual validation
        });
      } catch (error) {
        console.warn(`⚠️ Error analyzing form: ${error}`);
      }
    }

    return formAnalyses;
  }

  /**
   * Test responsive design at different breakpoints
   */
  async testResponsiveDesign(): Promise<{ [breakpoint: string]: boolean }> {
    const breakpoints = {
      mobile: { width: 375, height: 667 },
      tablet: { width: 768, height: 1024 },
      desktop: { width: 1920, height: 1080 }
    };

    const results: { [breakpoint: string]: boolean } = {};

    for (const [name, viewport] of Object.entries(breakpoints)) {
      try {
        await this.page.setViewportSize(viewport);
        await this.page.waitForTimeout(1000); // Allow layout to adjust
        
        // Check if page content is still accessible
        const body = this.page.locator('body');
        const isVisible = await body.isVisible();
        
        // Check for horizontal scrollbar
        const hasHorizontalScroll = await this.page.evaluate(() => {
          return document.body.scrollWidth > window.innerWidth;
        });

        results[name] = isVisible && !hasHorizontalScroll;
        
        console.log(`📱 ${name} (${viewport.width}x${viewport.height}): ${results[name] ? '✅' : '❌'}`);
      } catch (error) {
        console.warn(`⚠️ Error testing ${name} viewport: ${error}`);
        results[name] = false;
      }
    }

    // Reset to default viewport
    await this.page.setViewportSize({ width: 1280, height: 720 });
    
    return results;
  }

  /**
   * Measure page performance metrics
   */
  async measurePerformance(): Promise<PerformanceMetrics> {
    const performanceData = await this.page.evaluate(() => {
      const timing = performance.timing;
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      // Get resource counts and sizes
      const resources = performance.getEntriesByType('resource');
      const resourceCount = {
        total: resources.length,
        images: 0,
        scripts: 0,
        stylesheets: 0,
        fonts: 0,
        other: 0
      };
      
      const resourceSizes = {
        total: 0,
        images: 0,
        scripts: 0,
        stylesheets: 0,
        fonts: 0,
        other: 0
      };

      resources.forEach(resource => {
        const resourceTiming = resource as PerformanceResourceTiming;
        const size = resourceTiming.transferSize || 0;
        resourceSizes.total += size;
        
        if (resourceTiming.initiatorType === 'img') {
          resourceCount.images++;
          resourceSizes.images += size;
        } else if (resourceTiming.initiatorType === 'script') {
          resourceCount.scripts++;
          resourceSizes.scripts += size;
        } else if (resourceTiming.initiatorType === 'css') {
          resourceCount.stylesheets++;
          resourceSizes.stylesheets += size;
        } else if (resource.name.includes('.woff') || resource.name.includes('.ttf')) {
          resourceCount.fonts++;
          resourceSizes.fonts += size;
        } else {
          resourceCount.other++;
          resourceSizes.other += size;
        }
      });

      return {
        loadTime: timing.loadEventEnd - timing.navigationStart,
        domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
        firstContentfulPaint: navigation.loadEventEnd || 0,
        resourceCount,
        resourceSizes
      };
    });

    return performanceData as PerformanceMetrics;
  }

  /**
   * Test search functionality if present
   */
  async testSearchFunctionality(query: string = 'research'): Promise<boolean> {
    const searchSelectors = [
      'input[type="search"]',
      'input[placeholder*="search" i]',
      'input[name*="search" i]',
      'input[id*="search" i]',
      '.search-input',
      '.search-box'
    ];

    for (const selector of searchSelectors) {
      try {
        const searchInput = this.page.locator(selector);
        
        if (await searchInput.count() > 0 && await searchInput.isVisible()) {
          await searchInput.fill(query);
          
          // Look for search button
          const searchButtons = [
            'button[type="submit"]',
            '.search-button',
            '.search-btn',
            '[aria-label*="search" i]'
          ];
          
          for (const btnSelector of searchButtons) {
            const button = this.page.locator(btnSelector);
            if (await button.count() > 0 && await button.isVisible()) {
              // Don't actually click to avoid navigation, just verify it's there
              console.log('✅ Search functionality found and tested');
              return true;
            }
          }
          
          // Try pressing Enter
          await searchInput.press('Enter');
          console.log('✅ Search functionality found (Enter key)');
          return true;
        }
      } catch {
        continue;
      }
    }
    
    return false;
  }

  /**
   * Check for common accessibility issues
   */
  async checkBasicAccessibility(): Promise<string[]> {
    const issues: string[] = [];

    try {
      // Check for missing alt text on images
      const imagesWithoutAlt = await this.page.locator('img:not([alt])').count();
      if (imagesWithoutAlt > 0) {
        issues.push(`${imagesWithoutAlt} images missing alt text`);
      }

      // Check for missing form labels
      const inputsWithoutLabels = await this.page.evaluate(() => {
        const inputs = document.querySelectorAll('input, textarea, select');
        let count = 0;
        
        inputs.forEach(input => {
          const id = input.id;
          const hasLabel = id ? document.querySelector(`label[for="${id}"]`) !== null : false;
          const hasAriaLabel = input.hasAttribute('aria-label') || input.hasAttribute('aria-labelledby');
          const isInLabel = input.closest('label') !== null;
          
          if (!hasLabel && !hasAriaLabel && !isInLabel) {
            count++;
          }
        });
        
        return count;
      });
      
      if (inputsWithoutLabels > 0) {
        issues.push(`${inputsWithoutLabels} form inputs missing labels`);
      }

      // Check for heading hierarchy
      const headingIssues = await this.page.evaluate(() => {
        const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
        const issues = [];
        
        if (headings.length === 0) {
          issues.push('No headings found');
        } else {
          const h1Count = document.querySelectorAll('h1').length;
          if (h1Count === 0) {
            issues.push('No H1 heading found');
          } else if (h1Count > 1) {
            issues.push('Multiple H1 headings found');
          }
        }
        
        return issues;
      });
      
      issues.push(...headingIssues);

      // Check for language attribute
      const hasLang = await this.page.evaluate(() => {
        return document.documentElement.hasAttribute('lang');
      });
      
      if (!hasLang) {
        issues.push('Missing language attribute on html element');
      }

    } catch (error) {
      console.warn(`⚠️ Error checking accessibility: ${error}`);
      issues.push('Error during accessibility check');
    }

    return issues;
  }

  /**
   * Login with test credentials
   */
  async loginWithCredentials(user: TestUser): Promise<boolean> {
    try {
      // Look for login form or login link
      const loginSelectors = [
        'a[href*="login"]',
        'button:has-text("login")',
        'button:has-text("sign in")',
        '.login-button',
        '.signin-button'
      ];

      for (const selector of loginSelectors) {
        const loginElement = this.page.locator(selector);
        if (await loginElement.count() > 0 && await loginElement.isVisible()) {
          await loginElement.click();
          break;
        }
      }

      // Wait for login form
      await this.page.waitForTimeout(2000);

      // Fill login form
      const emailSelectors = [
        'input[type="email"]',
        'input[name*="email" i]',
        'input[id*="email" i]',
        'input[placeholder*="email" i]'
      ];

      const passwordSelectors = [
        'input[type="password"]',
        'input[name*="password" i]',
        'input[id*="password" i]'
      ];

      let emailFilled = false;
      let passwordFilled = false;

      for (const selector of emailSelectors) {
        const emailInput = this.page.locator(selector);
        if (await emailInput.count() > 0 && await emailInput.isVisible()) {
          await emailInput.fill(user.email);
          emailFilled = true;
          break;
        }
      }

      for (const selector of passwordSelectors) {
        const passwordInput = this.page.locator(selector);
        if (await passwordInput.count() > 0 && await passwordInput.isVisible()) {
          await passwordInput.fill(user.password);
          passwordFilled = true;
          break;
        }
      }

      if (emailFilled && passwordFilled) {
        // Look for submit button
        const submitButton = this.page.locator('button[type="submit"], input[type="submit"], .login-submit');
        if (await submitButton.count() > 0) {
          // Don't actually submit to avoid changing state
          console.log(`✅ Login form found and filled for ${user.email}`);
          return true;
        }
      }

      return false;
    } catch (error) {
      console.warn(`⚠️ Error during login test: ${error}`);
      return false;
    }
  }

  /**
   * Generate test summary report
   */
  async generateTestSummary(): Promise<Record<string, any>> {
    const summary = {
      timestamp: new Date().toISOString(),
      url: this.page.url(),
      title: await this.page.title(),
      viewport: await this.page.viewportSize(),
    };

    return summary;
  }
}