import { FullConfig } from '@playwright/test';

/**
 * Global Teardown for EaseMyResearch.com Test Suite
 * 
 * This runs once after all tests complete and cleans up the testing environment
 */
async function globalTeardown(config: FullConfig): Promise<void> {
  console.log('\n🧹 Starting EaseMyResearch.com Test Suite Global Teardown');
  console.log('=' .repeat(60));
  
  // Log test execution summary
  console.log('📊 Test Execution Summary:');
  console.log(`   Test Projects: ${config.projects.map(p => p.name).join(', ')}`);
  console.log(`   Workers Used: ${config.workers || 'auto'}`);
  console.log(`   Retries Configured: ${config.retries}`);
  
  // Clean up temporary files (optional - Playwright handles most cleanup)
  try {
    const fs = await import('fs');
    const path = await import('path');
    
    // Optional: Clean up old test artifacts (keep last 5 runs)
    const tempDirs = ['screenshots', 'videos', 'traces'];
    
    for (const dirName of tempDirs) {
      const dirPath = path.join(process.cwd(), dirName);
      if (fs.existsSync(dirPath)) {
        const files = fs.readdirSync(dirPath);
        if (files.length > 20) { // Keep only recent files
          console.log(`🗑️ Cleaning up old files in ${dirName}/`);
          // Additional cleanup logic could go here
        }
      }
    }
  } catch (error) {
    console.warn(`⚠️ Warning during cleanup: ${error}`);
  }
  
  // Log report locations
  console.log('\n📁 Generated Reports:');
  console.log(`   📄 HTML Report: playwright-report/index.html`);
  console.log(`   📊 JSON Results: test-results/results.json`);
  console.log(`   🧪 JUnit XML: test-results/junit.xml`);
  
  // Final message
  const timestamp = new Date().toISOString();
  console.log(`\n✅ Test suite teardown completed at ${timestamp}`);
  console.log('🎉 Thank you for testing EaseMyResearch.com!');
  console.log('=' .repeat(60));
}

export default globalTeardown;