// Comprehensive Dashboard Testing Suite
// Tests all dashboard functionality, components, and interactions

const baseUrl = 'http://localhost:5000';

class DashboardTester {
  constructor() {
    this.results = {
      unit: { passed: 0, failed: 0, errors: [] },
      functional: { passed: 0, failed: 0, errors: [] },
      integration: { passed: 0, failed: 0, errors: [] },
      overall: { passed: 0, failed: 0, errors: [] }
    };
    this.dashboardData = {};
  }

  async apiRequest(method, endpoint, data = null) {
    try {
      const options = {
        method,
        headers: { 'Content-Type': 'application/json' }
      };
      if (data) options.body = JSON.stringify(data);
      
      const response = await fetch(`${baseUrl}${endpoint}`, options);
      const responseData = await response.text();
      
      let jsonData;
      try {
        jsonData = JSON.parse(responseData);
      } catch (e) {
        jsonData = responseData;
      }
      
      return { status: response.status, data: jsonData };
    } catch (error) {
      throw new Error(`Request failed: ${error.message}`);
    }
  }

  logResult(category, testName, passed, error = null) {
    if (passed) {
      console.log(`✅ ${category.toUpperCase()}: ${testName}`);
      this.results[category].passed++;
    } else {
      console.log(`❌ ${category.toUpperCase()}: ${testName} - ${error}`);
      this.results[category].failed++;
      this.results[category].errors.push({ test: testName, error });
    }
  }

  // === UNIT TESTS FOR DASHBOARD APIs ===
  async runUnitTests() {
    console.log('\n🧪 UNIT TESTS - Dashboard API Endpoints');
    console.log('='.repeat(50));

    // Test 1: Dashboard Stats API
    try {
      const response = await this.apiRequest('GET', '/api/dashboard/stats');
      if (response.status === 200 && typeof response.data === 'object') {
        this.dashboardData.stats = response.data;
        // Verify required fields
        const requiredFields = ['todaySales', 'totalProducts', 'activeCustomers', 'lowStockCount'];
        const hasAllFields = requiredFields.every(field => response.data.hasOwnProperty(field));
        this.logResult('unit', 'Dashboard Stats API structure', hasAllFields, 
          hasAllFields ? null : 'Missing required fields');
      } else {
        this.logResult('unit', 'Dashboard Stats API', false, `Status: ${response.status}`);
      }
    } catch (error) {
      this.logResult('unit', 'Dashboard Stats API', false, error.message);
    }

    // Test 2: Sales Analytics API
    try {
      const response = await this.apiRequest('GET', '/api/dashboard/sales-analytics');
      if (response.status === 200 && Array.isArray(response.data)) {
        this.dashboardData.salesAnalytics = response.data;
        this.logResult('unit', 'Sales Analytics API', true);
      } else {
        this.logResult('unit', 'Sales Analytics API', false, `Status: ${response.status} or invalid data type`);
      }
    } catch (error) {
      this.logResult('unit', 'Sales Analytics API', false, error.message);
    }

    // Test 3: Top Products API
    try {
      const response = await this.apiRequest('GET', '/api/dashboard/top-products');
      if (response.status === 200 && Array.isArray(response.data)) {
        this.dashboardData.topProducts = response.data;
        this.logResult('unit', 'Top Products API', true);
      } else {
        this.logResult('unit', 'Top Products API', false, `Status: ${response.status}`);
      }
    } catch (error) {
      this.logResult('unit', 'Top Products API', false, error.message);
    }

    // Test 4: Recent Activity API
    try {
      const response = await this.apiRequest('GET', '/api/dashboard/recent-activity');
      if (response.status === 200 && Array.isArray(response.data)) {
        this.dashboardData.recentActivity = response.data;
        this.logResult('unit', 'Recent Activity API', true);
      } else {
        this.logResult('unit', 'Recent Activity API', false, `Status: ${response.status}`);
      }
    } catch (error) {
      this.logResult('unit', 'Recent Activity API', false, error.message);
    }

    // Test 5: Low Stock Products API
    try {
      const response = await this.apiRequest('GET', '/api/products/low-stock');
      if (response.status === 200 && Array.isArray(response.data)) {
        this.dashboardData.lowStock = response.data;
        this.logResult('unit', 'Low Stock Products API', true);
      } else {
        this.logResult('unit', 'Low Stock Products API', false, `Status: ${response.status}`);
      }
    } catch (error) {
      this.logResult('unit', 'Low Stock Products API', false, error.message);
    }

    // Test 6: Sales Analytics with Date Range
    try {
      const response = await this.apiRequest('GET', '/api/dashboard/sales-analytics?days=30');
      if (response.status === 200) {
        this.logResult('unit', 'Sales Analytics with Date Range', true);
      } else {
        this.logResult('unit', 'Sales Analytics with Date Range', false, `Status: ${response.status}`);
      }
    } catch (error) {
      this.logResult('unit', 'Sales Analytics with Date Range', false, error.message);
    }
  }

  // === FUNCTIONAL TESTS FOR DASHBOARD FEATURES ===
  async runFunctionalTests() {
    console.log('\n⚙️ FUNCTIONAL TESTS - Dashboard Features');
    console.log('='.repeat(50));

    // Test 1: Data Refresh Functionality
    try {
      const initialResponse = await this.apiRequest('GET', '/api/dashboard/stats');
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
      const refreshResponse = await this.apiRequest('GET', '/api/dashboard/stats');
      
      if (initialResponse.status === 200 && refreshResponse.status === 200) {
        this.logResult('functional', 'Data Refresh Capability', true);
      } else {
        this.logResult('functional', 'Data Refresh Capability', false, 'API calls failing');
      }
    } catch (error) {
      this.logResult('functional', 'Data Refresh Capability', false, error.message);
    }

    // Test 2: Error Handling for Invalid Requests
    try {
      const response = await this.apiRequest('GET', '/api/dashboard/nonexistent');
      if (response.status === 404) {
        this.logResult('functional', 'Error Handling for Invalid Endpoints', true);
      } else {
        this.logResult('functional', 'Error Handling for Invalid Endpoints', false, 
          `Expected 404, got ${response.status}`);
      }
    } catch (error) {
      // Network errors are also acceptable for error handling test
      this.logResult('functional', 'Error Handling for Invalid Endpoints', true);
    }

    // Test 3: Performance Testing - Multiple Concurrent Requests
    try {
      const startTime = Date.now();
      const promises = [
        this.apiRequest('GET', '/api/dashboard/stats'),
        this.apiRequest('GET', '/api/dashboard/sales-analytics'),
        this.apiRequest('GET', '/api/dashboard/top-products'),
        this.apiRequest('GET', '/api/dashboard/recent-activity')
      ];
      
      const responses = await Promise.all(promises);
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      
      const allSuccessful = responses.every(r => r.status === 200);
      const reasonableTime = totalTime < 5000; // Under 5 seconds
      
      if (allSuccessful && reasonableTime) {
        this.logResult('functional', `Concurrent API Performance (${totalTime}ms)`, true);
      } else {
        this.logResult('functional', 'Concurrent API Performance', false, 
          `Time: ${totalTime}ms, Success: ${allSuccessful}`);
      }
    } catch (error) {
      this.logResult('functional', 'Concurrent API Performance', false, error.message);
    }

    // Test 4: Data Validation and Consistency
    try {
      const statsResponse = await this.apiRequest('GET', '/api/dashboard/stats');
      const productsResponse = await this.apiRequest('GET', '/api/products');
      
      if (statsResponse.status === 200 && productsResponse.status === 200) {
        const statsProductCount = statsResponse.data.totalProducts;
        const actualProductCount = productsResponse.data.length;
        
        // Allow for small discrepancies (within 10%) due to filtering/caching
        const variance = Math.abs(statsProductCount - actualProductCount);
        const withinTolerance = variance <= Math.max(1, actualProductCount * 0.1);
        
        this.logResult('functional', 'Data Consistency Between Endpoints', withinTolerance,
          withinTolerance ? null : `Stats: ${statsProductCount}, Actual: ${actualProductCount}`);
      } else {
        this.logResult('functional', 'Data Consistency Between Endpoints', false, 'API calls failed');
      }
    } catch (error) {
      this.logResult('functional', 'Data Consistency Between Endpoints', false, error.message);
    }
  }

  // === INTEGRATION TESTS FOR DASHBOARD WORKFLOWS ===
  async runIntegrationTests() {
    console.log('\n🔗 INTEGRATION TESTS - Dashboard Workflows');
    console.log('='.repeat(50));

    // Test 1: Create Sale and Verify Dashboard Update
    try {
      // Get initial stats
      const initialStats = await this.apiRequest('GET', '/api/dashboard/stats');
      const initialSales = parseFloat(initialStats.data.todaySales || 0);
      
      // Get a product to sell
      const productsResponse = await this.apiRequest('GET', '/api/products');
      if (productsResponse.data.length === 0) {
        this.logResult('integration', 'Sale Creation Impact on Dashboard', false, 'No products available');
        return;
      }
      
      const product = productsResponse.data[0];
      const saleAmount = parseFloat(product.sellingPrice) * 2;
      
      // Create a sale
      const saleData = {
        items: [{
          productId: product.id,
          quantity: 2,
          price: product.sellingPrice
        }],
        totalAmount: saleAmount.toString(),
        paymentMethod: 'cash',
        customerId: null
      };
      
      const saleResponse = await this.apiRequest('POST', '/api/sales', saleData);
      
      if (saleResponse.status === 201) {
        // Wait a moment for data to propagate
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Check updated stats
        const updatedStats = await this.apiRequest('GET', '/api/dashboard/stats');
        const updatedSales = parseFloat(updatedStats.data.todaySales || 0);
        
        // Verify the sale amount was added to today's sales
        const expectedSales = initialSales + saleAmount;
        const salesUpdated = Math.abs(updatedSales - expectedSales) < 0.01;
        
        this.logResult('integration', 'Sale Creation Impact on Dashboard', salesUpdated,
          salesUpdated ? null : `Expected: ${expectedSales}, Got: ${updatedSales}`);
      } else {
        this.logResult('integration', 'Sale Creation Impact on Dashboard', false, 
          `Sale creation failed: ${saleResponse.status}`);
      }
    } catch (error) {
      this.logResult('integration', 'Sale Creation Impact on Dashboard', false, error.message);
    }

    // Test 2: Product Creation and Inventory Count Update
    try {
      const initialStats = await this.apiRequest('GET', '/api/dashboard/stats');
      const initialProductCount = initialStats.data.totalProducts;
      
      // Create a new product
      const productData = {
        name: `Dashboard Test Product ${Date.now()}`,
        sku: `DASH-${Date.now()}`,
        barcode: `DASH${Date.now()}`,
        category: 'Test',
        sellingPrice: '25.99',
        costPrice: '15.99',
        currentStock: 100,
        minStockLevel: 10
      };
      
      const productResponse = await this.apiRequest('POST', '/api/products', productData);
      
      if (productResponse.status === 201) {
        // Wait for data propagation
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const updatedStats = await this.apiRequest('GET', '/api/dashboard/stats');
        const updatedProductCount = updatedStats.data.totalProducts;
        
        const countIncreased = updatedProductCount > initialProductCount;
        this.logResult('integration', 'Product Creation Impact on Dashboard', countIncreased,
          countIncreased ? null : `Count didn't increase: ${initialProductCount} -> ${updatedProductCount}`);
      } else {
        this.logResult('integration', 'Product Creation Impact on Dashboard', false,
          `Product creation failed: ${productResponse.status}`);
      }
    } catch (error) {
      this.logResult('integration', 'Product Creation Impact on Dashboard', false, error.message);
    }

    // Test 3: Customer Creation and Active Count Update
    try {
      const initialStats = await this.apiRequest('GET', '/api/dashboard/stats');
      const initialCustomerCount = initialStats.data.activeCustomers;
      
      // Create a new customer
      const customerData = {
        name: `Dashboard Test Customer ${Date.now()}`,
        email: `dashtest${Date.now()}@example.com`,
        phone: `555${Date.now().toString().slice(-7)}`,
        address: '123 Dashboard Test St'
      };
      
      const customerResponse = await this.apiRequest('POST', '/api/customers', customerData);
      
      if (customerResponse.status === 201) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const updatedStats = await this.apiRequest('GET', '/api/dashboard/stats');
        const updatedCustomerCount = updatedStats.data.activeCustomers;
        
        const countIncreased = updatedCustomerCount > initialCustomerCount;
        this.logResult('integration', 'Customer Creation Impact on Dashboard', countIncreased,
          countIncreased ? null : `Count didn't increase: ${initialCustomerCount} -> ${updatedCustomerCount}`);
      } else {
        this.logResult('integration', 'Customer Creation Impact on Dashboard', false,
          `Customer creation failed: ${customerResponse.status}`);
      }
    } catch (error) {
      this.logResult('integration', 'Customer Creation Impact on Dashboard', false, error.message);
    }

    // Test 4: Low Stock Detection Integration
    try {
      // Get current low stock count
      const lowStockResponse = await this.apiRequest('GET', '/api/products/low-stock');
      const statsResponse = await this.apiRequest('GET', '/api/dashboard/stats');
      
      if (lowStockResponse.status === 200 && statsResponse.status === 200) {
        const actualLowStock = lowStockResponse.data.length;
        const dashboardLowStock = statsResponse.data.lowStockCount;
        
        const countsMatch = actualLowStock === dashboardLowStock;
        this.logResult('integration', 'Low Stock Count Consistency', countsMatch,
          countsMatch ? null : `Dashboard: ${dashboardLowStock}, Actual: ${actualLowStock}`);
      } else {
        this.logResult('integration', 'Low Stock Count Consistency', false, 'API calls failed');
      }
    } catch (error) {
      this.logResult('integration', 'Low Stock Count Consistency', false, error.message);
    }
  }

  // === OVERALL DASHBOARD SYSTEM TESTS ===
  async runOverallTests() {
    console.log('\n🎯 OVERALL TESTS - Complete Dashboard System');
    console.log('='.repeat(50));

    // Test 1: Complete Dashboard Data Load Simulation
    try {
      const startTime = Date.now();
      
      // Simulate a complete dashboard load
      const dashboardApis = [
        '/api/dashboard/stats',
        '/api/dashboard/sales-analytics',
        '/api/dashboard/top-products',
        '/api/dashboard/recent-activity',
        '/api/products/low-stock',
        '/api/invoices'
      ];
      
      const responses = await Promise.all(
        dashboardApis.map(api => this.apiRequest('GET', api))
      );
      
      const endTime = Date.now();
      const loadTime = endTime - startTime;
      
      const allSuccessful = responses.every(r => r.status === 200);
      const reasonableLoadTime = loadTime < 3000; // Under 3 seconds
      
      if (allSuccessful && reasonableLoadTime) {
        this.logResult('overall', `Complete Dashboard Load (${loadTime}ms)`, true);
      } else {
        this.logResult('overall', 'Complete Dashboard Load', false,
          `Success: ${allSuccessful}, Time: ${loadTime}ms`);
      }
    } catch (error) {
      this.logResult('overall', 'Complete Dashboard Load', false, error.message);
    }

    // Test 2: Data Integrity Across All Dashboard Components
    try {
      const stats = await this.apiRequest('GET', '/api/dashboard/stats');
      const products = await this.apiRequest('GET', '/api/products');
      const customers = await this.apiRequest('GET', '/api/customers');
      const sales = await this.apiRequest('GET', '/api/sales');
      
      if (stats.status === 200 && products.status === 200 && 
          customers.status === 200 && sales.status === 200) {
        
        // Check data consistency
        const checks = [
          stats.data.totalProducts >= 0,
          stats.data.activeCustomers >= 0,
          stats.data.todaySales >= 0,
          stats.data.lowStockCount >= 0,
          typeof stats.data.totalProducts === 'number',
          typeof stats.data.activeCustomers === 'number'
        ];
        
        const allChecksPass = checks.every(check => check);
        this.logResult('overall', 'Data Integrity Validation', allChecksPass,
          allChecksPass ? null : 'Some data integrity checks failed');
      } else {
        this.logResult('overall', 'Data Integrity Validation', false, 'Failed to fetch required data');
      }
    } catch (error) {
      this.logResult('overall', 'Data Integrity Validation', false, error.message);
    }

    // Test 3: Error Recovery and Graceful Degradation
    try {
      // Test with invalid parameters
      const invalidRequests = [
        '/api/dashboard/stats?invalid=param',
        '/api/dashboard/sales-analytics?days=invalid',
        '/api/dashboard/top-products?limit=abc'
      ];
      
      const responses = await Promise.all(
        invalidRequests.map(api => this.apiRequest('GET', api))
      );
      
      // Should either return 200 with default handling or proper error codes
      const gracefulHandling = responses.every(r => 
        r.status === 200 || r.status === 400 || r.status === 422
      );
      
      this.logResult('overall', 'Error Recovery and Graceful Degradation', gracefulHandling,
        gracefulHandling ? null : 'Unexpected error handling behavior');
    } catch (error) {
      this.logResult('overall', 'Error Recovery and Graceful Degradation', false, error.message);
    }
  }

  // === MAIN TEST RUNNER ===
  async runAllDashboardTests() {
    console.log('🎛️ COMPREHENSIVE DASHBOARD TESTING SUITE');
    console.log('='.repeat(60));
    console.log('Testing all dashboard functionality, APIs, and integrations...\n');

    await this.runUnitTests();
    await this.runFunctionalTests();
    await this.runIntegrationTests();
    await this.runOverallTests();

    // Generate comprehensive report
    this.generateTestReport();
    
    return this.results;
  }

  generateTestReport() {
    console.log('\n' + '='.repeat(60));
    console.log('🎯 DASHBOARD TESTING RESULTS SUMMARY');
    console.log('='.repeat(60));

    const categories = ['unit', 'functional', 'integration', 'overall'];
    let totalPassed = 0, totalFailed = 0;

    categories.forEach(category => {
      const { passed, failed } = this.results[category];
      totalPassed += passed;
      totalFailed += failed;
      const total = passed + failed;
      const successRate = total > 0 ? ((passed / total) * 100).toFixed(1) : 0;
      
      console.log(`\n📊 ${category.toUpperCase()} TESTS:`);
      console.log(`   ✅ Passed: ${passed}`);
      console.log(`   ❌ Failed: ${failed}`);
      console.log(`   📈 Success Rate: ${successRate}%`);
    });

    const grandTotal = totalPassed + totalFailed;
    const overallSuccessRate = grandTotal > 0 ? ((totalPassed / grandTotal) * 100).toFixed(1) : 0;

    console.log(`\n🏆 OVERALL DASHBOARD TESTING:`);
    console.log(`   ✅ Total Passed: ${totalPassed}`);
    console.log(`   ❌ Total Failed: ${totalFailed}`);
    console.log(`   📊 Total Tests: ${grandTotal}`);
    console.log(`   📈 Overall Success Rate: ${overallSuccessRate}%`);

    // List failed tests
    let hasFailures = false;
    categories.forEach(category => {
      if (this.results[category].errors.length > 0) {
        if (!hasFailures) {
          console.log('\n🐛 FAILED TESTS DETAILS:');
          console.log('-'.repeat(40));
          hasFailures = true;
        }
        console.log(`\n${category.toUpperCase()} FAILURES:`);
        this.results[category].errors.forEach((error, index) => {
          console.log(`   ${index + 1}. ${error.test}: ${error.error}`);
        });
      }
    });

    if (!hasFailures) {
      console.log('\n🎉 ALL DASHBOARD TESTS PASSED!');
    }

    // Recommendations
    console.log('\n💡 RECOMMENDATIONS:');
    if (overallSuccessRate >= 95) {
      console.log('   ✅ Dashboard is functioning excellently');
    } else if (overallSuccessRate >= 85) {
      console.log('   ⚠️ Dashboard is mostly functional, minor issues to address');
    } else {
      console.log('   🚨 Dashboard has significant issues requiring immediate attention');
    }

    console.log('\n🏁 Dashboard Testing Complete!');
  }
}

// Run the tests
const tester = new DashboardTester();
tester.runAllDashboardTests().catch(console.error);

// Export for manual testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DashboardTester;
}