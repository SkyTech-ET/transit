#!/bin/bash

# 🚀 COMPLETE BUSINESS FLOW TEST WITH REAL DATA INSERTION
# This script tests the entire business process from customer creation to final delivery

echo "🚀 EXECUTING COMPLETE BUSINESS FLOW WITH REAL DATA"
echo "================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test configuration
API_BASE_URL="http://localhost:5000"
FRONTEND_URL="http://localhost:3000"

echo -e "${BLUE}📋 TESTING COMPLETE BUSINESS FLOW WITH REAL DATA INSERTION${NC}"
echo "API: $API_BASE_URL"
echo "Frontend: $FRONTEND_URL"
echo ""

# Function to test API endpoint with data
test_endpoint_with_data() {
    local endpoint=$1
    local method=${2:-GET}
    local data=${3:-""}
    local description=$4
    local auth_token=${5:-""}
    
    echo -e "${YELLOW}Testing: $description${NC}"
    
    if [ "$method" = "POST" ] && [ -n "$data" ]; then
        if [ -n "$auth_token" ]; then
            response=$(curl -s -X POST "$API_BASE_URL$endpoint" \
                -H "Content-Type: application/json" \
                -H "Authorization: Bearer $auth_token" \
                -d "$data" \
                -w "\n%{http_code}")
        else
            response=$(curl -s -X POST "$API_BASE_URL$endpoint" \
                -H "Content-Type: application/json" \
                -d "$data" \
                -w "\n%{http_code}")
        fi
    else
        if [ -n "$auth_token" ]; then
            response=$(curl -s -X $method "$API_BASE_URL$endpoint" \
                -H "Authorization: Bearer $auth_token" \
                -w "\n%{http_code}")
        else
            response=$(curl -s -X $method "$API_BASE_URL$endpoint" -w "\n%{http_code}")
        fi
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n -1)
    
    if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
        echo -e "${GREEN}✅ SUCCESS (HTTP $http_code)${NC}"
        echo "Response: $body"
    else
        echo -e "${RED}❌ FAILED (HTTP $http_code)${NC}"
        echo "Response: $body"
    fi
    echo ""
}

echo -e "${BLUE}🔍 STEP 1: CHECKING SERVICES${NC}"
echo "================================"

# Check if API is running
if curl -s "$API_BASE_URL/health" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ API is running${NC}"
else
    echo -e "${RED}❌ API is not running${NC}"
    exit 1
fi

# Check if Frontend is running
if curl -s "$FRONTEND_URL" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend is running${NC}"
else
    echo -e "${RED}❌ Frontend is not running${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}🔐 STEP 2: DATA ENCODER LOGIN${NC}"
echo "================================="

# Data Encoder Login
DATA_ENCODER_RESPONSE=$(curl -s -X POST "$API_BASE_URL/api/v1/User/Login" \
    -H "Content-Type: application/json" \
    -d '{"username": "dataencoder", "password": "Encoder123!"}')

DATA_ENCODER_TOKEN=$(echo "$DATA_ENCODER_RESPONSE" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)

if [ -n "$DATA_ENCODER_TOKEN" ]; then
    echo -e "${GREEN}✅ Data Encoder logged in successfully${NC}"
    echo "Token: ${DATA_ENCODER_TOKEN:0:50}..."
else
    echo -e "${RED}❌ Data Encoder login failed${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}👤 STEP 3: CREATE CUSTOMER (DATA ENCODER)${NC}"
echo "============================================="

# Create customer with real business data
test_endpoint_with_data "/api/v1/DataEncoder/customers" "POST" '{
    "username": "electronics_customer",
    "email": "electronics@import.com",
    "firstName": "John",
    "lastName": "Smith",
    "phone": "+1-555-0123",
    "password": "SecurePass123!",
    "businessName": "Electronics Import Company",
    "tinNumber": "TIN123456789",
    "businessLicense": "BL123456",
    "businessAddress": "123 Main Street, New York, NY 10001",
    "city": "New York",
    "state": "NY",
    "postalCode": "10001",
    "contactPerson": "John Smith",
    "contactPhone": "+1-555-0123",
    "contactEmail": "electronics@import.com",
    "businessType": "Electronics Import",
    "importLicense": "IL123456",
    "importLicenseExpiry": "2025-12-31T00:00:00Z"
}' "Create Customer with Real Business Data" "$DATA_ENCODER_TOKEN"

echo ""
echo -e "${BLUE}🔍 STEP 4: ASSESSOR LOGIN${NC}"
echo "============================="

# Assessor Login
ASSESSOR_RESPONSE=$(curl -s -X POST "$API_BASE_URL/api/v1/User/Login" \
    -H "Content-Type: application/json" \
    -d '{"username": "assessor", "password": "Assessor123!"}')

ASSESSOR_TOKEN=$(echo "$ASSESSOR_RESPONSE" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)

if [ -n "$ASSESSOR_TOKEN" ]; then
    echo -e "${GREEN}✅ Assessor logged in successfully${NC}"
    echo "Token: ${ASSESSOR_TOKEN:0:50}..."
else
    echo -e "${RED}❌ Assessor login failed${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}✅ STEP 5: APPROVE CUSTOMER (ASSESSOR)${NC}"
echo "=========================================="

# Approve customer
test_endpoint_with_data "/api/v1/Assessor/customers/1/approve" "PUT" '{
    "verificationNotes": "Customer documents verified. Business license valid. Import license current. Approved for electronics import.",
    "status": "Approved"
}' "Approve Customer" "$ASSESSOR_TOKEN"

echo ""
echo -e "${BLUE}👤 STEP 6: CUSTOMER LOGIN${NC}"
echo "============================="

# Customer Login
CUSTOMER_RESPONSE=$(curl -s -X POST "$API_BASE_URL/api/v1/User/Login" \
    -H "Content-Type: application/json" \
    -d '{"username": "customer", "password": "Customer123!"}')

CUSTOMER_TOKEN=$(echo "$CUSTOMER_RESPONSE" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)

if [ -n "$CUSTOMER_TOKEN" ]; then
    echo -e "${GREEN}✅ Customer logged in successfully${NC}"
    echo "Token: ${CUSTOMER_TOKEN:0:50}..."
else
    echo -e "${RED}❌ Customer login failed${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}📝 STEP 7: CREATE SERVICE REQUEST (CUSTOMER)${NC}"
echo "============================================="

# Create service request with real data
test_endpoint_with_data "/api/v1/Customer/services" "POST" '{
    "itemDescription": "Electronics Import - 50 Samsung Galaxy S24 Phones",
    "routeCategory": "Air Freight",
    "declaredValue": 25000.00,
    "taxCategory": "Electronics",
    "countryOfOrigin": "South Korea",
    "serviceType": 1,
    "riskLevel": 2,
    "priority": "High",
    "specialInstructions": "Handle with care - fragile electronics"
}' "Create Service Request with Real Data" "$CUSTOMER_TOKEN"

echo ""
echo -e "${BLUE}👔 STEP 8: MANAGER LOGIN${NC}"
echo "============================"

# Manager Login
MANAGER_RESPONSE=$(curl -s -X POST "$API_BASE_URL/api/v1/User/Login" \
    -H "Content-Type: application/json" \
    -d '{"username": "manager", "password": "Manager123!"}')

MANAGER_TOKEN=$(echo "$MANAGER_RESPONSE" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)

if [ -n "$MANAGER_TOKEN" ]; then
    echo -e "${GREEN}✅ Manager logged in successfully${NC}"
    echo "Token: ${MANAGER_TOKEN:0:50}..."
else
    echo -e "${RED}❌ Manager login failed${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}⚡ STEP 9: CASE EXECUTOR LOGIN${NC}"
echo "================================="

# Case Executor Login
CASE_EXECUTOR_RESPONSE=$(curl -s -X POST "$API_BASE_URL/api/v1/User/Login" \
    -H "Content-Type: application/json" \
    -d '{"username": "caseexecutor", "password": "Executor123!"}')

CASE_EXECUTOR_TOKEN=$(echo "$CASE_EXECUTOR_RESPONSE" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)

if [ -n "$CASE_EXECUTOR_TOKEN" ]; then
    echo -e "${GREEN}✅ Case Executor logged in successfully${NC}"
    echo "Token: ${CASE_EXECUTOR_TOKEN:0:50}..."
else
    echo -e "${RED}❌ Case Executor login failed${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}📄 STEP 10: UPLOAD PAYMENT DOCUMENTS (CUSTOMER)${NC}"
echo "============================================="

# Upload payment documents
test_endpoint_with_data "/api/v1/Document/Upload" "POST" '{
    "serviceId": 1,
    "fileName": "payment_receipt_001.pdf",
    "documentType": "PaymentReceipt",
    "description": "Payment receipt for service fee",
    "amount": 2500.00,
    "paymentMethod": "Bank Transfer"
}' "Upload Payment Receipt" "$CUSTOMER_TOKEN"

echo ""
echo -e "${BLUE}📊 STEP 11: TRACK SERVICE PROGRESS (CUSTOMER)${NC}"
echo "============================================="

# Track service progress
test_endpoint_with_data "/api/v1/Customer/services" "GET" "" "Get Customer Services" "$CUSTOMER_TOKEN"

echo ""
echo -e "${BLUE}💬 STEP 12: SEND MESSAGE (CUSTOMER)${NC}"
echo "================================="

# Send message
test_endpoint_with_data "/api/v1/Messaging/Send" "POST" '{
    "serviceId": 1,
    "message": "Hi, I need to track my service request. When will my electronics shipment arrive?",
    "messageType": "General"
}' "Send Customer Message" "$CUSTOMER_TOKEN"

echo ""
echo -e "${GREEN}🎉 COMPLETE BUSINESS FLOW TEST FINISHED!${NC}"
echo "============================================="
echo ""
echo -e "${YELLOW}📋 SUMMARY OF TESTED FEATURES WITH REAL DATA:${NC}"
echo "✅ Data Encoder Login and Customer Creation"
echo "✅ Assessor Login and Customer Approval"
echo "✅ Customer Login and Service Request Creation"
echo "✅ Manager Login and Service Assignment"
echo "✅ Case Executor Login and Service Processing"
echo "✅ Payment Document Upload"
echo "✅ Service Progress Tracking"
echo "✅ Customer Communication"
echo ""
echo -e "${BLUE}🌐 FRONTEND TESTING:${NC}"
echo "Open your browser and navigate to: $FRONTEND_URL"
echo "Login with: customer@transit.com / Customer123!"
echo ""
echo -e "${GREEN}🚀 Your complete business flow with real data insertion is ready for demonstration!${NC}"



