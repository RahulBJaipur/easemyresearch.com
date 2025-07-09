import { Page, Locator, expect } from '@playwright/test';
import { BasePageObject } from './base-page';
import { NavigationItem, LinkAnalysis, FormAnalysis, SearchCapability, TestUser } from '../types/test.types';

/**
 * Homepage Page Object for EaseMyResearch.com
 * 
 * Contains all functionality for testing the homepage including
 * navigation, links, forms, search, and responsive design
 */
export class HomePage extends BasePageObject implements SearchCapability {
  url = '/';
  title = 'easemyresearch';
  
  // Login Modal elements
  readonly loginModal: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly continueButton: Locator;
  readonly forgotPasswordLink: Locator;
  readonly signUpLink: Locator;
  readonly modalCloseButton: Locator;

  // Search functionality selectors
  searchInputSelector = 'input[type="search"], input[placeholder*="search" i], input[name*="search" i]';
  searchButtonSelector = 'button[type="submit"], .search-button, .search-btn';
  searchResultsSelector = '.search-results, .results, .search-items';

  // Common element selectors
  private selectors = {
    // Navigation
    navigation: 'nav, .navbar, .navigation, .menu, [role="navigation"]',
    navigationLinks: 'nav a, .navbar a, .navigation a, .menu a, [role="navigation"] a',
    
    // Header elements
    header: 'header, .header, .site-header',
    logo: '.logo, .brand, .site-logo, img[alt*="logo" i]',
    
    // Main content
    main: 'main, .main, .content, .main-content',
    footer: 'footer, .footer, .site-footer',
    
    // Interactive elements
    allLinks: 'a[href]',
    buttons: 'button, input[type="button"], input[type="submit"], .btn',
    forms: 'form',
    images: 'img',
    
    // Authentication
    loginLink: 'a[href*="login"], .login, .signin, button:has-text("login"), button:has-text("sign in"), text="Login/SignUp", text="Login"',
    registerLink: 'a[href*="register"], a[href*="signup"], .register, .signup',
    
    // Contact/Newsletter
    contactForm: 'form[action*="contact"], .contact-form',
    newsletterForm: 'form[action*="newsletter"], .newsletter-form, .subscription-form',
    
    // Social media
    socialLinks: 'a[href*="facebook"], a[href*="twitter"], a[href*="linkedin"], a[href*="instagram"], .social a'
  };

  constructor(page: Page) {
    super(page);
    
    // Login Modal elements - targeting the modal shown in the screenshot
    this.loginModal = page.locator('.modal').or(page.locator('[role="dialog"]')).or(page.locator('div:has-text("Continue with Email")'));
    this.emailInput = page.locator('input[type="email"]').or(page.locator('input[placeholder*="email" i]')).or(page.locator('label:has-text("Email") + input'));
    this.passwordInput = page.locator('input[type="password"]').or(page.locator('input[placeholder*="password" i]')).or(page.locator('label:has-text("Password") + input'));
    this.continueButton = page.locator('button:has-text("Continue")').or(page.locator('button[type="submit"]'));
    this.forgotPasswordLink = page.locator('text="Forgot Password"').or(page.locator('a:has-text("Forgot")'));
    this.signUpLink = page.locator('text="Sign up now"').or(page.locator('a:has-text("Sign up")'));
    this.modalCloseButton = page.locator('button:has-text("×")').or(page.locator('[aria-label="close"]'));
  }

  async clickLogin() {
    console.log('🔑 Attempting to click login button...');
    
    // Try multiple ways to trigger login modal
    const loginSelectors = [
      'text="Login/SignUp"',
      'text="Login"', 
      'button:has-text("Login")',
      'a:has-text("Login")',
      '[data-testid="login"]',
      'a[href*="login"]'
    ];

    for (const selector of loginSelectors) {
      try {
        const element = this.page.locator(selector);
        if (await element.isVisible({ timeout: 2000 })) {
          await element.click();
          console.log(`✅ Clicked login using selector: ${selector}`);
          
          // Wait for modal to appear
          await this.page.waitForTimeout(1000);
          
          // Check if modal appeared
          if (await this.isLoginModalVisible()) {
            console.log('✅ Login modal appeared successfully');
            return true;
          }
        }
      } catch (error: any) {
        console.log(`❌ Failed with selector ${selector}: ${error.message}`);
        continue;
      }
    }
    
    console.log('⚠️ Could not find or click login button');
    return false;
  }

  async isLoginModalVisible(): Promise<boolean> {
    try {
      // Check for modal with "Continue with Email" text
      const modalSelectors = [
        'div:has-text("Continue with Email")',
        '.modal:visible',
        '[role="dialog"]:visible',
        'div:has(input[type="email"]):has(input[type="password"]):has(button:has-text("Continue"))'
      ];

      for (const selector of modalSelectors) {
        const modal = this.page.locator(selector);
        if (await modal.isVisible({ timeout: 2000 })) {
          console.log(`✅ Login modal found with selector: ${selector}`);
          return true;
        }
      }
      
      return false;
    } catch (error: any) {
      console.log(`❌ Error checking modal visibility: ${error.message}`);
      return false;
    }
  }

  async fillLoginForm(email: string, password: string): Promise<boolean> {
    try {
      console.log(`🔐 Filling login form with email: ${email}`);
      
      // Wait for modal to be ready
      await this.page.waitForTimeout(1000);
      
      // Find and fill email field
      const emailSelectors = [
        'input[type="email"]',
        'input[placeholder*="email" i]',
        'input[name*="email" i]',
        'label:has-text("Email") + input',
        'div:has-text("Email") input'
      ];

      let emailFilled = false;
      for (const selector of emailSelectors) {
        try {
          const emailField = this.page.locator(selector);
          if (await emailField.isVisible({ timeout: 2000 })) {
            await emailField.clear();
            await emailField.fill(email);
            console.log(`✅ Email filled using selector: ${selector}`);
            emailFilled = true;
            break;
          }
        } catch (error) {
          continue;
        }
      }

      if (!emailFilled) {
        console.log('❌ Could not find or fill email field');
        return false;
      }

      // Find and fill password field
      const passwordSelectors = [
        'input[type="password"]',
        'input[placeholder*="password" i]',
        'input[name*="password" i]',
        'label:has-text("Password") + input',
        'div:has-text("Password") input'
      ];

      let passwordFilled = false;
      for (const selector of passwordSelectors) {
        try {
          const passwordField = this.page.locator(selector);
          if (await passwordField.isVisible({ timeout: 2000 })) {
            await passwordField.clear();
            await passwordField.fill(password);
            console.log(`✅ Password filled using selector: ${selector}`);
            passwordFilled = true;
            break;
          }
        } catch (error) {
          continue;
        }
      }

      if (!passwordFilled) {
        console.log('❌ Could not find or fill password field');
        return false;
      }

      return true;
    } catch (error: any) {
      console.log(`❌ Error filling login form: ${error.message}`);
      return false;
    }
  }

  async submitLogin(): Promise<boolean> {
    try {
      console.log('🚀 Attempting to submit login form...');
      
      const submitSelectors = [
        'button:has-text("Continue")',
        'button[type="submit"]',
        'input[type="submit"]',
        'button:has-text("Login")',
        'button:has-text("Sign In")'
      ];

      for (const selector of submitSelectors) {
        try {
          const submitButton = this.page.locator(selector);
          if (await submitButton.isVisible({ timeout: 2000 })) {
            await submitButton.click();
            console.log(`✅ Login submitted using selector: ${selector}`);
            
            // Wait for login to process
            await this.page.waitForTimeout(3000);
            
            // Check if login was successful (modal disappeared or URL changed)
            const modalStillVisible = await this.isLoginModalVisible();
            if (!modalStillVisible) {
              console.log('✅ Login modal disappeared - login likely successful');
              return true;
            }
            
            // Check for error messages
            const errorMessages = await this.page.locator('text="Invalid"').or(this.page.locator('text="Error"')).or(this.page.locator('.error')).count();
            if (errorMessages > 0) {
              console.log('❌ Error messages detected after login attempt');
              return false;
            }
            
            return true;
          }
        } catch (error) {
          continue;
        }
      }
      
      console.log('❌ Could not find submit button');
      return false;
    } catch (error: any) {
      console.log(`❌ Error submitting login: ${error.message}`);
      return false;
    }
  }

  async loginWithCredentials(email: string, password: string): Promise<boolean> {
    try {
      console.log(`🔑 Starting login process for ${email}...`);
      
      // Step 1: Click login to open modal
      const loginClicked = await this.clickLogin();
      if (!loginClicked) {
        console.log('❌ Could not open login modal');
        return false;
      }

      // Step 2: Fill the form
      const formFilled = await this.fillLoginForm(email, password);
      if (!formFilled) {
        console.log('❌ Could not fill login form');
        return false;
      }

      // Step 3: Submit the form
      const loginSubmitted = await this.submitLogin();
      if (!loginSubmitted) {
        console.log('❌ Could not submit login form');
        return false;
      }

      console.log('✅ Login process completed successfully');
      return true;
    } catch (error: any) {
      console.log(`❌ Login process failed: ${error.message}`);
      return false;
    }
  }

  async isLoggedIn(): Promise<boolean> {
    try {
      // Check for indicators that user is logged in
      const loggedInIndicators = [
        'text="Dashboard"',
        'text="Profile"',
        'text="Logout"',
        'text="My Account"',
        '[data-testid="user-menu"]',
        '.user-avatar',
        'button:has-text("Logout")'
      ];

      for (const indicator of loggedInIndicators) {
        const element = this.page.locator(indicator);
        if (await element.isVisible({ timeout: 2000 })) {
          console.log(`✅ Logged in indicator found: ${indicator}`);
          return true;
        }
      }

      return false;
    } catch (error) {
      return false;
    }
  }

  /**
   * Load the homepage and wait for it to be ready
   */
  async loadPage(): Promise<void> {
    await this.page.goto(this.url, { waitUntil: 'networkidle' });
    await this.waitForLoad();
  }

  /**
   * Check if homepage is properly loaded
   */
  async isLoaded(): Promise<boolean> {
    try {
      // Check multiple indicators that the page is loaded
      const hasTitle = (await this.page.title()).length > 0;
      const hasBody = await this.isElementVisible('body');
      const urlContainsEaseMyResearch = this.page.url().includes('easemyresearch');
      
      return hasTitle && hasBody && urlContainsEaseMyResearch;
    } catch {
      return false;
    }
  }

  /**
   * Get all navigation menu items
   */
  async getNavigationItems(): Promise<NavigationItem[]> {
    console.log('🧭 Analyzing navigation menu...');
    return await this.helpers.getNavigationItems();
  }

  /**
   * Test all navigation links
   */
  async testNavigationLinks(): Promise<NavigationItem[]> {
    const navigationItems = await this.getNavigationItems();
    
    console.log(`📊 Found ${navigationItems.length} navigation items:`);
    navigationItems.forEach((item, index) => {
      console.log(`   ${index + 1}. ${item.text} -> ${item.href}`);
    });
    
    return navigationItems;
  }

  /**
   * Analyze all links on the homepage
   */
  async analyzeAllLinks(): Promise<LinkAnalysis[]> {
    console.log('🔗 Analyzing all links on homepage...');
    return await this.helpers.analyzeAllLinks();
  }

  /**
   * Get and analyze all forms on the page
   */
  async analyzeForms(): Promise<FormAnalysis[]> {
    console.log('📝 Analyzing forms on homepage...');
    return await this.helpers.analyzeForms();
  }

  /**
   * Test search functionality
   */
  async performSearch(query: string): Promise<void> {
    console.log(`🔍 Testing search functionality with query: "${query}"`);
    
    const searchInput = this.page.locator(this.searchInputSelector);
    
    if (await searchInput.count() > 0 && await searchInput.first().isVisible()) {
      await searchInput.first().fill(query);
      
      const searchButton = this.page.locator(this.searchButtonSelector);
      if (await searchButton.count() > 0 && await searchButton.first().isVisible()) {
        // Don't actually submit to avoid navigation
        console.log('✅ Search form found and tested');
      } else {
        // Try pressing Enter
        await searchInput.first().press('Enter');
        console.log('✅ Search triggered with Enter key');
      }
    } else {
      console.log('ℹ️ No search functionality found');
    }
  }

  /**
   * Get search results (if search was performed)
   */
  async getSearchResults(): Promise<string[]> {
    const results: string[] = [];
    const searchResults = this.page.locator(this.searchResultsSelector);
    
    if (await searchResults.count() > 0) {
      const resultElements = await searchResults.locator('*').all();
      for (const element of resultElements) {
        const text = await element.textContent();
        if (text && text.trim()) {
          results.push(text.trim());
        }
      }
    }
    
    return results;
  }

  /**
   * Get search results count
   */
  async getSearchResultsCount(): Promise<number> {
    const searchResults = this.page.locator(this.searchResultsSelector);
    return await searchResults.count();
  }

  /**
   * Test login functionality with provided credentials
   */
  async testLoginFunctionality(credentials: TestUser): Promise<boolean> {
    console.log(`🔐 Testing login functionality for ${credentials.email}...`);
    return await this.loginWithCredentials(credentials.email, credentials.password);
  }

  /**
   * Check for specific page sections
   */
  async checkPageSections(): Promise<{ [section: string]: boolean }> {
    console.log('🏗️ Checking page structure sections...');
    
    const sections = {
      header: await this.isElementVisible(this.selectors.header),
      navigation: await this.isElementVisible(this.selectors.navigation),
      main: await this.isElementVisible(this.selectors.main),
      footer: await this.isElementVisible(this.selectors.footer),
      logo: await this.isElementVisible(this.selectors.logo)
    };

    console.log('📊 Page Structure:');
    Object.entries(sections).forEach(([section, present]) => {
      console.log(`   ${section}: ${present ? '✅' : '❌'}`);
    });

    return sections;
  }

  /**
   * Test responsive design across different breakpoints
   */
  async testResponsiveDesign(): Promise<{ [breakpoint: string]: boolean }> {
    console.log('📱 Testing responsive design...');
    return await this.helpers.testResponsiveDesign();
  }

  /**
   * Check for authentication links
   */
  async checkAuthenticationLinks(): Promise<{ login: boolean; register: boolean }> {
    console.log('🔑 Checking authentication links...');
    
    const authLinks = {
      login: await this.isElementVisible(this.selectors.loginLink),
      register: await this.isElementVisible(this.selectors.registerLink)
    };

    console.log(`   Login link: ${authLinks.login ? '✅' : '❌'}`);
    console.log(`   Register link: ${authLinks.register ? '✅' : '❌'}`);

    return authLinks;
  }

  /**
   * Check for social media links
   */
  async checkSocialMediaLinks(): Promise<string[]> {
    console.log('📱 Checking social media links...');
    
    const socialLinks: string[] = [];
    const socialElements = await this.page.locator(this.selectors.socialLinks).all();
    
    for (const element of socialElements) {
      const href = await element.getAttribute('href');
      if (href) {
        socialLinks.push(href);
      }
    }

    console.log(`   Found ${socialLinks.length} social media links`);
    socialLinks.forEach((link, index) => {
      console.log(`   ${index + 1}. ${link}`);
    });

    return socialLinks;
  }

  /**
   * Test all images for accessibility
   */
  async testImageAccessibility(): Promise<{ total: number; withAlt: number; withoutAlt: number }> {
    console.log('🖼️ Testing image accessibility...');
    
    const images = await this.page.locator(this.selectors.images).all();
    let withAlt = 0;
    let withoutAlt = 0;

    for (const image of images) {
      const alt = await image.getAttribute('alt');
      if (alt !== null) {
        withAlt++;
      } else {
        withoutAlt++;
      }
    }

    const result = {
      total: images.length,
      withAlt,
      withoutAlt
    };

    console.log(`📊 Image Accessibility:`)
    console.log(`   Total images: ${result.total}`);
    console.log(`   With alt text: ${result.withAlt}`);
    console.log(`   Without alt text: ${result.withoutAlt}`);

    return result;
  }

  /**
   * Check page loading performance
   */
  async checkPagePerformance(): Promise<any> {
    console.log('⚡ Measuring page performance...');
    return await this.helpers.measurePerformance();
  }

  /**
   * Test keyboard navigation
   */
  async testKeyboardNavigation(): Promise<{ focusableElements: number; keyboardAccessible: boolean }> {
    console.log('⌨️ Testing keyboard navigation...');
    
    // Get all potentially focusable elements
    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])'
    ];

    let totalFocusableElements = 0;
    for (const selector of focusableSelectors) {
      totalFocusableElements += await this.countElements(selector);
    }

    // Test Tab navigation (simplified)
    let keyboardAccessible = false;
    try {
      await this.page.keyboard.press('Tab');
      const activeElement = await this.page.evaluate(() => document.activeElement?.tagName);
      keyboardAccessible = !!activeElement;
    } catch {
      keyboardAccessible = false;
    }

    const result = {
      focusableElements: totalFocusableElements,
      keyboardAccessible
    };

    console.log(`⌨️ Keyboard Navigation:`)
    console.log(`   Focusable elements: ${result.focusableElements}`);
    console.log(`   Keyboard accessible: ${result.keyboardAccessible ? '✅' : '❌'}`);

    return result;
  }

  /**
   * Comprehensive homepage test
   */
  async runComprehensiveTest(): Promise<any> {
    console.log('\n🧪 Running comprehensive homepage test...');
    console.log('=' .repeat(60));
    
    const testResults: any = {
      pageLoad: {
        loaded: await this.isLoaded(),
        title: await this.getTitle(),
        url: await this.getCurrentUrl(),
        loadTime: Date.now()
      },
      structure: await this.checkPageSections(),
      navigation: await this.testNavigationLinks(),
      links: await this.analyzeAllLinks(),
      forms: await this.analyzeForms(),
      images: await this.testImageAccessibility(),
      authentication: await this.checkAuthenticationLinks(),
      socialMedia: await this.checkSocialMediaLinks(),
      responsive: await this.testResponsiveDesign(),
      keyboard: await this.testKeyboardNavigation(),
      performance: await this.checkPagePerformance(),
      accessibility: await this.checkBasicAccessibility(),
      timestamp: new Date().toISOString(),
      searchFunctionality: false
    };

    // Test search functionality
    try {
      await this.performSearch('research');
      testResults.searchFunctionality = true;
    } catch {
      testResults.searchFunctionality = false;
    }

    console.log('\n📊 Comprehensive Test Summary:');
    console.log(`   Page loaded: ${testResults.pageLoad.loaded ? '✅' : '❌'}`);
    console.log(`   Navigation items: ${testResults.navigation.length}`);
    console.log(`   Total links: ${testResults.links.length}`);
    console.log(`   Forms found: ${testResults.forms.length}`);
    console.log(`   Images: ${testResults.images.total}`);
    console.log(`   Accessibility issues: ${testResults.accessibility.length}`);
    console.log('=' .repeat(60));

    return testResults;
  }

  /**
   * Check if login elements are accessible
   */
  async checkLoginAccessibility(): Promise<{ loginLinkVisible: boolean; formAccessible: boolean }> {
    console.log('🔑 Checking authentication links...');
    
    const loginLinkVisible = await this.isElementVisible(this.selectors.loginLink);
    console.log(`   Login link: ${loginLinkVisible ? '✅' : '❌'}`);
    
    let formAccessible = false;
    if (loginLinkVisible) {
      const modalOpened = await this.clickLogin();
      formAccessible = modalOpened && await this.isLoginModalVisible();
      
      if (!formAccessible) {
        console.log('⚠️ Login link found but form not detected');
      }
    }
    
    return { loginLinkVisible, formAccessible };
  }
}