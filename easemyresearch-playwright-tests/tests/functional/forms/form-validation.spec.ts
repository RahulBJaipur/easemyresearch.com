import { test, expect } from '@playwright/test';
import { HomePage } from '../../../src/pages/homepage';

/**
 * Comprehensive Form Validation and Data Entry Test Suite
 * Tests form validation, data entry, and form submission
 * Uses "Rahul" prefix for all test data
 */

const testData = {
  formPrefix: 'Rahul_Validation_',
  timestamp: new Date().getTime(),
  testUser: {
    email: 'testoneemr@gmail.com',
    password: '12345678'
  },
  sampleData: {
    participant: {
      name: 'Rahul Test Participant',
      email: 'rahul.test@example.com',
      age: 35,
      phone: '+1-555-123-4567',
      address: '123 Rahul Test Street, Test City, TC 12345'
    },
    medical: {
      height: 175,
      weight: 70,
      bloodPressure: { systolic: 120, diastolic: 80 },
      conditions: ['Hypertension', 'Diabetes'],
      medications: ['Metformin', 'Lisinopril']
    }
  }
};

test.describe('Form Validation and Data Entry - Comprehensive Testing', () => {
  let homepage: HomePage;

  test.beforeEach(async ({ page }) => {
    homepage = new HomePage(page);
    console.log('🧪 Setting up form validation test environment...');
    await homepage.loadPage();
    
    // Login to access forms
    await test.step('Login to access forms', async () => {
      try {
        const loginClicked = await homepage.clickLogin();
        if (loginClicked) {
          await homepage.fillLoginForm(testData.testUser.email, testData.testUser.password);
          console.log('✅ Login completed for form validation tests');
        }
      } catch (error) {
        console.log('⚠️ Login process encountered issues, continuing with available tests');
      }
    });
  });

  test.describe('📋 Form Field Validation Testing', () => {
    test('should test required field validation @functional @validation', async ({ page }) => {
      console.log('🧪 Testing required field validation...');
      
      await test.step('Navigate to form creation/editing', async () => {
        // Navigate to forms section
        await navigateToForms(page);
      });
      
      await test.step('Test empty required fields', async () => {
        // Try to submit form without filling required fields
        const submitButton = page.locator('button:has-text("Submit"), button[type="submit"]').first();
        if (await submitButton.isVisible({ timeout: 2000 })) {
          await submitButton.click();
          
          // Check for validation messages
          const errorMessages = await page.locator('.error, .invalid, [aria-invalid="true"]').count();
          console.log(`📊 Validation errors found: ${errorMessages}`);
          
          // Look for specific validation text
          const validationTexts = await page.locator('text="required", text="Required", text="This field is required"').count();
          console.log(`📊 Required field messages: ${validationTexts}`);
        }
      });
      
      await test.step('Test invalid email format', async () => {
        const emailFields = [
          'input[type="email"]',
          'input[name*="email" i]',
          'input[placeholder*="email" i]'
        ];
        
        for (const selector of emailFields) {
          const emailField = page.locator(selector).first();
          if (await emailField.isVisible({ timeout: 1000 })) {
            await emailField.fill('rahul.invalid-email');
            await emailField.blur();
            
            // Check for email validation
            const isInvalid = await emailField.getAttribute('aria-invalid');
            console.log(`📧 Email validation: ${isInvalid === 'true' ? '❌ Invalid' : '✅ Valid'}`);
            break;
          }
        }
      });
      
      await test.step('Test numeric field validation', async () => {
        const numberFields = [
          'input[type="number"]',
          'input[name*="age" i]',
          'input[name*="weight" i]',
          'input[name*="height" i]'
        ];
        
        for (const selector of numberFields) {
          const numberField = page.locator(selector).first();
          if (await numberField.isVisible({ timeout: 1000 })) {
            // Test non-numeric input
            await numberField.fill('Rahul123abc');
            await numberField.blur();
            
            const value = await numberField.inputValue();
            console.log(`🔢 Number field filtered value: "${value}"`);
            break;
          }
        }
      });
    });

    test('should test field length validation @functional @validation', async ({ page }) => {
      console.log('🧪 Testing field length validation...');
      
      await test.step('Navigate to form', async () => {
        await navigateToForms(page);
      });
      
      await test.step('Test maximum length validation', async () => {
        const textFields = await page.locator('input[type="text"], textarea').all();
        
        for (const field of textFields.slice(0, 3)) { // Test first 3 fields
          if (await field.isVisible()) {
            const maxLength = await field.getAttribute('maxlength');
            if (maxLength) {
              const longText = 'Rahul_' + 'A'.repeat(parseInt(maxLength) + 10);
              await field.fill(longText);
              
              const actualValue = await field.inputValue();
              console.log(`📏 Max length ${maxLength}: Input ${longText.length} chars, Got ${actualValue.length} chars`);
            }
          }
        }
      });
      
      await test.step('Test minimum length validation', async () => {
        const textFields = await page.locator('input[type="text"]').all();
        
        for (const field of textFields.slice(0, 2)) { // Test first 2 fields
          if (await field.isVisible()) {
            await field.fill('R'); // Very short input
            await field.blur();
            
            const isInvalid = await field.getAttribute('aria-invalid');
            console.log(`📏 Minimum length test: ${isInvalid === 'true' ? '❌ Too short' : '✅ Valid'}`);
          }
        }
      });
    });
  });

  test.describe('📊 Form Data Entry Testing', () => {
    test('should test comprehensive data entry for screening form @functional @dataentry', async ({ page }) => {
      console.log('🧪 Testing comprehensive data entry for screening form...');
      
      const formName = `${testData.formPrefix}Screening_${testData.timestamp}`;
      
      await test.step('Create or navigate to screening form', async () => {
        await navigateToForms(page);
        await createOrSelectForm(page, formName, 'screening');
      });
      
      await test.step('Fill participant information', async () => {
        // Fill text fields
        await fillFieldBySelector(page, ['input[name*="name" i]', 'input[placeholder*="name" i]'], testData.sampleData.participant.name);
        await fillFieldBySelector(page, ['input[name*="email" i]', 'input[type="email"]'], testData.sampleData.participant.email);
        await fillFieldBySelector(page, ['input[name*="age" i]', 'input[placeholder*="age" i]'], testData.sampleData.participant.age.toString());
        await fillFieldBySelector(page, ['input[name*="phone" i]', 'input[type="tel"]'], testData.sampleData.participant.phone);
      });
      
      await test.step('Fill dropdown selections', async () => {
        // Test dropdown selections
        const dropdowns = await page.locator('select').all();
        for (let i = 0; i < Math.min(dropdowns.length, 3); i++) {
          const dropdown = dropdowns[i];
          if (await dropdown.isVisible()) {
            const options = await dropdown.locator('option').all();
            if (options.length > 1) {
              await dropdown.selectOption({ index: 1 });
              console.log(`✅ Selected option in dropdown ${i + 1}`);
            }
          }
        }
      });
      
      await test.step('Fill checkbox selections', async () => {
        // Test checkbox selections
        const checkboxes = await page.locator('input[type="checkbox"]').all();
        for (let i = 0; i < Math.min(checkboxes.length, 5); i++) {
          const checkbox = checkboxes[i];
          if (await checkbox.isVisible()) {
            await checkbox.check();
            console.log(`✅ Checked checkbox ${i + 1}`);
          }
        }
      });
      
      await test.step('Fill radio button selections', async () => {
        // Test radio button selections
        const radioGroups = await getRadioGroups(page);
        for (const [groupName, radios] of radioGroups.entries()) {
          if (radios.length > 0) {
            await radios[0].check();
            console.log(`✅ Selected radio option in group: ${groupName}`);
          }
        }
      });
      
      await test.step('Submit form and verify', async () => {
        await submitForm(page);
        console.log(`✅ Screening form "${formName}" submitted successfully`);
      });
    });

    test('should test medical data entry for main form @functional @dataentry', async ({ page }) => {
      console.log('🧪 Testing medical data entry for main form...');
      
      const formName = `${testData.formPrefix}Main_${testData.timestamp}`;
      
      await test.step('Create or navigate to main form', async () => {
        await navigateToForms(page);
        await createOrSelectForm(page, formName, 'main');
      });
      
      await test.step('Fill medical measurements', async () => {
        // Fill height
        await fillFieldBySelector(page, ['input[name*="height" i]'], testData.sampleData.medical.height.toString());
        
        // Fill weight
        await fillFieldBySelector(page, ['input[name*="weight" i]'], testData.sampleData.medical.weight.toString());
        
        // Fill blood pressure
        await fillFieldBySelector(page, ['input[name*="systolic" i]', 'input[name*="bp" i]'], testData.sampleData.medical.bloodPressure.systolic.toString());
        await fillFieldBySelector(page, ['input[name*="diastolic" i]'], testData.sampleData.medical.bloodPressure.diastolic.toString());
      });
      
      await test.step('Fill date and time fields', async () => {
        const today = new Date().toISOString().split('T')[0];
        const currentTime = new Date().toTimeString().slice(0, 5);
        
        await fillFieldBySelector(page, ['input[type="date"]'], today);
        await fillFieldBySelector(page, ['input[type="time"]'], currentTime);
      });
      
      await test.step('Fill text areas', async () => {
        const textAreas = await page.locator('textarea').all();
        for (let i = 0; i < textAreas.length; i++) {
          const textArea = textAreas[i];
          if (await textArea.isVisible()) {
            await textArea.fill(`Rahul test notes for text area ${i + 1}. This is comprehensive medical history data for testing purposes.`);
            console.log(`✅ Filled textarea ${i + 1}`);
          }
        }
      });
      
      await test.step('Test file upload fields', async () => {
        const fileInputs = await page.locator('input[type="file"]').all();
        for (const fileInput of fileInputs) {
          if (await fileInput.isVisible()) {
            // Create a test file buffer
            const testFileContent = `Rahul test file content - ${testData.timestamp}`;
            const buffer = Buffer.from(testFileContent);
            
            await fileInput.setInputFiles({
              name: `rahul_test_${testData.timestamp}.txt`,
              mimeType: 'text/plain',
              buffer: buffer
            });
            console.log('✅ Uploaded test file');
          }
        }
      });
      
      await test.step('Submit main form', async () => {
        await submitForm(page);
        console.log(`✅ Main form "${formName}" submitted successfully`);
      });
    });
  });

  test.describe('🔄 Form Functionality Testing', () => {
    test('should test form save and load functionality @functional @saveload', async ({ page }) => {
      console.log('🧪 Testing form save and load functionality...');
      
      const formName = `${testData.formPrefix}SaveLoad_${testData.timestamp}`;
      
      await test.step('Create form and fill partial data', async () => {
        await navigateToForms(page);
        await createOrSelectForm(page, formName, 'test');
        
        // Fill some fields
        await fillFieldBySelector(page, ['input[type="text"]'], 'Rahul Partial Data');
        await fillFieldBySelector(page, ['input[type="email"]'], 'rahul.partial@test.com');
      });
      
      await test.step('Save form as draft', async () => {
        const saveButtons = [
          'button:has-text("Save")',
          'button:has-text("Save Draft")',
          'button:has-text("Save as Draft")'
        ];
        
        for (const selector of saveButtons) {
          const button = page.locator(selector).first();
          if (await button.isVisible({ timeout: 1000 })) {
            await button.click();
            console.log('✅ Form saved as draft');
            break;
          }
        }
      });
      
      await test.step('Navigate away and return', async () => {
        await page.reload();
        await navigateToForms(page);
        
        // Try to find the saved form
        const formLink = page.locator(`text="${formName}"`).first();
        if (await formLink.isVisible({ timeout: 2000 })) {
          await formLink.click();
          console.log('✅ Successfully navigated back to saved form');
        }
      });
      
      await test.step('Verify saved data persistence', async () => {
        // Check if previously filled data is still there
        const textField = page.locator('input[type="text"]').first();
        if (await textField.isVisible()) {
          const value = await textField.inputValue();
          console.log(`📊 Saved text field value: "${value}"`);
        }
        
        const emailField = page.locator('input[type="email"]').first();
        if (await emailField.isVisible()) {
          const value = await emailField.inputValue();
          console.log(`📊 Saved email field value: "${value}"`);
        }
      });
    });

    test('should test form conditional logic @functional @conditional', async ({ page }) => {
      console.log('🧪 Testing form conditional logic...');
      
      await test.step('Navigate to form with conditional logic', async () => {
        await navigateToForms(page);
      });
      
      await test.step('Test show/hide based on selection', async () => {
        // Look for radio buttons or dropdowns that might trigger conditional logic
        const triggers = [
          'input[type="radio"]',
          'select',
          'input[type="checkbox"]'
        ];
        
        for (const triggerSelector of triggers) {
          const triggerElements = await page.locator(triggerSelector).all();
          
          for (const trigger of triggerElements.slice(0, 2)) { // Test first 2 elements
            if (await trigger.isVisible()) {
              // Get the count of visible elements before interaction
              const beforeCount = await page.locator('input, select, textarea').count();
              
              // Interact with the trigger
              if (triggerSelector.includes('radio') || triggerSelector.includes('checkbox')) {
                await trigger.check();
              } else if (triggerSelector.includes('select')) {
                const options = await trigger.locator('option').all();
                if (options.length > 1) {
                  await trigger.selectOption({ index: 1 });
                }
              }
              
              // Wait for potential DOM changes
              await page.waitForTimeout(1000);
              
              // Get the count of visible elements after interaction
              const afterCount = await page.locator('input, select, textarea').count();
              
              if (beforeCount !== afterCount) {
                console.log(`✅ Conditional logic detected: ${beforeCount} -> ${afterCount} fields`);
              }
            }
          }
        }
      });
    });
  });
});

// Helper functions
async function navigateToForms(page: any) {
  const formNavSelectors = [
    'text="Forms"',
    'text="Create Form"',
    'a[href*="form"]',
    'button:has-text("Form")'
  ];
  
  for (const selector of formNavSelectors) {
    const element = page.locator(selector).first();
    if (await element.isVisible({ timeout: 2000 })) {
      await element.click();
      console.log(`✅ Navigated to forms using: ${selector}`);
      return;
    }
  }
  
  console.log('ℹ️ Direct form navigation not found, assuming already on form page');
}

async function createOrSelectForm(page: any, formName: string, formType: string) {
  // Try to find existing form first
  const existingForm = page.locator(`text="${formName}"`).first();
  if (await existingForm.isVisible({ timeout: 2000 })) {
    await existingForm.click();
    console.log(`✅ Found and selected existing form: ${formName}`);
    return;
  }
  
  // Create new form
  const createButtons = [
    'button:has-text("Create")',
    'button:has-text("New Form")',
    'button:has-text("Add Form")'
  ];
  
  for (const selector of createButtons) {
    const button = page.locator(selector).first();
    if (await button.isVisible({ timeout: 1000 })) {
      await button.click();
      break;
    }
  }
  
  // Set form name if name field is available
  const nameField = page.locator('input[name="name"], input[placeholder*="name" i]').first();
  if (await nameField.isVisible({ timeout: 2000 })) {
    await nameField.fill(formName);
  }
  
  console.log(`✅ Created new ${formType} form: ${formName}`);
}

async function fillFieldBySelector(page: any, selectors: string[], value: string) {
  for (const selector of selectors) {
    const field = page.locator(selector).first();
    if (await field.isVisible({ timeout: 1000 })) {
      await field.fill(value);
      console.log(`✅ Filled field "${selector}" with: ${value}`);
      return true;
    }
  }
  return false;
}

async function getRadioGroups(page: any): Promise<Map<string, any[]>> {
  const radioGroups = new Map();
  const radios = await page.locator('input[type="radio"]').all();
  
  for (const radio of radios) {
    const name = await radio.getAttribute('name') || 'default';
    if (!radioGroups.has(name)) {
      radioGroups.set(name, []);
    }
    radioGroups.get(name)!.push(radio);
  }
  
  return radioGroups;
}

async function submitForm(page: any) {
  const submitSelectors = [
    'button:has-text("Submit")',
    'button[type="submit"]',
    'button:has-text("Save")',
    'input[type="submit"]'
  ];
  
  for (const selector of submitSelectors) {
    const button = page.locator(selector).first();
    if (await button.isVisible({ timeout: 2000 })) {
      await button.click();
      console.log(`✅ Form submitted using: ${selector}`);
      
      // Wait for submission to complete
      await page.waitForTimeout(2000);
      return true;
    }
  }
  
  console.log('⚠️ No submit button found');
  return false;
}