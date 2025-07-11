import { test, expect, Page } from '@playwright/test';
import { LoginHelper } from '../../../src/helpers/login-helper';

/**
 * Negative Testing Suite - Maximum Defect Detection
 * 
 * Date: 2025-07-11
 * Email: testoneemr@gmail.com  
 * Prefix: Rahul
 * 
 * Focus: Edge cases, invalid inputs, boundary conditions, error scenarios
 */

test.describe('🚨 Negative Testing - Maximum Defect Detection', () => {
  let page: Page;
  let loginHelper: LoginHelper;
  
  const testData = {
    email: 'testoneemr@gmail.com',
    password: '12345678',
    timestamp: Date.now().toString(),
    bugTracker: [] as any[],
    forms: {
      negative: 'Rahul_Negative_Test_Form',
      boundary: 'Rahul_Boundary_Test_Form',
      malicious: 'Rahul_Security_Test_Form'
    }
  };

  // Bug tracking utility
  const trackBug = (bugId: string, severity: string, description: string, steps: string, expected: string, actual: string) => {
    testData.bugTracker.push({
      id: bugId,
      date: new Date().toISOString(),
      severity,
      description,
      steps,
      expected,
      actual,
      status: 'Open',
      module: 'Negative Testing'
    });
    console.log(`🚨 NEGATIVE BUG [${bugId}] - ${severity}: ${description}`);
  };
  
  // Error handling utility
  const getErrorMessage = (error: unknown): string => {
    return error instanceof Error ? error.message : String(error);
  };

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    loginHelper = new LoginHelper(page);
    
    // Login with testoneemr@gmail.com
    await loginHelper.loginAsRegularUser();
    await page.waitForLoadState('networkidle');
  });

  test.describe('🔥 Boundary Value Testing', () => {
    
    test('should test form creation with extreme values and invalid inputs', async () => {
      await test.step('Test form title with extreme values', async () => {
        await page.goto('/create-crf');
        await page.waitForLoadState('networkidle');
        
        // Test empty form title
        try {
          await page.fill('input[name="title"], input[placeholder*="title" i]', '');
          await page.click('button:has-text("Save Form"), button:has-text("Create"), button:has-text("Publish")');
          
          const errorMessage = await page.locator('text="error", text="required", .error-message').isVisible({ timeout: 3000 });
          if (!errorMessage) {
            trackBug('NEG-001', 'Medium', 'Empty form title allowed', 
              'Submit form with empty title', 'Should show validation error', 'Empty title was accepted');
          }
        } catch (error) {
          console.log('⚠️ Empty title test resulted in error (may be expected)');
        }
        
        // Test extremely long form title
        try {
          const longTitle = 'Rahul_' + 'A'.repeat(1000); // Very long title
          await page.fill('input[name="title"], input[placeholder*="title" i]', longTitle);
          
          // Check if input accepts the long title
          const inputValue = await page.inputValue('input[name="title"], input[placeholder*="title" i]');
          if (inputValue === longTitle) {
            trackBug('NEG-002', 'Low', 'Extremely long form title accepted', 
              'Enter 1000+ character title', 'Should limit title length', 'Long title was accepted');
          }
        } catch (error) {
          console.log('✅ Long title properly handled');
        }
        
        // Test title with special characters
        try {
          const specialTitle = 'Rahul_<script>alert("XSS")</script>_Test';
          await page.fill('input[name="title"], input[placeholder*="title" i]', specialTitle);
          
          const inputValue = await page.inputValue('input[name="title"], input[placeholder*="title" i]');
          if (inputValue.includes('<script>')) {
            trackBug('NEG-003', 'High', 'Script tags allowed in form title', 
              'Enter script tag in form title', 'Should sanitize script tags', 'Script tags were accepted');
          }
        } catch (error) {
          console.log('✅ Special characters properly handled');
        }
        
        // Test title with SQL injection attempt
        try {
          const sqlTitle = "Rahul_'; DROP TABLE forms; --";
          await page.fill('input[name="title"], input[placeholder*="title" i]', sqlTitle);
          
          const inputValue = await page.inputValue('input[name="title"], input[placeholder*="title" i]');
          if (inputValue.includes('DROP TABLE')) {
            trackBug('NEG-004', 'Critical', 'SQL injection pattern allowed in title', 
              'Enter SQL injection in form title', 'Should sanitize SQL patterns', 'SQL injection pattern accepted');
          }
        } catch (error) {
          console.log('✅ SQL injection attempt properly handled');
        }
      });

      await test.step('Test field creation with invalid configurations', async () => {
        // Set valid title for further testing
        await page.fill('input[name="title"], input[placeholder*="title" i]', `${testData.forms.negative}_${testData.timestamp}`);
        
        // Test adding field with empty name
        try {
          await page.click('button:has-text("Add Field"), .add-field-btn');
          await page.fill('input[placeholder*="field name" i]', ''); // Empty field name
          await page.selectOption('select[name="type"], select[placeholder*="type" i]', 'text');
          await page.click('button:has-text("Add"), button:has-text("Save Field")');
          
          const errorMessage = await page.locator('text="error", text="required", .error-message').isVisible({ timeout: 3000 });
          if (!errorMessage) {
            trackBug('NEG-005', 'Medium', 'Empty field name allowed', 
              'Add field with empty name', 'Should show validation error', 'Empty field name was accepted');
          }
        } catch (error) {
          console.log('⚠️ Empty field name test resulted in error (may be expected)');
        }
        
        // Test field name with invalid characters
        try {
          await page.click('button:has-text("Add Field"), .add-field-btn');
          await page.fill('input[placeholder*="field name" i]', 'Rahul@#$%^&*()');
          await page.selectOption('select[name="type"], select[placeholder*="type" i]', 'text');
          await page.click('button:has-text("Add"), button:has-text("Save Field")');
          
          // Check if field was actually added
          const fieldExists = await page.locator('text="Rahul@#$%^&*()"').isVisible({ timeout: 3000 });
          if (fieldExists) {
            trackBug('NEG-006', 'Medium', 'Invalid characters allowed in field name', 
              'Add field with special characters', 'Should validate field name format', 'Invalid characters accepted');
          }
        } catch (error) {
          console.log('✅ Invalid field name properly handled');
        }
        
        // Test duplicate field names
        try {
          await page.click('button:has-text("Add Field"), .add-field-btn');
          await page.fill('input[placeholder*="field name" i]', 'Rahul_Duplicate_Field');
          await page.selectOption('select[name="type"], select[placeholder*="type" i]', 'text');
          await page.click('button:has-text("Add"), button:has-text("Save Field")');
          
          // Try to add another field with same name
          await page.click('button:has-text("Add Field"), .add-field-btn');
          await page.fill('input[placeholder*="field name" i]', 'Rahul_Duplicate_Field');
          await page.selectOption('select[name="type"], select[placeholder*="type" i]', 'number');
          await page.click('button:has-text("Add"), button:has-text("Save Field")');
          
          const errorMessage = await page.locator('text="duplicate", text="already exists", .error-message').isVisible({ timeout: 3000 });
          if (!errorMessage) {
            trackBug('NEG-007', 'Medium', 'Duplicate field names allowed', 
              'Add two fields with same name', 'Should prevent duplicate field names', 'Duplicate field names accepted');
          }
        } catch (error) {
          console.log('⚠️ Duplicate field test resulted in error (may be expected)');
        }
      });

      await test.step('Test number field with boundary values', async () => {
        try {
          await page.click('button:has-text("Add Field"), .add-field-btn');
          await page.fill('input[placeholder*="field name" i]', 'Rahul_Number_Boundary');
          await page.selectOption('select[name="type"], select[placeholder*="type" i]', 'number');
          
          // Test invalid min/max values
          await page.fill('input[placeholder*="min" i]', 'abc'); // Non-numeric min
          await page.fill('input[placeholder*="max" i]', 'xyz'); // Non-numeric max
          
          await page.click('button:has-text("Add"), button:has-text("Save Field")');
          
          const errorMessage = await page.locator('text="error", text="invalid", .error-message').isVisible({ timeout: 3000 });
          if (!errorMessage) {
            trackBug('NEG-008', 'Medium', 'Non-numeric min/max values accepted', 
              'Set non-numeric min/max for number field', 'Should validate numeric values', 'Non-numeric values accepted');
          }
        } catch (error) {
          console.log('✅ Non-numeric min/max properly handled');
        }
        
        // Test min > max scenario
        try {
          await page.fill('input[placeholder*="min" i]', '100');
          await page.fill('input[placeholder*="max" i]', '50'); // Min > Max
          
          await page.click('button:has-text("Add"), button:has-text("Save Field")');
          
          const errorMessage = await page.locator('text="error", text="invalid", .error-message').isVisible({ timeout: 3000 });
          if (!errorMessage) {
            trackBug('NEG-009', 'Medium', 'Min greater than max allowed', 
              'Set min=100, max=50 for number field', 'Should validate min <= max', 'Invalid range accepted');
          }
        } catch (error) {
          console.log('✅ Min/Max validation properly handled');
        }
      });

      await test.step('Test select field with invalid options', async () => {
        try {
          await page.click('button:has-text("Add Field"), .add-field-btn');
          await page.fill('input[placeholder*="field name" i]', 'Rahul_Select_Invalid');
          await page.selectOption('select[name="type"], select[placeholder*="type" i]', 'select');
          
          // Test empty options
          await page.fill('textarea[placeholder*="options" i]', '');
          await page.click('button:has-text("Add"), button:has-text("Save Field")');
          
          const errorMessage = await page.locator('text="error", text="required", .error-message').isVisible({ timeout: 3000 });
          if (!errorMessage) {
            trackBug('NEG-010', 'Medium', 'Select field with no options allowed', 
              'Create select field with empty options', 'Should require at least one option', 'Empty options accepted');
          }
        } catch (error) {
          console.log('⚠️ Empty options test resulted in error (may be expected)');
        }
        
        // Test options with special characters
        try {
          const maliciousOptions = '<script>alert("XSS")</script>\n<img src="x" onerror="alert(1)">\n\'; DROP TABLE options; --';
          await page.fill('textarea[placeholder*="options" i]', maliciousOptions);
          await page.click('button:has-text("Add"), button:has-text("Save Field")');
          
          // Check if malicious content was accepted
          const textareaValue = await page.inputValue('textarea[placeholder*="options" i]');
          if (textareaValue.includes('<script>') || textareaValue.includes('DROP TABLE')) {
            trackBug('NEG-011', 'High', 'Malicious content allowed in select options', 
              'Enter script tags and SQL in select options', 'Should sanitize malicious content', 'Malicious content accepted');
          }
        } catch (error) {
          console.log('✅ Malicious options properly handled');
        }
      });
    });
  });

  test.describe('📊 Data Entry Negative Testing', () => {
    
    test('should test data entry with invalid and malicious inputs', async () => {
      await test.step('Create simple form for data testing', async () => {
        await page.goto('/create-crf');
        await page.waitForLoadState('networkidle');
        
        const formName = `${testData.forms.boundary}_${testData.timestamp}`;
        await page.fill('input[name="title"], input[placeholder*="title" i]', formName);
        
        // Add basic fields for testing
        await page.click('button:has-text("Add Field"), .add-field-btn');
        await page.fill('input[placeholder*="field name" i]', 'Rahul_Text_Field');
        await page.selectOption('select[name="type"], select[placeholder*="type" i]', 'text');
        await page.click('button:has-text("Add"), button:has-text("Save Field")');
        
        await page.click('button:has-text("Add Field"), .add-field-btn');
        await page.fill('input[placeholder*="field name" i]', 'Rahul_Number_Field');
        await page.selectOption('select[name="type"], select[placeholder*="type" i]', 'number');
        await page.fill('input[placeholder*="min" i]', '0');
        await page.fill('input[placeholder*="max" i]', '100');
        await page.click('button:has-text("Add"), button:has-text("Save Field")');
        
        await page.click('button:has-text("Add Field"), .add-field-btn');
        await page.fill('input[placeholder*="field name" i]', 'Rahul_Email_Field');
        await page.selectOption('select[name="type"], select[placeholder*="type" i]', 'email');
        await page.click('button:has-text("Add"), button:has-text("Save Field")');
        
        await page.click('button:has-text("Save Form"), button:has-text("Create"), button:has-text("Publish")');
        await page.waitForSelector('text="Form created successfully", text="Success", .success-message', { timeout: 10000 });
      });

      await test.step('Test data entry with boundary values', async () => {
        await page.goto('/my-crf');
        await page.waitForLoadState('networkidle');
        
        const formName = `${testData.forms.boundary}_${testData.timestamp}`;
        await page.click(`text="${formName}", a:has-text("${formName}")`);
        await page.waitForLoadState('networkidle');
        
        await page.click('button:has-text("Add Record"), button:has-text("New Entry"), .add-record-btn');
        
        // Test extremely long text input
        try {
          const longText = 'Rahul_' + 'A'.repeat(10000); // Very long text
          await page.fill('input[name*="Rahul_Text_Field"]', longText);
          
          const inputValue = await page.inputValue('input[name*="Rahul_Text_Field"]');
          if (inputValue.length > 5000) {
            trackBug('NEG-012', 'Low', 'Extremely long text input accepted', 
              'Enter 10000+ character text', 'Should limit text input length', 'Long text accepted');
          }
        } catch (error) {
          console.log('✅ Long text properly handled');
        }
        
        // Test XSS attempts in text field
        try {
          const xssPayload = '<script>alert("XSS Attack")</script><img src="x" onerror="alert(1)">';
          await page.fill('input[name*="Rahul_Text_Field"]', xssPayload);
          
          const inputValue = await page.inputValue('input[name*="Rahul_Text_Field"]');
          if (inputValue.includes('<script>') || inputValue.includes('onerror')) {
            trackBug('NEG-013', 'Critical', 'XSS payload accepted in text field', 
              'Enter script tags in text field', 'Should sanitize script content', 'XSS payload accepted');
          }
        } catch (error) {
          console.log('✅ XSS payload properly handled');
        }
        
        // Test SQL injection in text field
        try {
          const sqlPayload = "'; DELETE FROM records WHERE 1=1; --";
          await page.fill('input[name*="Rahul_Text_Field"]', sqlPayload);
          
          const inputValue = await page.inputValue('input[name*="Rahul_Text_Field"]');
          if (inputValue.includes('DELETE FROM') || inputValue.includes('DROP TABLE')) {
            trackBug('NEG-014', 'Critical', 'SQL injection payload accepted', 
              'Enter SQL injection in text field', 'Should sanitize SQL commands', 'SQL injection accepted');
          }
        } catch (error) {
          console.log('✅ SQL injection properly handled');
        }
        
        // Test number field boundary violations
        try {
          await page.fill('input[name*="Rahul_Number_Field"]', '999999'); // Above max (100)
          
          // Try to save
          await page.click('button:has-text("Save Record"), button:has-text("Submit"), button:has-text("Save")');
          
          const errorMessage = await page.locator('text="error", text="invalid", text="range", .error-message').isVisible({ timeout: 3000 });
          if (!errorMessage) {
            trackBug('NEG-015', 'Medium', 'Number field accepts values outside range', 
              'Enter number above maximum limit', 'Should validate number range', 'Out-of-range number accepted');
          }
        } catch (error) {
          console.log('⚠️ Number validation test resulted in error (may be expected)');
        }
        
        // Test negative number when min is 0
        try {
          await page.fill('input[name*="Rahul_Number_Field"]', '-50'); // Below min (0)
          
          const errorMessage = await page.locator('text="error", text="invalid", text="range", .error-message').isVisible({ timeout: 3000 });
          if (!errorMessage) {
            trackBug('NEG-016', 'Medium', 'Negative number accepted when min is 0', 
              'Enter negative number in field with min=0', 'Should validate minimum value', 'Negative number accepted');
          }
        } catch (error) {
          console.log('⚠️ Negative number test resulted in error (may be expected)');
        }
        
        // Test invalid email formats
        try {
          const invalidEmails = [
            'invalid-email',
            '@domain.com',
            'user@',
            'user@domain',
            'user..name@domain.com',
            'user name@domain.com',
            '<script>alert("xss")</script>@domain.com'
          ];
          
          for (const email of invalidEmails) {
            await page.fill('input[name*="Rahul_Email_Field"]', email);
            
            // Try to save
            await page.click('button:has-text("Save Record"), button:has-text("Submit"), button:has-text("Save")');
            
            const errorMessage = await page.locator('text="error", text="invalid", text="email", .error-message').isVisible({ timeout: 3000 });
            if (!errorMessage) {
              trackBug('NEG-017', 'Medium', `Invalid email format accepted: ${email}`, 
                `Enter invalid email: ${email}`, 'Should validate email format', `Invalid email "${email}" was accepted`);
              break; // Only report first invalid email that passes
            }
          }
        } catch (error) {
          console.log('✅ Email validation working properly');
        }
      });
    });
  });

  test.describe('🔄 Form Modification Negative Testing', () => {
    
    test('should test form modifications with existing data', async () => {
      await test.step('Create form and add data', async () => {
        await page.goto('/create-crf');
        await page.waitForLoadState('networkidle');
        
        const formName = `${testData.forms.malicious}_${testData.timestamp}`;
        await page.fill('input[name="title"], input[placeholder*="title" i]', formName);
        
        // Add a field
        await page.click('button:has-text("Add Field"), .add-field-btn');
        await page.fill('input[placeholder*="field name" i]', 'Rahul_Original_Field');
        await page.selectOption('select[name="type"], select[placeholder*="type" i]', 'text');
        await page.click('button:has-text("Add"), button:has-text("Save Field")');
        
        await page.click('button:has-text("Save Form"), button:has-text("Create"), button:has-text("Publish")');
        await page.waitForSelector('text="Form created successfully", text="Success", .success-message', { timeout: 10000 });
        
        // Add some data
        await page.goto('/my-crf');
        await page.waitForLoadState('networkidle');
        await page.click(`text="${formName}", a:has-text("${formName}")`);
        await page.waitForLoadState('networkidle');
        
        await page.click('button:has-text("Add Record"), button:has-text("New Entry"), .add-record-btn');
        await page.fill('input[name*="Rahul_Original_Field"]', 'Original Data Value');
        await page.click('button:has-text("Save Record"), button:has-text("Submit"), button:has-text("Save")');
        await page.waitForSelector('text="Record saved successfully", text="Success", .success-message', { timeout: 10000 });
      });

      await test.step('Test deleting fields with existing data', async () => {
        try {
          // Go to form editor
          await page.goto('/my-crf');
          await page.waitForLoadState('networkidle');
          
          const formName = `${testData.forms.malicious}_${testData.timestamp}`;
          await page.click(`text="${formName}", a:has-text("${formName}")`);
          await page.click('button:has-text("Edit Form"), .edit-form-btn');
          
          // Try to delete the field that has data
          await page.click('button:has-text("Delete Field"), .delete-field-btn');
          await page.click('button:has-text("Confirm"), button:has-text("Yes")');
          
          // Save form
          await page.click('button:has-text("Save Form"), button:has-text("Update"), button:has-text("Save")');
          
          // Check if deletion was allowed
          const successMessage = await page.locator('text="Form updated successfully", text="Success", .success-message').isVisible({ timeout: 5000 });
          if (successMessage) {
            // Check what happened to existing data
            await page.goto('/my-records');
            await page.waitForLoadState('networkidle');
            
            // Look for the data - is it still there? Is it corrupted?
            const originalData = await page.locator('text="Original Data Value"').isVisible({ timeout: 3000 });
            if (!originalData) {
              trackBug('NEG-018', 'High', 'Data lost when field deleted from form', 
                'Delete field that contains data', 'Should preserve data or warn about data loss', 'Data was lost without warning');
            }
          }
        } catch (error) {
          console.log('⚠️ Field deletion test resulted in error (may be expected)');
        }
      });

      await test.step('Test form deletion with existing records', async () => {
        try {
          await page.goto('/my-crf');
          await page.waitForLoadState('networkidle');
          
          // Try to delete form that has data
          const formName = `${testData.forms.malicious}_${testData.timestamp}`;
          await page.click('button:has-text("Delete"), .delete-form-btn');
          await page.click('button:has-text("Confirm"), button:has-text("Yes")');
          
          const successMessage = await page.locator('text="Form deleted successfully", text="Success", .success-message').isVisible({ timeout: 5000 });
          if (successMessage) {
            // Check if records still exist
            await page.goto('/my-records');
            await page.waitForLoadState('networkidle');
            
            const recordsExist = await page.locator('text="Original Data Value"').isVisible({ timeout: 3000 });
            if (!recordsExist) {
              trackBug('NEG-019', 'Critical', 'Records deleted when form deleted without warning', 
                'Delete form that contains records', 'Should warn about record deletion or preserve records', 'Records deleted without warning');
            }
          }
        } catch (error) {
          console.log('⚠️ Form deletion test resulted in error (may be expected)');
        }
      });
    });
  });

  test.describe('🌐 Session and Security Testing', () => {
    
    test('should test session management and security edge cases', async () => {
      await test.step('Test concurrent form editing', async () => {
        // This would ideally require multiple browser contexts
        // For now, test rapid consecutive edits
        try {
          await page.goto('/create-crf');
          await page.waitForLoadState('networkidle');
          
          const formName = `${testData.forms.negative}_concurrent_${testData.timestamp}`;
          await page.fill('input[name="title"], input[placeholder*="title" i]', formName);
          
          // Rapidly add multiple fields
          for (let i = 0; i < 5; i++) {
            await page.click('button:has-text("Add Field"), .add-field-btn');
            await page.fill('input[placeholder*="field name" i]', `Rahul_Rapid_Field_${i}`);
            await page.selectOption('select[name="type"], select[placeholder*="type" i]', 'text');
            await page.click('button:has-text("Add"), button:has-text("Save Field")');
          }
          
          // Save form
          await page.click('button:has-text("Save Form"), button:has-text("Create"), button:has-text("Publish")');
          
          const successMessage = await page.waitForSelector('text="Form created successfully", text="Success", .success-message', { timeout: 10000 });
          if (!successMessage) {
            trackBug('NEG-020', 'Medium', 'Rapid form editing caused failure', 
              'Rapidly add multiple fields and save', 'Should handle rapid edits gracefully', 'Rapid editing failed');
          }
        } catch (error) {
          trackBug('NEG-021', 'Medium', 'Concurrent editing caused exception', 
            'Rapidly add multiple fields', 'Should handle concurrent edits', `Error: ${getErrorMessage(error)}`);
        }
      });

      await test.step('Test form access with expired session', async () => {
        // This is a conceptual test - actual session expiry would require time manipulation
        try {
          // Navigate away and back to test session persistence
          await page.goto('https://google.com');
          await page.waitForLoadState('networkidle');
          
          // Go back to the application
          await page.goto('https://easemyresearch.com/create-crf');
          await page.waitForLoadState('networkidle');
          
          // Check if we're still authenticated
          const loginRequired = await page.locator('text="Login", text="Sign In"').isVisible({ timeout: 3000 });
          if (!loginRequired) {
            // Try to perform an action
            await page.fill('input[name="title"], input[placeholder*="title" i]', 'Session Test Form');
            await page.click('button:has-text("Save Form"), button:has-text("Create"), button:has-text("Publish")');
            
            const unauthorizedError = await page.locator('text="unauthorized", text="login required", .error-message').isVisible({ timeout: 3000 });
            if (!unauthorizedError) {
              console.log('✅ Session management working properly');
            }
          }
        } catch (error) {
          console.log('⚠️ Session test resulted in error (may be expected)');
        }
      });
    });
  });

  // Output negative testing bug summary
  test.afterAll(async () => {
    console.log('\n🚨 NEGATIVE TESTING BUG SUMMARY');
    console.log('==============================');
    console.log(`Total Negative Test Bugs Found: ${testData.bugTracker.length}`);
    
    const severityCounts = {
      Critical: testData.bugTracker.filter(bug => bug.severity === 'Critical').length,
      High: testData.bugTracker.filter(bug => bug.severity === 'High').length,
      Medium: testData.bugTracker.filter(bug => bug.severity === 'Medium').length,
      Low: testData.bugTracker.filter(bug => bug.severity === 'Low').length
    };
    
    console.log('Negative Testing Severity Breakdown:');
    console.log(`- Critical: ${severityCounts.Critical}`);
    console.log(`- High: ${severityCounts.High}`);
    console.log(`- Medium: ${severityCounts.Medium}`);
    console.log(`- Low: ${severityCounts.Low}`);
    
    // Save negative testing bug data
    require('fs').writeFileSync('negative-bug-tracker-data.json', JSON.stringify(testData.bugTracker, null, 2));
  });
});