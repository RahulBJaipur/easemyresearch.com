#!/usr/bin/env python3
"""
Validation script to verify test credentials configuration
"""

import json
import yaml
import sys
import os

def load_test_data():
    """Load test data configuration"""
    try:
        with open('config/test_data.json', 'r') as f:
            return json.load(f)
    except Exception as e:
        print(f"❌ Error loading test_data.json: {e}")
        return None

def load_fixtures():
    """Load test user fixtures"""
    try:
        with open('fixtures/test_users.json', 'r') as f:
            return json.load(f)
    except Exception as e:
        print(f"❌ Error loading test_users.json: {e}")
        return None

def load_environments():
    """Load environment configuration"""
    try:
        with open('config/environments.yaml', 'r') as f:
            return yaml.safe_load(f)
    except Exception as e:
        print(f"❌ Error loading environments.yaml: {e}")
        return None

def validate_credentials():
    """Validate that all credential configurations are consistent"""
    print("🔍 Validating Test Credentials Configuration...\n")
    
    # Expected credentials
    expected_users = [
        {'email': 'testoneemr@gmail.com', 'password': '12345678'},
        {'email': 'testtwoemr@gmail.com', 'password': '12345678'}
    ]
    
    success = True
    
    # Check test_data.json
    print("📋 Checking config/test_data.json...")
    test_data = load_test_data()
    if test_data:
        valid_users = test_data.get('test_users', {}).get('valid_users', [])
        if len(valid_users) >= 2:
            for i, expected in enumerate(expected_users):
                if i < len(valid_users):
                    user = valid_users[i]
                    if user['email'] == expected['email'] and user['password'] == expected['password']:
                        print(f"  ✅ User {i+1}: {user['email']} - Configured correctly")
                    else:
                        print(f"  ❌ User {i+1}: Expected {expected['email']}, found {user.get('email', 'N/A')}")
                        success = False
                else:
                    print(f"  ❌ User {i+1}: Missing in configuration")
                    success = False
        else:
            print("  ❌ Insufficient valid users configured")
            success = False
    else:
        success = False
    
    # Check fixtures/test_users.json
    print("\n📋 Checking fixtures/test_users.json...")
    fixtures = load_fixtures()
    if fixtures:
        valid_users = fixtures.get('valid_users', [])
        if len(valid_users) >= 2:
            for i, expected in enumerate(expected_users):
                if i < len(valid_users):
                    user = valid_users[i]
                    if user['email'] == expected['email'] and user['password'] == expected['password']:
                        print(f"  ✅ User {i+1}: {user['email']} - Configured correctly")
                    else:
                        print(f"  ❌ User {i+1}: Expected {expected['email']}, found {user.get('email', 'N/A')}")
                        success = False
                else:
                    print(f"  ❌ User {i+1}: Missing in configuration")
                    success = False
        else:
            print("  ❌ Insufficient valid users configured")
            success = False
    else:
        success = False
    
    # Check environments.yaml
    print("\n📋 Checking config/environments.yaml...")
    environments = load_environments()
    if environments:
        env_list = ['development', 'staging', 'qa', 'local']
        for env_name in env_list:
            env = environments.get('environments', {}).get(env_name, {})
            credentials = env.get('credentials', {})
            
            user_one_email = credentials.get('test_user_one')
            user_one_password = credentials.get('test_password_one')
            user_two_email = credentials.get('test_user_two')
            user_two_password = credentials.get('test_password_two')
            
            if (user_one_email == expected_users[0]['email'] and 
                user_one_password == expected_users[0]['password'] and
                user_two_email == expected_users[1]['email'] and 
                user_two_password == expected_users[1]['password']):
                print(f"  ✅ {env_name}: Credentials configured correctly")
            else:
                print(f"  ❌ {env_name}: Credentials mismatch")
                success = False
    else:
        success = False
    
    # Summary
    print("\n" + "="*50)
    if success:
        print("🎉 SUCCESS: All credential configurations are valid!")
        print("\n📖 Quick Reference:")
        print("   User 1: testoneemr@gmail.com / 12345678")
        print("   User 2: testtwoemr@gmail.com / 12345678")
        print("\n🚀 Ready to run tests:")
        print("   python run_tests.py --test-type smoke")
        return True
    else:
        print("❌ FAILED: Credential configuration issues found!")
        print("\n🔧 Please check and update the configuration files.")
        return False

def main():
    """Main function"""
    if not os.path.exists('config/test_data.json'):
        print("❌ Error: Not in test framework directory or config files missing")
        print("   Please run this script from the easemyresearch_test_framework directory")
        sys.exit(1)
    
    success = validate_credentials()
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()