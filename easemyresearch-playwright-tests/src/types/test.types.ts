/**
 * TypeScript Type Definitions for EaseMyResearch.com Test Framework
 */

// Test user credentials
export interface TestUser {
  email: string;
  password: string;
  name: string;
  role?: 'user' | 'admin' | 'researcher';
}

// Page element locators
export interface PageLocators {
  [key: string]: string;
}

// Test configuration
export interface TestConfig {
  baseUrl: string;
  timeout: number;
  retries: number;
  headless: boolean;
  slowMo: number;
  users: {
    user1: TestUser;
    user2: TestUser;
  };
}

// Navigation menu item
export interface NavigationItem {
  text: string;
  href: string;
  isVisible: boolean;
  isEnabled: boolean;
  hasSubmenu?: boolean;
  submenuItems?: NavigationItem[];
}

// Link analysis result
export interface LinkAnalysis {
  url: string;
  text: string;
  status: 'working' | 'broken' | 'redirect' | 'timeout' | 'error';
  statusCode?: number;
  responseTime?: number;
  errorMessage?: string;
  isExternal: boolean;
  position: {
    x: number;
    y: number;
  };
}

// Form field definition
export interface FormField {
  name: string;
  type: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'textarea' | 'select' | 'checkbox' | 'radio';
  label?: string;
  placeholder?: string;
  required: boolean;
  value?: string;
  options?: string[]; // For select/radio fields
}

// Form analysis result
export interface FormAnalysis {
  action: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  fields: FormField[];
  submitButton?: {
    text: string;
    type: string;
    disabled: boolean;
  } | undefined;
  isAccessible: boolean;
  validationErrors: string[];
}

// Performance metrics
export interface PerformanceMetrics {
  loadTime: number;
  domContentLoaded: number;
  firstContentfulPaint?: number;
  largestContentfulPaint?: number;
  firstInputDelay?: number;
  cumulativeLayoutShift?: number;
  totalBlockingTime?: number;
  resourceCount: {
    total: number;
    images: number;
    scripts: number;
    stylesheets: number;
    fonts: number;
    other: number;
  };
  resourceSizes: {
    total: number;
    images: number;
    scripts: number;
    stylesheets: number;
    fonts: number;
    other: number;
  };
}

// Accessibility violation
export interface AccessibilityViolation {
  rule: string;
  severity: 'critical' | 'serious' | 'moderate' | 'minor';
  element: string;
  description: string;
  helpUrl?: string;
  impact: 'critical' | 'serious' | 'moderate' | 'minor';
}

// Test result summary
export interface TestResultSummary {
  testName: string;
  status: 'passed' | 'failed' | 'skipped' | 'timeout';
  duration: number;
  startTime: Date;
  endTime: Date;
  error?: string;
  screenshots?: string[];
  videos?: string[];
  traces?: string[];
  metadata?: Record<string, any>;
}

// Browser context options
export interface BrowserContextOptions {
  viewport?: {
    width: number;
    height: number;
  };
  userAgent?: string;
  locale?: string;
  timezoneId?: string;
  permissions?: string[];
  geolocation?: {
    latitude: number;
    longitude: number;
    accuracy?: number;
  };
  colorScheme?: 'light' | 'dark' | 'no-preference';
  reducedMotion?: 'reduce' | 'no-preference';
}

// Test step definition
export interface TestStep {
  name: string;
  action: string;
  target?: string;
  value?: string;
  expectedResult?: string;
  timeout?: number;
  screenshot?: boolean;
}

// Page object base interface
export interface BasePage {
  url: string;
  title: string;
  load(): Promise<void>;
  isLoaded(): Promise<boolean>;
  waitForLoad(): Promise<void>;
  takeScreenshot(name?: string): Promise<string>;
}

// Search functionality interface
export interface SearchCapability {
  searchInputSelector: string;
  searchButtonSelector: string;
  searchResultsSelector: string;
  performSearch(query: string): Promise<void>;
  getSearchResults(): Promise<string[]>;
  getSearchResultsCount(): Promise<number>;
}

// Authentication interface
export interface AuthenticationCapability {
  loginForm: {
    emailSelector: string;
    passwordSelector: string;
    submitSelector: string;
  };
  login(credentials: TestUser): Promise<void>;
  logout(): Promise<void>;
  isLoggedIn(): Promise<boolean>;
  getLoggedInUser(): Promise<string | null>;
}

// Responsive design breakpoints
export interface ResponsiveBreakpoints {
  mobile: {
    width: number;
    height: number;
    device: string;
  };
  tablet: {
    width: number;
    height: number;
    device: string;
  };
  desktop: {
    width: number;
    height: number;
    device: string;
  };
}

// Test environment configuration
export interface Environment {
  name: string;
  baseUrl: string;
  apiUrl?: string;
  features: {
    authentication: boolean;
    search: boolean;
    registration: boolean;
    contactForm: boolean;
    newsletter: boolean;
  };
}

// Custom test annotations
export type TestTag = 'smoke' | 'critical' | 'regression' | 'accessibility' | 'performance' | 'visual' | 'api';

// Test data interface
export interface TestData {
  users: TestUser[];
  forms: {
    contact: Record<string, string>;
    search: string[];
    newsletter: string[];
  };
  navigation: NavigationItem[];
  content: {
    expectedTitles: string[];
    expectedHeadings: string[];
    expectedTexts: string[];
  };
}