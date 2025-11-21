# 🧪 **COMPLETE BUSINESS FLOW TEST GUIDE**

## 📋 **TESTING PROCEDURE**

This guide will walk you through testing the complete business flow by inserting data step-by-step.

---

## 🚀 **STEP 1: START BOTH APPLICATIONS**

### **Backend API:**
```bash
cd Transit-api/Transit.API
dotnet run --urls "http://localhost:5000"
```
**Expected:** API running on `http://localhost:5000`

### **Frontend:**
```bash
cd transit-portal
npm run dev
```
**Expected:** Frontend running on `http://localhost:3000` (or 3001)

---

## 📝 **STEP 2: TEST COMPLETE BUSINESS FLOW**

### **PHASE 1: USER AUTHENTICATION**

#### **1.1 Login as Data Encoder**
- **URL:** `http://localhost:3000` (or your frontend URL)
- **Credentials:**
  - Username: `dataencoder`
  - Password: `dataencoder123`
- **Expected:** Successfully logged in, redirected to Data Encoder dashboard

#### **1.2 Login as Assessor**
- **Credentials:**
  - Username: `assessor`
  - Password: `assessor123`
- **Expected:** Successfully logged in, redirected to Assessor dashboard

#### **1.3 Login as Customer**
- **Credentials:**
  - Username: `customer`
  - Password: `customer123`
- **Expected:** Successfully logged in, redirected to Customer dashboard

#### **1.4 Login as Manager**
- **Credentials:**
  - Username: `manager`
  - Password: `manager123`
- **Expected:** Successfully logged in, redirected to Manager dashboard

#### **1.5 Login as Case Executor**
- **Credentials:**
  - Username: `caseexecutor`
  - Password: `caseexecutor123`
- **Expected:** Successfully logged in, redirected to Case Executor dashboard

---

### **PHASE 2: CUSTOMER CREATION**

#### **2.1 Data Encoder Creates Customer**
1. **Login as Data Encoder**
2. **Navigate to:** `/admin/mot/customers` or click "Customers" in menu
3. **Click:** "Create Customer" button
4. **Fill in the form:**
   ```json
   {
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
     "importLicenseExpiry": "2025-12-31"
   }
   ```
5. **Click:** "Create Customer"
6. **Expected:** 
   - Success message displayed
   - Customer appears in the list
   - Customer status is "Pending" (not verified)

#### **2.2 Verify Customer in Database**
- Check that customer record exists with `isVerified = false`

---

### **PHASE 3: CUSTOMER APPROVAL**

#### **3.1 Assessor Approves Customer**
1. **Login as Assessor**
2. **Navigate to:** `/admin/mot/pending-approvals`
3. **Find:** The customer created in Step 2.1
4. **Click:** "View" to see customer details
5. **Click:** "Approve" button
6. **Add notes (optional):** "All documents verified. Customer approved."
7. **Click:** "Approve"
8. **Expected:**
   - Success message displayed
   - Customer removed from pending approvals list
   - Customer status changed to "Verified"

#### **3.2 Verify Approval**
- Check customer list - customer should now show as "Verified"

---

### **PHASE 4: SERVICE REQUEST CREATION**

#### **4.1 Customer Creates Service Request**
1. **Login as Customer**
2. **Navigate to:** `/admin/mot/customers/services` or "My Services"
3. **Click:** "Create New Service" button
4. **Fill in the form:**
   ```json
   {
     "serviceNumber": "SRV-TEST-001",
     "itemDescription": "Electronics Import - 50 Samsung Galaxy S24 Phones",
     "routeCategory": "Air Freight",
     "declaredValue": 25000.00,
     "taxCategory": "Electronics",
     "countryOfOrigin": "South Korea",
     "serviceType": "Multimodal",
     "riskLevel": "Green",
     "specialInstructions": "Handle with care - fragile electronics"
   }
   ```
5. **Upload Documents (optional):**
   - Commercial Invoice (PDF)
   - Bill of Lading (PDF)
   - Certificate of Origin (PDF)
6. **Click:** "Submit Service Request"
7. **Expected:**
   - Success message displayed
   - Service appears in "My Services" list
   - Service status is "Submitted"

#### **4.2 Verify Service Creation**
- Check service list - service should be visible
- Service should have status "Submitted"

---

### **PHASE 5: SERVICE ASSIGNMENT**

#### **5.1 Manager Assigns Service to Case Executor**
1. **Login as Manager**
2. **Navigate to:** `/admin/mot/services`
3. **Find:** The service created in Step 4.1
4. **Click:** "View" or service ID to open service details
5. **Click:** "Assign Service" button
6. **Select:**
   - Role: "Case Executor"
   - User ID: (Select a case executor user ID, e.g., 5)
7. **Click:** "Assign"
8. **Expected:**
   - Success message displayed
   - Service shows assigned case executor
   - Service status may change to "In Progress"

#### **5.2 Verify Assignment**
- Check service details - should show assigned case executor
- Case Executor should see service in their assigned services

---

### **PHASE 6: SERVICE STAGE UPDATES**

#### **6.1 Case Executor Views Assigned Service**
1. **Login as Case Executor**
2. **Navigate to:** `/admin/mot/case-executor/dashboard`
3. **Check:** "Assigned Services" count should be > 0
4. **Navigate to:** Service list or dashboard
5. **Click:** On the assigned service to view details

#### **6.2 Case Executor Updates Stage Status**
1. **In Service Detail Page:**
   - Go to "Stages" tab
2. **Find:** First stage (e.g., "PrepaymentInvoice")
3. **Click:** "Update" button
4. **Select Status:** "In Progress" or "Completed"
5. **Add Notes:** "Stage processing started"
6. **Click:** "Update"
7. **Expected:**
   - Success message displayed
   - Stage status updated in the table
   - Stage shows new status and notes

#### **6.3 Update Multiple Stages**
- Repeat for other stages:
  - Drop Risk → "Completed"
  - Delivery Order → "In Progress"
  - Inspection → "Pending"

---

### **PHASE 7: DOCUMENT MANAGEMENT**

#### **7.1 Upload Service Document**
1. **Login as Customer or Case Executor**
2. **Navigate to:** Service detail page
3. **Go to:** "Documents" tab
4. **Click:** "Upload Document" button
5. **Select File:** (PDF, JPG, PNG - max 10MB)
6. **Click:** "Upload"
7. **Expected:**
   - Success message displayed
   - Document appears in documents list
   - Document shows upload date and uploader

#### **7.2 View/Download Document**
1. **In Documents tab:**
2. **Click:** "View" or "Download" button
3. **Expected:** Document opens/downloads successfully

---

### **PHASE 8: MESSAGING**

#### **8.1 Send Message**
1. **Login as Customer**
2. **Navigate to:** `/admin/mot/messaging`
3. **Click:** "New Message" or "Send Message"
4. **Fill in:**
   - Recipient: (Select a staff member)
   - Subject: "Service Status Inquiry"
   - Message: "Can you provide an update on service SRV-TEST-001?"
5. **Click:** "Send"
6. **Expected:**
   - Success message displayed
   - Message appears in sent messages
   - Recipient receives notification

#### **8.2 View Messages**
1. **Login as recipient**
2. **Navigate to:** `/admin/mot/messaging`
3. **Check:** Inbox for new messages
4. **Click:** On message to view details
5. **Expected:** Message details displayed

---

### **PHASE 9: DASHBOARDS**

#### **9.1 Manager Dashboard**
1. **Login as Manager**
2. **Navigate to:** `/admin/mot/manager/dashboard`
3. **Verify:**
   - Total Services count displays
   - Pending Services count displays
   - Completed Services count displays
   - Recent Services table shows data
   - Monthly Service Stats chart displays

#### **9.2 Case Executor Dashboard**
1. **Login as Case Executor**
2. **Navigate to:** `/admin/mot/case-executor/dashboard`
3. **Verify:**
   - Assigned Services count displays
   - Pending Services count displays
   - Today's Tasks table shows data
   - Urgent Notifications section displays

#### **9.3 Assessor Dashboard**
1. **Login as Assessor**
2. **Navigate to:** `/admin/mot/assessor/dashboard`
3. **Verify:**
   - Pending Customer Approvals count displays
   - Pending Service Reviews count displays
   - Recent Customer Approvals table shows data
   - Recent Service Reviews table shows data

#### **9.4 Data Encoder Dashboard**
1. **Login as Data Encoder**
2. **Navigate to:** `/admin/mot/data-encoder/dashboard`
3. **Verify:**
   - Total Customers Created count displays
   - Pending Customer Approvals count displays
   - Total Services Created count displays
   - Recent Customers table shows data
   - Recent Services table shows data

---

### **PHASE 10: REPORTS**

#### **10.1 Service Statistics Report**
1. **Login as Manager**
2. **Navigate to:** `/admin/mot/reports`
3. **Go to:** "Service Statistics" tab
4. **Set Date Range (optional):** Select start and end dates
5. **Click:** "Refresh Reports"
6. **Verify:**
   - Total Services displays
   - Completed Services displays
   - Pending Services displays
   - Average Processing Time displays
   - Completion Rate displays

#### **10.2 Monthly Report**
1. **In Reports page:**
2. **Go to:** "Monthly Reports" tab
3. **Verify:**
   - Table shows monthly data
   - Each month shows total, completed, pending services
   - Completion rate per month displays

#### **10.3 Customer Statistics Report**
1. **Go to:** "Customer Statistics" tab
2. **Verify:**
   - Total Customers displays
   - Verified Customers displays
   - Pending Customers displays
   - Verification Rate displays

#### **10.4 System Report**
1. **Go to:** "System Report" tab
2. **Verify:**
   - All system-wide statistics display
   - Service completion rate displays
   - Customer verification rate displays
   - Total documents and messages count

---

## ✅ **VERIFICATION CHECKLIST**

After completing all phases, verify:

- [ ] All user roles can log in
- [ ] Data Encoder can create customers
- [ ] Assessor can approve customers
- [ ] Customer can create service requests
- [ ] Manager can assign services
- [ ] Case Executor can update service stages
- [ ] Documents can be uploaded and downloaded
- [ ] Messages can be sent and received
- [ ] All dashboards display real data
- [ ] All reports generate correctly
- [ ] Data persists across page refreshes
- [ ] Error messages display correctly
- [ ] Loading states work properly

---

## 🐛 **TROUBLESHOOTING**

### **API Not Responding:**
- Check backend is running on port 5000
- Check CORS settings in `Program.cs`
- Check database connection string

### **Frontend Not Loading:**
- Check frontend is running on port 3000/3001
- Check API base URL in axios config
- Check browser console for errors

### **Authentication Issues:**
- Verify JWT token is being sent in headers
- Check token expiration
- Verify user credentials in database

### **Data Not Appearing:**
- Check database has data
- Verify API endpoints are correct
- Check browser network tab for API calls
- Verify response format matches frontend expectations

---

## 📊 **EXPECTED RESULTS**

After completing all phases:

1. **Database should contain:**
   - 1+ verified customers
   - 1+ services with various statuses
   - Service stages with updates
   - Documents uploaded
   - Messages sent

2. **Dashboards should show:**
   - Real-time statistics
   - Recent activities
   - Charts and progress indicators

3. **Reports should display:**
   - Accurate service statistics
   - Monthly breakdowns
   - Customer statistics
   - System-wide metrics

---

## 🎉 **SUCCESS CRITERIA**

The test is successful if:
- ✅ All phases complete without errors
- ✅ Data flows correctly through the system
- ✅ All dashboards show real data
- ✅ All reports generate correctly
- ✅ No console errors in browser
- ✅ No API errors in backend logs

**If all criteria are met, the system is production-ready!** 🚀

