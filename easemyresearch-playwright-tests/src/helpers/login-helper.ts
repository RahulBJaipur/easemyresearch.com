import { Page } from '@playwright/test';

export class LoginHelper {
  constructor(private page: Page) {}

  async loginAsRegularUser(): Promise<void> {
    await this.page.goto('/');
    
    // Check if already logged in
    const loginButton = this.page.locator('text="Login", text="Sign In"');
    if (await loginButton.isVisible({ timeout: 2000 })) {
      await loginButton.click();
      
      await this.page.fill('input[name="email"], input[type="email"]', 'testoneemr@gmail.com');
      await this.page.fill('input[name="password"], input[type="password"]', '12345678');
      
      await this.page.click('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")');
      await this.page.waitForLoadState('networkidle');
    }
  }

  async loginAsSuperAdmin(): Promise<void> {
    await this.page.goto('/');
    
    const loginButton = this.page.locator('text="Login", text="Sign In"');
    if (await loginButton.isVisible({ timeout: 2000 })) {
      await loginButton.click();
      
      await this.page.fill('input[name="email"], input[type="email"]', 'easemyresearchtech+admin@gmail.com');
      await this.page.fill('input[name="password"], input[type="password"]', '12345678');
      
      await this.page.click('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")');
      await this.page.waitForLoadState('networkidle');
    }
  }

  async loginAsSupervisor(): Promise<void> {
    await this.page.goto('/');
    
    const loginButton = this.page.locator('text="Login", text="Sign In"');
    if (await loginButton.isVisible({ timeout: 2000 })) {
      await loginButton.click();
      
      await this.page.fill('input[name="email"], input[type="email"]', 'easemyresearchtech+supervisor@gmail.com');
      await this.page.fill('input[name="password"], input[type="password"]', '12345678');
      
      await this.page.click('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")');
      await this.page.waitForLoadState('networkidle');
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