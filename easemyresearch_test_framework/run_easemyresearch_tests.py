#!/usr/bin/env python3
"""
Comprehensive Test Runner for EaseMyResearch.com
Executes all functional and non-functional tests with detailed reporting
"""

import os
import sys
import argparse
import subprocess
import json
import time
from datetime import datetime
from pathlib import Path

# Add project root to Python path
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

def print_banner():
    """Print test execution banner"""
    banner = """
    ╔════════════════════════════════════════════════════════════════╗
    ║              EaseMyResearch.com Test Suite                     ║
    ║           Comprehensive Testing Framework                      ║
    ╚════════════════════════════════════════════════════════════════╝
    """
    print(banner)

def run_test_suite(test_type, browser="chrome", environment="production", verbose=True):
    """
    Run specific test suite
    
    Args:
        test_type: Type of tests to run (functional, performance, accessibility, all)
        browser: Browser to use for testing
        environment: Environment to test against
        verbose: Enable verbose output
    """
    
    # Set environment variables
    os.environ["BROWSER"] = browser
    os.environ["ENVIRONMENT"] = environment
    os.environ["BASE_URL"] = "https://easemyresearch.com/"
    
    # Test configurations
    test_configs = {
        "functional": {
            "name": "Functional Tests",
            "paths": [
                "tests/functional/ui_tests/test_homepage_comprehensive.py",
                "tests/functional/ui_tests/test_homepage.py",
                "tests/functional/ui_tests/test_login.py"
            ],
            "markers": "functional",
            "description": "Testing all links, pages, navigation, forms, and user interactions"
        },
        "performance": {
            "name": "Performance Tests", 
            "paths": [
                "tests/non_functional/performance/test_homepage_performance.py",
                "tests/non_functional/performance/test_load_testing.py"
            ],
            "markers": "performance",
            "description": "Testing page load times, resource optimization, and scalability"
        },
        "accessibility": {
            "name": "Accessibility Tests",
            "paths": [
                "tests/non_functional/accessibility/test_homepage_accessibility.py",
                "tests/non_functional/accessibility/test_accessibility.py"
            ],
            "markers": "accessibility", 
            "description": "Testing WCAG compliance, keyboard navigation, and screen reader compatibility"
        },
        "security": {
            "name": "Security Tests",
            "paths": [
                "tests/non_functional/security/test_security.py"
            ],
            "markers": "security",
            "description": "Testing for common security vulnerabilities"
        }
    }
    
    results = {}
    
    if test_type == "all":
        test_types_to_run = list(test_configs.keys())
    else:
        test_types_to_run = [test_type] if test_type in test_configs else []
    
    if not test_types_to_run:
        print(f"❌ Invalid test type: {test_type}")
        print(f"Available types: {', '.join(test_configs.keys())}, all")
        return results
    
    print(f"\n🎯 Testing EaseMyResearch.com")
    print(f"   URL: https://easemyresearch.com/")
    print(f"   Browser: {browser.title()}")
    print(f"   Environment: {environment.title()}")
    print(f"   Test Types: {', '.join(test_types_to_run)}")
    print(f"   Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Create reports directory
    reports_dir = project_root / "reports"
    reports_dir.mkdir(exist_ok=True)
    
    for test_category in test_types_to_run:
        config = test_configs[test_category]
        print(f"\n{'='*70}")
        print(f"🧪 Running {config['name']}")
        print(f"📋 {config['description']}")
        print(f"{'='*70}")
        
        # Find existing test files
        existing_paths = []
        for path in config['paths']:
            full_path = project_root / path
            if full_path.exists():
                existing_paths.append(str(full_path))
            else:
                print(f"⚠️ Test file not found: {path}")
        
        if not existing_paths:
            print(f"❌ No test files found for {config['name']}")
            results[test_category] = {"status": "skipped", "reason": "no test files"}
            continue
        
        # Build pytest command
        cmd = [
            "python", "-m", "pytest",
            *existing_paths,
            "-v" if verbose else "-q",
            f"--tb=short",
            f"--junit-xml=reports/{test_category}_results.xml",
            f"--html=reports/{test_category}_report.html",
            "--self-contained-html",
            f"-m", config['markers']
        ]
        
        # Add browser-specific options
        if browser == "chrome":
            cmd.extend(["--browser", "chrome"])
        elif browser == "firefox":
            cmd.extend(["--browser", "firefox"])
        
        print(f"🔧 Command: {' '.join(cmd)}")
        
        try:
            start_time = time.time()
            result = subprocess.run(
                cmd,
                cwd=project_root,
                capture_output=True,
                text=True,
                timeout=1800  # 30 minute timeout
            )
            execution_time = time.time() - start_time
            
            # Parse results
            results[test_category] = {
                "status": "passed" if result.returncode == 0 else "failed",
                "execution_time": execution_time,
                "return_code": result.returncode,
                "stdout": result.stdout,
                "stderr": result.stderr
            }
            
            # Print results
            if result.returncode == 0:
                print(f"✅ {config['name']} completed successfully")
            else:
                print(f"❌ {config['name']} failed with return code {result.returncode}")
            
            print(f"⏱️ Execution time: {execution_time:.2f} seconds")
            
            if verbose and result.stdout:
                print(f"\n📋 Test Output:")
                print(result.stdout)
            
            if result.stderr:
                print(f"\n⚠️ Errors/Warnings:")
                print(result.stderr)
                
        except subprocess.TimeoutExpired:
            print(f"⏰ {config['name']} timed out after 30 minutes")
            results[test_category] = {
                "status": "timeout",
                "execution_time": 1800,
                "return_code": -1
            }
        except Exception as e:
            print(f"❌ Error running {config['name']}: {e}")
            results[test_category] = {
                "status": "error",
                "error": str(e)
            }
    
    return results

def generate_summary_report(results, browser, environment):
    """Generate comprehensive summary report"""
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    
    # Generate JSON report
    json_report = {
        "execution_summary": {
            "timestamp": datetime.now().isoformat(),
            "url_tested": "https://easemyresearch.com/",
            "browser": browser,
            "environment": environment,
            "total_test_suites": len(results),
            "passed_suites": len([r for r in results.values() if r.get("status") == "passed"]),
            "failed_suites": len([r for r in results.values() if r.get("status") == "failed"]),
            "total_execution_time": sum([r.get("execution_time", 0) for r in results.values()])
        },
        "test_results": results
    }
    
    json_file = f"reports/easemyresearch_test_summary_{timestamp}.json"
    with open(json_file, 'w') as f:
        json.dump(json_report, f, indent=2)
    
    # Generate HTML summary report
    html_report = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <title>EaseMyResearch.com Test Results - {timestamp}</title>
        <style>
            body {{ font-family: Arial, sans-serif; margin: 20px; }}
            .header {{ background: #2c3e50; color: white; padding: 20px; border-radius: 5px; }}
            .summary {{ background: #ecf0f1; padding: 15px; margin: 20px 0; border-radius: 5px; }}
            .test-suite {{ margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }}
            .passed {{ border-left: 5px solid #27ae60; }}
            .failed {{ border-left: 5px solid #e74c3c; }}
            .skipped {{ border-left: 5px solid #f39c12; }}
            .error {{ border-left: 5px solid #8e44ad; }}
            .metrics {{ display: flex; justify-content: space-around; }}
            .metric {{ text-align: center; }}
            .metric h3 {{ margin: 0; color: #2c3e50; }}
            .metric p {{ font-size: 24px; font-weight: bold; margin: 5px 0; }}
        </style>
    </head>
    <body>
        <div class="header">
            <h1>🧪 EaseMyResearch.com Test Results</h1>
            <p>Comprehensive Testing Report - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
            <p><strong>URL:</strong> https://easemyresearch.com/ | <strong>Browser:</strong> {browser.title()} | <strong>Environment:</strong> {environment.title()}</p>
        </div>
        
        <div class="summary">
            <h2>📊 Execution Summary</h2>
            <div class="metrics">
                <div class="metric">
                    <h3>Total Suites</h3>
                    <p>{json_report['execution_summary']['total_test_suites']}</p>
                </div>
                <div class="metric">
                    <h3>Passed</h3>
                    <p style="color: #27ae60;">{json_report['execution_summary']['passed_suites']}</p>
                </div>
                <div class="metric">
                    <h3>Failed</h3>
                    <p style="color: #e74c3c;">{json_report['execution_summary']['failed_suites']}</p>
                </div>
                <div class="metric">
                    <h3>Total Time</h3>
                    <p>{json_report['execution_summary']['total_execution_time']:.2f}s</p>
                </div>
            </div>
        </div>
        
        <h2>🔍 Detailed Results</h2>
    """
    
    for test_type, result in results.items():
        status = result.get("status", "unknown")
        execution_time = result.get("execution_time", 0)
        
        status_icon = {
            "passed": "✅",
            "failed": "❌", 
            "skipped": "⚪",
            "error": "🔴",
            "timeout": "⏰"
        }.get(status, "❓")
        
        html_report += f"""
        <div class="test-suite {status}">
            <h3>{status_icon} {test_type.title()} Tests</h3>
            <p><strong>Status:</strong> {status.title()}</p>
            <p><strong>Execution Time:</strong> {execution_time:.2f} seconds</p>
            {f'<p><strong>Return Code:</strong> {result.get("return_code", "N/A")}</p>' if "return_code" in result else ''}
            {f'<p><strong>Error:</strong> {result.get("error", "")}</p>' if result.get("error") else ''}
        </div>
        """
    
    html_report += """
        <div class="summary">
            <h3>📁 Generated Reports</h3>
            <ul>
                <li>JSON Summary: """ + json_file + """</li>
                <li>Individual XML reports: reports/*_results.xml</li>
                <li>Individual HTML reports: reports/*_report.html</li>
            </ul>
        </div>
        
        <div class="summary">
            <h3>🔗 Useful Links</h3>
            <ul>
                <li><a href="https://easemyresearch.com/" target="_blank">EaseMyResearch.com</a></li>
                <li><a href="https://github.com/your-repo/easemyresearch-tests" target="_blank">Test Framework Repository</a></li>
            </ul>
        </div>
    </body>
    </html>
    """
    
    html_file = f"reports/easemyresearch_test_summary_{timestamp}.html"
    with open(html_file, 'w') as f:
        f.write(html_report)
    
    # Print summary
    print(f"\n{'='*70}")
    print(f"📊 FINAL TEST EXECUTION SUMMARY")
    print(f"{'='*70}")
    print(f"🌐 Website Tested: https://easemyresearch.com/")
    print(f"🕐 Execution Time: {json_report['execution_summary']['total_execution_time']:.2f} seconds")
    print(f"📋 Total Test Suites: {json_report['execution_summary']['total_test_suites']}")
    print(f"✅ Passed: {json_report['execution_summary']['passed_suites']}")
    print(f"❌ Failed: {json_report['execution_summary']['failed_suites']}")
    print(f"\n📁 Reports Generated:")
    print(f"   📄 HTML Summary: {html_file}")
    print(f"   📊 JSON Summary: {json_file}")
    print(f"   📁 Individual Reports: reports/")
    
    return json_report

def main():
    """Main function to run the test suite"""
    
    parser = argparse.ArgumentParser(
        description="Comprehensive Test Runner for EaseMyResearch.com",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Run all tests with Chrome
  python run_easemyresearch_tests.py --test-type all --browser chrome
  
  # Run only functional tests
  python run_easemyresearch_tests.py --test-type functional
  
  # Run performance tests with Firefox
  python run_easemyresearch_tests.py --test-type performance --browser firefox
  
  # Quick run (less verbose)
  python run_easemyresearch_tests.py --test-type functional --quiet
        """
    )
    
    parser.add_argument(
        "--test-type",
        choices=["functional", "performance", "accessibility", "security", "all"],
        default="all",
        help="Type of tests to run (default: all)"
    )
    
    parser.add_argument(
        "--browser",
        choices=["chrome", "firefox", "edge", "safari"],
        default="chrome",
        help="Browser to use for testing (default: chrome)"
    )
    
    parser.add_argument(
        "--environment",
        choices=["development", "staging", "qa", "production"],
        default="production",
        help="Environment to test against (default: production)"
    )
    
    parser.add_argument(
        "--quiet",
        action="store_true",
        help="Reduce output verbosity"
    )
    
    parser.add_argument(
        "--no-report",
        action="store_true",
        help="Skip generating summary report"
    )
    
    args = parser.parse_args()
    
    # Print banner
    print_banner()
    
    # Run tests
    try:
        results = run_test_suite(
            test_type=args.test_type,
            browser=args.browser,
            environment=args.environment,
            verbose=not args.quiet
        )
        
        # Generate reports
        if not args.no_report:
            generate_summary_report(results, args.browser, args.environment)
        
        # Exit with appropriate code
        failed_tests = [k for k, v in results.items() if v.get("status") not in ["passed", "skipped"]]
        if failed_tests:
            print(f"\n❌ Some tests failed: {', '.join(failed_tests)}")
            sys.exit(1)
        else:
            print(f"\n✅ All tests completed successfully!")
            sys.exit(0)
            
    except KeyboardInterrupt:
        print(f"\n⏹️ Test execution interrupted by user")
        sys.exit(130)
    except Exception as e:
        print(f"\n💥 Unexpected error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()