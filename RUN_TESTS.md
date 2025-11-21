# 🧪 **HOW TO RUN TESTS**

## 🚀 **QUICK START**

### **Step 1: Start Backend API**
Open a terminal and run:
```bash
cd Transit-api/Transit.API
dotnet run --urls "http://localhost:5000"
```

**Wait for:** `Now listening on: http://localhost:5000`

### **Step 2: Start Frontend**
Open another terminal and run:
```bash
cd transit-portal
npm run dev
```

**Wait for:** `Ready on http://localhost:3000`

### **Step 3: Run Automated Test (Optional)**
Open a third terminal and run:
```bash
# Install axios if not already installed
npm install axios

# Run the test script
node test-flow-with-data.js
```

---

## 📋 **MANUAL TESTING (Recommended)**

### **Option 1: Use the Test Guide**
Follow the step-by-step guide in `test-business-flow.md`:
1. Open browser to `http://localhost:3000`
2. Follow each phase in the guide
3. Insert test data as specified
4. Verify each step works

### **Option 2: Use Browser DevTools**
1. Open browser DevTools (F12)
2. Go to Network tab
3. Follow the business flow
4. Monitor API calls and responses
5. Check for errors

---

## 🎯 **TEST DATA TO INSERT**

### **Customer Data:**
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

### **Service Data:**
```json
{
  "serviceNumber": "SRV-TEST-001",
  "itemDescription": "Electronics Import - 50 Samsung Galaxy S24 Phones",
  "routeCategory": "Air Freight",
  "declaredValue": 25000.00,
  "taxCategory": "Electronics",
  "countryOfOrigin": "South Korea",
  "serviceType": 1,
  "riskLevel": 2
}
```

---

## ✅ **VERIFICATION CHECKLIST**

After testing, verify:

- [ ] All user roles can log in
- [ ] Data Encoder can create customers
- [ ] Assessor can approve customers
- [ ] Customer can create service requests
- [ ] Manager can assign services
- [ ] Case Executor can update stages
- [ ] Documents can be uploaded
- [ ] Messages can be sent
- [ ] All dashboards show data
- [ ] All reports generate correctly

---

## 🐛 **TROUBLESHOOTING**

### **Backend Not Starting:**
- Check .NET SDK is installed: `dotnet --version`
- Check database file exists: `Transit-api/Transit.API/transit.db`
- Check port 5000 is not in use

### **Frontend Not Starting:**
- Check Node.js is installed: `node --version`
- Install dependencies: `npm install`
- Check port 3000 is not in use

### **API Connection Errors:**
- Verify backend is running on port 5000
- Check axios config uses correct URL
- Check CORS settings in backend

### **Authentication Errors:**
- Clear browser storage
- Re-login with correct credentials
- Check JWT token in browser DevTools

---

## 📊 **EXPECTED RESULTS**

After successful testing:
- ✅ All phases complete without errors
- ✅ Data persists in database
- ✅ UI updates correctly
- ✅ All features work as expected
- ✅ No console errors
- ✅ No API errors

**If all tests pass → System is PRODUCTION READY!** 🚀

