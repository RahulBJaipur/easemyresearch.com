import { Page } from '@playwright/test';

export class LoginHelper {
  constructor(private page: Page) {}

  async loginAsRegularUser(): Promise<void> {
    await this.page.goto('/');
    
    // Check if already logged in by looking for user-specific elements
    const userLoggedIn = await this.page.locator('text="Dashboard", text="My CRF", text="Logout"').isVisible({ timeout: 2000 });
    
    if (!userLoggedIn) {
      // Step 1: Click Login/SignUp button to open modal
      const loginTrigger = this.page.locator('text="Login/SignUp"');
      if (await loginTrigger.isVisible({ timeout: 3000 })) {
        await loginTrigger.click();
        
        // Step 2: Click "Login with Email" to switch to email/password form
        await this.page.waitForTimeout(2000); // Wait for modal to load
        const emailLoginOption = this.page.locator('text="Login with Email"');
        if (await emailLoginOption.isVisible({ timeout: 5000 })) {
          await emailLoginOption.click();
          await this.page.waitForTimeout(2000); // Wait for form transition
        }
        
        // Step 3: Fill email and password fields
        await this.page.fill('input[type="email"]', 'testoneemr@gmail.com');
        await this.page.fill('input[type="password"]', '12345678');
        
        // Step 4: Click the Continue button
        await this.page.click('button:has-text("Continue")');
        
        // Step 5: Wait for login to complete
        await this.page.waitForLoadState('networkidle');
        await this.page.waitForTimeout(3000);
      }
    }
  }

  async loginAsSuperAdmin(): Promise<void> {
    await this.page.goto('/');
    
    const userLoggedIn = await this.page.locator('text="Dashboard", text="Admin", text="Logout"').isVisible({ timeout: 2000 });
    
    if (!userLoggedIn) {
      const loginTrigger = this.page.locator('text="Login/SignUp"');
      if (await loginTrigger.isVisible({ timeout: 3000 })) {
        await loginTrigger.click();
        
        await this.page.waitForTimeout(2000);
        const emailLoginOption = this.page.locator('text="Login with Email"');
        if (await emailLoginOption.isVisible({ timeout: 5000 })) {
          await emailLoginOption.click();
          await this.page.waitForTimeout(2000);
        }
        
        await this.page.fill('input[type="email"]', 'easemyresearchtech+admin@gmail.com');
        await this.page.fill('input[type="password"]', '12345678');
        
        await this.page.click('button:has-text("Continue")');
        await this.page.waitForLoadState('networkidle');
        await this.page.waitForTimeout(3000);
      }
    }
  }

  async loginAsSupervisor(): Promise<void> {
    await this.page.goto('/');
    
    const userLoggedIn = await this.page.locator('text="Dashboard", text="Templates", text="Logout"').isVisible({ timeout: 2000 });
    
    if (!userLoggedIn) {
      const loginTrigger = this.page.locator('text="Login/SignUp"');
      if (await loginTrigger.isVisible({ timeout: 3000 })) {
        await loginTrigger.click();
        
        await this.page.waitForTimeout(2000);
        const emailLoginOption = this.page.locator('text="Login with Email"');
        if (await emailLoginOption.isVisible({ timeout: 5000 })) {
          await emailLoginOption.click();
          await this.page.waitForTimeout(2000);
        }
        
        await this.page.fill('input[type="email"]', 'easemyresearchtech+supervisor@gmail.com');
        await this.page.fill('input[type="password"]', '12345678');
        
        await this.page.click('button:has-text("Continue")');
        await this.page.waitForLoadState('networkidle');
        await this.page.waitForTimeout(3000);
      }
    }
  }

  async logout(): Promise<void> {
    const logoutButton = this.page.locator('text="Logout", text="Sign Out", .logout-button');
    if (await logoutButton.isVisible({ timeout: 2000 })) {
      await logoutButton.click();
      await this.page.waitForLoadState('networkidle');
    }
  }
}