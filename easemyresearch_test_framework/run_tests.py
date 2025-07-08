#!/usr/bin/env python3
"""Main test runner script for EaseMyResearch test framework"""

import os
import sys
import click
import subprocess
from datetime import datetime

@click.command()
@click.option('--environment', '-e', default='development', 
              help='Test environment (development, staging, qa, production, local)')
@click.option('--browser', '-b', default='chrome',
              help='Browser to use (chrome, firefox, edge, safari)')
@click.option('--headless', is_flag=True, default=False,
              help='Run tests in headless mode')
@click.option('--test-type', '-t', default='all',
              help='Type of tests to run (smoke, functional, api, performance, security, accessibility, all)')
@click.option('--parallel', '-p', default=4,
              help='Number of parallel workers')
@click.option('--output-dir', '-o', default='reports',
              help='Output directory for reports')
@click.option('--verbose', '-v', is_flag=True, default=False,
              help='Verbose output')
def run_tests(environment, browser, headless, test_type, parallel, output_dir, verbose):
    """Run EaseMyResearch test suite"""
    
    # Ensure output directory exists
    os.makedirs(output_dir, exist_ok=True)
    
    # Build pytest command
    cmd = [
        'python', '-m', 'pytest',
        f'--environment={environment}',
        f'--browser={browser}',
        f'--html={output_dir}/test_report.html',
        f'--junitxml={output_dir}/junit.xml',
        '--self-contained-html'
    ]
    
    if headless:
        cmd.append('--headless')
    
    if verbose:
        cmd.extend(['-v', '--tb=short'])
    
    if parallel > 1:
        cmd.extend(['-n', str(parallel)])
    
    # Add test markers based on test type
    if test_type != 'all':
        cmd.extend(['-m', test_type])
    
    # Add coverage if running all tests
    if test_type == 'all':
        cmd.extend([
            '--cov=.',
            f'--cov-report=html:{output_dir}/coverage',
            '--cov-report=term-missing'
        ])
    
    print(f"Running tests with command: {' '.join(cmd)}")
    print(f"Environment: {environment}")
    print(f"Browser: {browser}")
    print(f"Test Type: {test_type}")
    print(f"Output Directory: {output_dir}")
    print("-" * 50)
    
    try:
        result = subprocess.run(cmd, check=False)
        return result.returncode
    except KeyboardInterrupt:
        print("\nTests interrupted by user")
        return 1
    except Exception as e:
        print(f"Error running tests: {e}")
        return 1

@click.group()
def cli():
    """EaseMyResearch Test Framework CLI"""
    pass

@cli.command()
@click.option('--environment', '-e', default='development')
def smoke_tests(environment):
    """Run smoke tests only"""
    cmd = [
        'python', '-m', 'pytest',
        f'--environment={environment}',
        '-m', 'smoke',
        '--tb=short'
    ]
    subprocess.run(cmd)

@cli.command()
@click.option('--users', '-u', default=100, help='Number of concurrent users')
@click.option('--duration', '-d', default='5m', help='Test duration')
def performance_tests(users, duration):
    """Run performance tests with Locust"""
    cmd = [
        'locust',
        '-f', 'tests/non_functional/performance/test_load_performance.py',
        '--users', str(users),
        '--spawn-rate', str(users // 10),
        '--run-time', duration,
        '--html', 'reports/performance_report.html'
    ]
    subprocess.run(cmd)

@cli.command()
def security_tests():
    """Run security tests"""
    cmd = [
        'python', '-m', 'pytest',
        '-m', 'security',
        '--tb=short'
    ]
    subprocess.run(cmd)

@cli.command()
def install_dependencies():
    """Install required dependencies"""
    cmd = ['pip', 'install', '-r', 'requirements.txt']
    subprocess.run(cmd)

if __name__ == '__main__':
    cli()
