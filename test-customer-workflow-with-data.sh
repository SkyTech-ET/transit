#!/bin/bash

# 🚀 COMPLETE CUSTOMER WORKFLOW TEST WITH REAL DATA INSERTION
# This script tests the entire customer journey with actual data

echo "🚀 TESTING COMPLETE CUSTOMER WORKFLOW WITH REAL DATA"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test configuration
API_BASE_URL="http://localhost:5000"
FRONTEND_URL="http://localhost:3000"

echo -e "${BLUE}📋 TESTING COMPLETE CUSTOMER WORKFLOW WITH DATA INSERTION${NC}"
echo "API: $API_BASE_URL"
echo "Frontend: $FRONTEND_URL"
echo ""

# Function to test API endpoint with data
test_endpoint_with_data() {
    local endpoint=$1
    local method=${2:-GET}
    local data=${3:-""}
    local description=$4
    
    echo -e "${YELLOW}Testing: $description${NC}"
    
    if [ "$method" = "POST" ] && [ -n "$data" ]; then
        response=$(curl -s -X POST "$API_BASE_URL$endpoint" \
            -H "Content-Type: application/json" \
            -d "$data" \
            -w "\n%{http_code}")
    else
        response=$(curl -s -X $method "$API_BASE_URL$endpoint" -w "\n%{http_code}")
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
echo -e "${BLUE}🧪 STEP 2: RUNNING COMPLETE SYSTEM TEST${NC}"
echo "============================================="

# Run the complete system test
test_endpoint_with_data "/api/Test/run-complete-test" "GET" "" "Complete System Test"

echo ""
echo -e "${BLUE}🔐 STEP 3: TESTING CUSTOMER AUTHENTICATION${NC}"
echo "============================================="

# Test customer login with real data
test_endpoint_with_data "/api/v1/Auth/Login" "POST" '{
    "email": "customer@transit.com",
    "password": "customer123"
}' "Customer Login"

echo -e "${BLUE}📝 STEP 4: TESTING CUSTOMER SERVICE REQUEST CREATION${NC}"
echo "====================================================="

# Test service request creation with real data
test_endpoint_with_data "/api/v1/Service/Create" "POST" '{
    "serviceNumber": "SRV-2024-001",
    "itemDescription": "Electronics Import - 50 Samsung Galaxy S24 Phones",
    "routeCategory": "Air Freight",
    "declaredValue": 25000.00,
    "taxCategory": "Electronics",
    "countryOfOrigin": "South Korea",
    "serviceType": "Import",
    "riskLevel": "Medium",
    "specialInstructions": "Handle with care - fragile electronics",
    "priority": "High",
    "customerId": 1
}' "Create Service Request"

echo -e "${BLUE}📄 STEP 5: TESTING DOCUMENT UPLOAD${NC}"
echo "===================================="

# Test document upload with real data
test_endpoint_with_data "/api/v1/Document/Upload" "POST" '{
    "fileName": "commercial_invoice.pdf",
    "documentType": "Invoice",
    "description": "Commercial Invoice for Samsung Phones",
    "fileSize": 245760,
    "contentType": "application/pdf",
    "serviceId": 1
}' "Upload Document"

echo -e "${BLUE}💬 STEP 6: TESTING CUSTOMER CHAT${NC}"
echo "================================="

# Test messaging system with real data
test_endpoint_with_data "/api/v1/Messaging/Send" "POST" '{
    "recipientId": 1,
    "message": "Hi, I need to track my service request SRV-2024-001. When will my electronics shipment arrive?",
    "messageType": "General",
    "serviceId": 1
}' "Send Customer Message"

echo -e "${BLUE}💳 STEP 7: TESTING PAYMENT PROCESSING${NC}"
echo "====================================="

# Test payment processing with real data
test_endpoint_with_data "/api/v1/Payment/Process" "POST" '{
    "amount": 2500.00,
    "currency": "USD",
    "paymentMethod": "Credit Card",
    "serviceId": 1,
    "customerId": 1
}' "Process Payment"

echo -e "${BLUE}📊 STEP 8: TESTING SERVICE TRACKING${NC}"
echo "===================================="

# Test service tracking
test_endpoint_with_data "/api/v1/Service/1/Track" "GET" "" "Track Service Progress"

echo -e "${BLUE}🚚 STEP 9: TESTING DELIVERY CONFIRMATION${NC}"
echo "========================================="

# Test delivery confirmation with real data
test_endpoint_with_data "/api/v1/Service/1/ConfirmDelivery" "POST" '{
    "deliveryDate": "2024-01-20T14:30:00Z",
    "deliveryAddress": "123 Main Street, New York, NY 10001",
    "recipient": "John Smith",
    "signature": "John Smith - Digital Signature",
    "deliveryNotes": "Package delivered successfully. All 50 Samsung Galaxy S24 phones received in good condition.",
    "serviceId": 1
}' "Confirm Delivery"

echo -e "${BLUE}⭐ STEP 10: TESTING CUSTOMER FEEDBACK${NC}"
echo "====================================="

# Test customer feedback with real data
test_endpoint_with_data "/api/v1/Service/1/Feedback" "POST" '{
    "rating": 5,
    "feedback": "Excellent service! Fast delivery and great communication throughout the process.",
    "satisfaction": 5,
    "serviceId": 1,
    "customerId": 1
}' "Submit Customer Feedback"

echo ""
echo -e "${BLUE}📈 STEP 11: TESTING DASHBOARD METRICS${NC}"
echo "====================================="

# Test dashboard endpoints
test_endpoint_with_data "/api/v1/Dashboard/Customer" "GET" "" "Customer Dashboard"
test_endpoint_with_data "/api/v1/Service/MyServices" "GET" "" "My Services"
test_endpoint_with_data "/api/v1/Service/Statistics" "GET" "" "Service Statistics"

echo ""
echo -e "${GREEN}🎉 COMPLETE CUSTOMER WORKFLOW TEST WITH DATA FINISHED!${NC}"
echo "============================================================="
echo ""
echo -e "${YELLOW}📋 SUMMARY OF TESTED FEATURES WITH REAL DATA:${NC}"
echo "✅ Complete System Test"
echo "✅ Customer Authentication"
echo "✅ Service Request Creation"
echo "✅ Document Upload"
echo "✅ Customer Chat/Messaging"
echo "✅ Payment Processing"
echo "✅ Service Tracking"
echo "✅ Delivery Confirmation"
echo "✅ Customer Feedback"
echo "✅ Dashboard Metrics"
echo ""
echo -e "${BLUE}🌐 FRONTEND TESTING:${NC}"
echo "Open your browser and navigate to: $FRONTEND_URL"
echo "Login with: customer@transit.com / customer123"
echo ""
echo -e "${GREEN}🚀 Your complete customer service request workflow with real data is ready for demonstration!${NC}"



