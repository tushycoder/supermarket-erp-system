// Comprehensive API Testing Suite
const baseUrl = 'http://localhost:5000';

// Test Results Storage
let testResults = {
  passed: 0,
  failed: 0,
  errors: []
};

// Helper function to make requests
async function apiRequest(method, endpoint, data = null) {
  try {
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      }
    };
    
    if (data) {
      options.body = JSON.stringify(data);
    }
    
    const response = await fetch(`${baseUrl}${endpoint}`, options);
    const responseData = await response.text();
    
    let jsonData;
    try {
      jsonData = JSON.parse(responseData);
    } catch (e) {
      jsonData = responseData;
    }
    
    return {
      status: response.status,
      data: jsonData,
      headers: response.headers
    };
  } catch (error) {
    throw new Error(`Request failed: ${error.message}`);
  }
}

// Test function wrapper
function test(name, fn) {
  return async () => {
    try {
      console.log(`🧪 Testing: ${name}`);
      await fn();
      console.log(`✅ PASS: ${name}`);
      testResults.passed++;
    } catch (error) {
      console.log(`❌ FAIL: ${name} - ${error.message}`);
      testResults.failed++;
      testResults.errors.push({ test: name, error: error.message });
    }
  };
}

// Assert function
function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

// === AUTHENTICATION TESTS ===
const authTests = [
  test('Login with valid credentials', async () => {
    const response = await apiRequest('POST', '/api/auth/login', {
      email: 'admin@supermarket.com',
      password: 'admin123'
    });
    assert(response.status === 200, `Expected 200, got ${response.status}`);
    assert(response.data.success, 'Login should be successful');
    assert(response.data.user, 'Should return user data');
  }),

  test('Get current user after login', async () => {
    const response = await apiRequest('GET', '/api/auth/user');
    assert(response.status === 200 || response.status === 401, `Unexpected status: ${response.status}`);
  })
];

// === PRODUCT MANAGEMENT TESTS ===
const productTests = [
  test('Get all products', async () => {
    const response = await apiRequest('GET', '/api/products');
    assert(response.status === 200, `Expected 200, got ${response.status}`);
    assert(Array.isArray(response.data), 'Should return array of products');
  }),

  test('Get product by ID', async () => {
    // First get all products to get a valid ID
    const productsResponse = await apiRequest('GET', '/api/products');
    if (productsResponse.data.length > 0) {
      const productId = productsResponse.data[0].id;
      const response = await apiRequest('GET', `/api/products/${productId}`);
      assert(response.status === 200, `Expected 200, got ${response.status}`);
      assert(response.data.id === productId, 'Should return correct product');
    }
  }),

  test('Create new product', async () => {
    const testProduct = {
      name: 'Test Product',
      sku: `TEST-${Date.now()}`,
      barcode: `TEST${Date.now()}`,
      category: 'Test Category',
      sellingPrice: '10.99',
      costPrice: '5.99',
      currentStock: 100,
      minStockLevel: 10
    };
    
    const response = await apiRequest('POST', '/api/products', testProduct);
    assert(response.status === 201, `Expected 201, got ${response.status}`);
    assert(response.data.name === testProduct.name, 'Should return created product');
  }),

  test('Get low stock products', async () => {
    const response = await apiRequest('GET', '/api/products/low-stock');
    assert(response.status === 200, `Expected 200, got ${response.status}`);
    assert(Array.isArray(response.data), 'Should return array of low stock products');
  })
];

// === CUSTOMER MANAGEMENT TESTS ===
const customerTests = [
  test('Get all customers', async () => {
    const response = await apiRequest('GET', '/api/customers');
    assert(response.status === 200, `Expected 200, got ${response.status}`);
    assert(Array.isArray(response.data), 'Should return array of customers');
  }),

  test('Create new customer', async () => {
    const testCustomer = {
      name: 'Test Customer',
      email: `test${Date.now()}@example.com`,
      phone: `555${Date.now().toString().slice(-7)}`,
      address: '123 Test Street'
    };
    
    const response = await apiRequest('POST', '/api/customers', testCustomer);
    assert(response.status === 201, `Expected 201, got ${response.status}`);
    assert(response.data.name === testCustomer.name, 'Should return created customer');
  })
];

// === SUPPLIER MANAGEMENT TESTS ===
const supplierTests = [
  test('Get all suppliers', async () => {
    const response = await apiRequest('GET', '/api/suppliers');
    assert(response.status === 200, `Expected 200, got ${response.status}`);
    assert(Array.isArray(response.data), 'Should return array of suppliers');
  }),

  test('Create new supplier', async () => {
    const testSupplier = {
      name: 'Test Supplier',
      email: `supplier${Date.now()}@example.com`,
      phone: `555${Date.now().toString().slice(-7)}`,
      address: '456 Supplier Avenue'
    };
    
    const response = await apiRequest('POST', '/api/suppliers', testSupplier);
    assert(response.status === 201, `Expected 201, got ${response.status}`);
    assert(response.data.name === testSupplier.name, 'Should return created supplier');
  })
];

// === SALES TESTS ===
const salesTests = [
  test('Get all sales', async () => {
    const response = await apiRequest('GET', '/api/sales');
    assert(response.status === 200, `Expected 200, got ${response.status}`);
    assert(Array.isArray(response.data), 'Should return array of sales');
  }),

  test('Create new sale', async () => {
    // First get a product to sell
    const productsResponse = await apiRequest('GET', '/api/products');
    if (productsResponse.data.length > 0) {
      const product = productsResponse.data[0];
      
      const testSale = {
        items: [{
          productId: product.id,
          quantity: 1,
          price: product.sellingPrice
        }],
        totalAmount: product.sellingPrice,
        paymentMethod: 'cash',
        customerId: null
      };
      
      const response = await apiRequest('POST', '/api/sales', testSale);
      assert(response.status === 201, `Expected 201, got ${response.status}`);
      assert(response.data.totalAmount, 'Should return sale with total amount');
    }
  })
];

// === DASHBOARD TESTS ===
const dashboardTests = [
  test('Get dashboard stats', async () => {
    const response = await apiRequest('GET', '/api/dashboard/stats');
    assert(response.status === 200, `Expected 200, got ${response.status}`);
    assert(typeof response.data === 'object', 'Should return stats object');
  }),

  test('Get sales analytics', async () => {
    const response = await apiRequest('GET', '/api/dashboard/sales-analytics');
    assert(response.status === 200, `Expected 200, got ${response.status}`);
    assert(Array.isArray(response.data), 'Should return analytics array');
  }),

  test('Get top products', async () => {
    const response = await apiRequest('GET', '/api/dashboard/top-products');
    assert(response.status === 200, `Expected 200, got ${response.status}`);
    assert(Array.isArray(response.data), 'Should return top products array');
  }),

  test('Get recent activity', async () => {
    const response = await apiRequest('GET', '/api/dashboard/recent-activity');
    assert(response.status === 200, `Expected 200, got ${response.status}`);
    assert(Array.isArray(response.data), 'Should return recent activity array');
  })
];

// === EXPORT TESTS ===
const exportTests = [
  test('Export sales data as CSV', async () => {
    const response = await apiRequest('GET', '/api/export/sales?format=csv');
    assert(response.status === 200, `Expected 200, got ${response.status}`);
    assert(typeof response.data === 'string', 'Should return CSV string');
  }),

  test('Export inventory data as JSON', async () => {
    const response = await apiRequest('GET', '/api/export/inventory?format=json');
    assert(response.status === 200, `Expected 200, got ${response.status}`);
    assert(Array.isArray(response.data), 'Should return JSON array');
  }),

  test('Export customers data', async () => {
    const response = await apiRequest('GET', '/api/export/customers');
    assert(response.status === 200, `Expected 200, got ${response.status}`);
  })
];

// === PURCHASE ORDER TESTS ===
const purchaseOrderTests = [
  test('Get all purchase orders', async () => {
    const response = await apiRequest('GET', '/api/purchase-orders');
    assert(response.status === 200, `Expected 200, got ${response.status}`);
    assert(Array.isArray(response.data), 'Should return array of purchase orders');
  }),

  test('Create new purchase order', async () => {
    // First get a supplier
    const suppliersResponse = await apiRequest('GET', '/api/suppliers');
    if (suppliersResponse.data.length > 0) {
      const supplier = suppliersResponse.data[0];
      
      const testPO = {
        supplierId: supplier.id,
        expectedDeliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        notes: 'Test purchase order',
        items: [],
        totalAmount: '100.00'
      };
      
      const response = await apiRequest('POST', '/api/purchase-orders', testPO);
      assert(response.status === 201, `Expected 201, got ${response.status}`);
      assert(response.data.supplierId === supplier.id, 'Should return created purchase order');
    }
  })
];

// === USER MANAGEMENT TESTS ===
const userTests = [
  test('Get all users', async () => {
    const response = await apiRequest('GET', '/api/users');
    assert(response.status === 200, `Expected 200, got ${response.status}`);
    assert(Array.isArray(response.data), 'Should return array of users');
  })
];

// === INVOICE TESTS ===
const invoiceTests = [
  test('Get all invoices', async () => {
    const response = await apiRequest('GET', '/api/invoices');
    assert(response.status === 200, `Expected 200, got ${response.status}`);
    assert(Array.isArray(response.data), 'Should return array of invoices');
  })
];

// === RUN ALL TESTS ===
async function runAllTests() {
  console.log('🚀 Starting Comprehensive ERP System Testing\n');
  console.log('=' * 60);
  
  const testSuites = [
    { name: 'Authentication', tests: authTests },
    { name: 'Product Management', tests: productTests },
    { name: 'Customer Management', tests: customerTests },
    { name: 'Supplier Management', tests: supplierTests },
    { name: 'Sales Processing', tests: salesTests },
    { name: 'Dashboard Analytics', tests: dashboardTests },
    { name: 'Export Functionality', tests: exportTests },
    { name: 'Purchase Orders', tests: purchaseOrderTests },
    { name: 'User Management', tests: userTests },
    { name: 'Invoice Management', tests: invoiceTests }
  ];
  
  for (const suite of testSuites) {
    console.log(`\n📋 ${suite.name} Tests:`);
    console.log('-'.repeat(40));
    
    for (const testFn of suite.tests) {
      await testFn();
    }
  }
  
  // Final Results
  console.log('\n' + '='.repeat(60));
  console.log('🎯 TEST RESULTS SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📊 Total: ${testResults.passed + testResults.failed}`);
  console.log(`📈 Success Rate: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`);
  
  if (testResults.errors.length > 0) {
    console.log('\n🐛 FAILED TESTS DETAILS:');
    console.log('-'.repeat(40));
    testResults.errors.forEach((error, index) => {
      console.log(`${index + 1}. ${error.test}: ${error.error}`);
    });
  }
  
  return testResults;
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { runAllTests, testResults };
} else {
  // Run tests in browser/node environment
  runAllTests().then(results => {
    console.log('\n🏁 Testing Complete!');
  }).catch(error => {
    console.error('💥 Testing failed:', error);
  });
}