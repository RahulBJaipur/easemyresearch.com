import { FullConfig } from '@playwright/test';
import * as dotenv from 'dotenv';

/**
 * Global Setup for EaseMyResearch.com Test Suite
 * 
 * This runs once before all tests and sets up the testing environment
 */
async function globalSetup(config: FullConfig): Promise<void> {
  // Load environment variables
  dotenv.config();
  
  console.log('🚀 Starting EaseMyResearch.com Test Suite Global Setup');
  console.log(`📍 Base URL: ${process.env.BASE_URL || 'https://easemyresearch.com/'}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'production'}`);
  console.log(`🎭 Test Projects: ${config.projects.map(p => p.name).join(', ')}`);
  
  // Verify base URL is accessible
  try {
    const axios = await import('axios');
    const response = await axios.default.get(process.env.BASE_URL || 'https://easemyresearch.com/', {
      timeout: 10000,
      validateStatus: (status) => status < 500, // Accept any status < 500
    });
    
    console.log(`✅ Base URL accessible (Status: ${response.status})`);
  } catch (error) {
    console.warn(`⚠️ Warning: Could not verify base URL accessibility: ${error}`);
  }
  
  // Validate test credentials
  const testUsers = [
    {
      email: process.env.TEST_USER_EMAIL_1,
      password: process.env.TEST_USER_PASSWORD_1,
      name: 'Test User 1'
    },
    {
      email: process.env.TEST_USER_EMAIL_2,
      password: process.env.TEST_USER_PASSWORD_2,
      name: 'Test User 2'
    }
  ];
  
  let validCredentials = 0;
  for (const user of testUsers) {
    if (user.email && user.password) {
      validCredentials++;
      console.log(`👤 ${user.name}: ${user.email} (configured)`);
    } else {
      console.warn(`⚠️ ${user.name}: Missing credentials`);
    }
  }
  
  if (validCredentials === 0) {
    console.warn('⚠️ Warning: No test user credentials configured');
  } else {
    console.log(`✅ ${validCredentials} test user(s) configured`);
  }
  
  // Create necessary directories
  const fs = await import('fs');
  const path = await import('path');
  
  const directories = [
    'test-results',
    'playwright-report',
    'screenshots',
    'videos',
    'traces'
  ];
  
  for (const dir of directories) {
    const dirPath = path.join(process.cwd(), dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`📁 Created directory: ${dir}`);
    }
  }
  
  // Log test execution settings
  console.log('\n📊 Test Execution Settings:');
  console.log(`   Parallel Workers: ${config.workers || 'auto'}`);
  console.log(`   Test Timeout: ${config.timeout}ms`);
  console.log(`   Retries: ${config.retries}`);
  console.log(`   Headless: ${process.env.HEADLESS !== 'false'}`);
  
  console.log('\n🎯 Ready to execute comprehensive functional tests!');
  console.log('=' .repeat(60));
}

export default globalSetup;