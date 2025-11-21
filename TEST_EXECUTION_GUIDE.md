# 🧪 **TEST EXECUTION GUIDE**

## 🚀 **QUICK START**

### **1. Start Backend API**
```bash
cd Transit-api/Transit.API
dotnet run --urls "http://localhost:5000"
```
**Wait for:** `Now listening on: http://localhost:5000`

### **2. Start Frontend**
```bash
cd transit-portal
npm run dev
```
**Wait for:** `Ready on http://localhost:3000`

### **3. Open Browser**
Navigate to: `http://localhost:3000`

---

## 📋 **COMPLETE TEST FLOW**

### **TEST DATA TO INSERT:**

#### **Phase 1: Customer Creation (Data Encoder)**
1. Login: `dataencoder` / `dataencoder123`
2. Go to: Customers → Create Customer
3. Insert:
   - Business Name: `Test Electronics Import Co`
   - TIN: `TIN-123456789`
   - Business License: `BL-2024-001`
   - Contact: `John Smith`
   - Email: `john.smith@testemail.com`
   - Phone: `+1-555-0123`
   - Address: `123 Main Street, New York, NY 10001`
   - Business Type: `Electronics Import`
   - Import License: `IL-2024-001`

#### **Phase 2: Customer Approval (Assessor)**
1. Login: `assessor` / `assessor123`
2. Go to: Pending Approvals
3. Find the customer created above
4. Click: Approve
5. Add notes: `All documents verified`

#### **Phase 3: Service Request (Customer)**
1. Login: `customer` / `customer123`
2. Go to: My Services → Create Service
3. Insert:
   - Service Number: `SRV-TEST-001` (or auto-generated)
   - Item Description: `Electronics Import - 50 Samsung Galaxy S24 Phones`
   - Route Category: `Air Freight`
   - Declared Value: `25000`
   - Tax Category: `Electronics`
   - Country of Origin: `South Korea`
   - Service Type: `Multimodal`
   - Risk Level: `Green`

#### **Phase 4: Service Assignment (Manager)**
1. Login: `manager` / `manager123`
2. Go to: Services
3. Find the service created above
4. Click: View → Assign Service
5. Select: Case Executor (User ID: 5 or available executor)
6. Click: Assign

#### **Phase 5: Stage Updates (Case Executor)**
1. Login: `caseexecutor` / `caseexecutor123`
2. Go to: Dashboard or Services
3. Find assigned service
4. Click: View → Stages tab
5. Update stages:
   - PrepaymentInvoice → Completed
   - DropRisk → In Progress
   - Add notes for each update

#### **Phase 6: Document Upload**
1. Login: Customer or Case Executor
2. Go to: Service Detail → Documents tab
3. Upload: Test PDF or image file
4. Verify: Document appears in list

#### **Phase 7: Messaging**
1. Login: Customer
2. Go to: Messages
3. Send message to Manager or Case Executor
4. Login as recipient and verify message received

#### **Phase 8: Verify Dashboards**
1. **Manager Dashboard:** `/admin/mot/manager/dashboard`
   - Verify all statistics display
   - Check recent services table
   
2. **Case Executor Dashboard:** `/admin/mot/case-executor/dashboard`
   - Verify assigned services count
   - Check today's tasks
   
3. **Assessor Dashboard:** `/admin/mot/assessor/dashboard`
   - Verify pending approvals count
   - Check recent activities
   
4. **Data Encoder Dashboard:** `/admin/mot/data-encoder/dashboard`
   - Verify created customers/services count
   - Check recent activities

#### **Phase 9: Verify Reports**
1. Login: Manager
2. Go to: Reports
3. Test each tab:
   - Service Statistics
   - Monthly Reports
   - Customer Statistics
   - System Report
4. Verify: All data displays correctly

---

## ✅ **VERIFICATION POINTS**

After each phase, verify:

1. **Database:**
   - Data persists after page refresh
   - Relationships are correct
   - Statuses update properly

2. **UI:**
   - Success messages appear
   - Error messages are clear
   - Loading states work
   - Data displays correctly

3. **API:**
   - Requests succeed (check Network tab)
   - Responses contain expected data
   - No 401/403/500 errors

---

## 🐛 **COMMON ISSUES & FIXES**

### **Issue: API Connection Failed**
- **Check:** Backend is running on port 5000
- **Fix:** Update axios config if needed
- **Verify:** `http://localhost:5000/api/v1/Test/health` responds

### **Issue: Authentication Errors**
- **Check:** Token is being sent in headers
- **Fix:** Clear browser storage and re-login
- **Verify:** User credentials are correct

### **Issue: Data Not Appearing**
- **Check:** API response format matches frontend expectations
- **Fix:** Check browser console for errors
- **Verify:** Database has data

### **Issue: CORS Errors**
- **Check:** Backend CORS configuration
- **Fix:** Ensure frontend URL is in allowed origins
- **Verify:** `Program.cs` CORS settings

---

## 📊 **EXPECTED TEST RESULTS**

After completing all phases:

✅ **5 Users logged in successfully**
✅ **1 Customer created and approved**
✅ **1 Service request created**
✅ **1 Service assigned to case executor**
✅ **Multiple service stages updated**
✅ **Documents uploaded successfully**
✅ **Messages sent and received**
✅ **All dashboards show real data**
✅ **All reports generate correctly**

---

## 🎯 **SUCCESS CRITERIA**

Test is successful if:
- ✅ All phases complete without errors
- ✅ Data flows correctly through system
- ✅ All UI components work
- ✅ All API calls succeed
- ✅ No console errors
- ✅ No API errors

**If all criteria met → System is PRODUCTION READY!** 🚀

