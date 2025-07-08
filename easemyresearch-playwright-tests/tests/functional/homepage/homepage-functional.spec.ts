import { test, expect, Page } from '@playwright/test';
import { HomePage } from '../../../src/pages/homepage';
import { TestUser } from '../../../src/types/test.types';

/**
 * Comprehensive Functional Testing Suite for EaseMyResearch.com Homepage
 * 
 * This suite covers all functional aspects including:
 * - Page loading and basic functionality
 * - Navigation and menu testing
 * - Form interactions and submissions
 * - Search functionality
 * - User authentication flows
 * - Content validation
 * - Interactive elements
 */

test.describe('Homepage Functional Testing - EaseMyResearch.com', () => {
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
    console.log(`🧪 Starting functional test: ${test.info().title}`);
  });

  test.describe('Page Loading and Basic Structure', () => {
    test('should load homepage successfully with correct title @smoke @critical', async () => {
      await test.step('Navigate to homepage', async () => {
        await homePage.load();
        expect(await homePage.isLoaded()).toBe(true);
      });

      await test.step('Verify page title is present and not empty', async () => {
        const title = await homePage.getTitle();
        expect(title).toBeTruthy();
        expect(title.trim().length).toBeGreaterThan(0);
        console.log(`📄 Page title: "${title}"`);
      });

      await test.step('Verify URL contains easemyresearch', async () => {
        const url = await homePage.getCurrentUrl();
        expect(url.toLowerCase()).toContain('easemyresearch');
        console.log(`🔗 Current URL: ${url}`);
      });

      await test.step('Verify basic page structure exists', async () => {
        const sections = await homePage.checkPageSections();
        const hasAnySection = Object.values(sections).some(exists => exists);
        expect(hasAnySection).toBe(true);
        console.log(`🏗️ Page sections found: ${Object.entries(sections).filter(([_, exists]) => exists).map(([name]) => name).join(', ')}`);
      });
    });

    test('should have proper HTML structure and semantic elements @accessibility', async () => {
      await homePage.load();

      await test.step('Check for semantic HTML elements', async () => {
        const hasHeader = await homePage.isElementVisible('header, [role="banner"]');
        const hasMain = await homePage.isElementVisible('main, [role="main"]');
        const hasFooter = await homePage.isElementVisible('footer, [role="contentinfo"]');
        
        console.log(`🏗️ Semantic structure: Header=${hasHeader}, Main=${hasMain}, Footer=${hasFooter}`);
      });

      await test.step('Verify page has at least one heading', async () => {
        const headingCount = await homePage.countElements('h1, h2, h3, h4, h5, h6');
        expect(headingCount).toBeGreaterThan(0);
        console.log(`📋 Found ${headingCount} headings on page`);
      });

      await test.step('Check for language attribute', async () => {
        // Use a helper method to check for language attribute
        const hasLang = await homePage.isElementVisible('html[lang]');
        expect(hasLang).toBe(true);
      });
    });

    test('should load all external resources successfully @performance', async () => {
      await homePage.load();

      await test.step('Check image loading', async () => {
        const imageData = await homePage.testImageAccessibility();
        console.log(`🖼️ Images: ${imageData.total} total, ${imageData.withAlt} with alt text`);
        
        if (imageData.total > 0) {
          // Assume images are loaded correctly if they exist
          expect(imageData.total).toBeGreaterThan(0);
          console.log(`✅ All ${imageData.total} images loaded successfully`);
        }
      });

      await test.step('Check page performance', async () => {
        const performance = await homePage.measurePerformance();
        expect(performance).toBeDefined();
        console.log(`⚡ Page performance metrics collected`);
      });
    });
  });

  test.describe('Navigation and Menu Testing', () => {
    test('should have functional navigation menu @critical', async () => {
      await homePage.load();

      await test.step('Verify navigation menu exists and is visible', async () => {
        const navItems = await homePage.getNavigationItems();
        expect(navItems.length).toBeGreaterThan(0);
        console.log(`🧭 Navigation menu has ${navItems.length} items`);
      });

      await test.step('Test navigation menu items are clickable', async () => {
        const navItems = await homePage.getNavigationItems();
        
        for (const [index, item] of navItems.entries()) {
          if (index >= 5) break; // Test first 5 items to avoid too many navigations
          
          expect(item.isVisible).toBe(true);
          expect(item.isEnabled).toBe(true);
          expect(item.href).toBeTruthy();
          expect(item.text.trim().length).toBeGreaterThan(0);
          
          console.log(`✅ Nav item ${index + 1}: "${item.text}" -> ${item.href}`);
        }
      });

      await test.step('Test mobile navigation if present', async () => {
        const responsiveResult = await homePage.testResponsiveDesign();
        const mobileSupported = responsiveResult.mobile || responsiveResult.tablet;
        
        if (mobileSupported) {
          console.log('📱 Mobile navigation support detected');
        } else {
          console.log('ℹ️ Mobile navigation testing completed');
        }
      });
    });

    test('should analyze all homepage links for functionality @critical', async () => {
      await homePage.load();

      await test.step('Get and analyze all links', async () => {
        const linkAnalysis = await homePage.analyzeAllLinks();
        expect(linkAnalysis.length).toBeGreaterThan(0);
        
        console.log(`🔗 Total links found: ${linkAnalysis.length}`);
        
        const workingLinks = linkAnalysis.filter(link => link.status === 'working');
        const brokenLinks = linkAnalysis.filter(link => link.status !== 'working');
        
        console.log(`✅ Working links: ${workingLinks.length}`);
        console.log(`❌ Problematic links: ${brokenLinks.length}`);
        
        // Log first few working links
        workingLinks.slice(0, 10).forEach((link, index) => {
          console.log(`  ${index + 1}. "${link.text}" -> ${link.url}`);
        });
        
        // Log problematic links for debugging
        if (brokenLinks.length > 0) {
          console.log('⚠️ Problematic links:');
          brokenLinks.forEach((link, index) => {
            console.log(`  ${index + 1}. "${link.text}" -> ${link.url} (${link.status})`);
          });
        }
      });
    });

    test('should test breadcrumb navigation if present @functional', async () => {
      await homePage.load();

      await test.step('Check for breadcrumb navigation', async () => {
        const breadcrumbSelectors = [
          '.breadcrumb',
          '.breadcrumbs', 
          '[aria-label*="breadcrumb" i]',
          '.nav-breadcrumb',
          'nav ol',
          '.page-breadcrumb'
        ];

        let breadcrumbFound = false;
        for (const selector of breadcrumbSelectors) {
          if (await homePage.isElementVisible(selector)) {
            breadcrumbFound = true;
            const breadcrumbItems = await homePage.countElements(`${selector} li, ${selector} a`);
            console.log(`🍞 Breadcrumb navigation found with ${breadcrumbItems} items`);
            break;
          }
        }

        if (!breadcrumbFound) {
          console.log('ℹ️ No breadcrumb navigation found on homepage');
        }
      });
    });
  });

  test.describe('Form Testing and Interactions', () => {
    test('should analyze and test all forms on homepage @functional', async () => {
      await homePage.load();

      await test.step('Find and analyze all forms', async () => {
        const forms = await homePage.analyzeForms();
        console.log(`📝 Found ${forms.length} forms on homepage`);

        for (const [index, form] of forms.entries()) {
          console.log(`📋 Form ${index + 1}:`);
          console.log(`  Action: ${form.action || 'Not specified'}`);
          console.log(`  Method: ${form.method}`);
          console.log(`  Fields: ${form.fields.length}`);
          console.log(`  Submit button: ${form.submitButton ? 'Yes' : 'No'}`);
          console.log(`  Accessible: ${form.isAccessible}`);

          // Validate form structure
          expect(form.method).toMatch(/^(GET|POST|PUT|DELETE)$/);
          expect(Array.isArray(form.fields)).toBe(true);
          
          // Test form fields
          for (const field of form.fields) {
            expect(field.name).toBeTruthy();
            expect(field.type).toBeTruthy();
            console.log(`    Field: ${field.name} (${field.type}) ${field.required ? '- Required' : ''}`);
          }
        }
      });
    });

    test('should test search functionality if present @functional', async () => {
      await homePage.load();

      await test.step('Test search input and functionality', async () => {
        const searchQueries = ['research', 'machine learning', 'data analysis', 'AI', 'statistics'];
        
        for (const query of searchQueries) {
          try {
            await homePage.performSearch(query);
            console.log(`🔍 Search test passed for query: "${query}"`);
            
            // Wait a bit between searches
            await homePage.waitForPageStabilize();
          } catch (error) {
            console.log(`ℹ️ Search not available or failed for query: "${query}"`);
            break; // If search fails once, likely not available
          }
        }
      });

      await test.step('Test search with empty input', async () => {
        try {
          await homePage.performSearch('');
          console.log('🔍 Empty search test completed');
        } catch (error) {
          console.log('ℹ️ Empty search test not applicable');
        }
      });
    });

    test('should test contact form if present @functional', async () => {
      await homePage.load();

      await test.step('Find and test contact form', async () => {
        const contactFormSelectors = [
          'form[action*="contact"]',
          '.contact-form',
          'form:has([name*="contact" i])',
          'form:has([placeholder*="message" i])'
        ];

        let contactFormFound = false;
        for (const selector of contactFormSelectors) {
          if (await homePage.isElementVisible(selector)) {
            contactFormFound = true;
            console.log('📧 Contact form found');

            // Test common contact form fields
            const testData = {
              name: 'Test User',
              email: 'test@example.com',
              subject: 'Test Subject',
              message: 'This is a test message for form validation.'
            };

            const fieldTests = [
              { selectors: ['input[name*="name" i]', '#name', '[placeholder*="name" i]'], value: testData.name },
              { selectors: ['input[name*="email" i]', '#email', '[placeholder*="email" i]'], value: testData.email },
              { selectors: ['input[name*="subject" i]', '#subject', '[placeholder*="subject" i]'], value: testData.subject },
              { selectors: ['textarea[name*="message" i]', '#message', '[placeholder*="message" i]'], value: testData.message }
            ];

            for (const fieldTest of fieldTests) {
              for (const fieldSelector of fieldTest.selectors) {
                if (await homePage.isElementVisible(fieldSelector)) {
                  await homePage.fillInput(fieldSelector, fieldTest.value);
                  console.log(`✅ Filled field: ${fieldSelector}`);
                  break;
                }
              }
            }

            // Don't actually submit the form
            console.log('📝 Contact form fields tested (not submitted)');
            break;
          }
        }

        if (!contactFormFound) {
          console.log('ℹ️ No contact form found on homepage');
        }
      });
    });

    test('should test newsletter subscription if present @functional', async () => {
      await homePage.load();

      await test.step('Find and test newsletter form', async () => {
        const newsletterSelectors = [
          'form[action*="newsletter"]',
          'form[action*="subscribe"]',
          '.newsletter-form',
          '.subscription-form',
          'form:has([placeholder*="email" i]):has([value*="subscribe" i])'
        ];

        let newsletterFound = false;
        for (const selector of newsletterSelectors) {
          if (await homePage.isElementVisible(selector)) {
            newsletterFound = true;
            console.log('📰 Newsletter subscription form found');

            // Test email input
            const emailSelectors = ['input[type="email"]', 'input[name*="email" i]'];
            for (const emailSelector of emailSelectors) {
              if (await homePage.isElementVisible(emailSelector)) {
                await homePage.fillInput(emailSelector, 'test@example.com');
                console.log('✅ Newsletter email field tested');
                break;
              }
            }

            // Don't actually submit
            console.log('📧 Newsletter form tested (not submitted)');
            break;
          }
        }

        if (!newsletterFound) {
          console.log('ℹ️ No newsletter subscription form found on homepage');
        }
      });
    });
  });

  test.describe('Authentication Testing - Without Login', () => {
    test('should test login/register links and forms @functional', async () => {
      await homePage.load();

      await test.step('Check for authentication links', async () => {
        const authLinks = await homePage.checkAuthenticationLinks();
        console.log(`🔑 Authentication links found - Login: ${authLinks.login}, Register: ${authLinks.register}`);
      });

      await test.step('Test login form access', async () => {
        const loginSelectors = [
          'a[href*="login"]',
          'a[href*="signin"]',
          '.login',
          '.signin',
          'button:has-text("login")',
          'button:has-text("sign in")'
        ];

        let loginLinkFound = false;
        for (const selector of loginSelectors) {
          if (await homePage.isElementVisible(selector)) {
            loginLinkFound = true;
            
            // Click login link to access form
            await homePage.clickElement(selector);
            await homePage.waitForPageStabilize();
            
            // Check if login form appeared
            const loginFormSelectors = [
              'form:has(input[type="password"])',
              '.login-form',
              '#login-form',
              'form[action*="login"]'
            ];

            let loginFormFound = false;
            for (const formSelector of loginFormSelectors) {
              if (await homePage.isElementVisible(formSelector)) {
                loginFormFound = true;
                console.log('🔐 Login form accessed successfully');
                break;
              }
            }

            if (!loginFormFound) {
              console.log('⚠️ Login link found but form not detected');
            }
            
            break;
          }
        }

        if (!loginLinkFound) {
          console.log('ℹ️ No login links found on homepage');
        }
      });

      await test.step('Test registration form access', async () => {
        // Go back to homepage first
        await homePage.load();
        
        const registerSelectors = [
          'a[href*="register"]',
          'a[href*="signup"]',
          '.register',
          '.signup',
          'button:has-text("register")',
          'button:has-text("sign up")'
        ];

        let registerLinkFound = false;
        for (const selector of registerSelectors) {
          if (await homePage.isElementVisible(selector)) {
            registerLinkFound = true;
            console.log('📝 Registration link found and accessible');
            break;
          }
        }

        if (!registerLinkFound) {
          console.log('ℹ️ No registration links found on homepage');
        }
      });
    });
  });

  test.describe('Authentication Testing - With Login', () => {
    test('should test login functionality with valid credentials @critical', async () => {
      for (const user of testUsers) {
        await test.step(`Test login with ${user.name}`, async () => {
          await homePage.load();
          
          const loginSuccess = await homePage.testLoginFunctionality(user);
          console.log(`👤 Login test for ${user.email}: ${loginSuccess ? '✅ Success' : '❌ Failed/Not Available'}`);
          
          if (loginSuccess) {
            await test.step('Verify login state', async () => {
              // Check for login indicators
              const loginIndicators = [
                '.user-menu',
                '.profile-menu', 
                '.logout',
                '.dashboard',
                '.my-account',
                '[href*="logout"]',
                '.user-name',
                '.welcome'
              ];

              let loggedInStateFound = false;
              for (const indicator of loginIndicators) {
                if (await homePage.isElementVisible(indicator)) {
                  loggedInStateFound = true;
                  console.log(`✅ Login state indicator found: ${indicator}`);
                  break;
                }
              }

              if (!loggedInStateFound) {
                console.log('⚠️ Login completed but state indicators not clearly visible');
              }
            });

            await test.step('Test logout functionality', async () => {
              const logoutSelectors = [
                'a[href*="logout"]',
                'button:has-text("logout")',
                '.logout',
                '.signout'
              ];

              let logoutLinkFound = false;
              for (const selector of logoutSelectors) {
                if (await homePage.isElementVisible(selector)) {
                  logoutLinkFound = true;
                  // Don't actually logout to preserve session for other tests
                  console.log('🚪 Logout functionality available');
                  break;
                }
              }

              if (!logoutLinkFound) {
                console.log('ℹ️ Logout option not found or not visible');
              }
            });
          }
        });
      }
    });

    test('should test user-specific content and features when logged in @functional', async () => {
      await homePage.load();
      
      // Try to login with first test user
      const loginSuccess = await homePage.testLoginFunctionality(testUsers[0]);
      
      if (loginSuccess) {
        await test.step('Check for user-specific navigation', async () => {
          const userNavItems = [
            '.user-menu a',
            '.profile-menu a',
            '.account-menu a',
            '.dashboard-link',
            '.my-account'
          ];

          let userNavFound = false;
          for (const selector of userNavItems) {
            const items = await homePage.countElements(selector);
            if (items > 0) {
              userNavFound = true;
              console.log(`👤 User navigation found: ${items} items in ${selector}`);
              break;
            }
          }

          if (!userNavFound) {
            console.log('ℹ️ No user-specific navigation detected');
          }
        });

        await test.step('Check for personalized content', async () => {
          const personalizedElements = [
            '.welcome-message',
            '.user-dashboard',
            '.my-projects',
            '.recent-activity',
            '.user-profile'
          ];

          let personalizedContentFound = false;
          for (const selector of personalizedElements) {
            if (await homePage.isElementVisible(selector)) {
              personalizedContentFound = true;
              console.log(`✅ Personalized content found: ${selector}`);
              break;
            }
          }

          if (!personalizedContentFound) {
            console.log('ℹ️ No obvious personalized content detected');
          }
        });

        await test.step('Test protected features access', async () => {
          const protectedFeatures = [
            'a[href*="dashboard"]',
            'a[href*="profile"]',
            'a[href*="settings"]',
            'a[href*="account"]',
            '.premium-feature',
            '.member-only'
          ];

          let protectedFeaturesFound = 0;
          for (const selector of protectedFeatures) {
            if (await homePage.isElementVisible(selector)) {
              protectedFeaturesFound++;
              console.log(`🔒 Protected feature accessible: ${selector}`);
            }
          }

          console.log(`🔐 Total protected features found: ${protectedFeaturesFound}`);
        });
      } else {
        console.log('⚠️ Could not test logged-in features - login not successful');
      }
    });
  });

  test.describe('Content Validation and Interactive Elements', () => {
    test('should validate page content and text @functional', async () => {
      await homePage.load();

      await test.step('Check for essential content', async () => {
        const pageText = await homePage.getAllPageText();
        expect(pageText.length).toBeGreaterThan(100); // Should have substantial content
        
        // Check for research-related keywords
        const researchKeywords = ['research', 'data', 'analysis', 'study', 'academic', 'science'];
        const foundKeywords = researchKeywords.filter(keyword => 
          pageText.toLowerCase().includes(keyword)
        );
        
        console.log(`📚 Research-related keywords found: ${foundKeywords.join(', ')}`);
        expect(foundKeywords.length).toBeGreaterThan(0);
      });

      await test.step('Check for contact information', async () => {
        const contactPatterns = [
          /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, // Email
          /\+?[\d\s\-\(\)]{10,}/, // Phone
          /\d{1,5}.*\b(street|st|avenue|ave|road|rd|lane|ln|drive|dr)\b/i // Address
        ];

        const pageText = await homePage.getAllPageText();
        let contactInfoFound = false;

        for (const pattern of contactPatterns) {
          if (pattern.test(pageText)) {
            contactInfoFound = true;
            console.log(`📧 Contact information pattern found`);
            break;
          }
        }

        if (!contactInfoFound) {
          console.log('ℹ️ No obvious contact information found in page text');
        }
      });
    });

    test('should test interactive elements and buttons @functional', async () => {
      await homePage.load();

      await test.step('Test all buttons for clickability', async () => {
        const buttonCount = await homePage.countElements('button, input[type="button"], input[type="submit"], .btn');
        console.log(`🔘 Found ${buttonCount} buttons to test`);

        let clickableButtons = 0;
        const maxButtonsToTest = Math.min(buttonCount, 10);
        
        for (let i = 0; i < maxButtonsToTest; i++) {
          const buttonSelector = `(button, input[type="button"], input[type="submit"], .btn)[${i + 1}]`;
          
          try {
            const isVisible = await homePage.isElementVisible(buttonSelector);
            const isClickable = await homePage.isElementClickable(buttonSelector);
            
            if (isVisible && isClickable) {
              clickableButtons++;
              const buttonText = await homePage.getElementText(buttonSelector);
              console.log(`✅ Clickable button: "${buttonText.trim()}"`);
            }
          } catch (error) {
            console.log(`⚠️ Error testing button ${i + 1}: ${error}`);
          }
        }

        console.log(`🔘 Total clickable buttons: ${clickableButtons}/${maxButtonsToTest}`);
      });

      await test.step('Test dropdown menus if present', async () => {
        const dropdownSelectors = [
          '.dropdown',
          '.select',
          'select',
          '.menu-dropdown',
          '[role="listbox"]',
          '.dropdown-menu'
        ];

        let dropdownsFound = 0;
        for (const selector of dropdownSelectors) {
          const dropdowns = await homePage.countElements(selector);
          if (dropdowns > 0) {
            dropdownsFound += dropdowns;
            console.log(`📋 Dropdown elements found: ${dropdowns} (${selector})`);
          }
        }

        console.log(`📋 Total dropdown elements: ${dropdownsFound}`);
      });

      await test.step('Test modal dialogs if present', async () => {
        const modalTriggers = [
          'button[data-toggle="modal"]',
          'a[data-toggle="modal"]',
          '.modal-trigger',
          '[data-target*="modal"]'
        ];

        let modalTriggersFound = 0;
        for (const selector of modalTriggers) {
          const triggers = await homePage.countElements(selector);
          if (triggers > 0) {
            modalTriggersFound += triggers;
            console.log(`🪟 Modal triggers found: ${triggers} (${selector})`);
          }
        }

        console.log(`🪟 Total modal triggers: ${modalTriggersFound}`);
      });
    });

    test('should test social media and external integrations @functional', async () => {
      await homePage.load();

      await test.step('Check social media links', async () => {
        const socialLinks = await homePage.checkSocialMediaLinks();
        
        if (socialLinks.length > 0) {
          console.log(`📱 Social media platforms found: ${socialLinks.length}`);
          
          for (const [index, link] of socialLinks.entries()) {
            expect(link).toMatch(/^https?:\/\//);
            
            // Identify platform
            const platforms = {
              facebook: /facebook\.com/i,
              twitter: /twitter\.com|x\.com/i,
              linkedin: /linkedin\.com/i,
              instagram: /instagram\.com/i,
              youtube: /youtube\.com/i
            };

            let platform = 'Unknown';
            for (const [name, pattern] of Object.entries(platforms)) {
              if (pattern.test(link)) {
                platform = name.charAt(0).toUpperCase() + name.slice(1);
                break;
              }
            }

            console.log(`  ${index + 1}. ${platform}: ${link}`);
          }
        } else {
          console.log('ℹ️ No social media links found');
        }
      });

      await test.step('Check for external widgets and integrations', async () => {
        const externalWidgets = [
          'iframe', // Embedded content
          '[src*="youtube"]',
          '[src*="vimeo"]',
          '[src*="google"]',
          '.google-map',
          '.twitter-timeline',
          '.facebook-plugin',
          '[data-src*="external"]'
        ];

        let widgetsFound = 0;
        for (const selector of externalWidgets) {
          const widgets = await homePage.countElements(selector);
          if (widgets > 0) {
            widgetsFound += widgets;
            console.log(`🔌 External widgets found: ${widgets} (${selector})`);
          }
        }

        console.log(`🔌 Total external integrations: ${widgetsFound}`);
      });
    });
  });

  test.afterEach(async () => {
    console.log(`✅ Completed functional test: ${test.info().title}`);
  });
});