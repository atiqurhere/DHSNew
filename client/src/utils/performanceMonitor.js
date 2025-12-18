// Performance monitoring utility
class PerformanceMonitor {
  constructor() {
    this.pageLoadTime = performance.now();
    this.metrics = {
      componentMounts: [],
      apiCalls: [],
      errors: []
    };

    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      console.log('👁️ Page visibility:', document.hidden ? 'hidden' : 'visible');
    });

    // Track when page is fully loaded
    window.addEventListener('load', () => {
      const loadTime = performance.now();
      console.log(`🚀 Page fully loaded in ${loadTime.toFixed(2)}ms`);
    });

    // Track navigation timing
    if (window.performance && window.performance.timing) {
      window.addEventListener('load', () => {
        setTimeout(() => {
          const timing = window.performance.timing;
          const metrics = {
            'DNS Lookup': timing.domainLookupEnd - timing.domainLookupStart,
            'TCP Connection': timing.connectEnd - timing.connectStart,
            'Request Time': timing.responseStart - timing.requestStart,
            'Response Time': timing.responseEnd - timing.responseStart,
            'DOM Processing': timing.domComplete - timing.domLoading,
            'Total Load Time': timing.loadEventEnd - timing.navigationStart
          };
          
          console.log('📊 Performance Metrics:', metrics);
        }, 0);
      });
    }
  }

  logComponentMount(componentName) {
    const time = performance.now() - this.pageLoadTime;
    this.metrics.componentMounts.push({ componentName, time });
    console.log(`🔷 Component mounted: ${componentName} at ${time.toFixed(2)}ms`);
  }

  logComponentUnmount(componentName) {
    const time = performance.now() - this.pageLoadTime;
    console.log(`🔶 Component unmounted: ${componentName} at ${time.toFixed(2)}ms`);
  }

  logAPICall(apiName, duration) {
    this.metrics.apiCalls.push({ apiName, duration });
    console.log(`🌐 API Call: ${apiName} took ${duration.toFixed(2)}ms`);
  }

  logError(error, context) {
    this.metrics.errors.push({ error: error.message, context, time: performance.now() });
    console.error(`💥 Error in ${context}:`, error);
  }

  getSummary() {
    return {
      pageLoadTime: this.pageLoadTime,
      ...this.metrics,
      totalTime: performance.now() - this.pageLoadTime
    };
  }

  printSummary() {
    const summary = this.getSummary();
    console.log('📈 Performance Summary:');
    console.log('  Total Runtime:', summary.totalTime.toFixed(2), 'ms');
    console.log('  Components Mounted:', summary.componentMounts.length);
    console.log('  API Calls:', summary.apiCalls.length);
    console.log('  Errors:', summary.errors.length);
    
    if (summary.apiCalls.length > 0) {
      const avgApiTime = summary.apiCalls.reduce((sum, call) => sum + call.duration, 0) / summary.apiCalls.length;
      console.log('  Avg API Call Time:', avgApiTime.toFixed(2), 'ms');
    }
  }
}

export const performanceMonitor = new PerformanceMonitor();

// Auto-print summary after 10 seconds
setTimeout(() => {
  performanceMonitor.printSummary();
}, 10000);
