import { test, expect } from '@playwright/test';
import { LoginHelper } from '../../../src/helpers/login-helper';

/**
 * Create CRF Module - Comprehensive Test Suite
 * 
 * Covers:
 * - 9 Field Types: Text, Textarea, Select, Multi-Select, Checkbox, Radio, Number, Date, Email
 * - 3 Form Sections: Screening Form, Main Form, Follow-up Form
 * - Template/Manual Creation
 * - Form Builder Features
 * - Data Validation Rules
 * - Conditional Logic
 * - Publishing/Sharing Options
 */

const testData = {
  forms: {
    screeningForm: {
      title: 'Rahul_Screening_Form_Patient_Eligibility',
      description: 'Comprehensive screening form for patient eligibility assessment',
      fields: [
        { type: 'text', label: 'Rahul_Patient_ID', required: true },
        { type: 'radio', label: 'Rahul_Eligible_Status', options: ['Eligible', 'Not Eligible', 'Pending Review'] },
        { type: 'checkbox', label: 'Rahul_Inclusion_Criteria', options: ['Age 18-65', 'No Prior Treatment', 'Consent Given'] },
        { type: 'select', label: 'Rahul_Study_Site', options: ['Site A', 'Site B', 'Site C'] },
        { type: 'date', label: 'Rahul_Screening_Date', required: true }
      ]
    },
    mainForm: {
      title: 'Rahul_Main_Form_Clinical_Assessment',
      description: 'Main clinical research form for comprehensive patient assessment',
      fields: [
        { type: 'text', label: 'Rahul_Patient_Name', required: true },
        { type: 'number', label: 'Rahul_Age', min: 18, max: 100, required: true },
        { type: 'email', label: 'Rahul_Contact_Email', required: true },
        { type: 'textarea', label: 'Rahul_Medical_History', maxLength: 500 },
        { type: 'multiselect', label: 'Rahul_Comorbidities', options: ['Diabetes', 'Hypertension', 'Heart Disease', 'None'] },
        { type: 'radio', label: 'Rahul_Treatment_Group', options: ['Group A', 'Group B', 'Control'] },
        { type: 'date', label: 'Rahul_Assessment_Date', required: true }
      ]
    },
    followupForm: {
      title: 'Rahul_FollowUp_Form_Monitoring',
      description: 'Follow-up form for ongoing patient monitoring and assessment',
      fields: [
        { type: 'text', label: 'Rahul_FollowUp_ID', required: true },
        { type: 'select', label: 'Rahul_Visit_Type', options: ['Week 1', 'Week 4', 'Week 12', 'Final Visit'] },
        { type: 'checkbox', label: 'Rahul_Adverse_Events', options: ['Nausea', 'Headache', 'Fatigue', 'None'] },
        { type: 'textarea', label: 'Rahul_Physician_Notes', maxLength: 1000 },
        { type: 'radio', label: 'Rahul_Overall_Status', options: ['Improving', 'Stable', 'Declining'] }
      ]
    }
  },
  validation: {
    invalidText: '',
    invalidEmail: 'not-an-email',
    invalidNumber: 'abc',
    tooLongText: 'a'.repeat(1001)
  }
};

test.describe('Create CRF Module - Comprehensive Testing', () => {
  let loginHelper: LoginHelper;

  test.beforeEach(async ({ page }) => {
    loginHelper = new LoginHelper(page);
    await loginHelper.loginAsRegularUser();
    
    // Navigate to Create CRF page
    await page.click('text="Create CRF", a[href*="create"], .create-crf-button');
    await page.waitForLoadState('networkidle');
  });

  test.describe('📝 Form Creation Options', () => {
    test('should provide template and manual creation options @functional @form-creation', async ({ page }) => {
      console.log('🧪 Testing form creation options...');
      
      await test.step('Verify creation options available', async () => {
        const creationOptions = [
          'text="Create from Template"',
          'text="Create Manually"',
          'text="Use Template"',
          '.template-option',
          '.manual-option'
        ];
        
        let optionFound = false;
        for (const option of creationOptions) {
          if (await page.locator(option).isVisible({ timeout: 3000 })) {
            optionFound = true;
            console.log(`✅ Creation option found: ${option}`);
            break;
          }
        }
        expect(optionFound).toBeTruthy();
      });

      await test.step('Test template selection if available', async () => {
        const templateButton = page.locator('text="Create from Template", text="Use Template"').first();
        if (await templateButton.isVisible({ timeout: 2000 })) {
          await templateButton.click();
          
          const templateList = await page.locator('.template-list, .template-card, option').count();
          console.log(`📊 Available templates: ${templateList}`);
          
          if (templateList > 0) {
            const firstTemplate = page.locator('.template-list .template-card, select option').first();
            if (await firstTemplate.isVisible({ timeout: 1000 })) {
              await firstTemplate.click();
              console.log('✅ Template selection working');
            }
          }
        }
      });

      await test.step('Test manual creation option', async () => {
        const manualButton = page.locator('text="Create Manually", text="Manual Creation"').first();
        if (manualButton && await manualButton.isVisible({ timeout: 2000 })) {
          await manualButton.click();
          console.log('✅ Manual creation option working');
        }
      });
    });

    test('should display form type selection @functional @form-types', async ({ page }) => {
      console.log('🧪 Testing form type selection...');
      
      await test.step('Verify form type options', async () => {
        const formTypes = [
          'text="Screening Form"',
          'text="Main Form"',
          'text="Follow-up Form"',
          'text="Follow up Form"',
          '.form-type-selector',
          'input[value="screening"]',
          'input[value="main"]',
          'input[value="followup"]'
        ];
        
        let typeFound = false;
        for (const type of formTypes) {
          if (await page.locator(type).isVisible({ timeout: 3000 })) {
            typeFound = true;
            console.log(`✅ Form type found: ${type}`);
            break;
          }
        }
        expect(typeFound).toBeTruthy();
      });
    });
  });

  test.describe('🎯 Screening Form Creation', () => {
    test('should create screening form with all field types @functional @screening-form', async ({ page }) => {
      console.log('🧪 Testing screening form creation...');
      
      await test.step('Start screening form creation', async () => {
        // Select screening form type
        const screeningOption = page.locator('text="Screening Form", input[value="screening"]').first();
        if (screeningOption && await screeningOption.isVisible({ timeout: 2000 })) {
          await screeningOption.click();
        }
        
        // Or click manual creation if no types shown
        await page.click('text="Create Manually", text="Create Form", button[type="submit"]');
      });

      await test.step('Fill form basic information', async () => {
        await page.fill('input[name="title"], input[placeholder*="title" i]', testData.forms.screeningForm.title);
        await page.fill('textarea[name="description"], textarea[placeholder*="description" i]', testData.forms.screeningForm.description);
      });

      await test.step('Add text field for Patient ID', async () => {
        await page.click('button:has-text("Add Field"), .add-field-button');
        
        // Select text field type
        await page.click('text="Text", option[value="text"]');
        await page.fill('input[name="fieldLabel"], input[placeholder*="label" i]', testData.forms.screeningForm.fields[0].label);
        
        // Mark as required
        const requiredCheckbox = page.locator('input[type="checkbox"][name="required"], text="Required"');
        if (await requiredCheckbox.isVisible({ timeout: 2000 })) {
          await requiredCheckbox.check();
        }
        
        await page.click('button:has-text("Save Field"), button:has-text("Add")');
      });

      await test.step('Add radio field for Eligible Status', async () => {
        await page.click('button:has-text("Add Field"), .add-field-button');
        
        await page.click('text="Radio", option[value="radio"]');
        await page.fill('input[name="fieldLabel"]', testData.forms.screeningForm.fields[1].label);
        
        // Add radio options
        for (const option of testData.forms.screeningForm.fields[1].options) {
          await page.fill('input[name="option"], input[placeholder*="option" i]', option);
          await page.click('button:has-text("Add Option"), .add-option-button');
        }
        
        await page.click('button:has-text("Save Field")');
      });

      await test.step('Add checkbox field for Inclusion Criteria', async () => {
        await page.click('button:has-text("Add Field")');
        
        await page.click('text="Checkbox", option[value="checkbox"]');
        await page.fill('input[name="fieldLabel"]', testData.forms.screeningForm.fields[2].label);
        
        // Add checkbox options
        for (const option of testData.forms.screeningForm.fields[2].options) {
          await page.fill('input[name="option"]', option);
          await page.click('button:has-text("Add Option")');
        }
        
        await page.click('button:has-text("Save Field")');
      });

      await test.step('Add select dropdown for Study Site', async () => {
        await page.click('button:has-text("Add Field")');
        
        await page.click('text="Select", text="Dropdown", option[value="select"]');
        await page.fill('input[name="fieldLabel"]', testData.forms.screeningForm.fields[3].label);
        
        // Add dropdown options
        for (const option of testData.forms.screeningForm.fields[3].options) {
          await page.fill('input[name="option"]', option);
          await page.click('button:has-text("Add Option")');
        }
        
        await page.click('button:has-text("Save Field")');
      });

      await test.step('Add date field for Screening Date', async () => {
        await page.click('button:has-text("Add Field")');
        
        await page.click('text="Date", option[value="date"]');
        await page.fill('input[name="fieldLabel"]', testData.forms.screeningForm.fields[4].label);
        
        const requiredCheckbox = page.locator('input[type="checkbox"][name="required"]');
        if (await requiredCheckbox.isVisible({ timeout: 2000 })) {
          await requiredCheckbox.check();
        }
        
        await page.click('button:has-text("Save Field")');
      });

      await test.step('Save and verify screening form', async () => {
        await page.click('button:has-text("Save Form"), button:has-text("Create Form")');
        
        // Wait for success message or redirect
        const successIndicators = [
          'text="Form created successfully"',
          'text="Form saved"',
          'text="Success"',
          'text="Created"'
        ];
        
        let successFound = false;
        for (const indicator of successIndicators) {
          if (await page.locator(indicator).isVisible({ timeout: 5000 })) {
            successFound = true;
            console.log(`✅ Screening form created: ${indicator}`);
            break;
          }
        }
        expect(successFound).toBeTruthy();
      });
    });

    test('should validate required fields in screening form @functional @validation', async ({ page }) => {
      console.log('🧪 Testing screening form validation...');
      
      await test.step('Attempt to save form without required fields', async () => {
        // Try to save empty form
        await page.click('button:has-text("Save Form"), button:has-text("Create Form")');
        
        // Check for validation errors
        const validationErrors = [
          'text="Title is required"',
          'text="Form title required"',
          'text="Please enter"',
          '.error-message',
          '.field-error'
        ];
        
        let errorFound = false;
        for (const error of validationErrors) {
          if (await page.locator(error).isVisible({ timeout: 3000 })) {
            errorFound = true;
            console.log(`✅ Validation error found: ${error}`);
            break;
          }
        }
        expect(errorFound).toBeTruthy();
      });
    });
  });

  test.describe('🏥 Main Form Creation', () => {
    test('should create comprehensive main form @functional @main-form', async ({ page }) => {
      console.log('🧪 Testing main form creation...');
      
      await test.step('Start main form creation', async () => {
        const mainFormOption = page.locator('text="Main Form", input[value="main"]').first();
        if (mainFormOption && await mainFormOption.isVisible({ timeout: 2000 })) {
          await mainFormOption.click();
        }
        
        await page.click('text="Create Manually", button[type="submit"]');
      });

      await test.step('Fill main form information', async () => {
        await page.fill('input[name="title"]', testData.forms.mainForm.title);
        await page.fill('textarea[name="description"]', testData.forms.mainForm.description);
      });

      await test.step('Add patient name text field', async () => {
        await page.click('button:has-text("Add Field")');
        await page.click('text="Text", option[value="text"]');
        await page.fill('input[name="fieldLabel"]', testData.forms.mainForm.fields[0].label);
        await page.check('input[name="required"]');
        await page.click('button:has-text("Save Field")');
      });

      await test.step('Add age number field with validation', async () => {
        await page.click('button:has-text("Add Field")');
        await page.click('text="Number", option[value="number"]');
        await page.fill('input[name="fieldLabel"]', testData.forms.mainForm.fields[1].label);
        
        // Set min/max values
        await page.fill('input[name="min"], input[placeholder*="min" i]', '18');
        await page.fill('input[name="max"], input[placeholder*="max" i]', '100');
        await page.check('input[name="required"]');
        await page.click('button:has-text("Save Field")');
      });

      await test.step('Add email field', async () => {
        await page.click('button:has-text("Add Field")');
        await page.click('text="Email", option[value="email"]');
        await page.fill('input[name="fieldLabel"]', testData.forms.mainForm.fields[2].label);
        await page.check('input[name="required"]');
        await page.click('button:has-text("Save Field")');
      });

      await test.step('Add textarea field for medical history', async () => {
        await page.click('button:has-text("Add Field")');
        await page.click('text="Textarea", text="Text Area", option[value="textarea"]');
        await page.fill('input[name="fieldLabel"]', testData.forms.mainForm.fields[3].label);
        await page.fill('input[name="maxLength"], input[placeholder*="max" i]', '500');
        await page.click('button:has-text("Save Field")');
      });

      await test.step('Add multi-select field for comorbidities', async () => {
        await page.click('button:has-text("Add Field")');
        await page.click('text="Multi Select", text="Multiple Select", option[value="multiselect"]');
        await page.fill('input[name="fieldLabel"]', testData.forms.mainForm.fields[4].label);
        
        for (const option of testData.forms.mainForm.fields[4].options) {
          await page.fill('input[name="option"]', option);
          await page.click('button:has-text("Add Option")');
        }
        
        await page.click('button:has-text("Save Field")');
      });

      await test.step('Save main form', async () => {
        await page.click('button:has-text("Save Form")');
        
        const successMessage = page.locator('text="Form created", text="Success", text="Saved"');
        await expect(successMessage).toBeVisible({ timeout: 5000 });
        console.log('✅ Main form created successfully');
      });
    });

    test('should test field validation rules @functional @field-validation', async ({ page }) => {
      console.log('🧪 Testing field validation rules...');
      
      await test.step('Create form with validation rules', async () => {
        await page.fill('input[name="title"]', 'Rahul_Validation_Test_Form');
        
        // Add email field with validation
        await page.click('button:has-text("Add Field")');
        await page.click('text="Email", option[value="email"]');
        await page.fill('input[name="fieldLabel"]', 'Rahul_Test_Email_Field');
        await page.check('input[name="required"]');
        await page.click('button:has-text("Save Field")');
        
        await page.click('button:has-text("Save Form")');
      });

      await test.step('Preview form and test validation', async () => {
        const previewButton = page.locator('button:has-text("Preview"), .preview-button');
        if (await previewButton.isVisible({ timeout: 3000 })) {
          await previewButton.click();
          
          // Fill invalid email
          await page.fill('input[type="email"]', testData.validation.invalidEmail);
          await page.click('button:has-text("Submit"), button[type="submit"]');
          
          // Check for email validation error
          const emailError = page.locator('text="Invalid email", text="Please enter a valid email"');
          await expect(emailError).toBeVisible({ timeout: 3000 });
          console.log('✅ Email validation working');
        }
      });
    });
  });

  test.describe('📊 Follow-up Form Creation', () => {
    test('should create follow-up form with conditional logic @functional @followup-form', async ({ page }) => {
      console.log('🧪 Testing follow-up form creation...');
      
      await test.step('Start follow-up form creation', async () => {
        const followupOption = page.locator('text="Follow-up Form", text="Follow up", input[value="followup"]').first();
        if (followupOption && await followupOption.isVisible({ timeout: 2000 })) {
          await followupOption.click();
        }
        
        await page.click('text="Create Manually", button[type="submit"]');
      });

      await test.step('Create follow-up form structure', async () => {
        await page.fill('input[name="title"]', testData.forms.followupForm.title);
        await page.fill('textarea[name="description"]', testData.forms.followupForm.description);
        
        // Add follow-up ID field
        await page.click('button:has-text("Add Field")');
        await page.click('text="Text", option[value="text"]');
        await page.fill('input[name="fieldLabel"]', testData.forms.followupForm.fields[0].label);
        await page.check('input[name="required"]');
        await page.click('button:has-text("Save Field")');
        
        // Add visit type dropdown
        await page.click('button:has-text("Add Field")');
        await page.click('text="Select", option[value="select"]');
        await page.fill('input[name="fieldLabel"]', testData.forms.followupForm.fields[1].label);
        
        for (const option of testData.forms.followupForm.fields[1].options) {
          await page.fill('input[name="option"]', option);
          await page.click('button:has-text("Add Option")');
        }
        
        await page.click('button:has-text("Save Field")');
      });

      await test.step('Add conditional adverse events field', async () => {
        await page.click('button:has-text("Add Field")');
        await page.click('text="Checkbox", option[value="checkbox"]');
        await page.fill('input[name="fieldLabel"]', testData.forms.followupForm.fields[2].label);
        
        for (const option of testData.forms.followupForm.fields[2].options) {
          await page.fill('input[name="option"]', option);
          await page.click('button:has-text("Add Option")');
        }
        
        // Add conditional logic if available
        const conditionalButton = page.locator('button:has-text("Add Condition"), .conditional-logic');
        if (conditionalButton && await conditionalButton.isVisible({ timeout: 2000 })) {
          await conditionalButton.click();
          console.log('✅ Conditional logic option available');
        }
        
        await page.click('button:has-text("Save Field")');
      });

      await test.step('Save follow-up form', async () => {
        await page.click('button:has-text("Save Form")');
        
        const success = page.locator('text="created", text="saved", text="Success"');
        await expect(success).toBeVisible({ timeout: 5000 });
        console.log('✅ Follow-up form created successfully');
      });
    });

    test('should test form scheduling features @functional @scheduling', async ({ page }) => {
      console.log('🧪 Testing form scheduling features...');
      
      await test.step('Check for scheduling options', async () => {
        const schedulingOptions = [
          'text="Schedule Follow-up"',
          'text="Set Reminder"',
          'text="Auto-schedule"',
          '.scheduling-section',
          'input[type="date"][name*="schedule"]'
        ];
        
        let schedulingFound = false;
        for (const option of schedulingOptions) {
          if (await page.locator(option).isVisible({ timeout: 3000 })) {
            schedulingFound = true;
            console.log(`✅ Scheduling option found: ${option}`);
            break;
          }
        }
        // Note: Scheduling might be in a different section
        console.log(`📊 Scheduling features: ${schedulingFound ? 'Available' : 'Not found in current view'}`);
      });
    });
  });

  test.describe('🔧 Advanced Form Features', () => {
    test('should test form builder drag and drop @functional @form-builder', async ({ page }) => {
      console.log('🧪 Testing form builder features...');
      
      await test.step('Check for drag and drop functionality', async () => {
        const dragDropElements = [
          '.field-palette',
          '.draggable-field',
          '.drop-zone',
          '[draggable="true"]'
        ];
        
        let dragDropFound = false;
        for (const element of dragDropElements) {
          if (await page.locator(element).isVisible({ timeout: 3000 })) {
            dragDropFound = true;
            console.log(`✅ Drag and drop element found: ${element}`);
            break;
          }
        }
        console.log(`📊 Drag and drop: ${dragDropFound ? 'Available' : 'Not available'}`);
      });

      await test.step('Test field reordering if available', async () => {
        const reorderButtons = page.locator('button:has-text("Move Up"), button:has-text("Move Down"), .reorder-button');
        const fieldCount = await reorderButtons.count();
        
        if (fieldCount > 0) {
          const firstButton = reorderButtons.first();
          if (firstButton && await firstButton.isVisible({ timeout: 1000 })) {
            await firstButton.click();
            console.log('✅ Field reordering working');
          }
        } else {
          console.log('📊 Field reordering: Not available in current view');
        }
      });
    });

    test('should test form preview functionality @functional @preview', async ({ page }) => {
      console.log('🧪 Testing form preview functionality...');
      
      await test.step('Create simple form for preview testing', async () => {
        await page.fill('input[name="title"]', 'Rahul_Preview_Test_Form');
        
        await page.click('button:has-text("Add Field")');
        await page.click('text="Text", option[value="text"]');
        await page.fill('input[name="fieldLabel"]', 'Rahul_Test_Field');
        await page.click('button:has-text("Save Field")');
      });

      await test.step('Test preview functionality', async () => {
        const previewButton = page.locator('button:has-text("Preview"), .preview-button, a[href*="preview"]');
        
        if (await previewButton.isVisible({ timeout: 3000 })) {
          await previewButton.click();
          
          // Verify preview shows form elements
          const formElements = [
            'input[name*="Rahul_Test_Field"]',
            'text="Rahul_Test_Field"',
            'form',
            '.form-preview'
          ];
          
          let previewWorking = false;
          for (const element of formElements) {
            if (await page.locator(element).isVisible({ timeout: 3000 })) {
              previewWorking = true;
              console.log(`✅ Preview element found: ${element}`);
              break;
            }
          }
          expect(previewWorking).toBeTruthy();
        } else {
          console.log('📊 Preview functionality: Not available in current view');
        }
      });
    });

    test('should test form publishing options @functional @publishing', async ({ page }) => {
      console.log('🧪 Testing form publishing options...');
      
      await test.step('Create form for publishing', async () => {
        await page.fill('input[name="title"]', 'Rahul_Publishing_Test_Form');
        
        await page.click('button:has-text("Add Field")');
        await page.click('text="Text", option[value="text"]');
        await page.fill('input[name="fieldLabel"]', 'Rahul_Sample_Field');
        await page.click('button:has-text("Save Field")');
        
        await page.click('button:has-text("Save Form")');
      });

      await test.step('Check publishing options', async () => {
        const publishingOptions = [
          'button:has-text("Publish")',
          'button:has-text("Share")',
          'text="Make Public"',
          'text="Generate Link"',
          '.publish-button',
          '.sharing-options'
        ];
        
        let publishingFound = false;
        for (const option of publishingOptions) {
          if (await page.locator(option).isVisible({ timeout: 3000 })) {
            publishingFound = true;
            console.log(`✅ Publishing option found: ${option}`);
            
            // Try clicking the option
            await page.click(option);
            await page.waitForTimeout(1000);
            break;
          }
        }
        console.log(`📊 Publishing features: ${publishingFound ? 'Available' : 'Not found'}`);
      });
    });
  });

  test.describe('⚡ Non-Functional Testing', () => {
    test('should test form creation performance @nonfunctional @performance', async ({ page }) => {
      console.log('🧪 Testing form creation performance...');
      
      await test.step('Measure form creation time', async () => {
        const startTime = Date.now();
        
        await page.fill('input[name="title"]', 'Rahul_Performance_Test_Form');
        
        // Add 5 fields quickly
        for (let i = 0; i < 5; i++) {
          await page.click('button:has-text("Add Field")');
          await page.click('text="Text", option[value="text"]');
          await page.fill('input[name="fieldLabel"]', `Rahul_Field_${i}`);
          await page.click('button:has-text("Save Field")');
        }
        
        await page.click('button:has-text("Save Form")');
        
        const endTime = Date.now();
        const creationTime = endTime - startTime;
        
        console.log(`📊 Form creation time: ${creationTime}ms`);
        expect(creationTime).toBeLessThan(30000); // Should complete within 30 seconds
      });
    });

    test('should test form responsiveness @nonfunctional @responsive', async ({ page }) => {
      console.log('🧪 Testing form creation responsiveness...');
      
      await test.step('Test different screen sizes', async () => {
        const viewports = [
          { name: 'Mobile', width: 375, height: 667 },
          { name: 'Tablet', width: 768, height: 1024 },
          { name: 'Desktop', width: 1920, height: 1080 }
        ];
        
        for (const viewport of viewports) {
          await page.setViewportSize({ width: viewport.width, height: viewport.height });
          await page.waitForTimeout(1000);
          
          const formVisible = await page.locator('.form-builder, form, .create-form').isVisible();
          console.log(`📱 ${viewport.name} (${viewport.width}x${viewport.height}): ${formVisible ? '✅' : '❌'}`);
        }
      });
    });

    test('should test form field limit handling @nonfunctional @scalability', async ({ page }) => {
      console.log('🧪 Testing form field limits...');
      
      await test.step('Test adding many fields', async () => {
        await page.fill('input[name="title"]', 'Rahul_Scalability_Test_Form');
        
        let fieldsAdded = 0;
        const maxFields = 50; // Test reasonable limit
        
        for (let i = 0; i < maxFields; i++) {
          try {
            await page.click('button:has-text("Add Field")', { timeout: 2000 });
            await page.click('text="Text", option[value="text"]', { timeout: 2000 });
            await page.fill('input[name="fieldLabel"]', `Rahul_Scalability_Field_${i}`, { timeout: 2000 });
            await page.click('button:has-text("Save Field")', { timeout: 2000 });
            fieldsAdded++;
          } catch (error) {
            console.log(`⚠️ Field limit reached at ${fieldsAdded} fields`);
            break;
          }
        }
        
        console.log(`📊 Successfully added ${fieldsAdded} fields`);
        expect(fieldsAdded).toBeGreaterThan(10); // Should support at least 10 fields
      });
    });
  });
});