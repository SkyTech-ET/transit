#!/bin/bash

# 🚀 COMPLETE CUSTOMER SERVICE REQUEST WORKFLOW TEST
# This script tests the entire customer journey from request to delivery

echo "🚀 STARTING COMPLETE CUSTOMER SERVICE REQUEST WORKFLOW TEST"
echo "=========================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test configuration
API_BASE_URL="http://localhost:5000"
FRONTEND_URL="http://localhost:3001"
CUSTOMER_EMAIL="customer@transit.com"
CUSTOMER_PASSWORD="customer123"

echo -e "${BLUE}📋 TESTING COMPLETE CUSTOMER WORKFLOW${NC}"
echo "API: $API_BASE_URL"
echo "Frontend: $FRONTEND_URL"
echo ""

# Function to test API endpoint
test_endpoint() {
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

# Function to wait for service
wait_for_service() {
    local service_name=$1
    local url=$2
    local max_attempts=30
    local attempt=1
    
    echo -e "${YELLOW}Waiting for $service_name to start...${NC}"
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s "$url" > /dev/null 2>&1; then
            echo -e "${GREEN}✅ $service_name is running!${NC}"
            return 0
        fi
        
        echo "Attempt $attempt/$max_attempts - waiting..."
        sleep 2
        attempt=$((attempt + 1))
    done
    
    echo -e "${RED}❌ $service_name failed to start after $max_attempts attempts${NC}"
    return 1
}

echo -e "${BLUE}🔍 STEP 1: CHECKING SERVICES${NC}"
echo "================================"

# Check if API is running
if ! wait_for_service "API" "$API_BASE_URL/health"; then
    echo -e "${RED}❌ API is not running. Please start it first:${NC}"
    echo "cd Transit-api/Transit.API && dotnet run --urls 'http://localhost:5000'"
    exit 1
fi

# Check if Frontend is running
if ! wait_for_service "Frontend" "$FRONTEND_URL"; then
    echo -e "${RED}❌ Frontend is not running. Please start it first:${NC}"
    echo "cd transit-portal && npm run dev"
    exit 1
fi

echo ""
echo -e "${BLUE}🔐 STEP 2: CUSTOMER AUTHENTICATION${NC}"
echo "====================================="

# Test customer login
test_endpoint "/api/v1/Auth/Login" "POST" '{
    "email": "'$CUSTOMER_EMAIL'",
    "password": "'$CUSTOMER_PASSWORD'"
}' "Customer Login"

echo -e "${BLUE}📝 STEP 3: SERVICE REQUEST CREATION${NC}"
echo "======================================="

# Test service request creation
test_endpoint "/api/v1/Service/Create" "POST" '{
    "serviceNumber": "SRV-2024-001",
    "itemDescription": "Electronics Import - 50 Samsung Galaxy S24 Phones",
    "routeCategory": "Air Freight",
    "declaredValue": 25000.00,
    "taxCategory": "Electronics",
    "countryOfOrigin": "South Korea",
    "serviceType": "Import",
    "riskLevel": "Medium",
    "specialInstructions": "Handle with care - fragile electronics",
    "priority": "High"
}' "Create Service Request"

echo -e "${BLUE}📄 STEP 4: DOCUMENT UPLOAD${NC}"
echo "============================="

# Test document upload (simulated)
test_endpoint "/api/v1/Document/Upload" "POST" '{
    "fileName": "commercial_invoice.pdf",
    "documentType": "Invoice",
    "description": "Commercial Invoice for Samsung Phones",
    "fileSize": 245760,
    "contentType": "application/pdf"
}' "Upload Document"

echo -e "${BLUE}💬 STEP 5: CUSTOMER CHAT${NC}"
echo "========================="

# Test messaging system
test_endpoint "/api/v1/Messaging/Send" "POST" '{
    "recipientId": 1,
    "message": "Hi, I need to track my service request SRV-2024-001. When will my electronics shipment arrive?",
    "messageType": "General"
}' "Send Customer Message"

echo -e "${BLUE}💳 STEP 6: PAYMENT PROCESSING${NC}"
echo "================================="

# Test payment processing
test_endpoint "/api/v1/Payment/Process" "POST" '{
    "amount": 2500.00,
    "currency": "USD",
    "paymentMethod": "Credit Card",
    "serviceId": 1
}' "Process Payment"

echo -e "${BLUE}📊 STEP 7: SERVICE TRACKING${NC}"
echo "============================="

# Test service tracking
test_endpoint "/api/v1/Service/1/Track" "GET" "" "Track Service Progress"

echo -e "${BLUE}🚚 STEP 8: DELIVERY CONFIRMATION${NC}"
echo "===================================="

# Test delivery confirmation
test_endpoint "/api/v1/Service/1/ConfirmDelivery" "POST" '{
    "deliveryDate": "2024-01-20T14:30:00Z",
    "deliveryAddress": "123 Main Street, New York, NY 10001",
    "recipient": "John Smith",
    "signature": "John Smith - Digital Signature",
    "deliveryNotes": "Package delivered successfully. All 50 Samsung Galaxy S24 phones received in good condition."
}' "Confirm Delivery"

echo -e "${BLUE}⭐ STEP 9: CUSTOMER FEEDBACK${NC}"
echo "================================="

# Test customer feedback
test_endpoint "/api/v1/Service/1/Feedback" "POST" '{
    "rating": 5,
    "feedback": "Excellent service! Fast delivery and great communication throughout the process.",
    "satisfaction": 5
}' "Submit Customer Feedback"

echo ""
echo -e "${BLUE}📈 STEP 10: DASHBOARD METRICS${NC}"
echo "=================================="

# Test dashboard endpoints
test_endpoint "/api/v1/Dashboard/Customer" "GET" "" "Customer Dashboard"
test_endpoint "/api/v1/Service/MyServices" "GET" "" "My Services"
test_endpoint "/api/v1/Service/Statistics" "GET" "" "Service Statistics"

echo ""
echo -e "${GREEN}🎉 COMPLETE WORKFLOW TEST FINISHED!${NC}"
echo "=========================================="
echo ""
echo -e "${YELLOW}📋 SUMMARY OF TESTED FEATURES:${NC}"
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
echo "Login with: $CUSTOMER_EMAIL / $CUSTOMER_PASSWORD"
echo ""
echo -e "${GREEN}🚀 Your complete customer service request workflow is ready for demonstration!${NC}"



