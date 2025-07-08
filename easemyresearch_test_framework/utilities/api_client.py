"""API Client utility for handling API requests and responses"""

import json
import logging
import time
from typing import Dict, Any, Optional
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

logger = logging.getLogger(__name__)

class APIClient:
    """API Client for handling REST API requests and responses"""
    
    def __init__(self, base_url: str, config: Dict[str, Any] = None):
        self.base_url = base_url.rstrip('/')
        self.config = config or {}
        self.session = requests.Session()
        self.auth_token = None
        self._setup_session()
    
    def _setup_session(self):
        retry_strategy = Retry(
            total=self.config.get('api', {}).get('max_retries', 3),
            status_forcelist=[429, 500, 502, 503, 504],
            method_whitelist=["HEAD", "GET", "OPTIONS"],
            backoff_factor=1
        )
        adapter = HTTPAdapter(max_retries=retry_strategy)
        self.session.mount("http://", adapter)
        self.session.mount("https://", adapter)
        
        self.session.headers.update({
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'User-Agent': 'EaseMyResearch-TestFramework/1.0'
        })
        
        self.session.verify = self.config.get('api', {}).get('verify_ssl', True)
        self.timeout = self.config.get('api', {}).get('timeout', 30)
    
    def _make_request(self, method: str, endpoint: str, **kwargs) -> requests.Response:
        url = f"{self.base_url}{endpoint}"
        
        if self.auth_token:
            if 'headers' not in kwargs:
                kwargs['headers'] = {}
            kwargs['headers']['Authorization'] = f'Bearer {self.auth_token}'
        
        logger.info(f"Making {method} request to {url}")
        return self.session.request(method, url, timeout=self.timeout, **kwargs)
    
    def get(self, endpoint: str, **kwargs) -> requests.Response:
        return self._make_request('GET', endpoint, **kwargs)
    
    def post(self, endpoint: str, **kwargs) -> requests.Response:
        return self._make_request('POST', endpoint, **kwargs)
    
    def login(self, username: str, password: str, endpoint: str = '/auth/login') -> requests.Response:
        login_data = {'email': username, 'password': password}
        response = self.post(endpoint, json=login_data)
        
        if response.status_code == 200:
            try:
                response_data = response.json()
                self.auth_token = response_data.get('token') or response_data.get('access_token')
                logger.info("Successfully authenticated")
            except Exception as e:
                logger.warning(f"Could not extract token: {e}")
        
        return response
    
    def search(self, query: str, filters: Dict[str, Any] = None, endpoint: str = '/search') -> requests.Response:
        search_data = {'query': query, 'filters': filters or {}}
        return self.post(endpoint, json=search_data)
