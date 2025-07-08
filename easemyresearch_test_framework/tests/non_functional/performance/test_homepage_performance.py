"""
Homepage Performance Testing Suite for EaseMyResearch.com
Comprehensive performance testing including load times, resource optimization, and scalability
"""

import pytest
import time
import json
from datetime import datetime
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.common.exceptions import TimeoutException

@pytest.mark.performance
@pytest.mark.non_functional
class TestHomepagePerformance:
    """Performance test suite for homepage"""
    
    def setup_method(self):
        """Setup performance tracking"""
        self.performance_results = {
            'timestamp': datetime.now().isoformat(),
            'url_tested': '',
            'performance_metrics': {},
            'thresholds': {
                'page_load_time': 5.0,  # seconds
                'first_contentful_paint': 2.0,  # seconds
                'time_to_interactive': 5.0,  # seconds
                'cumulative_layout_shift': 0.1,
                'largest_contentful_paint': 4.0  # seconds
            }
        }
    
    def test_page_load_performance(self, driver, base_url):
        """Test homepage load performance metrics"""
        print("\n⚡ Testing Page Load Performance...")
        
        self.performance_results['url_tested'] = base_url
        
        # Clear browser cache and cookies
        driver.delete_all_cookies()
        driver.execute_script("window.localStorage.clear(); window.sessionStorage.clear();")
        
        # Measure page load time
        start_time = time.time()
        driver.get(base_url)
        
        # Wait for page to be fully loaded
        WebDriverWait(driver, 30).until(
            lambda d: d.execute_script("return document.readyState") == "complete"
        )
        
        total_load_time = time.time() - start_time
        
        # Get detailed performance metrics
        performance_metrics = driver.execute_script("""
            const timing = performance.timing;
            const navigation = performance.getEntriesByType('navigation')[0];
            const paint = performance.getEntriesByType('paint');
            
            let metrics = {
                // Basic timing
                'page_load_time': """ + str(total_load_time) + """,
                'dom_ready_time': (timing.domContentLoadedEventEnd - timing.navigationStart) / 1000,
                'dom_interactive_time': (timing.domInteractive - timing.navigationStart) / 1000,
                
                // Network timing
                'dns_lookup_time': (timing.domainLookupEnd - timing.domainLookupStart) / 1000,
                'tcp_connect_time': (timing.connectEnd - timing.connectStart) / 1000,
                'server_response_time': (timing.responseEnd - timing.requestStart) / 1000,
                'download_time': (timing.responseEnd - timing.responseStart) / 1000,
                
                // Resource loading
                'resource_load_time': (timing.loadEventEnd - timing.loadEventStart) / 1000,
                
                // Paint metrics
                'first_paint': null,
                'first_contentful_paint': null
            };
            
            // Add paint metrics if available
            paint.forEach(entry => {
                if (entry.name === 'first-paint') {
                    metrics['first_paint'] = entry.startTime / 1000;
                } else if (entry.name === 'first-contentful-paint') {
                    metrics['first_contentful_paint'] = entry.startTime / 1000;
                }
            });
            
            return metrics;
        """)
        
        # Get resource counts and sizes
        resource_metrics = driver.execute_script("""
            const resources = performance.getEntriesByType('resource');
            let totalSize = 0;
            let resourceCount = {
                'total': resources.length,
                'images': 0,
                'scripts': 0,
                'stylesheets': 0,
                'documents': 0,
                'other': 0
            };
            
            resources.forEach(resource => {
                totalSize += resource.transferSize || 0;
                
                if (resource.initiatorType === 'img') resourceCount.images++;
                else if (resource.initiatorType === 'script') resourceCount.scripts++;
                else if (resource.initiatorType === 'css') resourceCount.stylesheets++;
                else if (resource.initiatorType === 'navigation') resourceCount.documents++;
                else resourceCount.other++;
            });
            
            return {
                'total_transfer_size': totalSize,
                'resource_count': resourceCount,
                'average_resource_load_time': resources.length > 0 ? 
                    resources.reduce((sum, r) => sum + r.duration, 0) / resources.length / 1000 : 0
            };
        """)
        
        # Combine all metrics
        all_metrics = {**performance_metrics, **resource_metrics}
        self.performance_results['performance_metrics'] = all_metrics
        
        # Performance assertions
        assert all_metrics['page_load_time'] < self.performance_results['thresholds']['page_load_time'], \
            f"Page load time {all_metrics['page_load_time']:.2f}s exceeds threshold"
        
        if all_metrics['first_contentful_paint']:
            assert all_metrics['first_contentful_paint'] < self.performance_results['thresholds']['first_contentful_paint'], \
                f"First Contentful Paint {all_metrics['first_contentful_paint']:.2f}s exceeds threshold"
        
        # Print detailed results
        print(f"📊 Performance Metrics:")
        print(f"   Page Load Time: {all_metrics['page_load_time']:.2f}s")
        print(f"   DOM Ready Time: {all_metrics['dom_ready_time']:.2f}s")
        print(f"   Server Response: {all_metrics['server_response_time']:.2f}s")
        print(f"   First Paint: {all_metrics['first_paint']:.2f}s" if all_metrics['first_paint'] else "   First Paint: Not available")
        print(f"   First Contentful Paint: {all_metrics['first_contentful_paint']:.2f}s" if all_metrics['first_contentful_paint'] else "   First Contentful Paint: Not available")
        print(f"   Total Resources: {all_metrics['resource_count']['total']}")
        print(f"   Total Transfer Size: {all_metrics['total_transfer_size']/1024:.1f} KB")
    
    def test_repeated_page_loads(self, driver, base_url):
        """Test performance consistency across multiple page loads"""
        print("\n🔄 Testing Repeated Page Load Performance...")
        
        load_times = []
        num_iterations = 5
        
        for i in range(num_iterations):
            # Clear cache between loads
            driver.delete_all_cookies()
            driver.execute_script("window.localStorage.clear(); window.sessionStorage.clear();")
            
            start_time = time.time()
            driver.get(base_url)
            
            WebDriverWait(driver, 30).until(
                lambda d: d.execute_script("return document.readyState") == "complete"
            )
            
            load_time = time.time() - start_time
            load_times.append(load_time)
            
            print(f"   Load {i+1}: {load_time:.2f}s")
            time.sleep(1)  # Brief pause between loads
        
        # Calculate statistics
        avg_load_time = sum(load_times) / len(load_times)
        min_load_time = min(load_times)
        max_load_time = max(load_times)
        variance = sum((x - avg_load_time) ** 2 for x in load_times) / len(load_times)
        
        consistency_metrics = {
            'average_load_time': avg_load_time,
            'min_load_time': min_load_time,
            'max_load_time': max_load_time,
            'variance': variance,
            'load_times': load_times
        }
        
        # Performance consistency assertions
        assert avg_load_time < self.performance_results['thresholds']['page_load_time'], \
            f"Average load time {avg_load_time:.2f}s exceeds threshold"
        
        assert max_load_time - min_load_time < 3.0, \
            f"Load time variance too high: {max_load_time - min_load_time:.2f}s"
        
        print(f"📈 Load Time Statistics:")
        print(f"   Average: {avg_load_time:.2f}s")
        print(f"   Range: {min_load_time:.2f}s - {max_load_time:.2f}s")
        print(f"   Variance: {variance:.3f}")
        
        self.performance_results['consistency_metrics'] = consistency_metrics
    
    def test_resource_optimization(self, driver, base_url):
        """Test resource optimization and loading efficiency"""
        print("\n🔧 Testing Resource Optimization...")
        
        driver.get(base_url)
        WebDriverWait(driver, 30).until(
            lambda d: d.execute_script("return document.readyState") == "complete"
        )
        
        # Get detailed resource information
        resource_analysis = driver.execute_script("""
            const resources = performance.getEntriesByType('resource');
            const analysis = {
                'compression_used': 0,
                'caching_enabled': 0,
                'large_resources': [],
                'slow_resources': [],
                'resource_types': {},
                'total_size': 0,
                'average_load_time': 0
            };
            
            let totalLoadTime = 0;
            
            resources.forEach(resource => {
                const size = resource.transferSize || 0;
                const loadTime = resource.duration;
                
                analysis.total_size += size;
                totalLoadTime += loadTime;
                
                // Check for large resources (>1MB)
                if (size > 1048576) {
                    analysis.large_resources.push({
                        'name': resource.name,
                        'size': size,
                        'type': resource.initiatorType
                    });
                }
                
                // Check for slow resources (>5s)
                if (loadTime > 5000) {
                    analysis.slow_resources.push({
                        'name': resource.name,
                        'duration': loadTime,
                        'type': resource.initiatorType
                    });
                }
                
                // Count resource types
                const type = resource.initiatorType || 'other';
                analysis.resource_types[type] = (analysis.resource_types[type] || 0) + 1;
            });
            
            analysis.average_load_time = resources.length > 0 ? totalLoadTime / resources.length : 0;
            
            return analysis;
        """)
        
        # Check image optimization
        image_analysis = driver.execute_script("""
            const images = document.querySelectorAll('img');
            const analysis = {
                'total_images': images.length,
                'images_with_alt': 0,
                'images_with_lazy_loading': 0,
                'large_images': []
            };
            
            images.forEach(img => {
                if (img.alt) analysis.images_with_alt++;
                if (img.loading === 'lazy') analysis.images_with_lazy_loading++;
                
                if (img.naturalWidth > 2000 || img.naturalHeight > 2000) {
                    analysis.large_images.push({
                        'src': img.src,
                        'width': img.naturalWidth,
                        'height': img.naturalHeight
                    });
                }
            });
            
            return analysis;
        """)
        
        # Performance recommendations
        recommendations = []
        
        if resource_analysis['large_resources']:
            recommendations.append(f"Consider optimizing {len(resource_analysis['large_resources'])} large resources")
        
        if resource_analysis['slow_resources']:
            recommendations.append(f"Optimize {len(resource_analysis['slow_resources'])} slow-loading resources")
        
        if image_analysis['large_images']:
            recommendations.append(f"Optimize {len(image_analysis['large_images'])} large images")
        
        if image_analysis['total_images'] > 0:
            lazy_percentage = (image_analysis['images_with_lazy_loading'] / image_analysis['total_images']) * 100
            if lazy_percentage < 50:
                recommendations.append("Consider implementing lazy loading for images")
        
        print(f"📊 Resource Analysis:")
        print(f"   Total Resources: {len(driver.execute_script('return performance.getEntriesByType(\"resource\")'))}")
        print(f"   Total Size: {resource_analysis['total_size']/1024:.1f} KB")
        print(f"   Average Load Time: {resource_analysis['average_load_time']:.0f}ms")
        print(f"   Large Resources: {len(resource_analysis['large_resources'])}")
        print(f"   Slow Resources: {len(resource_analysis['slow_resources'])}")
        print(f"   Images: {image_analysis['total_images']} total")
        print(f"   Images with Alt Text: {image_analysis['images_with_alt']}")
        print(f"   Images with Lazy Loading: {image_analysis['images_with_lazy_loading']}")
        
        if recommendations:
            print(f"💡 Optimization Recommendations:")
            for rec in recommendations:
                print(f"   - {rec}")
        
        self.performance_results['resource_analysis'] = resource_analysis
        self.performance_results['image_analysis'] = image_analysis
        self.performance_results['recommendations'] = recommendations
        
        # Assertions for resource optimization
        assert resource_analysis['total_size'] < 5 * 1024 * 1024, \
            f"Total page size {resource_analysis['total_size']/1024/1024:.1f}MB exceeds 5MB threshold"
        
        assert len(resource_analysis['slow_resources']) == 0, \
            f"{len(resource_analysis['slow_resources'])} resources loading too slowly"
    
    def test_network_conditions(self, driver, base_url):
        """Test performance under different network conditions"""
        print("\n🌐 Testing Network Performance...")
        
        # Note: This test simulates network conditions analysis
        # In a real environment, you might use Chrome DevTools Protocol
        # to set network throttling
        
        driver.get(base_url)
        WebDriverWait(driver, 30).until(
            lambda d: d.execute_script("return document.readyState") == "complete"
        )
        
        # Analyze network-dependent metrics
        network_metrics = driver.execute_script("""
            const timing = performance.timing;
            const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
            
            return {
                'dns_time': timing.domainLookupEnd - timing.domainLookupStart,
                'connect_time': timing.connectEnd - timing.connectStart,
                'ssl_time': timing.connectEnd - timing.secureConnectionStart,
                'ttfb': timing.responseStart - timing.requestStart,
                'download_time': timing.responseEnd - timing.responseStart,
                'connection_type': connection ? connection.effectiveType : 'unknown',
                'connection_downlink': connection ? connection.downlink : null,
                'connection_rtt': connection ? connection.rtt : null
            };
        """)
        
        print(f"🌐 Network Metrics:")
        print(f"   DNS Lookup: {network_metrics['dns_time']}ms")
        print(f"   TCP Connect: {network_metrics['connect_time']}ms")
        print(f"   SSL Handshake: {network_metrics['ssl_time']}ms")
        print(f"   Time to First Byte: {network_metrics['ttfb']}ms")
        print(f"   Download Time: {network_metrics['download_time']}ms")
        print(f"   Connection Type: {network_metrics['connection_type']}")
        
        # Network performance assertions
        assert network_metrics['ttfb'] < 2000, \
            f"Time to First Byte {network_metrics['ttfb']}ms exceeds 2s threshold"
        
        assert network_metrics['dns_time'] < 200, \
            f"DNS lookup time {network_metrics['dns_time']}ms exceeds 200ms threshold"
        
        self.performance_results['network_metrics'] = network_metrics
    
    def teardown_method(self):
        """Save performance test results"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        report_file = f"reports/homepage_performance_results_{timestamp}.json"
        
        import os
        os.makedirs("reports", exist_ok=True)
        
        with open(report_file, 'w') as f:
            json.dump(self.performance_results, f, indent=2)
        
        print(f"\n📊 Performance Test Summary:")
        if 'performance_metrics' in self.performance_results:
            metrics = self.performance_results['performance_metrics']
            print(f"   Page Load Time: {metrics.get('page_load_time', 0):.2f}s")
            print(f"   Total Resources: {metrics.get('resource_count', {}).get('total', 0)}")
            print(f"   Total Size: {metrics.get('total_transfer_size', 0)/1024:.1f} KB")
        print(f"   Performance Report: {report_file}")