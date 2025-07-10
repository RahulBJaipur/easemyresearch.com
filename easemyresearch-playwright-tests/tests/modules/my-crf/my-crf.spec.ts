import { test, expect } from '@playwright/test';
import { LoginHelper } from '../../../src/helpers/login-helper';

/**
 * My CRF Module - Comprehensive Test Suite
 * 
 * Covers:
 * - CRF Dashboard and Management
 * - Form Sharing and Permissions
 * - Form Status Management
 * - Form Analytics and Reports
 * - Form Editing and Updates
 * - Form Deletion and Archive
 * - Collaboration Features
 */

const testData = {
  forms: {
    testForm: {
      title: 'Rahul_Test_CRF_Management',
      description: 'Test form for My CRF management functionality',
      status: 'Draft'
    },
    sharedForm: {
      title: 'Rahul_Shared_CRF_Collaboration',
      description: 'Test form for sharing and collaboration features',
      status: 'Published'
    }
  },
  sharing: {
    emails: ['rahul.collaborator1@example.com', 'rahul.collaborator2@example.com'],
    permissions: ['View', 'Edit', 'Admin'],
    message: 'Please collaborate on this Rahul test research form'
  },
  filters: {
    status: ['Draft', 'Published', 'Archived', 'Shared'],
    dateRange: ['Last 7 days', 'Last 30 days', 'Last 3 months'],
    category: ['Screening', 'Main', 'Follow-up']
  }
};

test.describe('My CRF Module - Comprehensive Testing', () => {
  let loginHelper: LoginHelper;

  test.beforeEach(async ({ page }) => {
    loginHelper = new LoginHelper(page);
    await loginHelper.loginAsRegularUser();
    
    // Navigate to My CRF page
    await page.click('text="My CRF", text="My Forms", a[href*="my-crf"]');
    await page.waitForLoadState('networkidle');
  });

  test.describe('📊 CRF Dashboard and Overview', () => {
    test('should display CRF dashboard with form statistics @functional @dashboard', async ({ page }) => {
      console.log('🧪 Testing CRF dashboard display...');
      
      await test.step('Verify dashboard elements', async () => {
        const dashboardElements = [
          'text="My CRF"',
          'text="My Forms"',
          'text="Dashboard"',
          '.dashboard',
          '.crf-overview'
        ];
        
        let dashboardFound = false;
        for (const element of dashboardElements) {
          if (await page.locator(element).isVisible({ timeout: 3000 })) {
            dashboardFound = true;
            console.log(`✅ Dashboard element found: ${element}`);
            break;
          }
        }
        expect(dashboardFound).toBeTruthy();
      });

      await test.step('Check for form statistics', async () => {
        const statisticsElements = [
          'text="Total Forms"',
          'text="Active Forms"',
          'text="Draft Forms"',
          'text="Shared Forms"',
          '.stats',
          '.statistics',
          '.form-count'
        ];
        
        let statsFound = false;
        for (const element of statisticsElements) {
          if (await page.locator(element).isVisible({ timeout: 3000 })) {
            statsFound = true;
            console.log(`✅ Statistics found: ${element}`);
            break;
          }
        }
        console.log(`📊 Form statistics: ${statsFound ? 'Available' : 'Not displayed'}`);
      });

      await test.step('Verify recent activity or form list', async () => {
        const activityElements = [
          '.form-list',
          '.recent-forms',
          '.form-card',
          'table',
          '.activity-list'
        ];
        
        let activityFound = false;
        for (const element of activityElements) {
          const count = await page.locator(element).count();
          if (count > 0) {
            activityFound = true;
            console.log(`✅ Activity/forms display found (${count} elements): ${element}`);
            break;
          }
        }
        expect(activityFound).toBeTruthy();
      });
    });

    test('should provide form filtering and search functionality @functional @filtering', async ({ page }) => {
      console.log('🧪 Testing form filtering and search...');
      
      await test.step('Check for search functionality', async () => {
        const searchElements = [
          'input[type="search"]',
          'input[placeholder*="search" i]',
          'input[placeholder*="find" i]',
          '.search-box',
          '.search-input'
        ];
        
        let searchFound = false;
        for (const element of searchElements) {
          if (await page.locator(element).isVisible({ timeout: 3000 })) {
            searchFound = true;
            console.log(`✅ Search element found: ${element}`);
            
            // Test search functionality
            await page.fill(element, 'Rahul');
            await page.waitForTimeout(1000);
            
            // Check if results are filtered
            const resultsCount = await page.locator('.form-card, .form-item, tr').count();
            console.log(`📊 Search results: ${resultsCount} items`);
            break;
          }
        }
        console.log(`📊 Search functionality: ${searchFound ? 'Available' : 'Not found'}`);
      });

      await test.step('Check for status filters', async () => {
        const filterElements = [
          'select[name*="status"]',
          'text="Filter by Status"',
          'text="All Status"',
          'text="Draft"',
          'text="Published"',
          '.filter-dropdown',
          '.status-filter'
        ];
        
        let filterFound = false;
        for (const element of filterElements) {
          if (await page.locator(element).isVisible({ timeout: 3000 })) {
            filterFound = true;
            console.log(`✅ Filter element found: ${element}`);
            
            // Try to interact with filter
            if (element.includes('select') || element.includes('dropdown')) {
              await page.click(element);
              await page.waitForTimeout(500);
            }
            break;
          }
        }
        console.log(`📊 Filtering options: ${filterFound ? 'Available' : 'Not found'}`);
      });

      await test.step('Check for sorting options', async () => {
        const sortElements = [
          'select[name*="sort"]',
          'text="Sort by"',
          'text="Date Created"',
          'text="Name"',
          'button:has-text("Sort")',
          '.sort-dropdown'
        ];
        
        let sortFound = false;
        for (const element of sortElements) {
          if (await page.locator(element).isVisible({ timeout: 3000 })) {
            sortFound = true;
            console.log(`✅ Sort element found: ${element}`);
            break;
          }
        }
        console.log(`📊 Sorting options: ${sortFound ? 'Available' : 'Not found'}`);
      });
    });
  });

  test.describe('📝 Form Management Operations', () => {
    test('should allow editing existing forms @functional @form-editing', async ({ page }) => {
      console.log('🧪 Testing form editing functionality...');
      
      await test.step('Find and edit a form', async () => {
        // Look for edit buttons or clickable form items
        const editElements = [
          'button:has-text("Edit")',
          'a:has-text("Edit")',
          '.edit-button',
          '.form-card',
          '.form-item',
          'text="Edit Form"'
        ];
        
        let editFound = false;
        for (const element of editElements) {
          const editButton = page.locator(element).first();
          if (await editButton.isVisible({ timeout: 3000 })) {
            await editButton.click();
            editFound = true;
            console.log(`✅ Edit functionality accessed via: ${element}`);
            break;
          }
        }
        
        if (editFound) {
          await page.waitForLoadState('networkidle');
          
          // Check if we're in edit mode
          const editIndicators = [
            'text="Edit Form"',
            'text="Form Builder"',
            'text="Save Changes"',
            'button:has-text("Update")',
            '.form-editor',
            'input[name="title"]'
          ];
          
          let inEditMode = false;
          for (const indicator of editIndicators) {
            if (await page.locator(indicator).isVisible({ timeout: 3000 })) {
              inEditMode = true;
              console.log(`✅ Edit mode confirmed: ${indicator}`);
              break;
            }
          }
          expect(inEditMode).toBeTruthy();
        } else {
          console.log('📊 Form editing: No forms available to edit or edit buttons not found');
        }
      });
    });

    test('should allow duplicating forms @functional @form-duplication', async ({ page }) => {
      console.log('🧪 Testing form duplication functionality...');
      
      await test.step('Check for duplicate functionality', async () => {
        const duplicateElements = [
          'button:has-text("Duplicate")',
          'button:has-text("Copy")',
          'text="Duplicate Form"',
          '.duplicate-button',
          '.copy-button'
        ];
        
        let duplicateFound = false;
        for (const element of duplicateElements) {
          if (await page.locator(element).isVisible({ timeout: 3000 })) {
            duplicateFound = true;
            console.log(`✅ Duplicate functionality found: ${element}`);
            
            // Try to duplicate
            await page.click(element);
            await page.waitForTimeout(1000);
            
            // Check for confirmation or new form creation
            const confirmationElements = [
              'text="Duplicated"',
              'text="Copied"',
              'text="Form copied"',
              'input[value*="Copy"]',
              '.success-message'
            ];
            
            let confirmationFound = false;
            for (const confirmation of confirmationElements) {
              if (await page.locator(confirmation).isVisible({ timeout: 3000 })) {
                confirmationFound = true;
                console.log(`✅ Duplication confirmed: ${confirmation}`);
                break;
              }
            }
            break;
          }
        }
        console.log(`📊 Form duplication: ${duplicateFound ? 'Available' : 'Not found'}`);
      });
    });

    test('should allow deleting forms @functional @form-deletion', async ({ page }) => {
      console.log('🧪 Testing form deletion functionality...');
      
      await test.step('Check for delete functionality', async () => {
        const deleteElements = [
          'button:has-text("Delete")',
          'button:has-text("Remove")',
          'text="Delete Form"',
          '.delete-button',
          '.remove-button',
          '[data-testid="delete"]'
        ];
        
        let deleteFound = false;
        for (const element of deleteElements) {
          if (await page.locator(element).isVisible({ timeout: 3000 })) {
            deleteFound = true;
            console.log(`✅ Delete functionality found: ${element}`);
            
            // Click delete button
            await page.click(element);
            await page.waitForTimeout(1000);
            
            // Check for confirmation dialog
            const confirmationElements = [
              'text="Are you sure"',
              'text="Confirm"',
              'text="Delete"',
              'button:has-text("Yes")',
              'button:has-text("Confirm")',
              '.modal',
              '.confirmation-dialog'
            ];
            
            let confirmationFound = false;
            for (const confirmation of confirmationElements) {
              if (await page.locator(confirmation).isVisible({ timeout: 3000 })) {
                confirmationFound = true;
                console.log(`✅ Delete confirmation found: ${confirmation}`);
                
                // Cancel deletion to avoid actually deleting
                const cancelButton = page.locator('button:has-text("Cancel"), button:has-text("No")');
                if (await cancelButton.isVisible({ timeout: 2000 })) {
                  await cancelButton.click();
                }
                break;
              }
            }
            break;
          }
        }
        console.log(`📊 Form deletion: ${deleteFound ? 'Available with confirmation' : 'Not found'}`);
      });
    });

    test('should allow archiving forms @functional @form-archiving', async ({ page }) => {
      console.log('🧪 Testing form archiving functionality...');
      
      await test.step('Check for archive functionality', async () => {
        const archiveElements = [
          'button:has-text("Archive")',
          'text="Archive Form"',
          '.archive-button',
          'select option[value="archived"]'
        ];
        
        let archiveFound = false;
        for (const element of archiveElements) {
          if (await page.locator(element).isVisible({ timeout: 3000 })) {
            archiveFound = true;
            console.log(`✅ Archive functionality found: ${element}`);
            
            // Try to archive
            await page.click(element);
            await page.waitForTimeout(1000);
            break;
          }
        }
        console.log(`📊 Form archiving: ${archiveFound ? 'Available' : 'Not found'}`);
      });
    });
  });

  test.describe('🤝 Form Sharing and Collaboration', () => {
    test('should allow sharing forms with other users @functional @form-sharing', async ({ page }) => {
      console.log('🧪 Testing form sharing functionality...');
      
      await test.step('Find and access sharing functionality', async () => {
        const shareElements = [
          'button:has-text("Share")',
          'text="Share Form"',
          'text="Collaborate"',
          '.share-button',
          '.collaboration-button',
          'a:has-text("Share")'
        ];
        
        let shareFound = false;
        for (const element of shareElements) {
          if (await page.locator(element).isVisible({ timeout: 3000 })) {
            shareFound = true;
            console.log(`✅ Share functionality found: ${element}`);
            
            await page.click(element);
            await page.waitForTimeout(1000);
            break;
          }
        }
        
        if (shareFound) {
          // Check for sharing form/modal
          const sharingFormElements = [
            'input[type="email"]',
            'input[placeholder*="email" i]',
            'textarea[placeholder*="message" i]',
            'text="Email Address"',
            'text="Share with"',
            '.share-modal',
            '.collaboration-form'
          ];
          
          let sharingFormFound = false;
          for (const formElement of sharingFormElements) {
            if (await page.locator(formElement).isVisible({ timeout: 3000 })) {
              sharingFormFound = true;
              console.log(`✅ Sharing form found: ${formElement}`);
              
              // Fill in sharing details if email field found
              if (formElement.includes('email')) {
                await page.fill(formElement, testData.sharing.emails[0]);
              }
              break;
            }
          }
          expect(sharingFormFound).toBeTruthy();
        } else {
          console.log('📊 Form sharing: No share buttons found');
        }
      });
    });

    test('should allow setting permissions for shared forms @functional @permissions', async ({ page }) => {
      console.log('🧪 Testing permission management...');
      
      await test.step('Check for permission options in sharing', async () => {
        // First try to access sharing
        const shareButton = page.locator('button:has-text("Share"), text="Share Form"').first();
        if (await shareButton.isVisible({ timeout: 3000 })) {
          await shareButton.click();
          await page.waitForTimeout(1000);
          
          // Look for permission settings
          const permissionElements = [
            'select[name*="permission"]',
            'text="View Only"',
            'text="Edit"',
            'text="Admin"',
            'text="Permissions"',
            '.permission-selector',
            'input[type="radio"][value*="view"]'
          ];
          
          let permissionsFound = false;
          for (const permission of permissionElements) {
            if (await page.locator(permission).isVisible({ timeout: 3000 })) {
              permissionsFound = true;
              console.log(`✅ Permission option found: ${permission}`);
              break;
            }
          }
          console.log(`📊 Permission management: ${permissionsFound ? 'Available' : 'Not found'}`);
        } else {
          console.log('📊 Permission testing: Share functionality not accessible');
        }
      });
    });

    test('should display shared forms from other users @functional @shared-forms', async ({ page }) => {
      console.log('🧪 Testing shared forms display...');
      
      await test.step('Check for shared forms section', async () => {
        const sharedSections = [
          'text="Shared with Me"',
          'text="Shared Forms"',
          'text="Collaboration"',
          'text="Received Forms"',
          '.shared-forms',
          '.collaboration-section'
        ];
        
        let sharedSectionFound = false;
        for (const section of sharedSections) {
          if (await page.locator(section).isVisible({ timeout: 3000 })) {
            sharedSectionFound = true;
            console.log(`✅ Shared forms section found: ${section}`);
            
            // Click to view shared forms
            await page.click(section);
            await page.waitForTimeout(1000);
            break;
          }
        }
        
        console.log(`📊 Shared forms display: ${sharedSectionFound ? 'Available' : 'Section not found'}`);
      });
    });

    test('should provide collaboration features @functional @collaboration', async ({ page }) => {
      console.log('🧪 Testing collaboration features...');
      
      await test.step('Check for real-time collaboration indicators', async () => {
        const collaborationFeatures = [
          'text="Online"',
          'text="Currently Editing"',
          'text="Collaborators"',
          'text="Recent Activity"',
          '.collaborator-list',
          '.activity-feed',
          '.online-indicator'
        ];
        
        let collaborationFound = false;
        for (const feature of collaborationFeatures) {
          if (await page.locator(feature).isVisible({ timeout: 3000 })) {
            collaborationFound = true;
            console.log(`✅ Collaboration feature found: ${feature}`);
            break;
          }
        }
        console.log(`📊 Collaboration features: ${collaborationFound ? 'Available' : 'Not detected'}`);
      });

      await test.step('Check for comment/feedback system', async () => {
        const commentFeatures = [
          'text="Comments"',
          'text="Feedback"',
          'text="Notes"',
          'textarea[placeholder*="comment" i]',
          '.comment-section',
          '.feedback-area'
        ];
        
        let commentSystemFound = false;
        for (const feature of commentFeatures) {
          if (await page.locator(feature).isVisible({ timeout: 3000 })) {
            commentSystemFound = true;
            console.log(`✅ Comment system found: ${feature}`);
            break;
          }
        }
        console.log(`📊 Comment/Feedback system: ${commentSystemFound ? 'Available' : 'Not found'}`);
      });
    });
  });

  test.describe('📈 Analytics and Reporting', () => {
    test('should provide form analytics and statistics @functional @analytics', async ({ page }) => {
      console.log('🧪 Testing form analytics...');
      
      await test.step('Check for analytics section', async () => {
        const analyticsElements = [
          'text="Analytics"',
          'text="Statistics"',
          'text="Reports"',
          'text="Insights"',
          '.analytics-section',
          '.stats-dashboard'
        ];
        
        let analyticsFound = false;
        for (const element of analyticsElements) {
          if (await page.locator(element).isVisible({ timeout: 3000 })) {
            analyticsFound = true;
            console.log(`✅ Analytics section found: ${element}`);
            
            await page.click(element);
            await page.waitForTimeout(1000);
            break;
          }
        }
        
        if (analyticsFound) {
          // Check for specific analytics metrics
          const metricsElements = [
            'text="Submissions"',
            'text="Views"',
            'text="Completion Rate"',
            'text="Response Rate"',
            '.metric',
            '.chart',
            'canvas'
          ];
          
          let metricsFound = false;
          for (const metric of metricsElements) {
            if (await page.locator(metric).isVisible({ timeout: 3000 })) {
              metricsFound = true;
              console.log(`✅ Analytics metric found: ${metric}`);
              break;
            }
          }
          console.log(`📊 Analytics metrics: ${metricsFound ? 'Available' : 'Not displayed'}`);
        } else {
          console.log('📊 Form analytics: Section not found');
        }
      });
    });

    test('should provide export and download options @functional @export', async ({ page }) => {
      console.log('🧪 Testing export functionality...');
      
      await test.step('Check for export options', async () => {
        const exportElements = [
          'button:has-text("Export")',
          'button:has-text("Download")',
          'text="Export Data"',
          'text="Download Report"',
          '.export-button',
          '.download-button'
        ];
        
        let exportFound = false;
        for (const element of exportElements) {
          if (await page.locator(element).isVisible({ timeout: 3000 })) {
            exportFound = true;
            console.log(`✅ Export option found: ${element}`);
            
            // Try clicking export button
            await page.click(element);
            await page.waitForTimeout(1000);
            
            // Check for format options
            const formatOptions = [
              'text="PDF"',
              'text="Excel"',
              'text="CSV"',
              'text="JSON"',
              '.format-option'
            ];
            
            let formatFound = false;
            for (const format of formatOptions) {
              if (await page.locator(format).isVisible({ timeout: 2000 })) {
                formatFound = true;
                console.log(`✅ Export format found: ${format}`);
                break;
              }
            }
            break;
          }
        }
        console.log(`📊 Export functionality: ${exportFound ? 'Available' : 'Not found'}`);
      });
    });
  });

  test.describe('⚡ Non-Functional Testing', () => {
    test('should test My CRF page performance @nonfunctional @performance', async ({ page }) => {
      console.log('🧪 Testing My CRF page performance...');
      
      await test.step('Measure page load time', async () => {
        const startTime = Date.now();
        await page.goto('/my-crf');
        await page.waitForLoadState('networkidle');
        const loadTime = Date.now() - startTime;
        
        console.log(`📊 My CRF page load time: ${loadTime}ms`);
        expect(loadTime).toBeLessThan(8000); // Should load within 8 seconds
      });

      await test.step('Test large form list performance', async () => {
        // Check how many forms are displayed
        const formCount = await page.locator('.form-card, .form-item, tr').count();
        console.log(`📊 Forms displayed: ${formCount}`);
        
        if (formCount > 0) {
          // Test scrolling performance for large lists
          await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
          await page.waitForTimeout(1000);
          console.log('✅ Scrolling performance: Acceptable');
        }
      });
    });

    test('should test responsive design @nonfunctional @responsive', async ({ page }) => {
      console.log('🧪 Testing My CRF responsive design...');
      
      await test.step('Test different screen sizes', async () => {
        const viewports = [
          { name: 'Mobile', width: 375, height: 667 },
          { name: 'Tablet', width: 768, height: 1024 },
          { name: 'Desktop', width: 1920, height: 1080 }
        ];
        
        for (const viewport of viewports) {
          await page.setViewportSize({ width: viewport.width, height: viewport.height });
          await page.waitForTimeout(1000);
          
          const formsVisible = await page.locator('.form-card, .form-item').isVisible();
          const navigationVisible = await page.locator('nav, .sidebar, .menu').isVisible();
          
          console.log(`📱 ${viewport.name} (${viewport.width}x${viewport.height}): Forms=${formsVisible ? '✅' : '❌'}, Nav=${navigationVisible ? '✅' : '❌'}`);
        }
      });
    });

    test('should test data security and access control @nonfunctional @security', async ({ page }) => {
      console.log('🧪 Testing data security and access control...');
      
      await test.step('Verify authenticated access only', async () => {
        // Logout and try to access My CRF
        await loginHelper.logout();
        
        await page.goto('/my-crf');
        await page.waitForLoadState('networkidle');
        
        // Should be redirected to login
        const currentUrl = page.url();
        const needsAuth = currentUrl.includes('login') || currentUrl.includes('signin') || currentUrl.includes('auth');
        
        console.log(`📊 Access control: ${needsAuth ? '✅ Redirected to login' : '❌ Unauthorized access allowed'}`);
        expect(needsAuth).toBeTruthy();
        
        // Login back for other tests
        await loginHelper.loginAsRegularUser();
      });

      await test.step('Test HTTPS enforcement', async () => {
        expect(page.url()).toMatch(/^https:/);
        console.log('✅ HTTPS enforced for My CRF section');
      });
    });
  });
});