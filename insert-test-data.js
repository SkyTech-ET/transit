/**
 * Insert Test Data Script
 * Inserts complete test data following the business flow
 * 
 * Run: node insert-test-data.js
 */

const axios = require('axios');

const API_URL = 'http://localhost:5000/api/v1';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  blue: '\x1b[34m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Helper function
async function apiCall(method, endpoint, data = null, token = null) {
  try {
    const config = {
      method,
      url: `${API_URL}${endpoint}`,
      headers: { 'Content-Type': 'application/json' }
    };
    if (token) config.headers['Authorization'] = `Bearer ${token}`;
    if (data) config.data = data;
    
    const response = await axios(config);
    // Handle API response structure: { statusCode, error, response: { data } }
    let responseData = response.data;
    if (responseData && responseData.response && responseData.response.data !== undefined) {
      responseData = responseData.response.data;
    } else if (responseData && !responseData.error && responseData.statusCode === 200) {
      // If it's a successful response but data is at root level
      responseData = responseData.response?.data || responseData;
    }
    return { success: true, data: responseData };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || error.message,
      status: error.response?.status
    };
  }
}

// Test data
const testData = {
  customer: {
    businessName: "Test Electronics Import Co",
    tinNumber: "TIN-123456789",
    businessLicense: "BL-2024-001",
    contactPerson: "John Smith",
    contactPhone: "+1-555-0123",
    contactEmail: "john.smith@testemail.com",
    businessAddress: "123 Main Street",
    city: "New York",
    state: "NY",
    postalCode: "10001",
    businessType: "Electronics Import",
    importLicense: "IL-2024-001",
    importLicenseExpiry: "2025-12-31",
    userId: 1
  }
};

let tokens = {};
let customerId = null;
let serviceId = null;

async function main() {
  log('\n🚀 COMPLETE BUSINESS FLOW TEST', 'cyan');
  log('========================================\n', 'cyan');

  // Phase 0: Seed Database
  log('📋 PHASE 0: DATABASE SEEDING', 'yellow');
  log('---------------------------\n', 'yellow');
  
  log('Step 0: Seeding database with initial data...', 'blue');
  let seedResult = await apiCall('POST', '/Seeder/seed', null, null);
  if (seedResult.success) {
    log('✅ Database seeded successfully\n', 'green');
  } else {
    log('⚠️  Database seeding failed or already seeded: ' + JSON.stringify(seedResult.error || seedResult.data), 'yellow');
    log('Continuing with test...\n', 'yellow');
  }

  // Phase 1: Authentication
  log('📋 PHASE 1: AUTHENTICATION', 'yellow');
  log('---------------------------\n', 'yellow');

  // Login as Data Encoder
  log('Step 1: Login as Data Encoder...', 'blue');
  let result = await apiCall('POST', '/User/Login', {
    username: 'dataencoder',
    password: 'Encoder123!'
  });
  if (result.success && (result.data?.accessToken || result.data?.AccessToken)) {
    tokens.dataEncoder = result.data.accessToken || result.data.AccessToken;
    log('✅ Data Encoder logged in\n', 'green');
  } else {
    log('❌ Login failed: ' + JSON.stringify(result.error || result.data), 'red');
    return;
  }

  // Login as Assessor
  log('Step 2: Login as Assessor...', 'blue');
  result = await apiCall('POST', '/User/Login', {
    username: 'assessor',
    password: 'Assessor123!'
  });
  if (result.success && (result.data?.accessToken || result.data?.AccessToken)) {
    tokens.assessor = result.data.accessToken || result.data.AccessToken;
    log('✅ Assessor logged in\n', 'green');
  } else {
    log('❌ Login failed: ' + JSON.stringify(result.error || result.data), 'red');
    return;
  }

  // Login as Customer
  log('Step 3: Login as Customer...', 'blue');
  result = await apiCall('POST', '/User/Login', {
    username: 'customer',
    password: 'Customer123!'
  });
  if (result.success && (result.data?.accessToken || result.data?.AccessToken)) {
    tokens.customer = result.data.accessToken || result.data.AccessToken;
    log('✅ Customer logged in\n', 'green');
  } else {
    log('❌ Login failed: ' + JSON.stringify(result.error || result.data), 'red');
    return;
  }

  // Login as Manager
  log('Step 4: Login as Manager...', 'blue');
  result = await apiCall('POST', '/User/Login', {
    username: 'manager',
    password: 'Manager123!'
  });
  if (result.success && (result.data?.accessToken || result.data?.AccessToken)) {
    tokens.manager = result.data.accessToken || result.data.AccessToken;
    log('✅ Manager logged in\n', 'green');
  } else {
    log('❌ Login failed: ' + JSON.stringify(result.error || result.data), 'red');
    return;
  }

  // Login as Case Executor
  log('Step 5: Login as Case Executor...', 'blue');
  result = await apiCall('POST', '/User/Login', {
    username: 'caseexecutor',
    password: 'Executor123!'
  });
  if (result.success && (result.data?.accessToken || result.data?.AccessToken)) {
    tokens.executor = result.data.accessToken || result.data.AccessToken;
    log('✅ Case Executor logged in\n', 'green');
  } else {
    log('❌ Login failed: ' + JSON.stringify(result.error || result.data), 'red');
    return;
  }

  // Phase 2: Customer Creation
  log('\n📋 PHASE 2: CUSTOMER CREATION', 'yellow');
  log('---------------------------\n', 'yellow');

  log('Step 6: Data Encoder creates customer...', 'blue');
  result = await apiCall('POST', '/Customer/Create', testData.customer, tokens.dataEncoder);
  if (result.success && (result.data?.id || result.data?.Id)) {
    customerId = result.data.id || result.data.Id;
    log(`✅ Customer created with ID: ${customerId}\n`, 'green');
    log('Customer Details:', 'cyan');
    console.log(JSON.stringify(result.data, null, 2));
  } else {
    log('❌ Customer creation failed: ' + JSON.stringify(result.error || result.data), 'red');
    return;
  }

  // Phase 3: Customer Approval
  log('\n📋 PHASE 3: CUSTOMER APPROVAL', 'yellow');
  log('---------------------------\n', 'yellow');

  log(`Step 7: Assessor approves customer ${customerId}...`, 'blue');
  result = await apiCall('PUT', `/Assessor/customers/${customerId}/approve`, {
    isApproved: true,
    notes: "All documents verified. Customer approved."
  }, tokens.assessor);
  if (result.success) {
    log(`✅ Customer ${customerId} approved successfully\n`, 'green');
  } else {
    log('❌ Customer approval failed: ' + JSON.stringify(result.error), 'red');
    return;
  }

  // Phase 4: Service Creation
  log('\n📋 PHASE 4: SERVICE REQUEST CREATION', 'yellow');
  log('---------------------------\n', 'yellow');

  const serviceNumber = `SRV-TEST-${Date.now()}`;
  const serviceData = {
    serviceNumber: serviceNumber,
    itemDescription: "Electronics Import - 50 Samsung Galaxy S24 Phones",
    routeCategory: "Air Freight",
    declaredValue: 25000.00,
    taxCategory: "Electronics",
    countryOfOrigin: "South Korea",
    serviceType: 1, // Multimodal
    customerId: customerId
  };

  log('Step 8: Customer creates service request...', 'blue');
  result = await apiCall('POST', '/Customer/services', serviceData, tokens.customer);
  if (result.success && (result.data?.id || result.data?.Id)) {
    serviceId = result.data.id || result.data.Id;
    log(`✅ Service created with ID: ${serviceId}\n`, 'green');
    log('Service Details:', 'cyan');
    console.log(JSON.stringify(result.data, null, 2));
  } else {
    log('❌ Service creation failed: ' + JSON.stringify(result.error || result.data), 'red');
    return;
  }

  // Phase 5: Service Assignment
  log('\n📋 PHASE 5: SERVICE ASSIGNMENT', 'yellow');
  log('---------------------------\n', 'yellow');

  log(`Step 9: Manager assigns service ${serviceId} to case executor...`, 'blue');
  result = await apiCall('PUT', '/Manager/AssignExecutor', {
    serviceId: serviceId,
    caseExecutorId: 5 // Assuming user ID 5 is case executor
  }, tokens.manager);
  if (result.success) {
    log(`✅ Service ${serviceId} assigned successfully\n`, 'green');
  } else {
    log('❌ Service assignment failed: ' + JSON.stringify(result.error), 'red');
    log('Note: This might fail if user ID 5 is not a case executor. Check your database.', 'yellow');
  }

  // Phase 6: Get Service Stages
  log('\n📋 PHASE 6: SERVICE STAGES', 'yellow');
  log('---------------------------\n', 'yellow');

  log(`Step 10: Getting service stages for service ${serviceId}...`, 'blue');
  result = await apiCall('GET', `/Service/GetStages?serviceId=${serviceId}`, null, tokens.executor);
  if (result.success && result.data) {
    const stages = Array.isArray(result.data) ? result.data : (result.data.response?.data || []);
    log(`✅ Found ${stages.length} stages\n`, 'green');
    
    if (stages.length > 0) {
      const firstStage = stages[0];
      log(`Step 11: Updating stage ${firstStage.id || firstStage.Id} status...`, 'blue');
      result = await apiCall('PUT', '/CaseExecutor/UpdateStageStatus', {
        serviceId: serviceId,
        stageId: firstStage.id || firstStage.Id,
        status: 2, // InProgress (check StageStatus enum)
        comments: 'Stage processing started'
      }, tokens.executor);
      if (result.success) {
        log(`✅ Stage ${firstStage.id} updated successfully\n`, 'green');
      } else {
        log('❌ Stage update failed: ' + JSON.stringify(result.error), 'red');
      }
    }
  } else {
    log('❌ Failed to get stages: ' + JSON.stringify(result.error), 'red');
  }

  // Phase 7: Dashboards
  log('\n📋 PHASE 7: DASHBOARDS', 'yellow');
  log('---------------------------\n', 'yellow');

  log('Step 12: Testing Manager Dashboard...', 'blue');
  result = await apiCall('GET', '/Manager/GetDashboard', null, tokens.manager);
  if (result.success) {
    log('✅ Manager Dashboard loaded\n', 'green');
    log('Dashboard Stats:', 'cyan');
    const dashboard = result.data;
    console.log(`  Total Services: ${dashboard.totalServices || dashboard.TotalServices || 'N/A'}`);
    console.log(`  Completed: ${dashboard.completedServices || dashboard.CompletedServices || 'N/A'}`);
    console.log(`  Pending: ${dashboard.pendingServices || dashboard.PendingServices || 'N/A'}`);
  } else {
    log('❌ Manager Dashboard failed: ' + JSON.stringify(result.error || result.data), 'red');
  }

  log('Step 13: Testing Case Executor Dashboard...', 'blue');
  result = await apiCall('GET', '/CaseExecutor/GetDashboard', null, tokens.executor);
  if (result.success) {
    log('✅ Case Executor Dashboard loaded\n', 'green');
  } else {
    log('❌ Case Executor Dashboard failed: ' + JSON.stringify(result.error), 'red');
  }

  log('Step 14: Testing Assessor Dashboard...', 'blue');
  result = await apiCall('GET', '/Assessor/GetDashboard', null, tokens.assessor);
  if (result.success) {
    log('✅ Assessor Dashboard loaded\n', 'green');
  } else {
    log('❌ Assessor Dashboard failed: ' + JSON.stringify(result.error), 'red');
  }

  log('Step 15: Testing Data Encoder Dashboard...', 'blue');
  result = await apiCall('GET', '/DataEncoder/GetDashboard', null, tokens.dataEncoder);
  if (result.success) {
    log('✅ Data Encoder Dashboard loaded\n', 'green');
  } else {
    log('❌ Data Encoder Dashboard failed: ' + JSON.stringify(result.error), 'red');
  }

  // Phase 8: Reports
  log('\n📋 PHASE 8: REPORTS', 'yellow');
  log('---------------------------\n', 'yellow');

  log('Step 16: Testing Service Statistics Report...', 'blue');
  result = await apiCall('GET', '/Report/ServiceStatistics', null, tokens.manager);
  if (result.success) {
    log('✅ Service Statistics Report generated\n', 'green');
    const report = result.data;
    console.log(`  Total Services: ${report.totalServices || report.TotalServices || 'N/A'}`);
    console.log(`  Completed: ${report.completedServices || report.CompletedServices || 'N/A'}`);
    console.log(`  Completion Rate: ${report.completionRate || report.CompletionRate || 'N/A'}%`);
  } else {
    log('❌ Service Statistics Report failed: ' + JSON.stringify(result.error || result.data), 'red');
  }

  log('Step 17: Testing Monthly Report...', 'blue');
  const currentYear = new Date().getFullYear();
  result = await apiCall('GET', `/Report/MonthlyReports?year=${currentYear}`, null, tokens.manager);
  if (result.success) {
    log('✅ Monthly Report generated\n', 'green');
    const reports = Array.isArray(result.data) ? result.data : [];
    console.log(`  Found ${reports.length} months of data`);
  } else {
    log('❌ Monthly Report failed: ' + JSON.stringify(result.error || result.data), 'red');
  }

  log('Step 18: Testing Customer Statistics Report...', 'blue');
  result = await apiCall('GET', '/Report/CustomerStatistics', null, tokens.manager);
  if (result.success) {
    log('✅ Customer Statistics Report generated\n', 'green');
    const report = result.data;
    console.log(`  Total Customers: ${report.totalCustomers || report.TotalCustomers || 'N/A'}`);
    console.log(`  Verified: ${report.verifiedCustomers || report.VerifiedCustomers || 'N/A'}`);
  } else {
    log('❌ Customer Statistics Report failed: ' + JSON.stringify(result.error || result.data), 'red');
  }

  log('Step 19: Testing System Report...', 'blue');
  result = await apiCall('GET', '/Report/SystemReport', null, tokens.manager);
  if (result.success) {
    log('✅ System Report generated\n', 'green');
    const report = result.data;
    console.log(`  Total Users: ${report.totalUsers || report.TotalUsers || 'N/A'}`);
    console.log(`  Total Documents: ${report.totalDocuments || report.TotalDocuments || 'N/A'}`);
    console.log(`  Total Messages: ${report.totalMessages || report.TotalMessages || 'N/A'}`);
  } else {
    log('❌ System Report failed: ' + JSON.stringify(result.error || result.data), 'red');
  }

  // Summary
  log('\n========================================', 'cyan');
  log('📊 TEST SUMMARY', 'cyan');
  log('========================================', 'cyan');
  log(`\n✅ Created Customer ID: ${customerId}`, 'green');
  log(`✅ Created Service ID: ${serviceId}`, 'green');
  log(`\n🎉 Complete business flow test finished!`, 'green');
  log('\n📝 Next Steps:', 'yellow');
  log('1. Open browser to http://localhost:3000', 'blue');
  log('2. Login and verify the data you just created', 'blue');
  log('3. Check dashboards show the new data', 'blue');
  log('4. Verify reports include the new data', 'blue');
  log('\n');
}

// Run the test
main().catch(error => {
  log('❌ Test execution error: ' + error.message, 'red');
  console.error(error);
  process.exit(1);
});

