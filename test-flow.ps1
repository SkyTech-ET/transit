# Complete Business Flow Test Script for Windows PowerShell
# Tests the entire MOT system workflow

$API_URL = "http://localhost:5000/api/v1"
$PASSED = 0
$FAILED = 0

Write-Host "🚀 Starting Complete Business Flow Test" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Function to make API calls
function Invoke-ApiCall {
    param(
        [string]$Method,
        [string]$Endpoint,
        [string]$Data = $null,
        [string]$Token = $null
    )
    
    $headers = @{
        "Content-Type" = "application/json"
    }
    
    if ($Token) {
        $headers["Authorization"] = "Bearer $Token"
    }
    
    try {
        if ($Method -eq "GET") {
            $response = Invoke-RestMethod -Uri "$API_URL$Endpoint" -Method Get -Headers $headers -ErrorAction Stop
        } else {
            $body = $Data | ConvertFrom-Json | ConvertTo-Json -Depth 10
            $response = Invoke-RestMethod -Uri "$API_URL$Endpoint" -Method $Method -Headers $headers -Body $body -ErrorAction Stop
        }
        return @{ Success = $true; Data = $response }
    } catch {
        return @{ Success = $false; Error = $_.Exception.Message; Status = $_.Exception.Response.StatusCode.value__ }
    }
}

# Wait for API
Write-Host "⏳ Waiting for API to be ready..." -ForegroundColor Yellow
$maxAttempts = 30
$attempt = 0
$apiReady = $false

while ($attempt -lt $maxAttempts) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:5000" -TimeoutSec 2 -ErrorAction Stop
        $apiReady = $true
        Write-Host "✅ API is ready!" -ForegroundColor Green
        break
    } catch {
        $attempt++
        Start-Sleep -Seconds 1
    }
}

if (-not $apiReady) {
    Write-Host "❌ API is not responding after 30 attempts" -ForegroundColor Red
    Write-Host "   Please make sure backend is running on http://localhost:5000" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PHASE 1: USER AUTHENTICATION" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Login as Data Encoder
Write-Host ""
Write-Host "Step 1: Login as Data Encoder" -ForegroundColor Yellow
$loginData = @{
    username = "dataencoder"
    password = "dataencoder123"
} | ConvertTo-Json

$response = Invoke-ApiCall -Method "POST" -Endpoint "/UserAccount/Login" -Data $loginData
if ($response.Success -and $response.Data.response.data.userToken) {
    $DATA_ENCODER_TOKEN = $response.Data.response.data.userToken
    Write-Host "✅ Data Encoder logged in" -ForegroundColor Green
    $PASSED++
} else {
    Write-Host "❌ Failed to login as Data Encoder" -ForegroundColor Red
    Write-Host $response.Error
    $FAILED++
    exit 1
}

# Login as Assessor
Write-Host ""
Write-Host "Step 2: Login as Assessor" -ForegroundColor Yellow
$loginData = @{
    username = "assessor"
    password = "assessor123"
} | ConvertTo-Json

$response = Invoke-ApiCall -Method "POST" -Endpoint "/UserAccount/Login" -Data $loginData
if ($response.Success -and $response.Data.response.data.userToken) {
    $ASSESSOR_TOKEN = $response.Data.response.data.userToken
    Write-Host "✅ Assessor logged in" -ForegroundColor Green
    $PASSED++
} else {
    Write-Host "❌ Failed to login as Assessor" -ForegroundColor Red
    $FAILED++
}

# Login as Customer
Write-Host ""
Write-Host "Step 3: Login as Customer" -ForegroundColor Yellow
$loginData = @{
    username = "customer"
    password = "customer123"
} | ConvertTo-Json

$response = Invoke-ApiCall -Method "POST" -Endpoint "/UserAccount/Login" -Data $loginData
if ($response.Success -and $response.Data.response.data.userToken) {
    $CUSTOMER_TOKEN = $response.Data.response.data.userToken
    Write-Host "✅ Customer logged in" -ForegroundColor Green
    $PASSED++
} else {
    Write-Host "❌ Failed to login as Customer" -ForegroundColor Red
    $FAILED++
}

# Login as Manager
Write-Host ""
Write-Host "Step 4: Login as Manager" -ForegroundColor Yellow
$loginData = @{
    username = "manager"
    password = "manager123"
} | ConvertTo-Json

$response = Invoke-ApiCall -Method "POST" -Endpoint "/UserAccount/Login" -Data $loginData
if ($response.Success -and $response.Data.response.data.userToken) {
    $MANAGER_TOKEN = $response.Data.response.data.userToken
    Write-Host "✅ Manager logged in" -ForegroundColor Green
    $PASSED++
} else {
    Write-Host "❌ Failed to login as Manager" -ForegroundColor Red
    $FAILED++
}

# Login as Case Executor
Write-Host ""
Write-Host "Step 5: Login as Case Executor" -ForegroundColor Yellow
$loginData = @{
    username = "caseexecutor"
    password = "caseexecutor123"
} | ConvertTo-Json

$response = Invoke-ApiCall -Method "POST" -Endpoint "/UserAccount/Login" -Data $loginData
if ($response.Success -and $response.Data.response.data.userToken) {
    $EXECUTOR_TOKEN = $response.Data.response.data.userToken
    Write-Host "✅ Case Executor logged in" -ForegroundColor Green
    $PASSED++
} else {
    Write-Host "❌ Failed to login as Case Executor" -ForegroundColor Red
    $FAILED++
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PHASE 2: CUSTOMER CREATION" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Create Customer
Write-Host ""
Write-Host "Step 6: Data Encoder creates customer" -ForegroundColor Yellow
$customerData = @{
    businessName = "Test Electronics Import Co"
    tinNumber = "TIN-123456789"
    businessLicense = "BL-2024-001"
    contactPerson = "John Smith"
    contactPhone = "+1-555-0123"
    contactEmail = "john.smith@testemail.com"
    businessAddress = "123 Main Street"
    city = "New York"
    state = "NY"
    postalCode = "10001"
    businessType = "Electronics Import"
    importLicense = "IL-2024-001"
    importLicenseExpiry = "2025-12-31"
    userId = 1
} | ConvertTo-Json

$response = Invoke-ApiCall -Method "POST" -Endpoint "/Customer/Create" -Data $customerData -Token $DATA_ENCODER_TOKEN
if ($response.Success -and $response.Data.response.data.id) {
    $CUSTOMER_ID = $response.Data.response.data.id
    Write-Host "✅ Customer created with ID: $CUSTOMER_ID" -ForegroundColor Green
    $PASSED++
} else {
    Write-Host "❌ Failed to create customer" -ForegroundColor Red
    Write-Host $response.Error
    $FAILED++
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PHASE 3: CUSTOMER APPROVAL" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Approve Customer
Write-Host ""
Write-Host "Step 7: Assessor approves customer" -ForegroundColor Yellow
$approvalData = @{
    isApproved = $true
    notes = "All documents verified. Customer approved."
} | ConvertTo-Json

$response = Invoke-ApiCall -Method "PUT" -Endpoint "/Assessor/customers/$CUSTOMER_ID/approve" -Data $approvalData -Token $ASSESSOR_TOKEN
if ($response.Success) {
    Write-Host "✅ Customer approved successfully" -ForegroundColor Green
    $PASSED++
} else {
    Write-Host "❌ Failed to approve customer" -ForegroundColor Red
    Write-Host $response.Error
    $FAILED++
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PHASE 4: SERVICE REQUEST CREATION" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Create Service
Write-Host ""
Write-Host "Step 8: Customer creates service request" -ForegroundColor Yellow
$serviceNumber = "SRV-TEST-$(Get-Date -Format 'yyyyMMddHHmmss')"
$serviceData = @{
    serviceNumber = $serviceNumber
    itemDescription = "Electronics Import - 50 Samsung Galaxy S24 Phones"
    routeCategory = "Air Freight"
    declaredValue = 25000.00
    taxCategory = "Electronics"
    countryOfOrigin = "South Korea"
    serviceType = 1
    customerId = $CUSTOMER_ID
} | ConvertTo-Json

$response = Invoke-ApiCall -Method "POST" -Endpoint "/Customer/services" -Data $serviceData -Token $CUSTOMER_TOKEN
if ($response.Success -and $response.Data.response.data.id) {
    $SERVICE_ID = $response.Data.response.data.id
    Write-Host "✅ Service created with ID: $SERVICE_ID" -ForegroundColor Green
    $PASSED++
} else {
    Write-Host "❌ Failed to create service" -ForegroundColor Red
    Write-Host $response.Error
    $FAILED++
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PHASE 5: SERVICE ASSIGNMENT" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Assign Service
Write-Host ""
Write-Host "Step 9: Manager assigns service to case executor" -ForegroundColor Yellow
$assignData = @{
    serviceId = $SERVICE_ID
    caseExecutorId = 5
} | ConvertTo-Json

$response = Invoke-ApiCall -Method "PUT" -Endpoint "/Manager/AssignExecutor" -Data $assignData -Token $MANAGER_TOKEN
if ($response.Success) {
    Write-Host "✅ Service assigned successfully" -ForegroundColor Green
    $PASSED++
} else {
    Write-Host "❌ Failed to assign service" -ForegroundColor Red
    Write-Host $response.Error
    $FAILED++
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "PHASE 6: DASHBOARDS & REPORTS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Test Dashboards
Write-Host ""
Write-Host "Step 10: Test Manager Dashboard" -ForegroundColor Yellow
$response = Invoke-ApiCall -Method "GET" -Endpoint "/Manager/GetDashboard" -Token $MANAGER_TOKEN
if ($response.Success) {
    Write-Host "✅ Manager Dashboard loaded" -ForegroundColor Green
    $PASSED++
} else {
    Write-Host "❌ Manager Dashboard failed" -ForegroundColor Red
    $FAILED++
}

Write-Host ""
Write-Host "Step 11: Test Case Executor Dashboard" -ForegroundColor Yellow
$response = Invoke-ApiCall -Method "GET" -Endpoint "/CaseExecutor/GetDashboard" -Token $EXECUTOR_TOKEN
if ($response.Success) {
    Write-Host "✅ Case Executor Dashboard loaded" -ForegroundColor Green
    $PASSED++
} else {
    Write-Host "❌ Case Executor Dashboard failed" -ForegroundColor Red
    $FAILED++
}

Write-Host ""
Write-Host "Step 12: Test Assessor Dashboard" -ForegroundColor Yellow
$response = Invoke-ApiCall -Method "GET" -Endpoint "/Assessor/GetDashboard" -Token $ASSESSOR_TOKEN
if ($response.Success) {
    Write-Host "✅ Assessor Dashboard loaded" -ForegroundColor Green
    $PASSED++
} else {
    Write-Host "❌ Assessor Dashboard failed" -ForegroundColor Red
    $FAILED++
}

Write-Host ""
Write-Host "Step 13: Test Data Encoder Dashboard" -ForegroundColor Yellow
$response = Invoke-ApiCall -Method "GET" -Endpoint "/DataEncoder/GetDashboard" -Token $DATA_ENCODER_TOKEN
if ($response.Success) {
    Write-Host "✅ Data Encoder Dashboard loaded" -ForegroundColor Green
    $PASSED++
} else {
    Write-Host "❌ Data Encoder Dashboard failed" -ForegroundColor Red
    $FAILED++
}

Write-Host ""
Write-Host "Step 14: Test Service Statistics Report" -ForegroundColor Yellow
$response = Invoke-ApiCall -Method "GET" -Endpoint "/Report/GetServiceStatistics" -Token $MANAGER_TOKEN
if ($response.Success) {
    Write-Host "✅ Service Statistics Report generated" -ForegroundColor Green
    $PASSED++
} else {
    Write-Host "❌ Service Statistics Report failed" -ForegroundColor Red
    $FAILED++
}

Write-Host ""
Write-Host "Step 15: Test Monthly Report" -ForegroundColor Yellow
$currentYear = Get-Date -Format "yyyy"
$response = Invoke-ApiCall -Method "GET" -Endpoint "/Report/GetMonthlyReport?year=$currentYear" -Token $MANAGER_TOKEN
if ($response.Success) {
    Write-Host "✅ Monthly Report generated" -ForegroundColor Green
    $PASSED++
} else {
    Write-Host "❌ Monthly Report failed" -ForegroundColor Red
    $FAILED++
}

Write-Host ""
Write-Host "Step 16: Test Customer Statistics Report" -ForegroundColor Yellow
$response = Invoke-ApiCall -Method "GET" -Endpoint "/Report/GetCustomerStatistics" -Token $MANAGER_TOKEN
if ($response.Success) {
    Write-Host "✅ Customer Statistics Report generated" -ForegroundColor Green
    $PASSED++
} else {
    Write-Host "❌ Customer Statistics Report failed" -ForegroundColor Red
    $FAILED++
}

Write-Host ""
Write-Host "Step 17: Test System Report" -ForegroundColor Yellow
$response = Invoke-ApiCall -Method "GET" -Endpoint "/Report/GetSystemReport" -Token $MANAGER_TOKEN
if ($response.Success) {
    Write-Host "✅ System Report generated" -ForegroundColor Green
    $PASSED++
} else {
    Write-Host "❌ System Report failed" -ForegroundColor Red
    $FAILED++
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "TEST SUMMARY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ Passed: $PASSED" -ForegroundColor Green
Write-Host "❌ Failed: $FAILED" -ForegroundColor Red
Write-Host "Total Tests: $($PASSED + $FAILED)" -ForegroundColor Cyan

if ($FAILED -eq 0) {
    Write-Host ""
    Write-Host "🎉 All tests passed! System is working correctly." -ForegroundColor Green
    exit 0
} else {
    Write-Host ""
    Write-Host "⚠️  Some tests failed. Please check the errors above." -ForegroundColor Yellow
    exit 1
}

