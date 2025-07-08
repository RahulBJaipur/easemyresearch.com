"""Report Generator utility for creating test reports"""

import json
import logging
from datetime import datetime
from typing import Dict, Any, List

logger = logging.getLogger(__name__)

class ReportGenerator:
    """Generates various types of test reports"""
    
    def __init__(self, output_dir: str = "reports"):
        self.output_dir = output_dir
        self.logger = logging.getLogger(__name__)
    
    def generate_summary_report(self, test_results: Dict[str, Any]) -> str:
        """Generate test summary report"""
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        report_file = f"{self.output_dir}/test_summary_{timestamp}.json"
        
        summary = {
            'timestamp': timestamp,
            'total_tests': test_results.get('total', 0),
            'passed': test_results.get('passed', 0),
            'failed': test_results.get('failed', 0),
            'skipped': test_results.get('skipped', 0),
            'duration': test_results.get('duration', 0),
            'test_details': test_results.get('details', [])
        }
        
        try:
            with open(report_file, 'w') as f:
                json.dump(summary, f, indent=2)
            self.logger.info(f"Summary report generated: {report_file}")
            return report_file
        except Exception as e:
            self.logger.error(f"Failed to generate summary report: {e}")
            raise
    
    def generate_performance_report(self, performance_data: List[Dict[str, Any]]) -> str:
        """Generate performance test report"""
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        report_file = f"{self.output_dir}/performance_report_{timestamp}.json"
        
        try:
            with open(report_file, 'w') as f:
                json.dump(performance_data, f, indent=2)
            self.logger.info(f"Performance report generated: {report_file}")
            return report_file
        except Exception as e:
            self.logger.error(f"Failed to generate performance report: {e}")
            raise
