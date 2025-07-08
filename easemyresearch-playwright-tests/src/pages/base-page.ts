import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from '../types/test.types';
import { TestHelpers } from '../utils/test-helpers';

/**
 * Base Page Object for EaseMyResearch.com
 * 
 * Contains common functionality shared across all page objects
 */
export abstract class BasePageObject implements BasePage {
  protected page: Page;
  protected helpers: TestHelpers;
  abstract url: string;
  abstract title: string;

  constructor(page: Page) {
    this.page = page;
    this.helpers = new TestHelpers(page);
  }

  /**
   * Navigate to the page
   */
  async load(): Promise<void> {
    await this.page.goto(this.url);
    await this.waitForLoad();
  }

  /**
   * Check if page is loaded by verifying title
   */
  async isLoaded(): Promise<boolean> {
    try {
      const currentTitle = await this.page.title();
      return currentTitle.toLowerCase().includes(this.title.toLowerCase());
    } catch {
      return false;
    }
  }

  /**
   * Wait for page to be fully loaded
   */
  async waitForLoad(): Promise<void> {
    await this.helpers.waitForFullPageLoad();
    await this.page.waitForFunction(() => document.readyState === 'complete');
  }

  /**
   * Take screenshot with timestamp
   */
  async takeScreenshot(name?: string): Promise<string> {
    const screenshotName = name || `${this.constructor.name.toLowerCase()}-${Date.now()}`;
    return await this.helpers.takeTimestampedScreenshot(screenshotName);
  }

  /**
   * Get page title
   */
  async getTitle(): Promise<string> {
    return await this.page.title();
  }

  /**
   * Get page URL
   */
  async getCurrentUrl(): Promise<string> {
    return this.page.url();
  }

  /**
   * Check if element exists and is visible
   */
  async isElementVisible(selector: string): Promise<boolean> {
    try {
      const element = this.page.locator(selector);
      return await element.isVisible();
    } catch {
      return false;
    }
  }

  /**
   * Check if element is clickable
   */
  async isElementClickable(selector: string): Promise<boolean> {
    return await this.helpers.isElementInteractable(selector);
  }

  /**
   * Wait for element to be visible
   */
  async waitForElement(selector: string, timeout: number = 10000): Promise<Locator> {
    const element = this.page.locator(selector);
    await element.waitFor({ state: 'visible', timeout });
    return element;
  }

  /**
   * Wait for element to be hidden
   */
  async waitForElementToHide(selector: string, timeout: number = 10000): Promise<void> {
    const element = this.page.locator(selector);
    await element.waitFor({ state: 'hidden', timeout });
  }

  /**
   * Click element with optional wait
   */
  async clickElement(selector: string, options?: { timeout?: number; force?: boolean }): Promise<void> {
    const element = await this.waitForElement(selector, options?.timeout);
    await element.click({ force: options?.force });
  }

  /**
   * Fill input field
   */
  async fillInput(selector: string, value: string): Promise<void> {
    const element = await this.waitForElement(selector);
    await element.fill(value);
  }

  /**
   * Get text content from element
   */
  async getElementText(selector: string): Promise<string> {
    const element = await this.waitForElement(selector);
    return await element.textContent() || '';
  }

  /**
   * Get attribute value from element
   */
  async getElementAttribute(selector: string, attribute: string): Promise<string | null> {
    const element = await this.waitForElement(selector);
    return await element.getAttribute(attribute);
  }

  /**
   * Count elements matching selector
   */
  async countElements(selector: string): Promise<number> {
    return await this.page.locator(selector).count();
  }

  /**
   * Scroll to element
   */
  async scrollToElement(selector: string): Promise<void> {
    const element = await this.waitForElement(selector);
    await element.scrollIntoViewIfNeeded();
  }

  /**
   * Hover over element
   */
  async hoverElement(selector: string): Promise<void> {
    const element = await this.waitForElement(selector);
    await element.hover();
  }

  /**
   * Check if page has error messages
   */
  async hasErrorMessage(): Promise<boolean> {
    const errorSelectors = [
      '.error',
      '.error-message',
      '.alert-error',
      '.alert-danger',
      '[role="alert"]',
      '.notification-error'
    ];

    for (const selector of errorSelectors) {
      if (await this.isElementVisible(selector)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Get error message text if present
   */
  async getErrorMessage(): Promise<string | null> {
    const errorSelectors = [
      '.error',
      '.error-message',
      '.alert-error',
      '.alert-danger',
      '[role="alert"]',
      '.notification-error'
    ];

    for (const selector of errorSelectors) {
      if (await this.isElementVisible(selector)) {
        return await this.getElementText(selector);
      }
    }
    return null;
  }

  /**
   * Check if page is accessible (basic check)
   */
  async checkBasicAccessibility(): Promise<string[]> {
    return await this.helpers.checkBasicAccessibility();
  }

  /**
   * Test responsive design
   */
  async testResponsiveDesign(): Promise<{ [breakpoint: string]: boolean }> {
    return await this.helpers.testResponsiveDesign();
  }

  /**
   * Measure page performance
   */
  async measurePerformance() {
    return await this.helpers.measurePerformance();
  }

  /**
   * Assert page title contains expected text
   */
  async assertTitleContains(expectedText: string): Promise<void> {
    const title = await this.getTitle();
    expect(title.toLowerCase()).toContain(expectedText.toLowerCase());
  }

  /**
   * Assert current URL contains expected path
   */
  async assertUrlContains(expectedPath: string): Promise<void> {
    const currentUrl = await this.getCurrentUrl();
    expect(currentUrl).toContain(expectedPath);
  }

  /**
   * Assert element is visible
   */
  async assertElementVisible(selector: string): Promise<void> {
    const element = this.page.locator(selector);
    await expect(element).toBeVisible();
  }

  /**
   * Assert element is not visible
   */
  async assertElementNotVisible(selector: string): Promise<void> {
    const element = this.page.locator(selector);
    await expect(element).not.toBeVisible();
  }

  /**
   * Assert element contains text
   */
  async assertElementContainsText(selector: string, expectedText: string): Promise<void> {
    const element = this.page.locator(selector);
    await expect(element).toContainText(expectedText);
  }

  /**
   * Assert element has attribute
   */
  async assertElementHasAttribute(selector: string, attribute: string, expectedValue?: string): Promise<void> {
    const element = this.page.locator(selector);
    if (expectedValue) {
      await expect(element).toHaveAttribute(attribute, expectedValue);
    } else {
      const attributeValue = await element.getAttribute(attribute);
      expect(attributeValue).not.toBeNull();
    }
  }

  /**
   * Wait for page to stabilize (no network activity)
   */
  async waitForPageStabilize(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(1000); // Additional buffer
  }

  /**
   * Close any modal or popup if present
   */
  async closeModalIfPresent(): Promise<void> {
    const modalSelectors = [
      '.modal .close',
      '.popup .close',
      '[data-dismiss="modal"]',
      '.overlay .close',
      '.dialog .close'
    ];

    for (const selector of modalSelectors) {
      if (await this.isElementVisible(selector)) {
        await this.clickElement(selector);
        await this.page.waitForTimeout(500);
        break;
      }
    }
  }

  /**
   * Get all text content from page
   */
  async getAllPageText(): Promise<string> {
    return await this.page.textContent('body') || '';
  }

  /**
   * Check if page contains specific text
   */
  async containsText(text: string): Promise<boolean> {
    const pageText = await this.getAllPageText();
    return pageText.toLowerCase().includes(text.toLowerCase());
  }
}