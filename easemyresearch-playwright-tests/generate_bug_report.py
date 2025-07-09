#!/usr/bin/env python3
"""
Bug Report Generator for EaseMyResearch.com Test Suite
Analyzes test results and generates comprehensive Excel bug reports
"""

import json
import xlsxwriter
import os
from datetime import datetime

def analyze_test_results(json_file):
    """Analyze test results JSON and extract bugs/issues"""
    
    try:
        with open(json_file, 'r') as f:
            data = json.load(f)
    except FileNotFoundError:
        print(f"Test results file {json_file} not found")
        return []
    
    bugs = []
    
    # Analyze test suites
    for suite in data.get('suites', []):
        bugs.extend(analyze_suite(suite))
    
    return bugs

def analyze_suite(suite):
    """Analyze a test suite for bugs and issues"""
    bugs = []
    
    # Check nested suites
    for nested_suite in suite.get('suites', []):
        bugs.extend(analyze_suite(nested_suite))
    
    # Check specs in this suite
    for spec in suite.get('specs', []):
        bugs.extend(analyze_spec(spec, suite.get('title', '')))
    
    return bugs

def analyze_spec(spec, suite_title):
    """Analyze a test spec for bugs and issues"""
    bugs = []
    
    for test in spec.get('tests', []):
        for result in test.get('results', []):
            # Check for failed tests
            if result.get('status') == 'failed':
                bugs.append({
                    'id': f"BUG-{len(bugs)+1:03d}",
                    'title': spec.get('title', ''),
                    'suite': suite_title,
                    'severity': 'High',
                    'status': 'Open',
                    'description': f"Test failed: {spec.get('title', '')}",
                    'steps': extract_steps_from_result(result),
                    'expected': 'Test should pass successfully',
                    'actual': result.get('errors', [{}])[0].get('message', 'Test failed') if result.get('errors') else 'Test failed',
                    'browser': test.get('projectName', 'chromium'),
                    'environment': 'https://easemyresearch.com',
                    'timestamp': result.get('startTime', ''),
                    'duration': result.get('duration', 0),
                    'screenshot': 'Not captured',
                    'logs': '\n'.join([log.get('text', '') for log in result.get('stdout', [])])
                })
            
            # Check for specific issues in logs
            bugs.extend(analyze_logs_for_issues(result, spec, suite_title))
    
    return bugs

def analyze_logs_for_issues(result, spec, suite_title):
    """Analyze test logs for specific issues and bugs"""
    bugs = []
    
    logs = result.get('stdout', [])
    log_text = '\n'.join([log.get('text', '') for log in logs])
    
    # Look for specific issues
    issues = []
    
    # Missing semantic elements
    if 'Header=false' in log_text:
        issues.append({
            'type': 'Accessibility',
            'description': 'Missing semantic header element',
            'severity': 'Medium',
            'pattern': 'Header=false'
        })
    
    if 'Main=false' in log_text:
        issues.append({
            'type': 'Accessibility', 
            'description': 'Missing semantic main element',
            'severity': 'Medium',
            'pattern': 'Main=false'
        })
    
    # Broken links
    if 'Problematic links:' in log_text:
        issues.append({
            'type': 'Functional',
            'description': 'Broken or problematic links detected',
            'severity': 'High',
            'pattern': 'Problematic links:'
        })
    
    # Login failures
    if 'Login test for' in log_text and 'Failed/Not Available' in log_text:
        issues.append({
            'type': 'Authentication',
            'description': 'Login functionality not working with provided credentials',
            'severity': 'High',
            'pattern': 'Failed/Not Available'
        })
    
    # Button interaction issues
    if 'Total clickable buttons: 0' in log_text:
        issues.append({
            'type': 'Usability',
            'description': 'No clickable buttons detected on page',
            'severity': 'Medium',
            'pattern': 'Total clickable buttons: 0'
        })
    
    # Missing registration functionality
    if 'Register: false' in log_text:
        issues.append({
            'type': 'Functional',
            'description': 'No registration functionality found',
            'severity': 'Medium',
            'pattern': 'Register: false'
        })
    
    # Form detection issues
    if 'Login link found but form not detected' in log_text:
        issues.append({
            'type': 'Functional',
            'description': 'Login link present but form not accessible',
            'severity': 'High',
            'pattern': 'form not detected'
        })
    
    # Convert issues to bug reports
    for issue in issues:
        bugs.append({
            'id': f"ISSUE-{len(bugs)+1:03d}",
            'title': issue['description'],
            'suite': suite_title,
            'severity': issue['severity'],
            'status': 'Open',
            'description': f"{issue['type']} Issue: {issue['description']}",
            'steps': extract_reproduction_steps(issue, log_text),
            'expected': get_expected_behavior(issue),
            'actual': extract_actual_behavior(issue, log_text),
            'browser': result.get('projectName', 'chromium'),
            'environment': 'https://easemyresearch.com',
            'timestamp': result.get('startTime', ''),
            'duration': result.get('duration', 0),
            'screenshot': 'Available on failure',
            'logs': log_text
        })
    
    return bugs

def extract_steps_from_result(result):
    """Extract test steps from result"""
    steps = []
    for step in result.get('steps', []):
        steps.append(f"Step: {step.get('title', 'Unknown step')}")
    return '\n'.join(steps)

def extract_reproduction_steps(issue, log_text):
    """Extract reproduction steps for an issue"""
    steps = [
        "1. Open browser and navigate to https://easemyresearch.com",
        "2. Wait for page to load completely"
    ]
    
    if issue['type'] == 'Accessibility':
        steps.extend([
            "3. Inspect page source or use accessibility tools",
            "4. Check for semantic HTML elements (header, main, footer)"
        ])
    elif issue['type'] == 'Functional':
        if 'link' in issue['description'].lower():
            steps.extend([
                "3. Check all links on the page",
                "4. Click on each link to verify functionality"
            ])
        elif 'login' in issue['description'].lower():
            steps.extend([
                "3. Look for login link or button",
                "4. Click on login link",
                "5. Check if login form is accessible"
            ])
    elif issue['type'] == 'Authentication':
        steps.extend([
            "3. Navigate to login page",
            "4. Enter credentials: testoneemr@gmail.com / 12345678",
            "5. Attempt to login",
            "6. Verify login success/failure"
        ])
    elif issue['type'] == 'Usability':
        steps.extend([
            "3. Scan page for interactive elements",
            "4. Test clickability of buttons and links",
            "5. Verify user interface responsiveness"
        ])
    
    return '\n'.join(steps)

def get_expected_behavior(issue):
    """Get expected behavior for an issue"""
    expectations = {
        'Accessibility': 'Page should have proper semantic HTML structure with header, main, and footer elements',
        'Functional': 'All links should work properly and lead to valid destinations',
        'Authentication': 'Login should work with provided valid credentials',
        'Usability': 'Page should have interactive elements that users can click and interact with'
    }
    return expectations.get(issue['type'], 'Feature should work as expected')

def extract_actual_behavior(issue, log_text):
    """Extract actual behavior from logs"""
    if issue['pattern'] in log_text:
        lines = log_text.split('\n')
        for line in lines:
            if issue['pattern'] in line:
                return line.strip()
    return f"Issue detected: {issue['description']}"

def create_excel_report(bugs, filename='EaseMyResearch_Bug_Report.xlsx'):
    """Create Excel report with bug details"""
    
    # Create workbook and worksheet
    workbook = xlsxwriter.Workbook(filename)
    
    # Create formats
    header_format = workbook.add_format({
        'bold': True,
        'font_size': 12,
        'bg_color': '#D7E4BC',
        'border': 1,
        'align': 'center',
        'valign': 'vcenter'
    })
    
    critical_format = workbook.add_format({
        'bg_color': '#FFE6E6',
        'border': 1,
        'text_wrap': True,
        'valign': 'top'
    })
    
    high_format = workbook.add_format({
        'bg_color': '#FFF2E6',
        'border': 1,
        'text_wrap': True,
        'valign': 'top'
    })
    
    medium_format = workbook.add_format({
        'bg_color': '#FFFACD',
        'border': 1,
        'text_wrap': True,
        'valign': 'top'
    })
    
    low_format = workbook.add_format({
        'bg_color': '#F0F8FF',
        'border': 1,
        'text_wrap': True,
        'valign': 'top'
    })
    
    # Create main bug report worksheet
    worksheet = workbook.add_worksheet('Bug Report')
    
    # Define columns
    columns = [
        {'header': 'Bug ID', 'width': 15},
        {'header': 'Title', 'width': 40},
        {'header': 'Test Suite', 'width': 30},
        {'header': 'Severity', 'width': 12},
        {'header': 'Status', 'width': 12},
        {'header': 'Description', 'width': 50},
        {'header': 'Steps to Reproduce', 'width': 60},
        {'header': 'Expected Result', 'width': 40},
        {'header': 'Actual Result', 'width': 40},
        {'header': 'Browser', 'width': 15},
        {'header': 'Environment', 'width': 25},
        {'header': 'Timestamp', 'width': 20},
        {'header': 'Duration (ms)', 'width': 15},
        {'header': 'Screenshot', 'width': 20},
        {'header': 'Logs', 'width': 80}
    ]
    
    # Write headers
    for col_num, column in enumerate(columns):
        worksheet.write(0, col_num, column['header'], header_format)
        worksheet.set_column(col_num, col_num, column['width'])
    
    # Write bug data
    for row_num, bug in enumerate(bugs, 1):
        # Choose format based on severity
        severity_formats = {
            'Critical': critical_format,
            'High': high_format,
            'Medium': medium_format,
            'Low': low_format
        }
        row_format = severity_formats.get(bug['severity'], medium_format)
        
        worksheet.write(row_num, 0, bug['id'], row_format)
        worksheet.write(row_num, 1, bug['title'], row_format)
        worksheet.write(row_num, 2, bug['suite'], row_format)
        worksheet.write(row_num, 3, bug['severity'], row_format)
        worksheet.write(row_num, 4, bug['status'], row_format)
        worksheet.write(row_num, 5, bug['description'], row_format)
        worksheet.write(row_num, 6, bug['steps'], row_format)
        worksheet.write(row_num, 7, bug['expected'], row_format)
        worksheet.write(row_num, 8, bug['actual'], row_format)
        worksheet.write(row_num, 9, bug['browser'], row_format)
        worksheet.write(row_num, 10, bug['environment'], row_format)
        worksheet.write(row_num, 11, bug['timestamp'], row_format)
        worksheet.write(row_num, 12, bug['duration'], row_format)
        worksheet.write(row_num, 13, bug['screenshot'], row_format)
        worksheet.write(row_num, 14, bug['logs'], row_format)
    
    # Create summary worksheet
    summary_ws = workbook.add_worksheet('Summary')
    
    # Summary data
    total_bugs = len(bugs)
    severity_counts = {}
    for bug in bugs:
        severity_counts[bug['severity']] = severity_counts.get(bug['severity'], 0) + 1
    
    # Write summary
    summary_ws.write(0, 0, 'EaseMyResearch.com Test Results Summary', header_format)
    summary_ws.write(2, 0, 'Total Bugs Found:', header_format)
    summary_ws.write(2, 1, total_bugs, medium_format)
    
    row = 4
    summary_ws.write(row, 0, 'Severity Breakdown:', header_format)
    row += 1
    for severity, count in severity_counts.items():
        summary_ws.write(row, 0, f'{severity}:', medium_format)
        summary_ws.write(row, 1, count, medium_format)
        row += 1
    
    # Test execution summary
    row += 2
    summary_ws.write(row, 0, 'Test Execution Details:', header_format)
    row += 1
    summary_ws.write(row, 0, 'Website Tested:', medium_format)
    summary_ws.write(row, 1, 'https://easemyresearch.com', medium_format)
    row += 1
    summary_ws.write(row, 0, 'Test Framework:', medium_format)
    summary_ws.write(row, 1, 'Playwright + TypeScript', medium_format)
    row += 1
    summary_ws.write(row, 0, 'Browser:', medium_format)
    summary_ws.write(row, 1, 'Chromium', medium_format)
    row += 1
    summary_ws.write(row, 0, 'Generated On:', medium_format)
    summary_ws.write(row, 1, datetime.now().strftime('%Y-%m-%d %H:%M:%S'), medium_format)
    
    # Set column widths for summary
    summary_ws.set_column(0, 0, 25)
    summary_ws.set_column(1, 1, 30)
    
    workbook.close()
    print(f"Excel report created: {filename}")

def main():
    """Main function to generate bug report"""
    print("🔍 Analyzing test results...")
    
    # Analyze functional test results
    functional_bugs = analyze_test_results('test-results-simple.json')
    print(f"Found {len(functional_bugs)} issues in functional tests")
    
    # Analyze negative test results
    negative_bugs = analyze_test_results('negative-results.json')
    print(f"Found {len(negative_bugs)} issues in negative tests")
    
    # Combine all bugs
    all_bugs = functional_bugs + negative_bugs
    
    # Create Excel report
    print("📊 Creating Excel report...")
    create_excel_report(all_bugs)
    
    print(f"✅ Bug report complete! Found {len(all_bugs)} total issues")
    
    # Print summary
    print("\n📋 Bug Summary:")
    severity_counts = {}
    for bug in all_bugs:
        severity_counts[bug['severity']] = severity_counts.get(bug['severity'], 0) + 1
    
    for severity, count in sorted(severity_counts.items()):
        print(f"  {severity}: {count}")

if __name__ == "__main__":
    main()