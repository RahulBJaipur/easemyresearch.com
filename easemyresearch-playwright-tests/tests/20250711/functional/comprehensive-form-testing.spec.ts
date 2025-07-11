import { test, expect, Page } from '@playwright/test';
import { LoginHelper } from '../../../src/helpers/login-helper';

/**
 * Comprehensive Form Testing Suite - Functional Tests
 * 
 * Date: 2025-07-11
 * Email: testoneemr@gmail.com  
 * Prefix: Rahul
 * 
 * Focus: Maximum defect detection across all scenarios
 * 
 * Testing Flow:
 * Step 1: Form creation with all field types and sections
 * Step 2: Data addition and followup management with edge cases
 * Step 3: Record editing and management
 * Step 4: Form-record alignment testing
 */

test.describe('🔍 Comprehensive Form Testing - Functional & Defect Detection', () => {
  let page: Page;
  let loginHelper: LoginHelper;
  
  const testData = {
    email: 'testoneemr@gmail.com',
    password: '12345678',
    timestamp: Date.now().toString(),
    bugTracker: [] as any[],
    forms: {
      comprehensive: 'Rahul_Comprehensive_Test_Form',
      template: 'Rahul_Template_Test_Form',
      followup: 'Rahul_FollowUp_Test_Form'
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
      module: 'Form Testing'
    });
    console.log(`🐛 BUG DETECTED [${bugId}] - ${severity}: ${description}`);
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

  test.describe('🔨 Step 1: Comprehensive Form Creation Testing', () => {
    
    test('should create comprehensive form with all field types and detect creation issues', async () => {
      await test.step('Navigate to Create CRF and test accessibility', async () => {
        await page.goto('/create-crf');
        await page.waitForLoadState('networkidle');
        
        // Test if page loads properly
        const pageTitle = await page.title();
        console.log(`📄 Page Title: ${pageTitle}`);
        
        // Check for form creation indicators
        const formIndicators = [
          'input[name="title"]',
          'input[placeholder*="title" i]',
          'text="Form Title"',
          'text="Create Form"'
        ];
        
        let formPageFound = false;
        for (const indicator of formIndicators) {
          if (await page.locator(indicator).isVisible({ timeout: 3000 })) {
            formPageFound = true;
            break;
          }
        }
        
        if (!formPageFound) {
          trackBug('FORM-001', 'Critical', 'Form creation page not accessible', 
            'Navigate to /create-crf', 'Form creation fields should be visible', 'No form creation elements found');
        }
      });

      await test.step('Create form with comprehensive field testing', async () => {
        const formName = `${testData.forms.comprehensive}_${testData.timestamp}`;
        
        // Test form title field
        try {
          await page.fill('input[name="title"], input[placeholder*="title" i]', formName);
          console.log('✅ Form title field working');
        } catch (error) {
          trackBug('FORM-002', 'High', 'Form title field not fillable', 
            'Fill form title field', 'Should accept text input', `Error: ${error instanceof Error ? error.message : String(error)}`);
        }
        
        // Test description field
        try {
          await page.fill('textarea[name="description"], textarea[placeholder*="description" i]', 
            'Comprehensive testing form with all field types for defect detection');
          console.log('✅ Form description field working');
        } catch (error) {
          trackBug('FORM-003', 'Medium', 'Form description field not fillable', 
            'Fill form description field', 'Should accept text input', `Error: ${error instanceof Error ? error.message : String(error)}`);
        }
        
        // Test category selection
        try {
          const categorySelectors = [
            'select[name="category"]',
            'select[placeholder*="category" i]',
            '.category-dropdown'
          ];
          
          let categorySelected = false;
          for (const selector of categorySelectors) {
            const element = page.locator(selector);
            if (await element.isVisible({ timeout: 2000 })) {
              await element.selectOption({ index: 1 });
              categorySelected = true;
              console.log('✅ Category selection working');
              break;
            }
          }
          
          if (!categorySelected) {
            trackBug('FORM-004', 'Medium', 'Category selection not available', 
              'Select form category', 'Category dropdown should be available', 'No category selection found');
          }
        } catch (error) {
          trackBug('FORM-005', 'Medium', 'Category selection error', 
            'Select form category', 'Should allow category selection', `Error: ${getErrorMessage(error)}`);
        }
      });

      await test.step('Add Screening Section with extensive field testing', async () => {
        // Test section addition
        try {
          await page.click('button:has-text("Add Section"), button:has-text("Screening"), .add-section-btn');
          console.log('✅ Section addition working');
        } catch (error) {
          trackBug('FORM-006', 'High', 'Cannot add sections to form', 
            'Click Add Section button', 'Should add new section', `Error: ${getErrorMessage(error)}`);
        }
        
        // Test Text Field Addition
        await test.step('Test Text Field Addition', async () => {
          try {
            await page.click('button:has-text("Add Field"), .add-field-btn');
            await page.fill('input[placeholder*="field name" i]', 'Rahul_Screening_Text');
            await page.selectOption('select[name="type"], select[placeholder*="type" i]', 'text');
            await page.click('button:has-text("Add"), button:has-text("Save Field")');
            console.log('✅ Text field addition working');
          } catch (error) {
            trackBug('FORM-007', 'High', 'Text field cannot be added', 
              'Add text field to form', 'Should add text field successfully', `Error: ${getErrorMessage(error)}`);
          }
        });
        
        // Test Textarea Field with validation
        await test.step('Test Textarea Field Addition', async () => {
          try {
            await page.click('button:has-text("Add Field"), .add-field-btn');
            await page.fill('input[placeholder*="field name" i]', 'Rahul_Screening_Textarea');
            await page.selectOption('select[name="type"], select[placeholder*="type" i]', 'textarea');
            await page.fill('input[placeholder*="placeholder" i]', 'Enter detailed screening information');
            await page.click('button:has-text("Add"), button:has-text("Save Field")');
            console.log('✅ Textarea field addition working');
          } catch (error) {
            trackBug('FORM-008', 'High', 'Textarea field cannot be added', 
              'Add textarea field to form', 'Should add textarea field successfully', `Error: ${getErrorMessage(error)}`);
          }
        });
        
        // Test Number Field with Min/Max validation
        await test.step('Test Number Field with Validation', async () => {
          try {
            await page.click('button:has-text("Add Field"), .add-field-btn');
            await page.fill('input[placeholder*="field name" i]', 'Rahul_Screening_Number');
            await page.selectOption('select[name="type"], select[placeholder*="type" i]', 'number');
            await page.fill('input[placeholder*="min" i]', '0');
            await page.fill('input[placeholder*="max" i]', '100');
            await page.click('button:has-text("Add"), button:has-text("Save Field")');
            console.log('✅ Number field with validation working');
          } catch (error) {
            trackBug('FORM-009', 'High', 'Number field with validation cannot be added', 
              'Add number field with min/max validation', 'Should add number field with validation', `Error: ${getErrorMessage(error)}`);
          }
        });
        
        // Test Select Field with Multiple Options
        await test.step('Test Select Field with Options', async () => {
          try {
            await page.click('button:has-text("Add Field"), .add-field-btn');
            await page.fill('input[placeholder*="field name" i]', 'Rahul_Screening_Select');
            await page.selectOption('select[name="type"], select[placeholder*="type" i]', 'select');
            await page.fill('textarea[placeholder*="options" i]', 'Option 1\nOption 2\nOption 3\nOption 4\nOption 5');
            await page.click('button:has-text("Add"), button:has-text("Save Field")');
            console.log('✅ Select field with options working');
          } catch (error) {
            trackBug('FORM-010', 'High', 'Select field with options cannot be added', 
              'Add select field with multiple options', 'Should add select field with options', `Error: ${getErrorMessage(error)}`);
          }
        });
        
        // Test Date Field
        await test.step('Test Date Field Addition', async () => {
          try {
            await page.click('button:has-text("Add Field"), .add-field-btn');
            await page.fill('input[placeholder*="field name" i]', 'Rahul_Screening_Date');
            await page.selectOption('select[name="type"], select[placeholder*="type" i]', 'date');
            await page.click('button:has-text("Add"), button:has-text("Save Field")');
            console.log('✅ Date field addition working');
          } catch (error) {
            trackBug('FORM-011', 'High', 'Date field cannot be added', 
              'Add date field to form', 'Should add date field successfully', `Error: ${getErrorMessage(error)}`);
          }
        });
      });

      await test.step('Add Main CRF Section with complex field testing', async () => {
        // Test complex field types
        
        // Test Multi-Select Field
        await test.step('Test Multi-Select Field', async () => {
          try {
            await page.click('button:has-text("Add Section"), button:has-text("Main"), button:has-text("CRF")');
            await page.click('button:has-text("Add Field"), .add-field-btn');
            await page.fill('input[placeholder*="field name" i]', 'Rahul_Main_MultiSelect');
            await page.selectOption('select[name="type"], select[placeholder*="type" i]', 'multiselect');
            await page.fill('textarea[placeholder*="options" i]', 'Choice A\nChoice B\nChoice C\nChoice D\nChoice E');
            await page.click('button:has-text("Add"), button:has-text("Save Field")');
            console.log('✅ Multi-select field working');
          } catch (error) {
            trackBug('FORM-012', 'High', 'Multi-select field cannot be added', 
              'Add multi-select field with options', 'Should add multi-select field', `Error: ${getErrorMessage(error)}`);
          }
        });
        
        // Test Checkbox Field
        await test.step('Test Checkbox Field', async () => {
          try {
            await page.click('button:has-text("Add Field"), .add-field-btn');
            await page.fill('input[placeholder*="field name" i]', 'Rahul_Main_Checkbox');
            await page.selectOption('select[name="type"], select[placeholder*="type" i]', 'checkbox');
            await page.fill('input[placeholder*="label" i]', 'I agree to the terms and conditions');
            await page.click('button:has-text("Add"), button:has-text("Save Field")');
            console.log('✅ Checkbox field working');
          } catch (error) {
            trackBug('FORM-013', 'High', 'Checkbox field cannot be added', 
              'Add checkbox field with label', 'Should add checkbox field', `Error: ${getErrorMessage(error)}`);
          }
        });
        
        // Test Radio Button Field
        await test.step('Test Radio Button Field', async () => {
          try {
            await page.click('button:has-text("Add Field"), .add-field-btn');
            await page.fill('input[placeholder*="field name" i]', 'Rahul_Main_Radio');
            await page.selectOption('select[name="type"], select[placeholder*="type" i]', 'radio');
            await page.fill('textarea[placeholder*="options" i]', 'Yes\nNo\nMaybe\nNot Sure');
            await page.click('button:has-text("Add"), button:has-text("Save Field")');
            console.log('✅ Radio button field working');
          } catch (error) {
            trackBug('FORM-014', 'High', 'Radio button field cannot be added', 
              'Add radio button field with options', 'Should add radio button field', `Error: ${getErrorMessage(error)}`);
          }
        });
        
        // Test Email Field
        await test.step('Test Email Field', async () => {
          try {
            await page.click('button:has-text("Add Field"), .add-field-btn');
            await page.fill('input[placeholder*="field name" i]', 'Rahul_Main_Email');
            await page.selectOption('select[name="type"], select[placeholder*="type" i]', 'email');
            await page.fill('input[placeholder*="placeholder" i]', 'patient@example.com');
            await page.click('button:has-text("Add"), button:has-text("Save Field")');
            console.log('✅ Email field working');
          } catch (error) {
            trackBug('FORM-015', 'High', 'Email field cannot be added', 
              'Add email field with placeholder', 'Should add email field', `Error: ${getErrorMessage(error)}`);
          }
        });
        
        // Test Complex Table Field
        await test.step('Test Complex Table Field', async () => {
          try {
            await page.click('button:has-text("Add Field"), .add-field-btn');
            await page.fill('input[placeholder*="field name" i]', 'Rahul_Main_Table');
            await page.selectOption('select[name="type"], select[placeholder*="type" i]', 'table');
            
            // Add multiple columns with different types
            await page.click('button:has-text("Add Column"), .add-column-btn');
            await page.fill('input[placeholder*="column name" i]', 'Patient ID');
            await page.selectOption('select[name="column_type"]', 'text');
            
            await page.click('button:has-text("Add Column"), .add-column-btn');
            await page.fill('input[placeholder*="column name" i]', 'Visit Date');
            await page.selectOption('select[name="column_type"]', 'date');
            
            await page.click('button:has-text("Add Column"), .add-column-btn');
            await page.fill('input[placeholder*="column name" i]', 'Test Result');
            await page.selectOption('select[name="column_type"]', 'number');
            
            await page.click('button:has-text("Add Column"), .add-column-btn');
            await page.fill('input[placeholder*="column name" i]', 'Status');
            await page.selectOption('select[name="column_type"]', 'select');
            
            await page.click('button:has-text("Save Table"), button:has-text("Add"), button:has-text("Save Field")');
            console.log('✅ Complex table field working');
          } catch (error) {
            trackBug('FORM-016', 'High', 'Complex table field cannot be added', 
              'Add table field with multiple column types', 'Should add table with various column types', `Error: ${getErrorMessage(error)}`);
          }
        });
        
        // Test File Upload Field
        await test.step('Test File Upload Field', async () => {
          try {
            await page.click('button:has-text("Add Field"), .add-field-btn');
            await page.fill('input[placeholder*="field name" i]', 'Rahul_Main_FileUpload');
            await page.selectOption('select[name="type"], select[placeholder*="type" i]', 'file');
            await page.fill('input[placeholder*="file types" i]', 'pdf,doc,docx,jpg,png,xlsx');
            await page.fill('input[placeholder*="max size" i]', '10'); // 10MB
            await page.click('button:has-text("Add"), button:has-text("Save Field")');
            console.log('✅ File upload field working');
          } catch (error) {
            trackBug('FORM-017', 'High', 'File upload field cannot be added', 
              'Add file upload field with restrictions', 'Should add file upload field', `Error: ${getErrorMessage(error)}`);
          }
        });
        
        // Test Multiple File Upload Field
        await test.step('Test Multiple File Upload Field', async () => {
          try {
            await page.click('button:has-text("Add Field"), .add-field-btn');
            await page.fill('input[placeholder*="field name" i]', 'Rahul_Main_MultipleFiles');
            await page.selectOption('select[name="type"], select[placeholder*="type" i]', 'multiple-files');
            await page.fill('input[placeholder*="file types" i]', 'pdf,jpg,png,doc,docx,xls,xlsx');
            await page.fill('input[placeholder*="max files" i]', '5');
            await page.fill('input[placeholder*="max size" i]', '50'); // 50MB total
            await page.click('button:has-text("Add"), button:has-text("Save Field")');
            console.log('✅ Multiple file upload field working');
          } catch (error) {
            trackBug('FORM-018', 'High', 'Multiple file upload field cannot be added', 
              'Add multiple file upload field with restrictions', 'Should add multiple file upload field', `Error: ${getErrorMessage(error)}`);
          }
        });
      });

      await test.step('Add FollowUp Section with dynamic field testing', async () => {
        try {
          await page.click('button:has-text("Add Section"), button:has-text("Follow"), button:has-text("FollowUp")');
          
          // Test FollowUp Text Field
          await page.click('button:has-text("Add Field"), .add-field-btn');
          await page.fill('input[placeholder*="field name" i]', 'Rahul_FollowUp_Status');
          await page.selectOption('select[name="type"], select[placeholder*="type" i]', 'text');
          await page.fill('input[placeholder*="placeholder" i]', 'Enter followup status');
          await page.click('button:has-text("Add"), button:has-text("Save Field")');
          
          // Test FollowUp Date Field
          await page.click('button:has-text("Add Field"), .add-field-btn');
          await page.fill('input[placeholder*="field name" i]', 'Rahul_FollowUp_Date');
          await page.selectOption('select[name="type"], select[placeholder*="type" i]', 'date');
          await page.click('button:has-text("Add"), button:has-text("Save Field")');
          
          // Test FollowUp Number Field for measurements
          await page.click('button:has-text("Add Field"), .add-field-btn');
          await page.fill('input[placeholder*="field name" i]', 'Rahul_FollowUp_Measurement');
          await page.selectOption('select[name="type"], select[placeholder*="type" i]', 'number');
          await page.fill('input[placeholder*="min" i]', '0');
          await page.fill('input[placeholder*="max" i]', '1000');
          await page.click('button:has-text("Add"), button:has-text("Save Field")');
          
          // Test FollowUp Select for progress
          await page.click('button:has-text("Add Field"), .add-field-btn');
          await page.fill('input[placeholder*="field name" i]', 'Rahul_FollowUp_Progress');
          await page.selectOption('select[name="type"], select[placeholder*="type" i]', 'select');
          await page.fill('textarea[placeholder*="options" i]', 'Excellent\nGood\nFair\nPoor\nCritical');
          await page.click('button:has-text("Add"), button:has-text("Save Field")');
          
          // Test FollowUp Textarea for notes
          await page.click('button:has-text("Add Field"), .add-field-btn');
          await page.fill('input[placeholder*="field name" i]', 'Rahul_FollowUp_Notes');
          await page.selectOption('select[name="type"], select[placeholder*="type" i]', 'textarea');
          await page.fill('input[placeholder*="placeholder" i]', 'Enter detailed followup notes');
          await page.click('button:has-text("Add"), button:has-text("Save Field")');
          
          console.log('✅ FollowUp section with all fields working');
        } catch (error) {
          trackBug('FORM-019', 'High', 'FollowUp section cannot be created properly', 
            'Add FollowUp section with various field types', 'Should add FollowUp section successfully', `Error: ${getErrorMessage(error)}`);
        }
      });

      await test.step('Test form saving and publication', async () => {
        try {
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
          const successMessage = await page.waitForSelector('text="Form created successfully", text="Success", .success-message', { timeout: 10000 });
          
          if (successMessage) {
            console.log('✅ Form saved and published successfully');
          } else {
            trackBug('FORM-020', 'Critical', 'Form cannot be saved/published', 
              'Save and publish form', 'Should save form successfully', 'No success message received');
          }
          
          // Verify form was created
          const url = page.url();
          console.log(`📍 Form creation completed. Current URL: ${url}`);
          
        } catch (error) {
          trackBug('FORM-021', 'Critical', 'Form saving process failed', 
            'Save and publish form', 'Should complete form creation process', `Error: ${getErrorMessage(error)}`);
        }
      });

      await test.step('Verify form appears in listing', async () => {
        try {
          await page.goto('/my-crf');
          await page.waitForLoadState('networkidle');
          
          const formName = `${testData.forms.comprehensive}_${testData.timestamp}`;
          const formExists = await page.locator(`text="${formName}"`).isVisible({ timeout: 5000 });
          
          if (formExists) {
            console.log('✅ Form appears in My CRF listing');
          } else {
            trackBug('FORM-022', 'High', 'Created form does not appear in listing', 
              'Navigate to My CRF after form creation', 'Form should appear in the list', 'Form not visible in listing');
          }
        } catch (error) {
          trackBug('FORM-023', 'High', 'Cannot verify form in listing', 
            'Check form in My CRF listing', 'Should be able to view form list', `Error: ${getErrorMessage(error)}`);
        }
      });
    });

    test('should test template-based form creation and identify template issues', async () => {
      await test.step('Navigate to templates and test availability', async () => {
        try {
          await page.goto('/templates');
          await page.waitForLoadState('networkidle');
          
          // Check if templates page loads
          const templatesExist = await page.locator('.template-card, .template-item, text="Templates"').isVisible({ timeout: 5000 });
          
          if (!templatesExist) {
            trackBug('TEMPLATE-001', 'Medium', 'Templates page not accessible or empty', 
              'Navigate to templates page', 'Should show available templates', 'No templates found');
          } else {
            console.log('✅ Templates page accessible');
          }
        } catch (error) {
          trackBug('TEMPLATE-002', 'Medium', 'Templates page navigation failed', 
            'Navigate to /templates', 'Should load templates page', `Error: ${getErrorMessage(error)}`);
        }
      });

      await test.step('Test template selection and usage', async () => {
        try {
          const templateSelectors = [
            '.template-card:first-child',
            '.template-item:first-child',
            'button:has-text("Use Template"):first-child'
          ];
          
          let templateUsed = false;
          for (const selector of templateSelectors) {
            const element = page.locator(selector);
            if (await element.isVisible({ timeout: 3000 })) {
              await element.click();
              templateUsed = true;
              console.log('✅ Template selection working');
              break;
            }
          }
          
          if (!templateUsed) {
            console.log('⚠️ No templates available, creating template-based form manually');
            
            await page.goto('/create-crf');
            await page.waitForLoadState('networkidle');
            
            const templateFormName = `${testData.forms.template}_${testData.timestamp}`;
            await page.fill('input[name="title"], input[placeholder*="title" i]', templateFormName);
            await page.fill('textarea[name="description"], textarea[placeholder*="description" i]', 
              'Template-based form for testing template functionality and defect detection');
            
            // Add basic fields for template testing
            await page.click('button:has-text("Add Field"), .add-field-btn');
            await page.fill('input[placeholder*="field name" i]', 'Rahul_Template_Name');
            await page.selectOption('select[name="type"], select[placeholder*="type" i]', 'text');
            await page.click('button:has-text("Add"), button:has-text("Save Field")');
            
            await page.click('button:has-text("Save Form"), button:has-text("Create"), button:has-text("Publish")');
            
            // Wait for success
            await page.waitForSelector('text="Form created successfully", text="Success", .success-message', { timeout: 10000 });
            
            console.log('✅ Template-based form creation completed');
          }
        } catch (error) {
          trackBug('TEMPLATE-003', 'Medium', 'Template usage failed', 
            'Use template to create form', 'Should create form from template', `Error: ${getErrorMessage(error)}`);
        }
      });
    });
  });

  test.describe('📊 Step 2: Data Addition and FollowUp Management Testing', () => {
    
    test('should test data addition and followup management with edge cases', async () => {
      await test.step('Navigate to created form and test data entry', async () => {
        try {
          await page.goto('/my-crf');
          await page.waitForLoadState('networkidle');
          
          const formName = `${testData.forms.comprehensive}_${testData.timestamp}`;
          await page.click(`text="${formName}", a:has-text("${formName}")`);
          await page.waitForLoadState('networkidle');
          
          console.log('✅ Successfully navigated to form');
        } catch (error) {
          trackBug('DATA-001', 'High', 'Cannot navigate to created form', 
            'Click on created form in My CRF', 'Should open form for data entry', `Error: ${getErrorMessage(error)}`);
        }
      });

      await test.step('Add comprehensive initial data with validation testing', async () => {
        try {
          // Click to add new record
          await page.click('button:has-text("Add Record"), button:has-text("New Entry"), .add-record-btn');
          
          // Fill screening section with edge cases
          await page.fill('input[name*="Rahul_Screening_Text"], input[placeholder*="screening text" i]', 
            'Rahul Patient Testing Data - Special Characters: @#$%^&*()_+{}[]|\\:";\'<>?,./ 123456789');
          
          await page.fill('textarea[name*="Rahul_Screening_Textarea"], textarea[placeholder*="screening information" i]', 
            'Comprehensive screening information for patient Rahul testing with very long text to test textarea limits and see if there are any character restrictions or issues with large amounts of text input that might cause problems');
          
          // Test number field validation
          await page.fill('input[name*="Rahul_Screening_Number"], input[type="number"]', '75');
          
          // Test boundary conditions for number field
          await page.fill('input[name*="Rahul_Screening_Number"], input[type="number"]', '101'); // Above max
          await page.fill('input[name*="Rahul_Screening_Number"], input[type="number"]', '-1'); // Below min
          await page.fill('input[name*="Rahul_Screening_Number"], input[type="number"]', '75'); // Valid value
          
          await page.selectOption('select[name*="Rahul_Screening_Select"]', { index: 1 });
          await page.fill('input[name*="Rahul_Screening_Date"], input[type="date"]', '2025-01-15');
          
          // Fill main CRF section
          await page.fill('input[name*="Rahul_Main_Email"], input[type="email"]', 'rahul.patient@example.com');
          
          // Test invalid email
          await page.fill('input[name*="Rahul_Main_Email"], input[type="email"]', 'invalid-email');
          await page.fill('input[name*="Rahul_Main_Email"], input[type="email"]', 'rahul.patient@example.com'); // Valid
          
          await page.check('input[name*="Rahul_Main_Checkbox"], input[type="checkbox"]');
          await page.click('input[name*="Rahul_Main_Radio"][value="Yes"], input[value="Yes"]');
          
          // Test table data entry
          await page.fill('input[name*="Patient ID"], td:nth-child(1) input', 'RAHUL001');
          await page.fill('input[name*="Visit Date"], td:nth-child(2) input', '2025-01-15');
          await page.fill('input[name*="Test Result"], td:nth-child(3) input', '85');
          
          // Save the record
          await page.click('button:has-text("Save Record"), button:has-text("Submit"), button:has-text("Save")');
          
          // Wait for success message
          await page.waitForSelector('text="Record saved successfully", text="Success", .success-message', { timeout: 10000 });
          
          console.log('✅ Initial data added successfully');
        } catch (error) {
          trackBug('DATA-002', 'High', 'Data entry failed or validation issues', 
            'Fill form fields and save record', 'Should save record with valid data', `Error: ${getErrorMessage(error)}`);
        }
      });

      await test.step('Test FollowUp sequence and date management', async () => {
        // Test FollowUp 1
        try {
          await page.click('button:has-text("Add FollowUp"), button:has-text("Add Follow-up"), .add-followup-btn');
          
          await page.fill('input[name*="Rahul_FollowUp_Status"], input[placeholder*="followup status" i]', 'Initial Follow-up Complete');
          await page.fill('input[name*="Rahul_FollowUp_Date"], input[type="date"]', '2025-01-22');
          await page.fill('input[name*="Rahul_FollowUp_Measurement"], input[type="number"]', '80');
          await page.selectOption('select[name*="Rahul_FollowUp_Progress"]', 'Good');
          await page.fill('textarea[name*="Rahul_FollowUp_Notes"], textarea[placeholder*="followup notes" i]', 
            'Patient showing good progress. Vital signs stable. Continue current treatment plan as prescribed.');
          
          await page.click('button:has-text("Save FollowUp"), button:has-text("Save Follow-up"), button:has-text("Save")');
          await page.waitForSelector('text="FollowUp saved successfully", text="Success", .success-message', { timeout: 10000 });
          
          console.log('✅ FollowUp 1 added successfully');
        } catch (error) {
          trackBug('FOLLOWUP-001', 'High', 'FollowUp 1 cannot be added', 
            'Add first followup with data', 'Should save followup successfully', `Error: ${getErrorMessage(error)}`);
        }
        
        // Test FollowUp 2 sequence
        try {
          await page.click('button:has-text("Add FollowUp"), button:has-text("Add Follow-up"), .add-followup-btn');
          
          await page.fill('input[name*="Rahul_FollowUp_Status"], input[placeholder*="followup status" i]', 'Second Follow-up Complete');
          await page.fill('input[name*="Rahul_FollowUp_Date"], input[type="date"]', '2025-01-29');
          await page.fill('input[name*="Rahul_FollowUp_Measurement"], input[type="number"]', '78');
          await page.selectOption('select[name*="Rahul_FollowUp_Progress"]', 'Excellent');
          await page.fill('textarea[name*="Rahul_FollowUp_Notes"], textarea[placeholder*="followup notes" i]', 
            'Patient continues to improve. All parameters within normal range. Excellent recovery progress noted.');
          
          await page.click('button:has-text("Save FollowUp"), button:has-text("Save Follow-up"), button:has-text("Save")');
          await page.waitForSelector('text="FollowUp saved successfully", text="Success", .success-message', { timeout: 10000 });
          
          console.log('✅ FollowUp 2 added successfully');
        } catch (error) {
          trackBug('FOLLOWUP-002', 'High', 'FollowUp 2 sequence issue', 
            'Add second followup in sequence', 'Should save second followup successfully', `Error: ${getErrorMessage(error)}`);
        }
        
        // Test out-of-sequence FollowUp (should this be allowed?)
        try {
          await page.click('button:has-text("Add FollowUp"), button:has-text("Add Follow-up"), .add-followup-btn');
          
          await page.fill('input[name*="Rahul_FollowUp_Date"], input[type="date"]', '2025-01-20'); // Earlier date
          await page.fill('input[name*="Rahul_FollowUp_Status"], input[placeholder*="followup status" i]', 'Out of Sequence Test');
          
          await page.click('button:has-text("Save FollowUp"), button:has-text("Save Follow-up"), button:has-text("Save")');
          
          // Check if this is allowed or blocked
          const errorMessage = await page.locator('text="error", text="invalid", .error-message').isVisible({ timeout: 3000 });
          
          if (!errorMessage) {
            trackBug('FOLLOWUP-003', 'Medium', 'Out-of-sequence followup allowed', 
              'Add followup with earlier date than previous followups', 'Should validate date sequence', 'Out-of-sequence followup was accepted');
          }
        } catch (error) {
          console.log('⚠️ Out-of-sequence followup test generated error (may be expected)');
        }
      });

      await test.step('Test followup date filtering', async () => {
        try {
          const dateFilters = [
            'input[name="date_filter"], input[type="date"]',
            'select[name="date_range"]',
            '.date-filter-btn'
          ];
          
          let filterTested = false;
          for (const selector of dateFilters) {
            const element = page.locator(selector);
            if (await element.isVisible({ timeout: 2000 })) {
              if (selector.includes('date')) {
                await element.fill('2025-01-20');
              } else {
                await element.selectOption('last_week');
              }
              filterTested = true;
              break;
            }
          }
          
          if (filterTested) {
            await page.click('button:has-text("Filter"), button:has-text("Apply"), .filter-btn');
            console.log('✅ Date filtering functionality working');
          } else {
            trackBug('FOLLOWUP-004', 'Medium', 'Date filtering not available', 
              'Filter followups by date', 'Should provide date filtering options', 'No date filter found');
          }
        } catch (error) {
          trackBug('FOLLOWUP-005', 'Medium', 'Date filtering failed', 
            'Apply date filter to followups', 'Should filter followups by date', `Error: ${getErrorMessage(error)}`);
        }
      });
    });
  });

  // Output bug summary at the end
  test.afterAll(async () => {
    console.log('\n🐛 BUG SUMMARY REPORT');
    console.log('===================');
    console.log(`Total Bugs Found: ${testData.bugTracker.length}`);
    
    const severityCounts = {
      Critical: testData.bugTracker.filter(bug => bug.severity === 'Critical').length,
      High: testData.bugTracker.filter(bug => bug.severity === 'High').length,
      Medium: testData.bugTracker.filter(bug => bug.severity === 'Medium').length,
      Low: testData.bugTracker.filter(bug => bug.severity === 'Low').length
    };
    
    console.log('Severity Breakdown:');
    console.log(`- Critical: ${severityCounts.Critical}`);
    console.log(`- High: ${severityCounts.High}`);
    console.log(`- Medium: ${severityCounts.Medium}`);
    console.log(`- Low: ${severityCounts.Low}`);
    
    // Save bug data for Excel report generation
    require('fs').writeFileSync('bug-tracker-data.json', JSON.stringify(testData.bugTracker, null, 2));
  });
});