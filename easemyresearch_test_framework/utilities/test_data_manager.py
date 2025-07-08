"""Test Data Manager utility for handling test data"""

import json
import yaml
import logging
from typing import Dict, Any, List
from faker import Faker

logger = logging.getLogger(__name__)

class TestDataManager:
    """Manages test data generation and manipulation"""
    
    def __init__(self):
        self.fake = Faker()
        self.logger = logging.getLogger(__name__)
    
    def generate_user_data(self) -> Dict[str, Any]:
        """Generate fake user data"""
        return {
            'first_name': self.fake.first_name(),
            'last_name': self.fake.last_name(),
            'email': self.fake.email(),
            'password': 'TestPass123!',
            'institution': self.fake.company(),
            'department': self.fake.job(),
            'phone': self.fake.phone_number()
        }
    
    def generate_research_data(self) -> Dict[str, Any]:
        """Generate fake research data"""
        return {
            'title': self.fake.sentence(nb_words=8),
            'abstract': self.fake.text(max_nb_chars=500),
            'authors': [self.fake.name() for _ in range(self.fake.random_int(1, 5))],
            'keywords': [self.fake.word() for _ in range(self.fake.random_int(3, 8))],
            'year': self.fake.random_int(2020, 2024),
            'doi': f"10.1000/{self.fake.lexify('???###')}"
        }
    
    def load_test_data(self, file_path: str) -> Dict[str, Any]:
        """Load test data from file"""
        try:
            with open(file_path, 'r') as file:
                if file_path.endswith('.json'):
                    return json.load(file)
                elif file_path.endswith('.yaml') or file_path.endswith('.yml'):
                    return yaml.safe_load(file)
        except Exception as e:
            self.logger.error(f"Failed to load test data: {e}")
            return {}
    
    def get_valid_user(self, user_type: str = 'user_one') -> Dict[str, Any]:
        """Get valid user data for testing"""
        users = {
            'user_one': {
                'email': 'testoneemr@gmail.com',
                'password': '12345678',
                'first_name': 'Test',
                'last_name': 'User One'
            },
            'user_two': {
                'email': 'testtwoemr@gmail.com',
                'password': '12345678',
                'first_name': 'Test',
                'last_name': 'User Two'
            }
        }
        return users.get(user_type, users['user_one'])
