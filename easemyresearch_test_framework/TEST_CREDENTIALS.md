# Test Credentials for EaseMyResearch Testing

## Active Test User Accounts

### Test User One
- **Email**: `testoneemr@gmail.com`
- **Password**: `12345678`
- **Role**: Researcher
- **Department**: Computer Science
- **Institution**: Test University

### Test User Two  
- **Email**: `testtwoemr@gmail.com`
- **Password**: `12345678`
- **Role**: Researcher
- **Department**: Biology
- **Institution**: Test University

## Usage in Tests

### Configuration Files
These credentials are configured in the following files:
- `config/test_data.json` - Main test data configuration
- `fixtures/test_users.json` - Test user fixtures
- `config/environments.yaml` - Environment-specific credentials

### Code Examples

#### Using in API Tests
```python
def test_login_with_test_user_one(self, api_client, test_data):
    user = test_data['test_users']['valid_users'][0]  # testoneemr@gmail.com
    response = api_client.login(user['email'], user['password'])
    assert response.status_code == 200

def test_login_with_test_user_two(self, api_client, test_data):
    user = test_data['test_users']['valid_users'][1]  # testtwoemr@gmail.com
    response = api_client.login(user['email'], user['password'])
    assert response.status_code == 200
```

#### Using in UI Tests
```python
def test_ui_login_user_one(self, driver, base_url, test_data):
    login_page = LoginPage(driver, base_url)
    login_page.navigate_to_login()
    
    user = test_data['test_users']['valid_users'][0]
    login_page.login(user['email'], user['password'])
    
    assert login_page.is_login_successful()
```

#### Using TestDataManager
```python
def test_with_data_manager(self, test_data_manager):
    user_one = test_data_manager.get_valid_user('user_one')
    user_two = test_data_manager.get_valid_user('user_two')
    
    assert user_one['email'] == 'testoneemr@gmail.com'
    assert user_two['email'] == 'testtwoemr@gmail.com'
```

## Environment Variables (Production)

For production testing, set these environment variables for security:

```bash
export PROD_TEST_USER_ONE="testoneemr@gmail.com"
export PROD_TEST_PASSWORD_ONE="12345678"
export PROD_TEST_USER_TWO="testtwoemr@gmail.com"  
export PROD_TEST_PASSWORD_TWO="12345678"
```

## Security Notes

⚠️ **Important**: 
- These credentials are for testing purposes only
- Do not use these credentials in production systems
- Ensure test accounts have limited privileges
- Consider using different credentials for different environments

## Test Account Preparation

Before running tests, ensure these accounts are:
1. ✅ Created in the target environment
2. ✅ Verified/activated if required
3. ✅ Have appropriate permissions for testing
4. ✅ Not used for other purposes

## Troubleshooting

### Common Issues
- **Account locked**: Check if accounts are locked due to failed login attempts
- **Password expired**: Verify passwords haven't expired
- **Environment mismatch**: Ensure accounts exist in the target environment
- **Permission issues**: Verify accounts have necessary permissions for test operations

### Reset Instructions
If accounts need to be reset:
1. Contact system administrator
2. Reset password through application (if available)
3. Update configuration files with new credentials
4. Re-run test suite to verify functionality