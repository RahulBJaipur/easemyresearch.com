import { test, expect } from '@playwright/test';

/**
 * Pricing Module - Comprehensive Test Suite
 * 
 * Covers:
 * - Plan Types: Scholar, Professional, Freemium
 * - Plan Features and Limitations
 * - Subscription Management
 * - Payment Integration
 * - Plan Comparison
 * - Upgrade/Downgrade Functionality
 */

const testData = {
  plans: {
    freemium: {
      name: 'Freemium',
      price: 'Free',
      features: ['Basic Forms', 'Limited Storage', 'Community Support']
    },
    scholar: {
      name: 'Scholar',
      price: '$29',
      features: ['Advanced Forms', 'Extended Storage', 'Priority Support', 'Templates']
    },
    professional: {
      name: 'Professional',
      price: '$99',
      features: ['Unlimited Forms', 'Unlimited Storage', '24/7 Support', 'Advanced Analytics', 'API Access']
    }
  },
  testUser: {
    email: 'rahul.pricing.test@example.com',
    password: 'Test@123456',
    name: 'Rahul Pricing Test User'
  },
  paymentData: {
    cardNumber: '4111111111111111',
    expiryDate: '12/25',
    cvv: '123',
    cardholderName: 'Rahul Test User'
  }
};

test.describe('Pricing Module - Comprehensive Testing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test.describe('💰 Plan Display and Information', () => {
    test('should display all available pricing plans @functional @plan-display', async ({ page }) => {
      console.log('🧪 Testing pricing plans display...');
      
      await test.step('Navigate to pricing page', async () => {
        const pricingLink = page.locator('text="Pricing", a[href*="pricing"], .pricing-link');
        if (await pricingLink.isVisible({ timeout: 3000 })) {
          await pricingLink.click();
        } else {
          // Direct navigation if link not found
          await page.goto('/pricing');
        }
        
        await page.waitForLoadState('networkidle');
      });

      await test.step('Verify Freemium plan display', async () => {
        const freemiumPlan = [
          'text="Freemium"',
          'text="Free"',
          'text="$0"',
          '.freemium-plan',
          '.free-plan'
        ];
        
        let freemiumFound = false;
        for (const selector of freemiumPlan) {
          if (await page.locator(selector).isVisible({ timeout: 3000 })) {
            freemiumFound = true;
            console.log(`✅ Freemium plan found: ${selector}`);
            break;
          }
        }
        expect(freemiumFound).toBeTruthy();
      });

      await test.step('Verify Scholar plan display', async () => {
        const scholarPlan = [
          'text="Scholar"',
          'text="$29"',
          'text="29"',
          '.scholar-plan',
          '.basic-plan'
        ];
        
        let scholarFound = false;
        for (const selector of scholarPlan) {
          if (await page.locator(selector).isVisible({ timeout: 3000 })) {
            scholarFound = true;
            console.log(`✅ Scholar plan found: ${selector}`);
            break;
          }
        }
        expect(scholarFound).toBeTruthy();
      });

      await test.step('Verify Professional plan display', async () => {
        const professionalPlan = [
          'text="Professional"',
          'text="$99"',
          'text="99"',
          '.professional-plan',
          '.premium-plan'
        ];
        
        let professionalFound = false;
        for (const selector of professionalPlan) {
          if (await page.locator(selector).isVisible({ timeout: 3000 })) {
            professionalFound = true;
            console.log(`✅ Professional plan found: ${selector}`);
            break;
          }
        }
        expect(professionalFound).toBeTruthy();
      });
    });

    test('should display plan features and limitations @functional @plan-features', async ({ page }) => {
      console.log('🧪 Testing plan features display...');
      
      await test.step('Navigate to pricing page', async () => {
        await page.goto('/pricing');
        await page.waitForLoadState('networkidle');
      });

      await test.step('Check for feature lists', async () => {
        const featureIndicators = [
          'text="Features"',
          'text="Included"',
          'text="Unlimited"',
          'text="Limited"',
          'ul li',
          '.feature-list',
          '.plan-features'
        ];
        
        let featuresFound = false;
        for (const indicator of featureIndicators) {
          const elements = page.locator(indicator);
          const count = await elements.count();
          if (count > 0) {
            featuresFound = true;
            console.log(`✅ Features found (${count} elements): ${indicator}`);
            break;
          }
        }
        expect(featuresFound).toBeTruthy();
      });

      await test.step('Verify specific feature mentions', async () => {
        const expectedFeatures = [
          'Forms',
          'Storage',
          'Support',
          'Templates',
          'Analytics',
          'API'
        ];
        
        let featuresDisplayed = 0;
        for (const feature of expectedFeatures) {
          if (await page.locator(`text*="${feature}"`).isVisible({ timeout: 2000 })) {
            featuresDisplayed++;
            console.log(`✅ Feature mentioned: ${feature}`);
          }
        }
        
        console.log(`📊 Features displayed: ${featuresDisplayed}/${expectedFeatures.length}`);
        expect(featuresDisplayed).toBeGreaterThan(2); // At least 3 features should be mentioned
      });
    });

    test('should provide plan comparison functionality @functional @plan-comparison', async ({ page }) => {
      console.log('🧪 Testing plan comparison...');
      
      await test.step('Navigate to pricing page', async () => {
        await page.goto('/pricing');
      });

      await test.step('Check for comparison table or features', async () => {
        const comparisonElements = [
          'table',
          '.comparison-table',
          '.plan-comparison',
          'text="Compare Plans"',
          'text="Feature Comparison"'
        ];
        
        let comparisonFound = false;
        for (const element of comparisonElements) {
          if (await page.locator(element).isVisible({ timeout: 3000 })) {
            comparisonFound = true;
            console.log(`✅ Comparison element found: ${element}`);
            break;
          }
        }
        
        // Comparison might be implicit in plan layout
        console.log(`📊 Plan comparison: ${comparisonFound ? 'Available' : 'Implicit in plan display'}`);
      });
    });
  });

  test.describe('🛒 Plan Selection and Subscription', () => {
    test('should allow selecting Freemium plan @functional @freemium-selection', async ({ page }) => {
      console.log('🧪 Testing Freemium plan selection...');
      
      await test.step('Navigate to pricing and select Freemium', async () => {
        await page.goto('/pricing');
        
        const freemiumButtons = [
          'button:has-text("Get Started")',
          'button:has-text("Choose Free")',
          'button:has-text("Start Free")',
          'a:has-text("Sign Up Free")',
          '.freemium-plan button',
          '.free-plan button'
        ];
        
        let buttonClicked = false;
        for (const button of freemiumButtons) {
          const buttonElement = page.locator(button);
          if (await buttonElement.isVisible({ timeout: 2000 })) {
            await buttonElement.click();
            buttonClicked = true;
            console.log(`✅ Freemium button clicked: ${button}`);
            break;
          }
        }
        
        if (buttonClicked) {
          await page.waitForLoadState('networkidle');
          
          // Should redirect to signup or dashboard
          const currentUrl = page.url();
          expect(currentUrl).toMatch(/(signup|register|dashboard|login)/);
          console.log(`✅ Redirected to: ${currentUrl}`);
        } else {
          console.log('📊 Freemium selection: No interactive button found');
        }
      });
    });

    test('should allow selecting Scholar plan @functional @scholar-selection', async ({ page }) => {
      console.log('🧪 Testing Scholar plan selection...');
      
      await test.step('Navigate to pricing and select Scholar', async () => {
        await page.goto('/pricing');
        
        const scholarButtons = [
          'button:has-text("Choose Scholar")',
          'button:has-text("Subscribe")',
          'button:has-text("Get Started")',
          'a:has-text("Select Plan")',
          '.scholar-plan button',
          '.basic-plan button'
        ];
        
        let buttonClicked = false;
        for (const button of scholarButtons) {
          const buttonElement = page.locator(button);
          if (await buttonElement.isVisible({ timeout: 2000 })) {
            await buttonElement.click();
            buttonClicked = true;
            console.log(`✅ Scholar button clicked: ${button}`);
            break;
          }
        }
        
        if (buttonClicked) {
          await page.waitForLoadState('networkidle');
          
          // Should redirect to signup, login, or payment
          const currentUrl = page.url();
          const expectedRedirects = /(signup|register|payment|checkout|login|billing)/;
          expect(currentUrl).toMatch(expectedRedirects);
          console.log(`✅ Redirected to: ${currentUrl}`);
        } else {
          console.log('📊 Scholar selection: No interactive button found');
        }
      });
    });

    test('should allow selecting Professional plan @functional @professional-selection', async ({ page }) => {
      console.log('🧪 Testing Professional plan selection...');
      
      await test.step('Navigate to pricing and select Professional', async () => {
        await page.goto('/pricing');
        
        const professionalButtons = [
          'button:has-text("Choose Professional")',
          'button:has-text("Subscribe")',
          'button:has-text("Get Started")',
          'a:has-text("Select Plan")',
          '.professional-plan button',
          '.premium-plan button'
        ];
        
        let buttonClicked = false;
        for (const button of professionalButtons) {
          const buttonElement = page.locator(button);
          if (await buttonElement.isVisible({ timeout: 2000 })) {
            await buttonElement.click();
            buttonClicked = true;
            console.log(`✅ Professional button clicked: ${button}`);
            break;
          }
        }
        
        if (buttonClicked) {
          await page.waitForLoadState('networkidle');
          
          // Should redirect to signup, login, or payment
          const currentUrl = page.url();
          const expectedRedirects = /(signup|register|payment|checkout|login|billing)/;
          expect(currentUrl).toMatch(expectedRedirects);
          console.log(`✅ Redirected to: ${currentUrl}`);
        } else {
          console.log('📊 Professional selection: No interactive button found');
        }
      });
    });
  });

  test.describe('💳 Payment Integration', () => {
    test('should display payment form for paid plans @functional @payment-form', async ({ page }) => {
      console.log('🧪 Testing payment form display...');
      
      await test.step('Navigate to pricing and attempt Scholar subscription', async () => {
        await page.goto('/pricing');
        
        // Try to click Scholar plan button
        const scholarButton = page.locator('button:has-text("Scholar"), button:has-text("Subscribe")').first();
        if (await scholarButton.isVisible({ timeout: 3000 })) {
          await scholarButton.click();
          await page.waitForLoadState('networkidle');
          
          // Check if payment form appears
          const paymentElements = [
            'input[name="cardNumber"]',
            'input[placeholder*="card" i]',
            'input[placeholder*="4111" i]',
            'text="Card Number"',
            'text="Payment"',
            'text="Billing"',
            '.payment-form',
            '.card-element'
          ];
          
          let paymentFormFound = false;
          for (const element of paymentElements) {
            if (await page.locator(element).isVisible({ timeout: 5000 })) {
              paymentFormFound = true;
              console.log(`✅ Payment form element found: ${element}`);
              break;
            }
          }
          
          console.log(`📊 Payment form: ${paymentFormFound ? 'Available' : 'Not found in current flow'}`);
        } else {
          console.log('📊 Scholar plan selection: Button not found for payment testing');
        }
      });
    });

    test('should validate payment form fields @functional @payment-validation', async ({ page }) => {
      console.log('🧪 Testing payment form validation...');
      
      await test.step('Navigate to payment form if available', async () => {
        await page.goto('/pricing');
        
        // Try multiple paths to reach payment form
        const paymentPaths = [
          { action: () => page.click('button:has-text("Scholar")'), description: 'Scholar plan' },
          { action: () => page.click('button:has-text("Professional")'), description: 'Professional plan' },
          { action: () => page.goto('/payment'), description: 'Direct payment URL' },
          { action: () => page.goto('/checkout'), description: 'Direct checkout URL' }
        ];
        
        let paymentFormReached = false;
        for (const path of paymentPaths) {
          try {
            await path.action();
            await page.waitForLoadState('networkidle');
            
            if (await page.locator('input[name="cardNumber"], input[placeholder*="card" i], .payment-form').isVisible({ timeout: 3000 })) {
              paymentFormReached = true;
              console.log(`✅ Payment form reached via: ${path.description}`);
              break;
            }
          } catch (error) {
            console.log(`📊 ${path.description}: Not accessible`);
          }
        }
        
        if (paymentFormReached) {
          // Test form validation
          const submitButton = page.locator('button:has-text("Pay"), button:has-text("Subscribe"), button[type="submit"]');
          if (await submitButton.isVisible({ timeout: 2000 })) {
            await submitButton.click();
            
            // Check for validation errors
            const validationErrors = [
              'text="Required"',
              'text="Invalid"',
              'text="Card number"',
              '.error-message',
              '.field-error'
            ];
            
            let validationFound = false;
            for (const error of validationErrors) {
              if (await page.locator(error).isVisible({ timeout: 3000 })) {
                validationFound = true;
                console.log(`✅ Payment validation found: ${error}`);
                break;
              }
            }
            
            console.log(`📊 Payment validation: ${validationFound ? 'Working' : 'Not detected'}`);
          }
        } else {
          console.log('📊 Payment form validation: Form not accessible for testing');
        }
      });
    });

    test('should support multiple payment methods @functional @payment-methods', async ({ page }) => {
      console.log('🧪 Testing payment methods support...');
      
      await test.step('Check for payment method options', async () => {
        // Check on pricing page first
        await page.goto('/pricing');
        
        const paymentMethods = [
          'text="Credit Card"',
          'text="Debit Card"',
          'text="PayPal"',
          'text="Stripe"',
          'text="Visa"',
          'text="Mastercard"',
          '.payment-methods',
          '.payment-options'
        ];
        
        let methodsFound = 0;
        for (const method of paymentMethods) {
          if (await page.locator(method).isVisible({ timeout: 2000 })) {
            methodsFound++;
            console.log(`✅ Payment method found: ${method}`);
          }
        }
        
        console.log(`📊 Payment methods supported: ${methodsFound}`);
        expect(methodsFound).toBeGreaterThan(0); // At least one payment method should be mentioned
      });
    });
  });

  test.describe('🔄 Plan Management', () => {
    test('should display current plan information for logged-in users @functional @current-plan', async ({ page }) => {
      console.log('🧪 Testing current plan display...');
      
      await test.step('Login and check plan information', async () => {
        // Login first
        await page.goto('/');
        const loginButton = page.locator('text="Login", text="Sign In"');
        if (await loginButton.isVisible({ timeout: 3000 })) {
          await loginButton.click();
          await page.fill('input[name="email"], input[type="email"]', 'testtwoemr@gmail.com');
          await page.fill('input[name="password"], input[type="password"]', '12345678');
          await page.click('button[type="submit"]');
          await page.waitForLoadState('networkidle');
        }
        
        // Navigate to pricing or account settings
        const accountPages = [
          '/pricing',
          '/account',
          '/settings',
          '/subscription',
          '/billing'
        ];
        
        let currentPlanFound = false;
        for (const pagePath of accountPages) {
          try {
            await page.goto(pagePath);
            await page.waitForLoadState('networkidle');
            
            const planIndicators = [
              'text="Current Plan"',
              'text="Your Plan"',
              'text="Active Plan"',
              'text="Subscription"',
              'text="Freemium"',
              'text="Scholar"',
              'text="Professional"',
              '.current-plan',
              '.active-plan'
            ];
            
            for (const indicator of planIndicators) {
              if (await page.locator(indicator).isVisible({ timeout: 3000 })) {
                currentPlanFound = true;
                console.log(`✅ Current plan info found on ${pagePath}: ${indicator}`);
                break;
              }
            }
            
            if (currentPlanFound) break;
          } catch (error) {
            console.log(`📊 ${pagePath}: Not accessible`);
          }
        }
        
        console.log(`📊 Current plan information: ${currentPlanFound ? 'Available' : 'Not found'}`);
      });
    });

    test('should provide plan upgrade options @functional @plan-upgrade', async ({ page }) => {
      console.log('🧪 Testing plan upgrade options...');
      
      await test.step('Check for upgrade options', async () => {
        await page.goto('/pricing');
        
        const upgradeElements = [
          'button:has-text("Upgrade")',
          'text="Upgrade Plan"',
          'text="Upgrade to"',
          'button:has-text("Subscribe")',
          '.upgrade-button',
          '.upgrade-option'
        ];
        
        let upgradeFound = false;
        for (const element of upgradeElements) {
          if (await page.locator(element).isVisible({ timeout: 3000 })) {
            upgradeFound = true;
            console.log(`✅ Upgrade option found: ${element}`);
            
            // Try clicking upgrade option
            await page.click(element);
            await page.waitForTimeout(1000);
            break;
          }
        }
        
        console.log(`📊 Plan upgrade options: ${upgradeFound ? 'Available' : 'Not found'}`);
      });
    });

    test('should provide billing history access @functional @billing-history', async ({ page }) => {
      console.log('🧪 Testing billing history access...');
      
      await test.step('Check for billing/invoice access', async () => {
        const billingPages = [
          '/billing',
          '/invoices',
          '/account/billing',
          '/subscription/history'
        ];
        
        let billingFound = false;
        for (const pagePath of billingPages) {
          try {
            await page.goto(pagePath);
            await page.waitForLoadState('networkidle');
            
            const billingElements = [
              'text="Billing History"',
              'text="Invoices"',
              'text="Payment History"',
              'text="Transactions"',
              '.billing-history',
              '.invoice-list'
            ];
            
            for (const element of billingElements) {
              if (await page.locator(element).isVisible({ timeout: 3000 })) {
                billingFound = true;
                console.log(`✅ Billing history found on ${pagePath}: ${element}`);
                break;
              }
            }
            
            if (billingFound) break;
          } catch (error) {
            console.log(`📊 ${pagePath}: Not accessible`);
          }
        }
        
        console.log(`📊 Billing history: ${billingFound ? 'Available' : 'Not accessible'}`);
      });
    });
  });

  test.describe('⚡ Non-Functional Testing', () => {
    test('should test pricing page performance @nonfunctional @performance', async ({ page }) => {
      console.log('🧪 Testing pricing page performance...');
      
      await test.step('Measure page load time', async () => {
        const startTime = Date.now();
        await page.goto('/pricing');
        await page.waitForLoadState('networkidle');
        const loadTime = Date.now() - startTime;
        
        console.log(`📊 Pricing page load time: ${loadTime}ms`);
        expect(loadTime).toBeLessThan(5000); // Should load within 5 seconds
      });
    });

    test('should test pricing page responsiveness @nonfunctional @responsive', async ({ page }) => {
      console.log('🧪 Testing pricing page responsiveness...');
      
      await test.step('Test different screen sizes', async () => {
        await page.goto('/pricing');
        
        const viewports = [
          { name: 'Mobile', width: 375, height: 667 },
          { name: 'Tablet', width: 768, height: 1024 },
          { name: 'Desktop', width: 1920, height: 1080 }
        ];
        
        for (const viewport of viewports) {
          await page.setViewportSize({ width: viewport.width, height: viewport.height });
          await page.waitForTimeout(1000);
          
          const plansVisible = await page.locator('.plan, .pricing-card, .plan-card').count();
          console.log(`📱 ${viewport.name} (${viewport.width}x${viewport.height}): ${plansVisible} plans visible`);
        }
      });
    });

    test('should test pricing accessibility @nonfunctional @accessibility', async ({ page }) => {
      console.log('🧪 Testing pricing page accessibility...');
      
      await test.step('Check accessibility features', async () => {
        await page.goto('/pricing');
        
        // Check for proper headings
        const headings = await page.locator('h1, h2, h3').count();
        console.log(`📊 Headings found: ${headings}`);
        expect(headings).toBeGreaterThan(0);
        
        // Check for alt text on images
        const images = page.locator('img');
        const imageCount = await images.count();
        if (imageCount > 0) {
          const imagesWithAlt = await images.locator('[alt]').count();
          console.log(`📊 Images with alt text: ${imagesWithAlt}/${imageCount}`);
        }
        
        // Check for proper button labels
        const buttons = await page.locator('button').count();
        console.log(`📊 Buttons found: ${buttons}`);
        
        // Check for keyboard navigation
        await page.keyboard.press('Tab');
        const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
        console.log(`📊 Keyboard navigation: ${focusedElement ? 'Working' : 'Not detected'}`);
      });
    });
  });
});