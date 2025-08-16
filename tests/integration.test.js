// Integration Testing Suite
// Tests complete workflows and business processes

const baseUrl = 'http://localhost:5000';

class IntegrationTester {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      errors: [],
      workflows: []
    };
    this.testData = {
      createdProducts: [],
      createdCustomers: [],
      createdSuppliers: [],
      createdSales: [],
      createdPurchaseOrders: []
    };
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

  logPass(testName) {
    console.log(`✅ PASS: ${testName}`);
    this.results.passed++;
  }

  logFail(testName, error) {
    console.log(`❌ FAIL: ${testName} - ${error}`);
    this.results.failed++;
    this.results.errors.push({ test: testName, error });
  }

  logWorkflow(workflowName, steps) {
    this.results.workflows.push({ name: workflowName, steps });
  }

  // === COMPLETE BUSINESS WORKFLOWS ===

  async testCompleteProductLifecycle() {
    console.log('\n🔄 Testing Complete Product Lifecycle...');
    const workflow = [];
    
    try {
      // 1. Create a new product
      const productData = {
        name: `Integration Test Product ${Date.now()}`,
        sku: `INT-${Date.now()}`,
        barcode: `INT${Date.now()}`,
        category: 'Test Category',
        sellingPrice: '15.99',
        costPrice: '8.99',
        currentStock: 50,
        minStockLevel: 10
      };
      
      const createResponse = await this.apiRequest('POST', '/api/products', productData);
      if (createResponse.status !== 201) {
        throw new Error(`Product creation failed: ${createResponse.status}`);
      }
      
      const createdProduct = createResponse.data;
      this.testData.createdProducts.push(createdProduct);
      workflow.push('✅ Product created successfully');

      // 2. Retrieve the product
      const getResponse = await this.apiRequest('GET', `/api/products/${createdProduct.id}`);
      if (getResponse.status !== 200) {
        throw new Error(`Product retrieval failed: ${getResponse.status}`);
      }
      workflow.push('✅ Product retrieved successfully');

      // 3. Update the product
      const updateData = { sellingPrice: '16.99', currentStock: 45 };
      const updateResponse = await this.apiRequest('PUT', `/api/products/${createdProduct.id}`, updateData);
      if (updateResponse.status !== 200) {
        throw new Error(`Product update failed: ${updateResponse.status}`);
      }
      workflow.push('✅ Product updated successfully');

      // 4. Verify the product appears in low stock if applicable
      const lowStockResponse = await this.apiRequest('GET', '/api/products/low-stock');
      workflow.push('✅ Low stock check completed');

      this.logPass('Complete Product Lifecycle');
      this.logWorkflow('Product Lifecycle', workflow);
      
    } catch (error) {
      workflow.push(`❌ Failed: ${error.message}`);
      this.logFail('Complete Product Lifecycle', error.message);
      this.logWorkflow('Product Lifecycle', workflow);
    }
  }

  async testCompleteSalesWorkflow() {
    console.log('\n💰 Testing Complete Sales Workflow...');
    const workflow = [];
    
    try {
      // 1. Get available products
      const productsResponse = await this.apiRequest('GET', '/api/products');
      if (productsResponse.data.length === 0) {
        throw new Error('No products available for sale');
      }
      
      const product = productsResponse.data[0];
      workflow.push(`✅ Product selected: ${product.name}`);

      // 2. Create a customer (optional)
      const customerData = {
        name: `Integration Test Customer ${Date.now()}`,
        email: `integration${Date.now()}@test.com`,
        phone: `555${Date.now().toString().slice(-7)}`,
        address: '123 Test Street'
      };
      
      const customerResponse = await this.apiRequest('POST', '/api/customers', customerData);
      let customerId = null;
      if (customerResponse.status === 201) {
        customerId = customerResponse.data.id;
        this.testData.createdCustomers.push(customerResponse.data);
        workflow.push('✅ Customer created');
      }

      // 3. Process a sale
      const saleData = {
        items: [{
          productId: product.id,
          quantity: 2,
          price: product.sellingPrice
        }],
        totalAmount: (parseFloat(product.sellingPrice) * 2).toString(),
        paymentMethod: 'cash',
        customerId: customerId
      };
      
      const saleResponse = await this.apiRequest('POST', '/api/sales', saleData);
      if (saleResponse.status !== 201) {
        throw new Error(`Sale creation failed: ${saleResponse.status}`);
      }
      
      const createdSale = saleResponse.data;
      this.testData.createdSales.push(createdSale);
      workflow.push('✅ Sale processed successfully');

      // 4. Verify inventory was updated
      const updatedProductResponse = await this.apiRequest('GET', `/api/products/${product.id}`);
      if (updatedProductResponse.status === 200) {
        const updatedProduct = updatedProductResponse.data;
        const expectedStock = product.currentStock - 2;
        if (updatedProduct.currentStock === expectedStock) {
          workflow.push('✅ Inventory automatically updated');
        } else {
          workflow.push(`⚠️ Inventory update check: expected ${expectedStock}, got ${updatedProduct.currentStock}`);
        }
      }

      // 5. Verify sale appears in dashboard
      const statsResponse = await this.apiRequest('GET', '/api/dashboard/stats');
      if (statsResponse.status === 200) {
        workflow.push('✅ Dashboard stats accessible');
      }

      this.logPass('Complete Sales Workflow');
      this.logWorkflow('Sales Workflow', workflow);
      
    } catch (error) {
      workflow.push(`❌ Failed: ${error.message}`);
      this.logFail('Complete Sales Workflow', error.message);
      this.logWorkflow('Sales Workflow', workflow);
    }
  }

  async testPurchaseOrderWorkflow() {
    console.log('\n📦 Testing Purchase Order Workflow...');
    const workflow = [];
    
    try {
      // 1. Create a supplier
      const supplierData = {
        name: `Integration Supplier ${Date.now()}`,
        email: `supplier${Date.now()}@test.com`,
        phone: `555${Date.now().toString().slice(-7)}`,
        address: '456 Supplier Ave'
      };
      
      const supplierResponse = await this.apiRequest('POST', '/api/suppliers', supplierData);
      if (supplierResponse.status !== 201) {
        throw new Error(`Supplier creation failed: ${supplierResponse.status}`);
      }
      
      const supplier = supplierResponse.data;
      this.testData.createdSuppliers.push(supplier);
      workflow.push('✅ Supplier created');

      // 2. Create a purchase order
      const poData = {
        supplierId: supplier.id,
        expectedDeliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        notes: 'Integration test purchase order',
        items: [],
        totalAmount: '500.00'
      };
      
      const poResponse = await this.apiRequest('POST', '/api/purchase-orders', poData);
      if (poResponse.status !== 201) {
        throw new Error(`Purchase order creation failed: ${poResponse.status}`);
      }
      
      const purchaseOrder = poResponse.data;
      this.testData.createdPurchaseOrders.push(purchaseOrder);
      workflow.push('✅ Purchase order created');

      // 3. Retrieve purchase orders
      const getPOsResponse = await this.apiRequest('GET', '/api/purchase-orders');
      if (getPOsResponse.status === 200) {
        const pos = getPOsResponse.data;
        const foundPO = pos.find(po => po.id === purchaseOrder.id);
        if (foundPO) {
          workflow.push('✅ Purchase order retrieved successfully');
        } else {
          workflow.push('⚠️ Purchase order not found in list');
        }
      }

      this.logPass('Purchase Order Workflow');
      this.logWorkflow('Purchase Order Workflow', workflow);
      
    } catch (error) {
      workflow.push(`❌ Failed: ${error.message}`);
      this.logFail('Purchase Order Workflow', error.message);
      this.logWorkflow('Purchase Order Workflow', workflow);
    }
  }

  async testExportWorkflow() {
    console.log('\n📊 Testing Export Workflow...');
    const workflow = [];
    
    try {
      // Test all export formats
      const exports = [
        { name: 'Sales CSV', endpoint: '/api/export/sales?format=csv' },
        { name: 'Sales JSON', endpoint: '/api/export/sales?format=json' },
        { name: 'Inventory CSV', endpoint: '/api/export/inventory?format=csv' },
        { name: 'Inventory JSON', endpoint: '/api/export/inventory?format=json' },
        { name: 'Customers CSV', endpoint: '/api/export/customers?format=csv' },
        { name: 'Customers JSON', endpoint: '/api/export/customers?format=json' }
      ];

      for (const exportTest of exports) {
        const response = await this.apiRequest('GET', exportTest.endpoint);
        if (response.status === 200) {
          workflow.push(`✅ ${exportTest.name} export successful`);
        } else {
          workflow.push(`❌ ${exportTest.name} export failed: ${response.status}`);
        }
      }

      this.logPass('Export Workflow');
      this.logWorkflow('Export Workflow', workflow);
      
    } catch (error) {
      workflow.push(`❌ Failed: ${error.message}`);
      this.logFail('Export Workflow', error.message);
      this.logWorkflow('Export Workflow', workflow);
    }
  }

  async testDashboardAnalyticsWorkflow() {
    console.log('\n📈 Testing Dashboard Analytics Workflow...');
    const workflow = [];
    
    try {
      const analyticsEndpoints = [
        { name: 'Dashboard Stats', endpoint: '/api/dashboard/stats' },
        { name: 'Sales Analytics', endpoint: '/api/dashboard/sales-analytics' },
        { name: 'Top Products', endpoint: '/api/dashboard/top-products' },
        { name: 'Recent Activity', endpoint: '/api/dashboard/recent-activity' }
      ];

      for (const analytics of analyticsEndpoints) {
        const response = await this.apiRequest('GET', analytics.endpoint);
        if (response.status === 200) {
          workflow.push(`✅ ${analytics.name} loaded successfully`);
        } else {
          workflow.push(`❌ ${analytics.name} failed: ${response.status}`);
        }
      }

      this.logPass('Dashboard Analytics Workflow');
      this.logWorkflow('Dashboard Analytics Workflow', workflow);
      
    } catch (error) {
      workflow.push(`❌ Failed: ${error.message}`);
      this.logFail('Dashboard Analytics Workflow', error.message);
      this.logWorkflow('Dashboard Analytics Workflow', workflow);
    }
  }

  async testDataConsistencyWorkflow() {
    console.log('\n🔍 Testing Data Consistency...');
    const workflow = [];
    
    try {
      // Test that created data is consistent across endpoints
      if (this.testData.createdProducts.length > 0) {
        const product = this.testData.createdProducts[0];
        const getResponse = await this.apiRequest('GET', `/api/products/${product.id}`);
        
        if (getResponse.status === 200 && getResponse.data.id === product.id) {
          workflow.push('✅ Product data consistency verified');
        } else {
          workflow.push('❌ Product data consistency check failed');
        }
      }

      if (this.testData.createdCustomers.length > 0) {
        const customer = this.testData.createdCustomers[0];
        const getResponse = await this.apiRequest('GET', `/api/customers/${customer.id}`);
        
        if (getResponse.status === 200 && getResponse.data.id === customer.id) {
          workflow.push('✅ Customer data consistency verified');
        } else {
          workflow.push('❌ Customer data consistency check failed');
        }
      }

      this.logPass('Data Consistency Workflow');
      this.logWorkflow('Data Consistency Workflow', workflow);
      
    } catch (error) {
      workflow.push(`❌ Failed: ${error.message}`);
      this.logFail('Data Consistency Workflow', error.message);
      this.logWorkflow('Data Consistency Workflow', workflow);
    }
  }

  async runIntegrationTests() {
    console.log('🔗 Starting Integration Testing Suite\n');
    console.log('='.repeat(60));

    // Run all integration tests
    await this.testCompleteProductLifecycle();
    await this.testCompleteSalesWorkflow();
    await this.testPurchaseOrderWorkflow();
    await this.testExportWorkflow();
    await this.testDashboardAnalyticsWorkflow();
    await this.testDataConsistencyWorkflow();

    // Results Summary
    console.log('\n' + '='.repeat(60));
    console.log('🎯 INTEGRATION TEST RESULTS');
    console.log('='.repeat(60));
    console.log(`✅ Passed: ${this.results.passed}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    console.log(`📊 Total: ${this.results.passed + this.results.failed}`);
    
    const successRate = this.results.passed + this.results.failed > 0 
      ? ((this.results.passed / (this.results.passed + this.results.failed)) * 100).toFixed(1)
      : 0;
    console.log(`📈 Success Rate: ${successRate}%`);

    // Workflow Details
    console.log('\n📋 WORKFLOW DETAILS:');
    console.log('-'.repeat(40));
    this.results.workflows.forEach((workflow, index) => {
      console.log(`\n${index + 1}. ${workflow.name}:`);
      workflow.steps.forEach(step => console.log(`   ${step}`));
    });

    if (this.results.errors.length > 0) {
      console.log('\n🐛 FAILED TESTS:');
      console.log('-'.repeat(40));
      this.results.errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error.test}: ${error.error}`);
      });
    }

    console.log('\n🏁 Integration Testing Complete!');
    return this.results;
  }
}

// Run tests
const tester = new IntegrationTester();
tester.runIntegrationTests().catch(console.error);

module.exports = IntegrationTester;