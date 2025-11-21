/**
 * Complete Business Flow Test Script
 * Tests the entire MOT system workflow by inserting data
 * 
 * Usage: node test-flow-with-data.js
 * 
 * Prerequisites:
 * 1. Backend API running on http://localhost:5000
 * 2. Frontend running on http://localhost:3000
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api/v1';

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
  },
  service: {
    serviceNumber: `SRV-TEST-${Date.now()}`,
    itemDescription: "Electronics Import - 50 Samsung Galaxy S24 Phones",
    routeCategory: "Air Freight",
    declaredValue: 25000.00,
    taxCategory: "Electronics",
    countryOfOrigin: "South Korea",
    serviceType: 1, // Multimodal
    customerId: null // Will be set after customer creation
  }
};

// Store tokens
const tokens = {};

// Helper function to make API calls
async function apiCall(method, endpoint, data = null, token = null) {
  try {
    const config = {
      method,
      url: `${API_BASE_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || error.message,
      status: error.response?.status
    };
  }
}

// Test functions
async function login(username, password) {
  console.log(`\n🔐 Logging in as ${username}...`);
  const result = await apiCall('POST', '/UserAccount/Login', {
    username,
    password
  });

  if (result.success && result.data?.response?.data?.userToken) {
    const token = result.data.response.data.userToken;
    tokens[username] = token;
    console.log(`✅ ${username} logged in successfully`);
    return token;
  } else {
    console.log(`❌ Login failed for ${username}:`, result.error);
    return null;
  }
}

async function createCustomer(token) {
  console.log('\n👤 Creating customer...');
  const result = await apiCall('POST', '/Customer/Create', testData.customer, token);

  if (result.success && result.data?.response?.data?.id) {
    const customerId = result.data.response.data.id;
    console.log(`✅ Customer created with ID: ${customerId}`);
    testData.service.customerId = customerId;
    return customerId;
  } else {
    console.log('❌ Customer creation failed:', result.error);
    return null;
  }
}

async function approveCustomer(customerId, token) {
  console.log(`\n✅ Approving customer ${customerId}...`);
  const result = await apiCall('PUT', `/Assessor/customers/${customerId}/approve`, {
    isApproved: true,
    notes: "All documents verified. Customer approved."
  }, token);

  if (result.success) {
    console.log(`✅ Customer ${customerId} approved successfully`);
    return true;
  } else {
    console.log(`❌ Customer approval failed:`, result.error);
    return false;
  }
}

async function createService(token) {
  console.log('\n📦 Creating service request...');
  const result = await apiCall('POST', '/Customer/services', testData.service, token);

  if (result.success && result.data?.response?.data?.id) {
    const serviceId = result.data.response.data.id;
    console.log(`✅ Service created with ID: ${serviceId}`);
    return serviceId;
  } else {
    console.log('❌ Service creation failed:', result.error);
    return null;
  }
}

async function assignService(serviceId, executorId, token) {
  console.log(`\n👥 Assigning service ${serviceId} to executor ${executorId}...`);
  const result = await apiCall('PUT', '/Manager/AssignExecutor', {
    serviceId,
    caseExecutorId: executorId
  }, token);

  if (result.success) {
    console.log(`✅ Service ${serviceId} assigned successfully`);
    return true;
  } else {
    console.log(`❌ Service assignment failed:`, result.error);
    return false;
  }
}

async function getServiceStages(serviceId, token) {
  console.log(`\n📋 Getting service stages for service ${serviceId}...`);
  const result = await apiCall('GET', `/Service/GetStages?serviceId=${serviceId}`, null, token);

  if (result.success && result.data?.response?.data) {
    const stages = result.data.response.data;
    console.log(`✅ Found ${stages.length} stages`);
    return stages;
  } else {
    console.log('❌ Failed to get stages:', result.error);
    return [];
  }
}

async function updateStageStatus(serviceId, stageId, status, notes, token) {
  console.log(`\n🔄 Updating stage ${stageId} status...`);
  const result = await apiCall('PUT', '/CaseExecutor/UpdateStageStatus', {
    serviceId,
    stageId,
    status,
    comments: notes
  }, token);

  if (result.success) {
    console.log(`✅ Stage ${stageId} updated successfully`);
    return true;
  } else {
    console.log(`❌ Stage update failed:`, result.error);
    return false;
  }
}

async function testDashboard(endpoint, name, token) {
  console.log(`\n📊 Testing ${name} dashboard...`);
  const result = await apiCall('GET', endpoint, null, token);

  if (result.success) {
    console.log(`✅ ${name} dashboard loaded successfully`);
    return true;
  } else {
    console.log(`❌ ${name} dashboard failed:`, result.error);
    return false;
  }
}

async function testReport(endpoint, name, token) {
  console.log(`\n📈 Testing ${name} report...`);
  const result = await apiCall('GET', endpoint, null, token);

  if (result.success) {
    console.log(`✅ ${name} report generated successfully`);
    return true;
  } else {
    console.log(`❌ ${name} report failed:`, result.error);
    return false;
  }
}

// Main test flow
async function runCompleteTest() {
  console.log('🚀 Starting Complete Business Flow Test');
  console.log('========================================\n');

  let passed = 0;
  let failed = 0;

  try {
    // Phase 1: Authentication
    console.log('📋 PHASE 1: AUTHENTICATION');
    console.log('---------------------------');
    
    const dataEncoderToken = await login('dataencoder', 'dataencoder123');
    if (dataEncoderToken) passed++; else failed++;

    const assessorToken = await login('assessor', 'assessor123');
    if (assessorToken) passed++; else failed++;

    const customerToken = await login('customer', 'customer123');
    if (customerToken) passed++; else failed++;

    const managerToken = await login('manager', 'manager123');
    if (managerToken) passed++; else failed++;

    const executorToken = await login('caseexecutor', 'caseexecutor123');
    if (executorToken) passed++; else failed++;

    // Phase 2: Customer Creation
    console.log('\n📋 PHASE 2: CUSTOMER CREATION');
    console.log('---------------------------');
    
    const customerId = await createCustomer(dataEncoderToken);
    if (customerId) passed++; else failed++;

    // Phase 3: Customer Approval
    console.log('\n📋 PHASE 3: CUSTOMER APPROVAL');
    console.log('---------------------------');
    
    const approved = await approveCustomer(customerId, assessorToken);
    if (approved) passed++; else failed++;

    // Phase 4: Service Creation
    console.log('\n📋 PHASE 4: SERVICE CREATION');
    console.log('---------------------------');
    
    const serviceId = await createService(customerToken);
    if (serviceId) passed++; else failed++;

    // Phase 5: Service Assignment
    console.log('\n📋 PHASE 5: SERVICE ASSIGNMENT');
    console.log('---------------------------');
    
    const assigned = await assignService(serviceId, 5, managerToken); // Assuming user ID 5 is case executor
    if (assigned) passed++; else failed++;

    // Phase 6: Stage Updates
    console.log('\n📋 PHASE 6: STAGE UPDATES');
    console.log('---------------------------');
    
    const stages = await getServiceStages(serviceId, executorToken);
    if (stages.length > 0) {
      passed++;
      // Update first stage
      const firstStage = stages[0];
      const stageUpdated = await updateStageStatus(serviceId, firstStage.id, 3, 'Stage in progress', executorToken);
      if (stageUpdated) passed++; else failed++;
    } else {
      failed++;
    }

    // Phase 7: Dashboards
    console.log('\n📋 PHASE 7: DASHBOARDS');
    console.log('---------------------------');
    
    if (await testDashboard('/Manager/GetDashboard', 'Manager', managerToken)) passed++; else failed++;
    if (await testDashboard('/CaseExecutor/GetDashboard', 'Case Executor', executorToken)) passed++; else failed++;
    if (await testDashboard('/Assessor/GetDashboard', 'Assessor', assessorToken)) passed++; else failed++;
    if (await testDashboard('/DataEncoder/GetDashboard', 'Data Encoder', dataEncoderToken)) passed++; else failed++;

    // Phase 8: Reports
    console.log('\n📋 PHASE 8: REPORTS');
    console.log('---------------------------');
    
    const currentYear = new Date().getFullYear();
    if (await testReport('/Report/GetServiceStatistics', 'Service Statistics', managerToken)) passed++; else failed++;
    if (await testReport(`/Report/GetMonthlyReport?year=${currentYear}`, 'Monthly Report', managerToken)) passed++; else failed++;
    if (await testReport('/Report/GetCustomerStatistics', 'Customer Statistics', managerToken)) passed++; else failed++;
    if (await testReport('/Report/GetSystemReport', 'System Report', managerToken)) passed++; else failed++;

    // Summary
    console.log('\n========================================');
    console.log('📊 TEST SUMMARY');
    console.log('========================================');
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📈 Total: ${passed + failed}`);
    console.log(`🎯 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);

    if (failed === 0) {
      console.log('\n🎉 All tests passed! System is working correctly.');
      process.exit(0);
    } else {
      console.log('\n⚠️  Some tests failed. Please check the errors above.');
      process.exit(1);
    }

  } catch (error) {
    console.error('\n❌ Test execution error:', error);
    process.exit(1);
  }
}

// Check if API is available
async function checkApiHealth() {
  try {
    await axios.get(`${API_BASE_URL}/Test/health`).catch(() => {});
    return true;
  } catch {
    return false;
  }
}

// Run test
(async () => {
  console.log('⏳ Checking API availability...');
  const apiReady = await checkApiHealth();
  
  if (!apiReady) {
    console.log('⚠️  API might not be ready. Make sure backend is running on http://localhost:5000');
    console.log('   Continuing anyway...\n');
  } else {
    console.log('✅ API is ready!\n');
  }

  await runCompleteTest();
})();

