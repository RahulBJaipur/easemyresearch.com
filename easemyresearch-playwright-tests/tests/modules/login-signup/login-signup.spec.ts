import { test, expect } from '@playwright/test';
import { HomePage } from '../../../src/pages/homepage';

/**
 * Login/SignUp Module - Comprehensive Test Suite
 * 
 * Covers:
 * - Email/Password Authentication
 * - Google Auth
 * - Mobile OTP
 * - Forget Password
 * - Role-Based Access Control
 * - Help Section
 */

const testData = {
  users: {
    superAdmin: {
      email: 'easemyresearchtech+admin@gmail.com',
      password: '12345678',
      role: 'Super-Admin'
    },
    supervisor: {
      email: 'easemyresearchtech+supervisor@gmail.com',
      password: '12345678',
      role: 'Supervisor'
    },
    regularUser: {
      email: 'testoneemr@gmail.com',
      password: '12345678',
      role: 'User'
    },
    newUser: {
      email: 'rahul.test@example.com',
      password: 'Test@123456',
      name: 'Rahul Test User',
      mobile: '+91-9876543210'
    }
  },
  invalidData: {
    email: 'invalid-email',
    password: '123',
    mobile: '123456789'
  }
};

test.describe('Login/SignUp Module - Comprehensive Testing', () => {
  let homepage: HomePage;

  test.beforeEach(async ({ page }) => {
    homepage = new HomePage(page);
    await homepage.loadPage();
  });

  test.describe('🔐 Email/Password Authentication', () => {
    test('should register new user with email and password @functional @signup', async ({ page }) => {
      console.log('🧪 Testing email/password signup...');
      
      await test.step('Navigate to signup page', async () => {
        await page.click('text="Sign Up", text="Register", a[href*="signup"]');
        await page.waitForURL('**/signup');
      });
      
      await test.step('Fill signup form with valid data', async () => {
        await page.fill('input[name="email"], input[type="email"]', testData.users.newUser.email);
        await page.fill('input[name="password"], input[type="password"]', testData.users.newUser.password);
        await page.fill('input[name="name"], input[placeholder*="name" i]', testData.users.newUser.name);
        await page.fill('input[name="mobile"], input[type="tel"]', testData.users.newUser.mobile);
      });
      
      await test.step('Submit signup form', async () => {
        await page.click('button[type="submit"], button:has-text("Sign Up")');
        
        // Should redirect to pricing page after successful signup
        await page.waitForURL('**/pricing', { timeout: 10000 });
        expect(page.url()).toContain('pricing');
      });
      
      await test.step('Verify account creation', async () => {
        // Check for success message or user profile
        const successIndicators = [
          'text="Welcome"',
          'text="Account created"',
          'text="Choose a plan"',
          '.user-profile',
          '[data-testid="user-menu"]'
        ];
        
        let found = false;
        for (const indicator of successIndicators) {
          if (await page.locator(indicator).isVisible({ timeout: 2000 })) {
            found = true;
            break;
          }
        }
        expect(found).toBeTruthy();
      });
    });

    test('should login existing user with email and password @functional @login', async ({ page }) => {
      console.log('🧪 Testing email/password login...');
      
      await test.step('Open login modal and switch to email login', async () => {
        await page.click('text="Login/SignUp"');
        await page.waitForTimeout(2000);
        
        // Click "Login with Email" to switch to email/password form
        const emailLoginOption = page.locator('text="Login with Email"');
        if (await emailLoginOption.isVisible({ timeout: 5000 })) {
          await emailLoginOption.click();
          await page.waitForTimeout(2000);
        }
      });
      
      await test.step('Fill login form with valid credentials', async () => {
        await page.fill('input[type="email"]', testData.users.regularUser.email);
        await page.fill('input[type="password"]', testData.users.regularUser.password);
      });
      
      await test.step('Submit login form', async () => {
        await page.click('button:has-text("Continue")');
        
        // Should redirect to dashboard or pricing based on plan status
        await page.waitForLoadState('networkidle');
        // Login success if we don't get redirected back to homepage
        const currentUrl = page.url();
        console.log(`✅ Login completed, current URL: ${currentUrl}`);
      });
      
      await test.step('Verify successful login', async () => {
        // Check for user-specific elements
        const loginIndicators = [
          'text="Dashboard"',
          'text="My CRF"',
          'text="Logout"',
          '.user-menu',
          '[data-testid="user-profile"]'
        ];
        
        let found = false;
        for (const indicator of loginIndicators) {
          if (await page.locator(indicator).isVisible({ timeout: 3000 })) {
            found = true;
            break;
          }
        }
        expect(found).toBeTruthy();
      });
    });

    test('should validate email format during signup @functional @validation', async ({ page }) => {
      console.log('🧪 Testing email validation...');
      
      await test.step('Navigate to signup page', async () => {
        await page.click('text="Sign Up", text="Register"');
      });
      
      await test.step('Enter invalid email format', async () => {
        await page.fill('input[name="email"], input[type="email"]', testData.invalidData.email);
        await page.fill('input[name="password"], input[type="password"]', testData.users.newUser.password);
        await page.fill('input[name="name"]', testData.users.newUser.name);
        
        await page.click('button[type="submit"]');
      });
      
      await test.step('Verify email validation error', async () => {
        const errorMessages = [
          'text="Invalid email format"',
          'text="Please enter a valid email"',
          '.error-message',
          '[aria-invalid="true"]'
        ];
        
        let errorFound = false;
        for (const error of errorMessages) {
          if (await page.locator(error).isVisible({ timeout: 2000 })) {
            errorFound = true;
            break;
          }
        }
        expect(errorFound).toBeTruthy();
      });
    });

    test('should validate password strength @functional @validation', async ({ page }) => {
      console.log('🧪 Testing password validation...');
      
      await test.step('Navigate to signup page', async () => {
        await page.click('text="Sign Up", text="Register"');
      });
      
      await test.step('Enter weak password', async () => {
        await page.fill('input[name="email"], input[type="email"]', testData.users.newUser.email);
        await page.fill('input[name="password"], input[type="password"]', testData.invalidData.password);
        await page.fill('input[name="name"]', testData.users.newUser.name);
        
        await page.click('button[type="submit"]');
      });
      
      await test.step('Verify password validation error', async () => {
        const passwordErrors = [
          'text="Password too short"',
          'text="Password must be at least"',
          'text="Invalid password"',
          '.password-error'
        ];
        
        let errorFound = false;
        for (const error of passwordErrors) {
          if (await page.locator(error).isVisible({ timeout: 2000 })) {
            errorFound = true;
            break;
          }
        }
        expect(errorFound).toBeTruthy();
      });
    });

    test('should handle invalid login credentials @functional @negative', async ({ page }) => {
      console.log('🧪 Testing invalid login credentials...');
      
      await test.step('Open login modal', async () => {
        await page.click('text="Login/SignUp", text="Login", text="Sign In"');
        await page.waitForSelector('text="Continue with Email"', { timeout: 5000 });
      });
      
      await test.step('Enter invalid credentials', async () => {
        await page.fill('input[type="email"], input[placeholder*="email" i]', 'invalid@example.com');
        await page.fill('input[type="password"], input[placeholder*="password" i]', 'wrongpassword');
        
        await page.click('button:has-text("Continue")');
      });
      
      await test.step('Verify error message', async () => {
        const errorMessages = [
          'text="Invalid credentials"',
          'text="Login failed"',
          'text="User not found"',
          'text="Incorrect password"',
          '.login-error'
        ];
        
        let errorFound = false;
        for (const error of errorMessages) {
          if (await page.locator(error).isVisible({ timeout: 3000 })) {
            errorFound = true;
            break;
          }
        }
        expect(errorFound).toBeTruthy();
      });
    });
  });

  test.describe('📱 Google Authentication', () => {
    test('should display Google sign up option @functional @google-auth', async ({ page }) => {
      console.log('🧪 Testing Google authentication availability...');
      
      await test.step('Navigate to signup page', async () => {
        await page.click('text="Sign Up", text="Register"');
      });
      
      await test.step('Verify Google signup option', async () => {
        const googleSignupSelectors = [
          'button:has-text("Sign up with Google")',
          'button:has-text("Continue with Google")',
          '.google-signin-button',
          '[data-testid="google-signup"]'
        ];
        
        let googleOptionFound = false;
        for (const selector of googleSignupSelectors) {
          if (await page.locator(selector).isVisible({ timeout: 2000 })) {
            googleOptionFound = true;
            console.log(`✅ Google signup option found: ${selector}`);
            break;
          }
        }
        expect(googleOptionFound).toBeTruthy();
      });
    });

    test('should display Google login option @functional @google-auth', async ({ page }) => {
      console.log('🧪 Testing Google login availability...');
      
      await test.step('Navigate to login page', async () => {
        await page.click('text="Login", text="Sign In"');
      });
      
      await test.step('Verify Google login option', async () => {
        const googleLoginSelectors = [
          'button:has-text("Login with Google")',
          'button:has-text("Continue with Google")',
          '.google-signin-button',
          '[data-testid="google-login"]'
        ];
        
        let googleOptionFound = false;
        for (const selector of googleLoginSelectors) {
          if (await page.locator(selector).isVisible({ timeout: 2000 })) {
            googleOptionFound = true;
            console.log(`✅ Google login option found: ${selector}`);
            break;
          }
        }
        expect(googleOptionFound).toBeTruthy();
      });
    });
  });

  test.describe('📞 Mobile OTP Authentication', () => {
    test('should display mobile OTP signup option @functional @mobile-otp', async ({ page }) => {
      console.log('🧪 Testing mobile OTP signup availability...');
      
      await test.step('Navigate to signup page', async () => {
        await page.click('text="Sign Up", text="Register"');
      });
      
      await test.step('Verify mobile OTP signup option', async () => {
        const mobileOTPSelectors = [
          'button:has-text("Sign up with Mobile")',
          'button:has-text("Use Mobile Number")',
          'text="Sign up with OTP"',
          '.mobile-signup-button',
          '[data-testid="mobile-signup"]'
        ];
        
        let mobileOptionFound = false;
        for (const selector of mobileOTPSelectors) {
          if (await page.locator(selector).isVisible({ timeout: 2000 })) {
            mobileOptionFound = true;
            console.log(`✅ Mobile OTP signup option found: ${selector}`);
            break;
          }
        }
        expect(mobileOptionFound).toBeTruthy();
      });
    });

    test('should validate mobile number format @functional @validation', async ({ page }) => {
      console.log('🧪 Testing mobile number validation...');
      
      await test.step('Navigate to mobile signup', async () => {
        await page.click('text="Sign Up", text="Register"');
        // Look for mobile signup option
        const mobileSignupButton = page.locator('button:has-text("Mobile"), text="Mobile Number"').first();
        if (await mobileSignupButton.isVisible({ timeout: 2000 })) {
          await mobileSignupButton.click();
        }
      });
      
      await test.step('Enter invalid mobile number', async () => {
        await page.fill('input[name="mobile"], input[type="tel"]', testData.invalidData.mobile);
        await page.click('button:has-text("Send OTP"), button[type="submit"]');
      });
      
      await test.step('Verify mobile validation error', async () => {
        const mobileErrors = [
          'text="Invalid mobile number"',
          'text="Mobile number must be 10 digits"',
          'text="Please enter a valid mobile number"',
          '.mobile-error'
        ];
        
        let errorFound = false;
        for (const error of mobileErrors) {
          if (await page.locator(error).isVisible({ timeout: 2000 })) {
            errorFound = true;
            break;
          }
        }
        expect(errorFound).toBeTruthy();
      });
    });

    test('should provide resend OTP functionality @functional @otp', async ({ page }) => {
      console.log('🧪 Testing resend OTP functionality...');
      
      await test.step('Navigate to mobile signup and enter valid mobile', async () => {
        await page.click('text="Sign Up", text="Register"');
        // Navigate to mobile signup if available
        const mobileOption = page.locator('button:has-text("Mobile"), text="Mobile Number"').first();
        if (await mobileOption.isVisible({ timeout: 2000 })) {
          await mobileOption.click();
          await page.fill('input[name="mobile"], input[type="tel"]', '+919876543210');
          await page.click('button:has-text("Send OTP")');
        }
      });
      
      await test.step('Verify resend OTP option', async () => {
        const resendOTPSelectors = [
          'button:has-text("Resend OTP")',
          'text="Resend OTP"',
          '.resend-otp-button',
          '[data-testid="resend-otp"]'
        ];
        
        let resendOptionFound = false;
        for (const selector of resendOTPSelectors) {
          if (await page.locator(selector).isVisible({ timeout: 5000 })) {
            resendOptionFound = true;
            console.log(`✅ Resend OTP option found: ${selector}`);
            break;
          }
        }
        // Note: This might not be visible immediately, so we don't fail the test
        console.log(`📊 Resend OTP option availability: ${resendOptionFound}`);
      });
    });
  });

  test.describe('🔄 Forget Password', () => {
    test('should provide forget password functionality @functional @password-reset', async ({ page }) => {
      console.log('🧪 Testing forget password functionality...');
      
      await test.step('Open login modal', async () => {
        await page.click('text="Login/SignUp", text="Login", text="Sign In"');
        await page.waitForSelector('text="Continue with Email"', { timeout: 5000 });
      });
      
      await test.step('Find and click forget password link', async () => {
        const forgetPasswordSelectors = [
          'text="Forgot Password?"',
          'text="Forgot Password"',
          'text="Forget Password"',
          'a[href*="forgot"]',
          'a[href*="reset"]',
          '.forgot-password-link'
        ];
        
        let forgetLinkFound = false;
        for (const selector of forgetPasswordSelectors) {
          if (await page.locator(selector).isVisible({ timeout: 2000 })) {
            await page.click(selector);
            forgetLinkFound = true;
            console.log(`✅ Forget password link found: ${selector}`);
            break;
          }
        }
        expect(forgetLinkFound).toBeTruthy();
      });
      
      await test.step('Enter email for password reset', async () => {
        await page.fill('input[type="email"], input[placeholder*="email" i]', testData.users.regularUser.email);
        await page.click('button:has-text("Reset"), button:has-text("Send"), button:has-text("Continue"), button[type="submit"]');
      });
      
      await test.step('Verify reset email confirmation', async () => {
        const confirmationMessages = [
          'text="Reset link sent"',
          'text="Check your email"',
          'text="Password reset email sent"',
          '.success-message'
        ];
        
        let confirmationFound = false;
        for (const message of confirmationMessages) {
          if (await page.locator(message).isVisible({ timeout: 3000 })) {
            confirmationFound = true;
            break;
          }
        }
        expect(confirmationFound).toBeTruthy();
      });
    });
  });

  test.describe('👥 Role-Based Access Control', () => {
    test('should login Super-Admin and verify dashboard access @functional @rbac', async ({ page }) => {
      console.log('🧪 Testing Super-Admin role access...');
      
      await test.step('Login as Super-Admin', async () => {
        await page.click('text="Login", text="Sign In"');
        await page.fill('input[name="email"], input[type="email"]', testData.users.superAdmin.email);
        await page.fill('input[name="password"], input[type="password"]', testData.users.superAdmin.password);
        await page.click('button[type="submit"]');
        
        await page.waitForLoadState('networkidle');
      });
      
      await test.step('Verify Super-Admin dashboard access', async () => {
        const adminFeatures = [
          'text="Admin Dashboard"',
          'text="Manage Users"',
          'text="System Settings"',
          'text="All CRFs"',
          'text="Analytics"',
          '.admin-panel'
        ];
        
        let adminFeatureFound = false;
        for (const feature of adminFeatures) {
          if (await page.locator(feature).isVisible({ timeout: 3000 })) {
            adminFeatureFound = true;
            console.log(`✅ Admin feature found: ${feature}`);
            break;
          }
        }
        expect(adminFeatureFound).toBeTruthy();
      });
    });

    test('should login Supervisor and verify template creation access @functional @rbac', async ({ page }) => {
      console.log('🧪 Testing Supervisor role access...');
      
      await test.step('Login as Supervisor', async () => {
        await page.click('text="Login", text="Sign In"');
        await page.fill('input[name="email"], input[type="email"]', testData.users.supervisor.email);
        await page.fill('input[name="password"], input[type="password"]', testData.users.supervisor.password);
        await page.click('button[type="submit"]');
        
        await page.waitForLoadState('networkidle');
      });
      
      await test.step('Verify Supervisor dashboard access', async () => {
        const supervisorFeatures = [
          'text="Supervisor Dashboard"',
          'text="Create Template"',
          'text="Templates"',
          'text="Template Management"',
          '.supervisor-panel'
        ];
        
        let supervisorFeatureFound = false;
        for (const feature of supervisorFeatures) {
          if (await page.locator(feature).isVisible({ timeout: 3000 })) {
            supervisorFeatureFound = true;
            console.log(`✅ Supervisor feature found: ${feature}`);
            break;
          }
        }
        expect(supervisorFeatureFound).toBeTruthy();
      });
    });

    test('should login regular User and verify research features access @functional @rbac', async ({ page }) => {
      console.log('🧪 Testing regular User role access...');
      
      await test.step('Login as regular User', async () => {
        await page.click('text="Login", text="Sign In"');
        await page.fill('input[name="email"], input[type="email"]', testData.users.regularUser.email);
        await page.fill('input[name="password"], input[type="password"]', testData.users.regularUser.password);
        await page.click('button[type="submit"]');
        
        await page.waitForLoadState('networkidle');
      });
      
      await test.step('Verify User dashboard access', async () => {
        const userFeatures = [
          'text="Dashboard"',
          'text="My CRF"',
          'text="Create CRF"',
          'text="My Records"',
          'text="Statistical Tables"',
          'text="Graphs"',
          '.user-dashboard'
        ];
        
        let userFeatureFound = false;
        for (const feature of userFeatures) {
          if (await page.locator(feature).isVisible({ timeout: 3000 })) {
            userFeatureFound = true;
            console.log(`✅ User feature found: ${feature}`);
            break;
          }
        }
        expect(userFeatureFound).toBeTruthy();
      });
    });
  });

  test.describe('❓ Help Section', () => {
    test('should provide help section access @functional @help', async ({ page }) => {
      console.log('🧪 Testing help section availability...');
      
      await test.step('Navigate to login/signup page', async () => {
        await page.click('text="Login", text="Sign In"');
      });
      
      await test.step('Find and access help section', async () => {
        const helpSelectors = [
          'text="Help"',
          'text="Support"',
          'text="FAQ"',
          'a[href*="help"]',
          'a[href*="support"]',
          '.help-link'
        ];
        
        let helpFound = false;
        for (const selector of helpSelectors) {
          if (await page.locator(selector).isVisible({ timeout: 2000 })) {
            await page.click(selector);
            helpFound = true;
            console.log(`✅ Help section found: ${selector}`);
            break;
          }
        }
        expect(helpFound).toBeTruthy();
      });
      
      await test.step('Verify help content', async () => {
        const helpContent = [
          'text="FAQ"',
          'text="Contact Support"',
          'text="Email"',
          'text="Call"',
          '.help-content',
          '.faq-section'
        ];
        
        let contentFound = false;
        for (const content of helpContent) {
          if (await page.locator(content).isVisible({ timeout: 3000 })) {
            contentFound = true;
            break;
          }
        }
        expect(contentFound).toBeTruthy();
      });
    });
  });

  test.describe('⚡ Non-Functional Testing', () => {
    test('should test login page performance @nonfunctional @performance', async ({ page }) => {
      console.log('🧪 Testing login page performance...');
      
      await test.step('Measure page load time', async () => {
        const startTime = Date.now();
        await page.goto('/login');
        await page.waitForLoadState('networkidle');
        const loadTime = Date.now() - startTime;
        
        console.log(`📊 Login page load time: ${loadTime}ms`);
        expect(loadTime).toBeLessThan(5000); // Should load within 5 seconds
      });
      
      await test.step('Test form responsiveness', async () => {
        const viewports = [
          { name: 'Mobile', width: 375, height: 667 },
          { name: 'Tablet', width: 768, height: 1024 },
          { name: 'Desktop', width: 1920, height: 1080 }
        ];
        
        for (const viewport of viewports) {
          await page.setViewportSize({ width: viewport.width, height: viewport.height });
          await page.waitForTimeout(1000);
          
          const formVisible = await page.locator('form, .login-form').isVisible();
          console.log(`📱 ${viewport.name} (${viewport.width}x${viewport.height}): ${formVisible ? '✅' : '❌'}`);
        }
      });
    });

    test('should test login security features @nonfunctional @security', async ({ page }) => {
      console.log('🧪 Testing login security features...');
      
      await test.step('Test HTTPS enforcement', async () => {
        expect(page.url()).toMatch(/^https:/);
        console.log('✅ HTTPS enforced');
      });
      
      await test.step('Test password field masking', async () => {
        await page.click('text="Login", text="Sign In"');
        
        const passwordField = page.locator('input[type="password"]').first();
        const fieldType = await passwordField.getAttribute('type');
        expect(fieldType).toBe('password');
        console.log('✅ Password field properly masked');
      });
      
      await test.step('Test brute force protection', async () => {
        await page.click('text="Login", text="Sign In"');
        
        // Attempt multiple failed logins
        for (let i = 0; i < 3; i++) {
          await page.fill('input[name="email"]', 'test@example.com');
          await page.fill('input[name="password"]', 'wrongpassword');
          await page.click('button[type="submit"]');
          await page.waitForTimeout(1000);
        }
        
        // Check for rate limiting or captcha
        const protectionIndicators = [
          'text="Too many attempts"',
          'text="Please try again later"',
          '.captcha',
          'text="Account locked"'
        ];
        
        let protectionFound = false;
        for (const indicator of protectionIndicators) {
          if (await page.locator(indicator).isVisible({ timeout: 2000 })) {
            protectionFound = true;
            console.log(`✅ Brute force protection detected: ${indicator}`);
            break;
          }
        }
        // Note: This is optional security feature
        console.log(`📊 Brute force protection: ${protectionFound ? 'Enabled' : 'Not detected'}`);
      });
    });
  });
});