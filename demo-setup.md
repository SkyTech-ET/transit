# 🎯 **TRANSIT PORTAL - CLIENT DEMO SETUP GUIDE**

## 🚀 **QUICK START FOR CLIENT PRESENTATION**

### **Step 1: Start Backend API**
```bash
cd Transit-api/Transit.API
dotnet run --urls "http://localhost:5000"
```
**Expected Result:** API running on http://localhost:5000

### **Step 2: Start Frontend Portal**
```bash
cd transit-portal
npm run dev
```
**Expected Result:** Frontend running on http://localhost:3001

### **Step 3: Test API Endpoints**
```bash
# Test API health
curl http://localhost:5000/api/v1/Seeder/GetSeededCredentials

# Test login endpoint
curl -X POST "http://localhost:5000/api/v1/User/Login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

---

## 👥 **DEMO USER ACCOUNTS (Pre-seeded)**

### **System Administrator**
- **Username:** admin
- **Password:** admin123
- **Role:** System Administrator
- **Access:** Full system access

### **Manager**
- **Username:** manager
- **Password:** manager123
- **Role:** Manager
- **Access:** Service oversight, user management

### **Data Encoder**
- **Username:** encoder
- **Password:** encoder123
- **Role:** Data Encoder
- **Access:** Customer creation, data entry

### **Case Executor**
- **Username:** executor
- **Password:** executor123
- **Role:** Case Executor
- **Access:** Service execution, document handling

### **Assessor**
- **Username:** assessor
- **Password:** assessor123
- **Role:** Assessor
- **Access:** Service assessment, approval workflow

### **Customer**
- **Username:** customer
- **Password:** customer123
- **Role:** Customer
- **Access:** Service requests, document upload

---

## 🎬 **DEMO SCENARIOS FOR CLIENT**

### **Scenario 1: System Overview**
1. **Login as Admin** → View system dashboard
2. **Navigate to Users** → See all user roles
3. **Check Permissions** → Verify role-based access
4. **View Reports** → Show system analytics

### **Scenario 2: Customer Onboarding**
1. **Login as Data Encoder** → Create new customer
2. **Upload Documents** → Customer verification documents
3. **Submit for Approval** → Manager review process
4. **Login as Manager** → Approve customer
5. **Login as Customer** → Access granted

### **Scenario 3: Service Request Workflow**
1. **Login as Customer** → Create service request
2. **Upload Required Documents** → Service-specific documents
3. **Submit Request** → System processes request
4. **Login as Manager** → Assign to Case Executor
5. **Login as Case Executor** → Execute service
6. **Login as Assessor** → Review and approve
7. **Service Completion** → Customer notification

### **Scenario 4: Document Management**
1. **Upload Documents** → Various file types
2. **Document Verification** → Check document integrity
3. **Download Documents** → Secure document access
4. **Document Tracking** → Status updates

### **Scenario 5: Messaging System**
1. **Send Messages** → Between different roles
2. **Message Threads** → Conversation tracking
3. **Notifications** → Real-time updates
4. **Message History** → Complete audit trail

---

## 📊 **DEMO DATA TO SHOW**

### **Dashboard Metrics:**
- Total Users: 6 (all roles)
- Active Services: 15+
- Pending Approvals: 5
- Completed Services: 10+

### **Sample Services:**
- **Service #001:** Electronics Import
- **Service #002:** Textile Export
- **Service #003:** Machinery Import
- **Service #004:** Food Products Export
- **Service #005:** Automotive Parts

### **Document Types:**
- Invoices
- Bills of Lading
- Certificates
- Permits
- Photos
- Other Documents

---

## 🔧 **TROUBLESHOOTING**

### **If API doesn't start:**
```bash
# Check if port 5000 is available
netstat -an | findstr :5000

# Try different port
dotnet run --urls "http://localhost:5001"
```

### **If Frontend doesn't start:**
```bash
# Install dependencies
npm install

# Clear cache
npm run build
```

### **If Database issues:**
```bash
# Check database file
ls Transit-api/Transit.API/userprofiles.db

# Reset database
rm Transit-api/Transit.API/userprofiles.db
# Restart API to recreate
```

---

## 🎉 **PRESENTATION TIPS**

### **Key Points to Highlight:**
1. **Role-Based Access Control** - Different dashboards for different roles
2. **Complete Workflow** - End-to-end service management
3. **Document Security** - Secure upload/download system
4. **Real-time Communication** - Messaging between users
5. **Comprehensive Reporting** - Analytics and insights
6. **Mobile Responsive** - Works on all devices
7. **Production Ready** - Secure and scalable

### **Demo Flow:**
1. **Start with Admin Dashboard** - Show system overview
2. **Demonstrate User Management** - Create/edit users
3. **Show Service Workflow** - Complete business process
4. **Highlight Security Features** - Authentication, authorization
5. **Display Reports** - Business intelligence
6. **Test Mobile View** - Responsive design

---

## ✅ **SUCCESS CRITERIA**

- [ ] All servers start successfully
- [ ] All user roles can login
- [ ] Complete service workflow works
- [ ] Document upload/download functions
- [ ] Messaging system operational
- [ ] Reports generate correctly
- [ ] Mobile responsiveness confirmed

**🎯 Your Transit Portal is ready for client presentation!**



