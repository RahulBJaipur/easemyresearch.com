# EaseMyResearch Test Framework

A comprehensive automated testing framework for https://easemyresearch.com/ supporting both functional and non-functional testing.

## Features

- **Functional Testing**: UI automation, API testing, integration testing
- **Non-Functional Testing**: Performance, security, accessibility testing
- **Cross-browser Support**: Chrome, Firefox, Edge, Safari
- **Multi-environment Support**: Development, staging, QA, production
- **Parallel Execution**: Run tests concurrently for faster execution
- **Detailed Reporting**: HTML reports with screenshots and metrics

## Quick Start

1. **Install dependencies:**
```bash
pip install -r requirements.txt
```

2. **Run smoke tests:**
```bash
python run_tests.py --test-type smoke --environment development
```

3. **Run all tests:**
```bash
python run_tests.py --environment staging --browser chrome
```

## Test Types

### Functional Tests
- **UI Tests**: Homepage, login, search, navigation
- **API Tests**: Authentication, search, user management
- **Integration Tests**: End-to-end workflows

### Non-Functional Tests
- **Performance**: Load, stress, volume testing
- **Security**: SQL injection, XSS, authentication security
- **Accessibility**: WCAG compliance, keyboard navigation
- **Compatibility**: Cross-browser, mobile responsiveness

## Configuration

### Environment Setup
Edit `config/environments.yaml`:
```yaml
environments:
  development:
    app:
      base_url: "https://dev.easemyresearch.com"
      api_base_url: "https://dev.easemyresearch.com/api"
```

### Test Data
Update `config/test_data.json` with test users and data.

**Active Test Credentials:**
- User 1: `testoneemr@gmail.com` / `12345678`
- User 2: `testtwoemr@gmail.com` / `12345678`

See `TEST_CREDENTIALS.md` for detailed usage instructions.

## Running Tests

### Command Line Options
```bash
python run_tests.py [OPTIONS]

Options:
  --environment    Test environment (development, staging, qa, production)
  --browser        Browser (chrome, firefox, edge, safari)
  --headless       Run in headless mode
  --test-type      Type of tests (smoke, functional, api, performance, security, all)
  --parallel       Number of parallel workers (default: 4)
  --verbose        Verbose output
```

### Examples
```bash
# Smoke tests in production
python run_tests.py --test-type smoke --environment production --headless

# Performance tests
python run_tests.py performance-tests --users 100 --duration 5m

# Security tests
python run_tests.py security-tests

# API tests only
pytest -m api --environment staging

# UI tests in Firefox
pytest tests/functional/ui_tests/ --browser firefox
```

## Reports

Reports are generated in the `reports/` directory:
- `test_report.html`: Main test execution report
- `coverage/`: Code coverage reports
- `performance_report.html`: Performance test results
- `screenshots/`: Failure screenshots

## Framework Structure

```
easemyresearch_test_framework/
├── config/                 # Configuration files
├── tests/                  # Test files
│   ├── functional/        # Functional tests
│   └── non_functional/    # Non-functional tests
├── utilities/             # Utility classes
├── page_objects/          # Page object models
├── fixtures/              # Test data fixtures
├── reports/               # Test reports
└── logs/                  # Log files
```

## CI/CD Integration

### GitHub Actions
```yaml
- name: Run Tests
  run: |
    cd easemyresearch_test_framework
    python run_tests.py --test-type smoke --headless
```

### Jenkins
```groovy
sh 'cd easemyresearch_test_framework && python run_tests.py --environment staging'
```

## Best Practices

1. **Test Organization**: Group related tests, use descriptive names
2. **Page Objects**: Maintain separation between test logic and UI structure
3. **Data Management**: Use external test data, implement cleanup
4. **Error Handling**: Capture screenshots, meaningful assertions

## Troubleshooting

**Driver Issues:**
```bash
rm -rf ~/.wdm/  # Clear driver cache
pip install --upgrade webdriver-manager
```

**Dependencies:**
```bash
pip install --upgrade -r requirements.txt
```

**Debug Mode:**
```bash
pytest --capture=no --log-cli-level=DEBUG -v
```

## Contributing

1. Fork the repository
2. Create feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit pull request

Follow PEP 8 guidelines and add proper documentation.
