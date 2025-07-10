import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Playwright Configuration for EaseMyResearch.com Testing
 * 
 * This configuration defines all test projects, browsers, and settings
 * for comprehensive functional testing of https://easemyresearch.com/
 */
export default defineConfig({
  // Test directory
  testDir: './tests',
  
  // Global test timeout
  timeout: 60000, // 1 minute per test
  
  // Global expect timeout
  expect: {
    timeout: 10000, // 10 seconds for assertions
  },
  
  // Test configuration
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 1 : undefined,
  
  // Reporter configuration
  reporter: [
    ['html', { 
      outputFolder: 'playwright-report',
      open: 'never'
    }],
    ['json', { 
      outputFile: 'test-results/results.json' 
    }],
    ['junit', { 
      outputFile: 'test-results/junit.xml' 
    }],
    ['list'],
    ['github'], // For GitHub Actions
  ],
  
  // Global setup and teardown
  globalSetup: require.resolve('./global-setup'),
  globalTeardown: require.resolve('./global-teardown'),
  
  // Output directories
  outputDir: 'test-results/',
  
  // Use configuration
  use: {
    // Base URL for all tests
    baseURL: process.env.BASE_URL || 'https://easemyresearch.com/',
    
    // Browser context options
    ignoreHTTPSErrors: false,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
    
    // Viewport size
    viewport: { width: 1280, height: 720 },
    
    // Additional context options
    acceptDownloads: true,
    
    // Navigation timeouts
    actionTimeout: 15000,
    navigationTimeout: 30000,
    
    // User agent
    userAgent: 'Mozilla/5.0 (compatible; EaseMyResearch-TestBot/1.0)',
    
    // Locale and timezone
    locale: 'en-US',
    timezoneId: 'America/New_York',
    
    // Permissions
    permissions: ['clipboard-read', 'clipboard-write'],
    
    // Extra HTTP headers
    extraHTTPHeaders: {
      'Accept-Language': 'en-US,en;q=0.9',
    },
  },

  // Test projects for different browsers and scenarios
  projects: [
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
      teardown: 'cleanup',
    },
    {
      name: 'cleanup',
      testMatch: /.*\.teardown\.ts/,
    },
    
    // Desktop Browsers
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
      },
      dependencies: ['setup'],
    },
    {
      name: 'firefox',
      use: { 
        ...devices['Desktop Firefox'] 
      },
      dependencies: ['setup'],
    },
    {
      name: 'webkit',
      use: { 
        ...devices['Desktop Safari'] 
      },
      dependencies: ['setup'],
    },
    
    // Mobile devices
    {
      name: 'mobile-chrome',
      use: { 
        ...devices['Pixel 5'],
      },
      dependencies: ['setup'],
    },
    {
      name: 'mobile-safari',
      use: { 
        ...devices['iPhone 12'],
      },
      dependencies: ['setup'],
    },
    
    // Tablet devices
    {
      name: 'tablet-chrome',
      use: { 
        ...devices['iPad Pro'],
        isMobile: false,
      },
      dependencies: ['setup'],
    },
    
    // Accessibility testing
    {
      name: 'accessibility',
      use: {
        ...devices['Desktop Chrome'],
        reducedMotion: 'reduce',
        colorScheme: 'dark',
      },
      dependencies: ['setup'],
    },
    
    // Performance testing
    {
      name: 'performance',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          args: [
            '--enable-precise-memory-info',
            '--enable-automation',
            '--disable-background-timer-throttling',
            '--disable-renderer-backgrounding',
            '--disable-backgrounding-occluded-windows',
          ]
        }
      },
      dependencies: ['setup'],
    },
    
    // Branded Browsers (if installed)
    {
      name: 'microsoft-edge',
      use: { 
        ...devices['Desktop Chrome'],
        channel: 'msedge',
      },
      dependencies: ['setup'],
    },
    {
      name: 'google-chrome',
      use: { 
        ...devices['Desktop Chrome'],
      },
      dependencies: ['setup'],
    },
  ],
  
  // Test metadata
  metadata: {
    testSuite: 'EaseMyResearch.com Functional Testing',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'production',
    baseUrl: process.env.BASE_URL || 'https://easemyresearch.com/',
    timestamp: new Date().toISOString(),
  },
  
  // Web Server (for local development)
  webServer: process.env.START_LOCAL_SERVER ? {
    command: 'npm start',
    port: 3000,
    reuseExistingServer: !process.env.CI,
  } : undefined,
});