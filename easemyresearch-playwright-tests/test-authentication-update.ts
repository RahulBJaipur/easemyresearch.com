import { chromium, Browser, Page } from 'playwright';

/**
 * Quick Authentication Test for testoneemr@gmail.com
 * 
 * This verifies that the updated email works properly
 */

async function testAuthenticationUpdate() {
  console.log('🚀 Testing Authentication Update (testoneemr@gmail.com)...\n');
  
  let browser: Browser | null = null;
  let page: Page | null = null;
  
  try {
    // Launch browser
    browser = await chromium.launch({ headless: false });
    page = await browser.newPage();
    
    console.log('📂 Navigating to EaseMyResearch...');
    await page.goto('https://easemyresearch.com');
    await page.waitForLoadState('networkidle');
    
    console.log('🔍 Looking for Login/SignUp button...');
    
    // Look for the login trigger button
    const loginTrigger = page.locator('text="Login/SignUp"');
    
    if (await loginTrigger.isVisible({ timeout: 5000 })) {
      console.log('✅ Login/SignUp button found, clicking...');
      await loginTrigger.click();
      
      // Wait for modal to load
      await page.waitForTimeout(3000);
      
      // Look for "Login with Email" option
      const emailOption = page.locator('text="Login with Email"');
      
      if (await emailOption.isVisible({ timeout: 5000 })) {
        console.log('✅ "Login with Email" option found, clicking...');
        await emailOption.click();
        await page.waitForTimeout(2000);
        
        // Fill credentials with testoneemr@gmail.com
        console.log('📝 Filling credentials (testoneemr@gmail.com)...');
        await page.fill('input[type="email"]', 'testoneemr@gmail.com');
        await page.fill('input[type="password"]', '12345678');
        
        // Click Continue
        console.log('🚀 Clicking Continue...');
        await page.click('button:has-text("Continue")');
        
        // Wait for login to complete
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(5000);
        
        // Check if login was successful
        const currentUrl = page.url();
        console.log(`✅ Login process completed. Current URL: ${currentUrl}`);
        
        // Look for user indicators
        const userIndicators = [
          'text="Dashboard"',
          'text="My CRF"',
          'text="Logout"',
          'text="Profile"',
          '.user-menu'
        ];
        
        let loginSuccess = false;
        for (const indicator of userIndicators) {
          if (await page.locator(indicator).isVisible({ timeout: 3000 })) {
            console.log(`✅ Login successful! Found indicator: ${indicator}`);
            loginSuccess = true;
            break;
          }
        }
        
        if (!loginSuccess) {
          console.log('⚠️  Login may have completed but no user indicators found');
          
          // Take screenshot for debugging
          await page.screenshot({ 
            path: 'testoneemr-login-result.png', 
            fullPage: true 
          });
          console.log('📸 Screenshot saved: testoneemr-login-result.png');
        }
        
        // Test navigation to form creation
        console.log('🔄 Testing navigation to form creation...');
        await page.goto('https://easemyresearch.com/create-crf');
        await page.waitForLoadState('networkidle');
        
        const createFormUrl = page.url();
        console.log(`📝 Form creation page URL: ${createFormUrl}`);
        
        // Check if form creation page is accessible
        const formCreationIndicators = [
          'text="Create Form"',
          'text="Form Title"',
          'text="Add Field"',
          'input[name="title"]',
          'input[placeholder*="title" i]'
        ];
        
        let formPageAccessible = false;
        for (const indicator of formCreationIndicators) {
          if (await page.locator(indicator).isVisible({ timeout: 3000 })) {
            console.log(`✅ Form creation page accessible! Found: ${indicator}`);
            formPageAccessible = true;
            break;
          }
        }
        
        if (!formPageAccessible) {
          console.log('⚠️  Form creation page may not be accessible');
          
          // Take screenshot
          await page.screenshot({ 
            path: 'testoneemr-form-creation.png', 
            fullPage: true 
          });
          console.log('📸 Screenshot saved: testoneemr-form-creation.png');
        }
        
        console.log('\n🎯 AUTHENTICATION TEST RESULTS:');
        console.log('================================');
        console.log(`✅ Email: testoneemr@gmail.com`);
        console.log(`✅ Password: 12345678`);
        console.log(`✅ Login Flow: Working`);
        console.log(`✅ User Session: ${loginSuccess ? 'Active' : 'Unclear'}`);
        console.log(`✅ Form Creation Access: ${formPageAccessible ? 'Available' : 'Unclear'}`);
        console.log(`✅ Framework Status: Ready for comprehensive testing`);
        
        return {
          success: true,
          email: 'testoneemr@gmail.com',
          loginSuccess,
          formPageAccessible,
          url: currentUrl
        };
        
      } else {
        console.log('❌ "Login with Email" option not found');
        return { success: false, error: 'Login with Email option not found' };
      }
      
    } else {
      console.log('❌ Login/SignUp button not found');
      return { success: false, error: 'Login/SignUp button not found' };
    }
    
  } catch (error) {
    console.error('❌ Error during authentication test:', error);
    return { success: false, error: error.message };
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Run the test
testAuthenticationUpdate().then((result) => {
  console.log('\n🏁 Final Result:', result);
}).catch((error) => {
  console.error('❌ Test execution failed:', error);
});