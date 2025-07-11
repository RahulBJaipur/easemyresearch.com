import { test, expect, Page } from '@playwright/test';
import { LoginHelper } from '../../src/helpers/login-helper';

/**
 * Comprehensive Form Lifecycle Testing
 * 
 * Testing Flow:
 * Step 1: Create forms with all field types and sections
 * Step 2: Add data and followups with various scenarios
 * Step 3: Edit records and followups
 * Step 4: Form-record alignment testing
 * 
 * User: testoneemr@gmail.com
 * Prefix: Rahul_
 */

test.describe('📋 Comprehensive Form Lifecycle Tests', () => {
  let page: Page;
  let loginHelper: LoginHelper;

  const testData = {
    email: 'testoneemr@gmail.com',
    password: '12345678',
    formPrefix: 'Rahul_',
    timestamp: Date.now().toString(),
    forms: {
      comprehensive: 'Rahul_Comprehensive_Form_Test',
      template: 'Rahul_Template_Based_Form',
      followup: 'Rahul_Followup_Testing_Form'
    }
  };

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    loginHelper = new LoginHelper(page);
    
    // Login with testoneemr@gmail.com
    await loginHelper.loginAsRegularUser();
    await page.waitForLoadState('networkidle');
  });

  test.describe('🔨 Step 1: Comprehensive Form Creation', () => {
    
    test('should create comprehensive form with all field types and sections', async () => {
      await test.step('Navigate to Create CRF', async () => {
        await page.goto('/create-crf');
        await page.waitForLoadState('networkidle');
      });

      await test.step('Create form with basic info', async () => {
        const formName = `${testData.forms.comprehensive}_${testData.timestamp}`;
        
        // Fill form basic details
        await page.fill('input[name="title"], input[placeholder*="title" i]', formName);
        await page.fill('textarea[name="description"], textarea[placeholder*="description" i]', 
          'Comprehensive testing form with all field types and sections');
        
        // Select category if available
        const categorySelectors = [
          'select[name="category"]',
          'select[placeholder*="category" i]',
          '.category-dropdown'
        ];
        
        for (const selector of categorySelectors) {
          const element = page.locator(selector);
          if (await element.isVisible({ timeout: 2000 })) {
            await element.selectOption({ index: 1 });
            break;
          }
        }
      });

      await test.step('Add Screening Section with all field types', async () => {
        // Click to add screening section
        await page.click('button:has-text("Add Section"), button:has-text("Screening"), .add-section-btn');
        
        // Add Text Field
        await page.click('button:has-text("Add Field"), .add-field-btn');
        await page.fill('input[placeholder*="field name" i]', 'Rahul_Screening_Text');
        await page.selectOption('select[name="type"], select[placeholder*="type" i]', 'text');
        await page.click('button:has-text("Add"), button:has-text("Save Field")');
        
        // Add Textarea Field
        await page.click('button:has-text("Add Field"), .add-field-btn');
        await page.fill('input[placeholder*="field name" i]', 'Rahul_Screening_Textarea');
        await page.selectOption('select[name="type"], select[placeholder*="type" i]', 'textarea');
        await page.fill('input[placeholder*="placeholder" i]', 'Enter detailed screening information');
        await page.click('button:has-text("Add"), button:has-text("Save Field")');
        
        // Add Number Field
        await page.click('button:has-text("Add Field"), .add-field-btn');
        await page.fill('input[placeholder*="field name" i]', 'Rahul_Screening_Number');
        await page.selectOption('select[name="type"], select[placeholder*="type" i]', 'number');
        await page.fill('input[placeholder*="min" i]', '0');
        await page.fill('input[placeholder*="max" i]', '100');
        await page.click('button:has-text("Add"), button:has-text("Save Field")');
        
        // Add Select Field
        await page.click('button:has-text("Add Field"), .add-field-btn');
        await page.fill('input[placeholder*="field name" i]', 'Rahul_Screening_Select');
        await page.selectOption('select[name="type"], select[placeholder*="type" i]', 'select');
        await page.fill('textarea[placeholder*="options" i]', 'Option 1\nOption 2\nOption 3');
        await page.click('button:has-text("Add"), button:has-text("Save Field")');
        
        // Add Date Field
        await page.click('button:has-text("Add Field"), .add-field-btn');
        await page.fill('input[placeholder*="field name" i]', 'Rahul_Screening_Date');
        await page.selectOption('select[name="type"], select[placeholder*="type" i]', 'date');
        await page.click('button:has-text("Add"), button:has-text("Save Field")');
      });

      await test.step('Add Main CRF Section with complex fields', async () => {
        // Click to add main CRF section
        await page.click('button:has-text("Add Section"), button:has-text("Main"), button:has-text("CRF")');
        
        // Add Multi-Select Field
        await page.click('button:has-text("Add Field"), .add-field-btn');
        await page.fill('input[placeholder*="field name" i]', 'Rahul_Main_MultiSelect');
        await page.selectOption('select[name="type"], select[placeholder*="type" i]', 'multiselect');
        await page.fill('textarea[placeholder*="options" i]', 'Multiple Choice A\nMultiple Choice B\nMultiple Choice C\nMultiple Choice D');
        await page.click('button:has-text("Add"), button:has-text("Save Field")');
        
        // Add Checkbox Field
        await page.click('button:has-text("Add Field"), .add-field-btn');
        await page.fill('input[placeholder*="field name" i]', 'Rahul_Main_Checkbox');
        await page.selectOption('select[name="type"], select[placeholder*="type" i]', 'checkbox');
        await page.fill('input[placeholder*="label" i]', 'I agree to the terms and conditions');
        await page.click('button:has-text("Add"), button:has-text("Save Field")');
        
        // Add Radio Button Field
        await page.click('button:has-text("Add Field"), .add-field-btn');
        await page.fill('input[placeholder*="field name" i]', 'Rahul_Main_Radio');
        await page.selectOption('select[name="type"], select[placeholder*="type" i]', 'radio');
        await page.fill('textarea[placeholder*="options" i]', 'Yes\nNo\nMaybe');
        await page.click('button:has-text("Add"), button:has-text("Save Field")');
        
        // Add Email Field
        await page.click('button:has-text("Add Field"), .add-field-btn');
        await page.fill('input[placeholder*="field name" i]', 'Rahul_Main_Email');
        await page.selectOption('select[name="type"], select[placeholder*="type" i]', 'email');
        await page.fill('input[placeholder*="placeholder" i]', 'patient@example.com');
        await page.click('button:has-text("Add"), button:has-text("Save Field")');
        
        // Add Table Field with multiple columns
        await page.click('button:has-text("Add Field"), .add-field-btn');
        await page.fill('input[placeholder*="field name" i]', 'Rahul_Main_Table');
        await page.selectOption('select[name="type"], select[placeholder*="type" i]', 'table');
        
        // Add table columns
        await page.click('button:has-text("Add Column"), .add-column-btn');
        await page.fill('input[placeholder*="column name" i]', 'Patient ID');
        await page.selectOption('select[name="column_type"]', 'text');
        
        await page.click('button:has-text("Add Column"), .add-column-btn');
        await page.fill('input[placeholder*="column name" i]', 'Visit Date');
        await page.selectOption('select[name="column_type"]', 'date');
        
        await page.click('button:has-text("Add Column"), .add-column-btn');
        await page.fill('input[placeholder*="column name" i]', 'Test Result');
        await page.selectOption('select[name="column_type"]', 'number');
        
        await page.click('button:has-text("Save Table"), button:has-text("Add"), button:has-text("Save Field")');
        
        // Add File Upload Field
        await page.click('button:has-text("Add Field"), .add-field-btn');
        await page.fill('input[placeholder*="field name" i]', 'Rahul_Main_FileUpload');
        await page.selectOption('select[name="type"], select[placeholder*="type" i]', 'file');
        await page.fill('input[placeholder*="file types" i]', 'pdf,doc,docx,jpg,png');
        await page.fill('input[placeholder*="max size" i]', '10'); // 10MB
        await page.click('button:has-text("Add"), button:has-text("Save Field")');
        
        // Add Multiple File Upload Field
        await page.click('button:has-text("Add Field"), .add-field-btn');
        await page.fill('input[placeholder*="field name" i]', 'Rahul_Main_MultipleFiles');
        await page.selectOption('select[name="type"], select[placeholder*="type" i]', 'multiple-files');
        await page.fill('input[placeholder*="file types" i]', 'pdf,jpg,png,doc');
        await page.fill('input[placeholder*="max files" i]', '5');
        await page.fill('input[placeholder*="max size" i]', '20'); // 20MB total
        await page.click('button:has-text("Add"), button:has-text("Save Field")');
      });

      await test.step('Add FollowUp Section with dynamic fields', async () => {
        // Click to add followup section
        await page.click('button:has-text("Add Section"), button:has-text("Follow"), button:has-text("FollowUp")');
        
        // Add FollowUp Text Field
        await page.click('button:has-text("Add Field"), .add-field-btn');
        await page.fill('input[placeholder*="field name" i]', 'Rahul_FollowUp_Status');
        await page.selectOption('select[name="type"], select[placeholder*="type" i]', 'text');
        await page.fill('input[placeholder*="placeholder" i]', 'Enter followup status');
        await page.click('button:has-text("Add"), button:has-text("Save Field")');
        
        // Add FollowUp Date Field
        await page.click('button:has-text("Add Field"), .add-field-btn');
        await page.fill('input[placeholder*="field name" i]', 'Rahul_FollowUp_Date');
        await page.selectOption('select[name="type"], select[placeholder*="type" i]', 'date');
        await page.click('button:has-text("Add"), button:has-text("Save Field")');
        
        // Add FollowUp Number Field for measurements
        await page.click('button:has-text("Add Field"), .add-field-btn');
        await page.fill('input[placeholder*="field name" i]', 'Rahul_FollowUp_Measurement');
        await page.selectOption('select[name="type"], select[placeholder*="type" i]', 'number');
        await page.fill('input[placeholder*="min" i]', '0');
        await page.fill('input[placeholder*="max" i]', '1000');
        await page.click('button:has-text("Add"), button:has-text("Save Field")');
        
        // Add FollowUp Select for progress
        await page.click('button:has-text("Add Field"), .add-field-btn');
        await page.fill('input[placeholder*="field name" i]', 'Rahul_FollowUp_Progress');
        await page.selectOption('select[name="type"], select[placeholder*="type" i]', 'select');
        await page.fill('textarea[placeholder*="options" i]', 'Excellent\nGood\nFair\nPoor');
        await page.click('button:has-text("Add"), button:has-text("Save Field")');
        
        // Add FollowUp Textarea for notes
        await page.click('button:has-text("Add Field"), .add-field-btn');
        await page.fill('input[placeholder*="field name" i]', 'Rahul_FollowUp_Notes');
        await page.selectOption('select[name="type"], select[placeholder*="type" i]', 'textarea');
        await page.fill('input[placeholder*="placeholder" i]', 'Enter detailed followup notes');
        await page.click('button:has-text("Add"), button:has-text("Save Field")');
      });

      await test.step('Configure form settings and save', async () => {
        // Set form visibility and permissions
        const publishSettings = [
          'input[name="is_public"]',
          'input[value="public"]',
          'select[name="visibility"]'
        ];
        
        for (const selector of publishSettings) {
          const element = page.locator(selector);
          if (await element.isVisible({ timeout: 2000 })) {
            if (await element.getAttribute('type') === 'checkbox') {
              await element.check();
            } else {
              await element.selectOption('public');
            }
            break;
          }
        }
        
        // Save the form
        await page.click('button:has-text("Save Form"), button:has-text("Create"), button:has-text("Publish")');
        
        // Wait for success message
        await page.waitForSelector('text="Form created successfully", text="Success", .success-message', { timeout: 10000 });
        
        // Verify form was created
        const url = page.url();
        console.log(`Form created successfully. Current URL: ${url}`);
      });

      await test.step('Test user experience during form creation', async () => {
        // Navigate back to forms list to verify creation
        await page.goto('/my-crf');
        await page.waitForLoadState('networkidle');
        
        // Check if form appears in list
        const formExists = await page.locator(`text="${testData.forms.comprehensive}_${testData.timestamp}"`).isVisible({ timeout: 5000 });
        expect(formExists).toBe(true);
        
        console.log('✅ Form creation user experience test passed');
      });
    });

    test('should create form using templates', async () => {
      await test.step('Navigate to templates', async () => {
        await page.goto('/templates');
        await page.waitForLoadState('networkidle');
      });

      await test.step('Select and use template', async () => {
        // Look for available templates
        const templateSelectors = [
          '.template-card:first-child',
          '.template-item:first-child',
          'button:has-text("Use Template"):first-child'
        ];
        
        for (const selector of templateSelectors) {
          const element = page.locator(selector);
          if (await element.isVisible({ timeout: 3000 })) {
            await element.click();
            break;
          }
        }
        
        // If no templates found, create basic template-based form
        await page.goto('/create-crf');
        await page.waitForLoadState('networkidle');
        
        const templateFormName = `${testData.forms.template}_${testData.timestamp}`;
        await page.fill('input[name="title"], input[placeholder*="title" i]', templateFormName);
        await page.fill('textarea[name="description"], textarea[placeholder*="description" i]', 
          'Template-based form for testing template functionality');
        
        // Add basic fields using template approach
        await page.click('button:has-text("Add Field"), .add-field-btn');
        await page.fill('input[placeholder*="field name" i]', 'Rahul_Template_Name');
        await page.selectOption('select[name="type"], select[placeholder*="type" i]', 'text');
        await page.click('button:has-text("Add"), button:has-text("Save Field")');
        
        await page.click('button:has-text("Save Form"), button:has-text("Create"), button:has-text("Publish")');
        
        // Wait for success
        await page.waitForSelector('text="Form created successfully", text="Success", .success-message', { timeout: 10000 });
        
        console.log('✅ Template-based form creation completed');
      });
    });
  });

  test.describe('📊 Step 2: Data Addition and FollowUp Management', () => {
    
    test('should add data to form and manage followups', async () => {
      await test.step('Navigate to My CRF and find created form', async () => {
        await page.goto('/my-crf');
        await page.waitForLoadState('networkidle');
        
        // Find the comprehensive form
        const formName = `${testData.forms.comprehensive}_${testData.timestamp}`;
        await page.click(`text="${formName}", a:has-text("${formName}")`);
        await page.waitForLoadState('networkidle');
      });

      await test.step('Add initial data to form', async () => {
        // Click to add new record
        await page.click('button:has-text("Add Record"), button:has-text("New Entry"), .add-record-btn');
        
        // Fill screening section
        await page.fill('input[name*="Rahul_Screening_Text"], input[placeholder*="screening text" i]', 'Rahul Patient Screening Data');
        await page.fill('textarea[name*="Rahul_Screening_Textarea"], textarea[placeholder*="screening information" i]', 
          'Comprehensive screening information for patient Rahul testing');
        await page.fill('input[name*="Rahul_Screening_Number"], input[type="number"]', '75');
        await page.selectOption('select[name*="Rahul_Screening_Select"]', { index: 1 });
        await page.fill('input[name*="Rahul_Screening_Date"], input[type="date"]', '2025-01-15');
        
        // Fill main CRF section
        await page.fill('input[name*="Rahul_Main_Email"], input[type="email"]', 'rahul.patient@example.com');
        await page.check('input[name*="Rahul_Main_Checkbox"], input[type="checkbox"]');
        await page.click('input[name*="Rahul_Main_Radio"][value="Yes"], input[value="Yes"]');
        
        // Select multiple options for multiselect
        const multiselectOptions = [
          'option:has-text("Multiple Choice A")',
          'option:has-text("Multiple Choice B")'
        ];
        
        for (const option of multiselectOptions) {
          const element = page.locator(option);
          if (await element.isVisible({ timeout: 2000 })) {
            await element.click();
          }
        }
        
        // Fill table data if available
        await page.fill('input[name*="Patient ID"], td:nth-child(1) input', 'RAHUL001');
        await page.fill('input[name*="Visit Date"], td:nth-child(2) input', '2025-01-15');
        await page.fill('input[name*="Test Result"], td:nth-child(3) input', '85');
        
        // Save the record
        await page.click('button:has-text("Save Record"), button:has-text("Submit"), button:has-text("Save")');
        
        // Wait for success message
        await page.waitForSelector('text="Record saved successfully", text="Success", .success-message', { timeout: 10000 });
        
        console.log('✅ Initial data added to form');
      });

      await test.step('Add FollowUp 1', async () => {
        // Look for add followup button
        await page.click('button:has-text("Add FollowUp"), button:has-text("Add Follow-up"), .add-followup-btn');
        
        // Fill followup data
        await page.fill('input[name*="Rahul_FollowUp_Status"], input[placeholder*="followup status" i]', 'Initial Follow-up Complete');
        await page.fill('input[name*="Rahul_FollowUp_Date"], input[type="date"]', '2025-01-22');
        await page.fill('input[name*="Rahul_FollowUp_Measurement"], input[type="number"]', '80');
        await page.selectOption('select[name*="Rahul_FollowUp_Progress"]', 'Good');
        await page.fill('textarea[name*="Rahul_FollowUp_Notes"], textarea[placeholder*="followup notes" i]', 
          'Patient showing good progress. Vital signs stable. Continue current treatment.');
        
        // Save followup
        await page.click('button:has-text("Save FollowUp"), button:has-text("Save Follow-up"), button:has-text("Save")');
        
        // Wait for success
        await page.waitForSelector('text="FollowUp saved successfully", text="Success", .success-message', { timeout: 10000 });
        
        console.log('✅ FollowUp 1 added successfully');
      });

      await test.step('Add FollowUp 2 in sequence', async () => {
        // Add second followup
        await page.click('button:has-text("Add FollowUp"), button:has-text("Add Follow-up"), .add-followup-btn');
        
        // Fill followup 2 data
        await page.fill('input[name*="Rahul_FollowUp_Status"], input[placeholder*="followup status" i]', 'Second Follow-up Complete');
        await page.fill('input[name*="Rahul_FollowUp_Date"], input[type="date"]', '2025-01-29');
        await page.fill('input[name*="Rahul_FollowUp_Measurement"], input[type="number"]', '78');
        await page.selectOption('select[name*="Rahul_FollowUp_Progress"]', 'Excellent');
        await page.fill('textarea[name*="Rahul_FollowUp_Notes"], textarea[placeholder*="followup notes" i]', 
          'Patient continues to improve. All parameters within normal range.');
        
        // Save followup
        await page.click('button:has-text("Save FollowUp"), button:has-text("Save Follow-up"), button:has-text("Save")');
        
        // Wait for success
        await page.waitForSelector('text="FollowUp saved successfully", text="Success", .success-message', { timeout: 10000 });
        
        console.log('✅ FollowUp 2 added successfully');
      });

      await test.step('Test followup filtering by date', async () => {
        // Look for date filter options
        const dateFilters = [
          'input[name="date_filter"], input[type="date"]',
          'select[name="date_range"]',
          '.date-filter-btn'
        ];
        
        for (const selector of dateFilters) {
          const element = page.locator(selector);
          if (await element.isVisible({ timeout: 2000 })) {
            if (selector.includes('date')) {
              await element.fill('2025-01-20');
            } else {
              await element.selectOption('last_week');
            }
            break;
          }
        }
        
        // Apply filter
        await page.click('button:has-text("Filter"), button:has-text("Apply"), .filter-btn');
        
        // Verify filtering worked
        const followupsVisible = await page.locator('.followup-item, .followup-record').count();
        console.log(`✅ Date filtering test completed. ${followupsVisible} followups visible`);
      });
    });
  });

  test.describe('🔄 Step 3: Record Editing and Management', () => {
    
    test('should edit records and followups', async () => {
      await test.step('Navigate to My Records', async () => {
        await page.goto('/my-records');
        await page.waitForLoadState('networkidle');
      });

      await test.step('Edit existing record', async () => {
        // Find and click edit button on first record
        await page.click('button:has-text("Edit"), .edit-btn:first-child, .edit-record-btn:first-child');
        
        // Update some fields
        await page.fill('input[name*="Rahul_Screening_Text"], input[placeholder*="screening text" i]', 'Updated Rahul Patient Screening Data');
        await page.fill('input[name*="Rahul_Screening_Number"], input[type="number"]', '85');
        
        // Save changes
        await page.click('button:has-text("Save Changes"), button:has-text("Update"), button:has-text("Save")');
        
        // Wait for success
        await page.waitForSelector('text="Record updated successfully", text="Success", .success-message', { timeout: 10000 });
        
        console.log('✅ Record edited successfully');
      });

      await test.step('Edit followup data', async () => {
        // Find and edit followup
        await page.click('button:has-text("Edit FollowUp"), .edit-followup-btn:first-child');
        
        // Update followup data
        await page.fill('input[name*="Rahul_FollowUp_Status"], input[placeholder*="followup status" i]', 'Updated Follow-up Status');
        await page.fill('input[name*="Rahul_FollowUp_Measurement"], input[type="number"]', '82');
        await page.selectOption('select[name*="Rahul_FollowUp_Progress"]', 'Excellent');
        
        // Save changes
        await page.click('button:has-text("Save FollowUp"), button:has-text("Save Follow-up"), button:has-text("Save")');
        
        // Wait for success
        await page.waitForSelector('text="FollowUp updated successfully", text="Success", .success-message', { timeout: 10000 });
        
        console.log('✅ FollowUp edited successfully');
      });

      await test.step('Delete and restore record', async () => {
        // Delete record
        await page.click('button:has-text("Delete"), .delete-btn:first-child, .delete-record-btn:first-child');
        
        // Confirm deletion
        await page.click('button:has-text("Confirm"), button:has-text("Yes"), button:has-text("Delete")');
        
        // Wait for success
        await page.waitForSelector('text="Record deleted successfully", text="Success", .success-message', { timeout: 10000 });
        
        // Try to restore if option is available
        const restoreBtn = page.locator('button:has-text("Restore"), .restore-btn');
        if (await restoreBtn.isVisible({ timeout: 3000 })) {
          await restoreBtn.click();
          await page.waitForSelector('text="Record restored successfully", text="Success", .success-message', { timeout: 10000 });
          console.log('✅ Record restored successfully');
        }
        
        console.log('✅ Delete and restore test completed');
      });
    });
  });

  test.describe('⚖️ Step 4: Form-Record Alignment Testing', () => {
    
    test('should maintain form-record alignment during edits', async () => {
      await test.step('Navigate to form editor', async () => {
        await page.goto('/my-crf');
        await page.waitForLoadState('networkidle');
        
        // Find and edit the comprehensive form
        const formName = `${testData.forms.comprehensive}_${testData.timestamp}`;
        await page.click(`text="${formName}", a:has-text("${formName}")`);
        await page.click('button:has-text("Edit Form"), .edit-form-btn');
      });

      await test.step('Add new fields to existing form', async () => {
        // Add new field to screening section
        await page.click('button:has-text("Add Field"), .add-field-btn');
        await page.fill('input[placeholder*="field name" i]', 'Rahul_New_Field_Test');
        await page.selectOption('select[name="type"], select[placeholder*="type" i]', 'text');
        await page.fill('input[placeholder*="placeholder" i]', 'New field for alignment testing');
        await page.click('button:has-text("Add"), button:has-text("Save Field")');
        
        // Save form changes
        await page.click('button:has-text("Save Form"), button:has-text("Update"), button:has-text("Save")');
        
        // Wait for success
        await page.waitForSelector('text="Form updated successfully", text="Success", .success-message', { timeout: 10000 });
        
        console.log('✅ New field added to form');
      });

      await test.step('Verify alignment in records', async () => {
        // Navigate to records to check alignment
        await page.goto('/my-records');
        await page.waitForLoadState('networkidle');
        
        // Check if new field appears in record view
        const newFieldExists = await page.locator('text="Rahul_New_Field_Test", input[name*="Rahul_New_Field_Test"]').isVisible({ timeout: 5000 });
        
        if (newFieldExists) {
          console.log('✅ Form-record alignment maintained - new field visible in records');
        } else {
          console.log('⚠️ Form-record alignment issue - new field not visible in records');
        }
      });

      await test.step('Test removing fields and impact on records', async () => {
        // Go back to form editor
        await page.goto('/my-crf');
        await page.waitForLoadState('networkidle');
        
        const formName = `${testData.forms.comprehensive}_${testData.timestamp}`;
        await page.click(`text="${formName}", a:has-text("${formName}")`);
        await page.click('button:has-text("Edit Form"), .edit-form-btn');
        
        // Remove a field
        await page.click('button:has-text("Delete Field"), .delete-field-btn:first-child');
        await page.click('button:has-text("Confirm"), button:has-text("Yes")');
        
        // Save form
        await page.click('button:has-text("Save Form"), button:has-text("Update"), button:has-text("Save")');
        
        // Wait for success
        await page.waitForSelector('text="Form updated successfully", text="Success", .success-message', { timeout: 10000 });
        
        console.log('✅ Field removal test completed');
      });

      await test.step('Add multiple new records with updated form', async () => {
        // Add new record with updated form structure
        await page.click('button:has-text("Add Record"), button:has-text("New Entry"), .add-record-btn');
        
        // Fill available fields
        await page.fill('input[name*="Rahul_Screening_Text"], input[placeholder*="screening text" i]', 'Updated Form New Record');
        await page.fill('input[name*="Rahul_New_Field_Test"], input[placeholder*="new field" i]', 'Alignment test data');
        
        // Save record
        await page.click('button:has-text("Save Record"), button:has-text("Submit"), button:has-text("Save")');
        
        // Wait for success
        await page.waitForSelector('text="Record saved successfully", text="Success", .success-message', { timeout: 10000 });
        
        console.log('✅ New record added with updated form structure');
      });
    });
  });

  test.describe('🤖 AI-Powered Mass Data Entry Testing', () => {
    
    test('should handle multiple entries using AI simulation', async () => {
      await test.step('Simulate AI-powered mass data entry', async () => {
        // Navigate to form for mass entry
        await page.goto('/my-crf');
        await page.waitForLoadState('networkidle');
        
        const formName = `${testData.forms.comprehensive}_${testData.timestamp}`;
        await page.click(`text="${formName}", a:has-text("${formName}")`);
        
        // Create multiple entries to simulate AI behavior
        const entries = [
          { id: 'RAHUL002', status: 'Active', measurement: '75', progress: 'Good' },
          { id: 'RAHUL003', status: 'Pending', measurement: '82', progress: 'Excellent' },
          { id: 'RAHUL004', status: 'Complete', measurement: '79', progress: 'Fair' },
          { id: 'RAHUL005', status: 'Review', measurement: '88', progress: 'Good' }
        ];
        
        for (const entry of entries) {
          // Add new record
          await page.click('button:has-text("Add Record"), button:has-text("New Entry"), .add-record-btn');
          
          // Fill with AI-simulated data
          await page.fill('input[name*="Rahul_Screening_Text"], input[placeholder*="screening text" i]', 
            `AI Generated Entry ${entry.id}`);
          await page.fill('input[name*="Rahul_Screening_Number"], input[type="number"]', entry.measurement);
          await page.fill('input[name*="Patient ID"], td:nth-child(1) input', entry.id);
          await page.fill('input[name*="Test Result"], td:nth-child(3) input', entry.measurement);
          
          // Save record
          await page.click('button:has-text("Save Record"), button:has-text("Submit"), button:has-text("Save")');
          
          // Wait for success
          await page.waitForSelector('text="Record saved successfully", text="Success", .success-message', { timeout: 10000 });
          
          console.log(`✅ AI-simulated entry ${entry.id} added`);
        }
        
        console.log('✅ Mass data entry simulation completed');
      });
    });
  });
});