#!/bin/bash

# Complete Business Flow Test Script
# This script tests the entire MOT system workflow

echo "🚀 Starting Complete Business Flow Test"
echo "========================================"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# API Base URL
API_URL="http://localhost:5000/api/v1"

# Test results
PASSED=0
FAILED=0

# Function to make API calls
api_call() {
    local method=$1
    local endpoint=$2
    local data=$3
    local token=$4
    
    if [ -z "$token" ]; then
        if [ "$method" = "GET" ]; then
            curl -s -X GET "$API_URL$endpoint" -H "Content-Type: application/json"
        else
            curl -s -X $method "$API_URL$endpoint" -H "Content-Type: application/json" -d "$data"
        fi
    else
        if [ "$method" = "GET" ]; then
            curl -s -X GET "$API_URL$endpoint" -H "Content-Type: application/json" -H "Authorization: Bearer $token"
        else
            curl -s -X $method "$API_URL$endpoint" -H "Content-Type: application/json" -H "Authorization: Bearer $token" -d "$data"
        fi
    fi
}

# Function to test endpoint
test_endpoint() {
    local name=$1
    local method=$2
    local endpoint=$3
    local data=$4
    local token=$5
    
    echo -e "\n${YELLOW}Testing: $name${NC}"
    response=$(api_call "$method" "$endpoint" "$data" "$token")
    
    if echo "$response" | grep -q '"isError":false\|"error":false\|"success":true'; then
        echo -e "${GREEN}✅ PASSED: $name${NC}"
        ((PASSED++))
        echo "$response" | jq '.' 2>/dev/null || echo "$response"
        return 0
    else
        echo -e "${RED}❌ FAILED: $name${NC}"
        ((FAILED++))
        echo "$response" | jq '.' 2>/dev/null || echo "$response"
        return 1
    fi
}

# Wait for API to be ready
echo "⏳ Waiting for API to be ready..."
for i in {1..30}; do
    if curl -s "$API_URL/Test/health" > /dev/null 2>&1 || curl -s "http://localhost:5000" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ API is ready!${NC}"
        break
    fi
    if [ $i -eq 30 ]; then
        echo -e "${RED}❌ API is not responding after 30 attempts${NC}"
        exit 1
    fi
    sleep 1
done

echo -e "\n${YELLOW}========================================${NC}"
echo -e "${YELLOW}PHASE 1: USER AUTHENTICATION${NC}"
echo -e "${YELLOW}========================================${NC}"

# Step 1: Login as Data Encoder
echo -e "\n${YELLOW}Step 1: Login as Data Encoder${NC}"
DATA_ENCODER_LOGIN='{"username":"dataencoder","password":"dataencoder123"}'
DATA_ENCODER_RESPONSE=$(api_call "POST" "/UserAccount/Login" "$DATA_ENCODER_LOGIN")
DATA_ENCODER_TOKEN=$(echo "$DATA_ENCODER_RESPONSE" | jq -r '.response.data.token' 2>/dev/null)

if [ -z "$DATA_ENCODER_TOKEN" ] || [ "$DATA_ENCODER_TOKEN" = "null" ]; then
    echo -e "${RED}❌ Failed to get Data Encoder token${NC}"
    echo "$DATA_ENCODER_RESPONSE"
    exit 1
fi
echo -e "${GREEN}✅ Data Encoder logged in${NC}"

# Step 2: Login as Assessor
echo -e "\n${YELLOW}Step 2: Login as Assessor${NC}"
ASSESSOR_LOGIN='{"username":"assessor","password":"assessor123"}'
ASSESSOR_RESPONSE=$(api_call "POST" "/UserAccount/Login" "$ASSESSOR_LOGIN")
ASSESSOR_TOKEN=$(echo "$ASSESSOR_RESPONSE" | jq -r '.response.data.token' 2>/dev/null)

if [ -z "$ASSESSOR_TOKEN" ] || [ "$ASSESSOR_TOKEN" = "null" ]; then
    echo -e "${RED}❌ Failed to get Assessor token${NC}"
    echo "$ASSESSOR_RESPONSE"
    exit 1
fi
echo -e "${GREEN}✅ Assessor logged in${NC}"

# Step 3: Login as Customer
echo -e "\n${YELLOW}Step 3: Login as Customer${NC}"
CUSTOMER_LOGIN='{"username":"customer","password":"customer123"}'
CUSTOMER_RESPONSE=$(api_call "POST" "/UserAccount/Login" "$CUSTOMER_LOGIN")
CUSTOMER_TOKEN=$(echo "$CUSTOMER_RESPONSE" | jq -r '.response.data.token' 2>/dev/null)

if [ -z "$CUSTOMER_TOKEN" ] || [ "$CUSTOMER_TOKEN" = "null" ]; then
    echo -e "${RED}❌ Failed to get Customer token${NC}"
    echo "$CUSTOMER_RESPONSE"
    exit 1
fi
echo -e "${GREEN}✅ Customer logged in${NC}"

# Step 4: Login as Manager
echo -e "\n${YELLOW}Step 4: Login as Manager${NC}"
MANAGER_LOGIN='{"username":"manager","password":"manager123"}'
MANAGER_RESPONSE=$(api_call "POST" "/UserAccount/Login" "$MANAGER_LOGIN")
MANAGER_TOKEN=$(echo "$MANAGER_RESPONSE" | jq -r '.response.data.token' 2>/dev/null)

if [ -z "$MANAGER_TOKEN" ] || [ "$MANAGER_TOKEN" = "null" ]; then
    echo -e "${RED}❌ Failed to get Manager token${NC}"
    echo "$MANAGER_RESPONSE"
    exit 1
fi
echo -e "${GREEN}✅ Manager logged in${NC}"

# Step 5: Login as Case Executor
echo -e "\n${YELLOW}Step 5: Login as Case Executor${NC}"
EXECUTOR_LOGIN='{"username":"caseexecutor","password":"caseexecutor123"}'
EXECUTOR_RESPONSE=$(api_call "POST" "/UserAccount/Login" "$EXECUTOR_LOGIN")
EXECUTOR_TOKEN=$(echo "$EXECUTOR_RESPONSE" | jq -r '.response.data.token' 2>/dev/null)

if [ -z "$EXECUTOR_TOKEN" ] || [ "$EXECUTOR_TOKEN" = "null" ]; then
    echo -e "${RED}❌ Failed to get Case Executor token${NC}"
    echo "$EXECUTOR_RESPONSE"
    exit 1
fi
echo -e "${GREEN}✅ Case Executor logged in${NC}"

echo -e "\n${YELLOW}========================================${NC}"
echo -e "${YELLOW}PHASE 2: CUSTOMER CREATION${NC}"
echo -e "${YELLOW}========================================${NC}"

# Step 6: Data Encoder creates customer
echo -e "\n${YELLOW}Step 6: Data Encoder creates customer${NC}"
CUSTOMER_DATA='{
  "businessName": "Test Electronics Import Co",
  "tinNumber": "TIN-123456789",
  "businessLicense": "BL-2024-001",
  "contactPerson": "John Smith",
  "contactPhone": "+1-555-0123",
  "contactEmail": "john.smith@testemail.com",
  "businessAddress": "123 Main Street",
  "city": "New York",
  "state": "NY",
  "postalCode": "10001",
  "businessType": "Electronics Import",
  "importLicense": "IL-2024-001",
  "importLicenseExpiry": "2025-12-31",
  "userId": 1
}'

CUSTOMER_RESPONSE=$(api_call "POST" "/Customer/Create" "$CUSTOMER_DATA" "$DATA_ENCODER_TOKEN")
CUSTOMER_ID=$(echo "$CUSTOMER_RESPONSE" | jq -r '.response.data.id' 2>/dev/null)

if [ -z "$CUSTOMER_ID" ] || [ "$CUSTOMER_ID" = "null" ]; then
    echo -e "${RED}❌ Failed to create customer${NC}"
    echo "$CUSTOMER_RESPONSE"
    exit 1
fi
echo -e "${GREEN}✅ Customer created with ID: $CUSTOMER_ID${NC}"

echo -e "\n${YELLOW}========================================${NC}"
echo -e "${YELLOW}PHASE 3: CUSTOMER APPROVAL${NC}"
echo -e "${YELLOW}========================================${NC}"

# Step 7: Assessor approves customer
echo -e "\n${YELLOW}Step 7: Assessor approves customer${NC}"
APPROVAL_DATA='{
  "isApproved": true,
  "notes": "All documents verified. Customer approved."
}'

APPROVAL_RESPONSE=$(api_call "PUT" "/Assessor/customers/$CUSTOMER_ID/approve" "$APPROVAL_DATA" "$ASSESSOR_TOKEN")
test_endpoint "Customer Approval" "PUT" "/Assessor/customers/$CUSTOMER_ID/approve" "$APPROVAL_DATA" "$ASSESSOR_TOKEN"

echo -e "\n${YELLOW}========================================${NC}"
echo -e "${YELLOW}PHASE 4: SERVICE REQUEST CREATION${NC}"
echo -e "${YELLOW}========================================${NC}"

# Step 8: Customer creates service request
echo -e "\n${YELLOW}Step 8: Customer creates service request${NC}"
SERVICE_DATA='{
  "serviceNumber": "SRV-TEST-001",
  "itemDescription": "Electronics Import - 50 Samsung Galaxy S24 Phones",
  "routeCategory": "Air Freight",
  "declaredValue": 25000.00,
  "taxCategory": "Electronics",
  "countryOfOrigin": "South Korea",
  "serviceType": 1,
  "customerId": '$CUSTOMER_ID'
}'

SERVICE_RESPONSE=$(api_call "POST" "/Customer/services" "$SERVICE_DATA" "$CUSTOMER_TOKEN")
SERVICE_ID=$(echo "$SERVICE_RESPONSE" | jq -r '.response.data.id' 2>/dev/null)

if [ -z "$SERVICE_ID" ] || [ "$SERVICE_ID" = "null" ]; then
    echo -e "${RED}❌ Failed to create service${NC}"
    echo "$SERVICE_RESPONSE"
    exit 1
fi
echo -e "${GREEN}✅ Service created with ID: $SERVICE_ID${NC}"

echo -e "\n${YELLOW}========================================${NC}"
echo -e "${YELLOW}PHASE 5: SERVICE ASSIGNMENT${NC}"
echo -e "${YELLOW}========================================${NC}"

# Step 9: Manager assigns service to case executor
echo -e "\n${YELLOW}Step 9: Manager assigns service to case executor${NC}"
# First, get a case executor user ID (assuming user ID 5 is case executor)
EXECUTOR_USER_ID=5
ASSIGN_DATA="{\"serviceId\": $SERVICE_ID, \"caseExecutorId\": $EXECUTOR_USER_ID}"

ASSIGN_RESPONSE=$(api_call "PUT" "/Manager/AssignExecutor" "$ASSIGN_DATA" "$MANAGER_TOKEN")
test_endpoint "Service Assignment" "PUT" "/Manager/AssignExecutor" "$ASSIGN_DATA" "$MANAGER_TOKEN"

echo -e "\n${YELLOW}========================================${NC}"
echo -e "${YELLOW}PHASE 6: SERVICE STAGE UPDATES${NC}"
echo -e "${YELLOW}========================================${NC}"

# Step 10: Get service stages
echo -e "\n${YELLOW}Step 10: Get service stages${NC}"
STAGES_RESPONSE=$(api_call "GET" "/Service/GetStages?serviceId=$SERVICE_ID" "" "$EXECUTOR_TOKEN")
STAGE_ID=$(echo "$STAGES_RESPONSE" | jq -r '.response.data[0].id' 2>/dev/null)

if [ -n "$STAGE_ID" ] && [ "$STAGE_ID" != "null" ]; then
    echo -e "${GREEN}✅ Found stage with ID: $STAGE_ID${NC}"
    
    # Step 11: Case Executor updates stage status
    echo -e "\n${YELLOW}Step 11: Case Executor updates stage status${NC}"
    STAGE_UPDATE_DATA="{
      \"serviceId\": $SERVICE_ID,
      \"stageId\": $STAGE_ID,
      \"status\": 3,
      \"comments\": \"Stage in progress\"
    }"
    
    test_endpoint "Stage Status Update" "PUT" "/CaseExecutor/UpdateStageStatus" "$STAGE_UPDATE_DATA" "$EXECUTOR_TOKEN"
else
    echo -e "${YELLOW}⚠️  No stages found for service${NC}"
fi

echo -e "\n${YELLOW}========================================${NC}"
echo -e "${YELLOW}PHASE 7: DASHBOARDS & REPORTS${NC}"
echo -e "${YELLOW}========================================${NC}"

# Step 12: Test Manager Dashboard
echo -e "\n${YELLOW}Step 12: Test Manager Dashboard${NC}"
test_endpoint "Manager Dashboard" "GET" "/Manager/GetDashboard" "" "$MANAGER_TOKEN"

# Step 13: Test Case Executor Dashboard
echo -e "\n${YELLOW}Step 13: Test Case Executor Dashboard${NC}"
test_endpoint "Case Executor Dashboard" "GET" "/CaseExecutor/GetDashboard" "" "$EXECUTOR_TOKEN"

# Step 14: Test Assessor Dashboard
echo -e "\n${YELLOW}Step 14: Test Assessor Dashboard${NC}"
test_endpoint "Assessor Dashboard" "GET" "/Assessor/GetDashboard" "" "$ASSESSOR_TOKEN"

# Step 15: Test Data Encoder Dashboard
echo -e "\n${YELLOW}Step 15: Test Data Encoder Dashboard${NC}"
test_endpoint "Data Encoder Dashboard" "GET" "/DataEncoder/GetDashboard" "" "$DATA_ENCODER_TOKEN"

# Step 16: Test Reports
echo -e "\n${YELLOW}Step 16: Test Service Statistics Report${NC}"
test_endpoint "Service Statistics Report" "GET" "/Report/GetServiceStatistics" "" "$MANAGER_TOKEN"

echo -e "\n${YELLOW}Step 17: Test Monthly Report${NC}"
CURRENT_YEAR=$(date +%Y)
test_endpoint "Monthly Report" "GET" "/Report/GetMonthlyReport?year=$CURRENT_YEAR" "" "$MANAGER_TOKEN"

echo -e "\n${YELLOW}Step 18: Test Customer Statistics Report${NC}"
test_endpoint "Customer Statistics Report" "GET" "/Report/GetCustomerStatistics" "" "$MANAGER_TOKEN"

echo -e "\n${YELLOW}Step 19: Test System Report${NC}"
test_endpoint "System Report" "GET" "/Report/GetSystemReport" "" "$MANAGER_TOKEN"

echo -e "\n${YELLOW}========================================${NC}"
echo -e "${YELLOW}TEST SUMMARY${NC}"
echo -e "${YELLOW}========================================${NC}"
echo -e "${GREEN}✅ Passed: $PASSED${NC}"
echo -e "${RED}❌ Failed: $FAILED${NC}"
echo -e "Total Tests: $((PASSED + FAILED))"

if [ $FAILED -eq 0 ]; then
    echo -e "\n${GREEN}🎉 All tests passed!${NC}"
    exit 0
else
    echo -e "\n${RED}⚠️  Some tests failed${NC}"
    exit 1
fi

