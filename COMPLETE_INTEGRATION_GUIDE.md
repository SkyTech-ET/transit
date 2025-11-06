# 🚀 **COMPLETE BACKEND-TO-FRONTEND INTEGRATION GUIDE**

## 📋 **OVERVIEW**
This guide provides step-by-step instructions for building features from backend to frontend integration, following the project's architecture patterns.


## 🎨 **PHASE 2: FRONTEND INTEGRATION**

### **STEP 7: CREATE FRONTEND TYPES**
**Location:** `transit-portal/modules/[feature]/[feature].types.ts`

**Example Structure:**
```typescript
export interface ICustomer {
  id: number;
  userId: number;
  businessName: string;
  tinNumber: string;
  businessLicense: string;
  contactPerson: string;
  contactPhone: string;
  contactEmail: string;
  businessAddress: string;
  city: string;
  state: string;
  postalCode: string;
  businessType: string;
  importLicense: string;
  importLicenseExpiry?: string;
  isVerified: boolean;
  verifiedByUserId?: number;
  createdByDataEncoderId: number;
  registeredDate: string;
  lastUpdateDate: string;
  user?: IUser;
  documents?: ICustomerDocument[];
}

export interface ICustomerPayload {
  businessName: string;
  tinNumber: string;
  businessLicense: string;
  contactPerson: string;
  contactPhone: string;
  contactEmail: string;
  businessAddress: string;
  city: string;
  state: string;
  postalCode: string;
  businessType: string;
  importLicense: string;
  importLicenseExpiry?: string;
  userId: number;
}

export interface ICustomerFilters {
  page?: number;
  pageSize?: number;
  searchTerm?: string;
  isVerified?: boolean;
}

export interface ICustomerState {
  customers: ICustomer[];
  customer: ICustomer | null;
  loading: boolean;
  error: string | null;
  listLoading: boolean;
}

export interface ICustomerActions {
  createCustomer: (payload: ICustomerPayload) => Promise<void>;
  updateCustomer: (payload: ICustomerPayload, id: number) => Promise<void>;
  deleteCustomer: (id: number) => Promise<void>;
  getCustomers: (filters?: ICustomerFilters) => Promise<void>;
  getCustomerById: (id: number) => Promise<void>;
}

export type ICustomerStore = ICustomerState & ICustomerActions;
```

**✅ Checklist:**
- [ ] Create interface for entity (`ICustomer`)
- [ ] Create interface for payload (`ICustomerPayload`)
- [ ] Create interface for filters (`ICustomerFilters`)
- [ ] Create state interface (`ICustomerState`)
- [ ] Create actions interface (`ICustomerActions`)
- [ ] Create store type (`ICustomerStore`)
- [ ] Match property names with backend DTOs

---

### **STEP 8: CREATE API ENDPOINTS**
**Location:** `transit-portal/modules/[feature]/[feature].endpoints.ts`

**Example Structure:**
```typescript
import http from '@/modules/utils/axios';
import { ICustomer, ICustomerPayload, ICustomerFilters } from './customer.types';

const customerEndpoints = Object.freeze({
  getAll: '/Customer/GetAll',
  getById: '/Customer/GetById',
  create: '/Customer/Create',
  update: '/Customer/Update',
  delete: '/Customer/Delete',
});

export const getAllCustomers = (filters?: ICustomerFilters): Promise<Response> => {
  return http.get({ 
    url: customerEndpoints.getAll, 
    params: filters 
  });
};

export const getCustomerById = (id: number): Promise<Response> => {
  return http.get({ 
    url: customerEndpoints.getById, 
    params: { id } 
  });
};

export const createCustomer = (payload: ICustomerPayload): Promise<Response> => {
  return http.post({ 
    url: customerEndpoints.create, 
    data: payload 
  });
};

export const updateCustomer = (id: number, payload: ICustomerPayload): Promise<Response> => {
  return http.put({ 
    url: `${customerEndpoints.update}/${id}`, 
    data: payload 
  });
};

export const deleteCustomer = (id: number): Promise<Response> => {
  return http.delete({ 
    url: `${customerEndpoints.delete}/${id}` 
  });
};
```

**✅ Checklist:**
- [ ] Create endpoints object with frozen routes
- [ ] Create function for each CRUD operation
- [ ] Use `http.get()`, `http.post()`, `http.put()`, `http.delete()` from axios utility
- [ ] Pass proper parameters and data
- [ ] Return `Promise<Response>`
- [ ] Match endpoint URLs with backend routes

---

### **STEP 9: CREATE ZUSTAND STORE**
**Location:** `transit-portal/modules/[feature]/[feature].store.ts`

**Example Structure:**
```typescript
import { create } from 'zustand';
import { ICustomerStore, ICustomer, ICustomerPayload, ICustomerFilters } from './customer.types';
import * as customerEndpoints from './customer.endpoints';
import { message } from 'antd';

export const useCustomerStore = create<ICustomerStore>((set, get) => ({
  // State
  customers: [],
  customer: null,
  loading: false,
  error: null,
  listLoading: false,

  // Actions
  createCustomer: async (payload: ICustomerPayload) => {
    set({ loading: true, error: null });
    try {
      const response = await customerEndpoints.createCustomer(payload);
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.message || 'Failed to create customer');
      }

      const newCustomer = data.response?.data as ICustomer;
      set(state => ({
        customers: [newCustomer, ...state.customers],
        loading: false,
      }));
      
      message.success('Customer created successfully');
    } catch (error: any) {
      set({ error: error.message, loading: false });
      message.error(error.message || 'Failed to create customer');
      throw error;
    }
  },

  getCustomers: async (filters?: ICustomerFilters) => {
    set({ listLoading: true, error: null });
    try {
      const response = await customerEndpoints.getAllCustomers(filters);
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.message || 'Failed to fetch customers');
      }

      const customers = data.response?.data?.data || data.response?.data || [];
      set({ customers, listLoading: false });
    } catch (error: any) {
      set({ error: error.message, listLoading: false });
      message.error(error.message || 'Failed to fetch customers');
    }
  },

  getCustomerById: async (id: number) => {
    set({ loading: true, error: null });
    try {
      const response = await customerEndpoints.getCustomerById(id);
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.message || 'Failed to fetch customer');
      }

      const customer = data.response?.data as ICustomer;
      set({ customer, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      message.error(error.message || 'Failed to fetch customer');
    }
  },

  updateCustomer: async (payload: ICustomerPayload, id: number) => {
    set({ loading: true, error: null });
    try {
      const response = await customerEndpoints.updateCustomer(id, payload);
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.message || 'Failed to update customer');
      }

      const updatedCustomer = data.response?.data as ICustomer;
      set(state => ({
        customers: state.customers.map(c => c.id === id ? updatedCustomer : c),
        customer: state.customer?.id === id ? updatedCustomer : state.customer,
        loading: false,
      }));
      
      message.success('Customer updated successfully');
    } catch (error: any) {
      set({ error: error.message, loading: false });
      message.error(error.message || 'Failed to update customer');
      throw error;
    }
  },

  deleteCustomer: async (id: number) => {
    set({ loading: true, error: null });
    try {
      const response = await customerEndpoints.deleteCustomer(id);
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.message || 'Failed to delete customer');
      }

      set(state => ({
        customers: state.customers.filter(c => c.id !== id),
        customer: state.customer?.id === id ? null : state.customer,
        loading: false,
      }));
      
      message.success('Customer deleted successfully');
    } catch (error: any) {
      set({ error: error.message, loading: false });
      message.error(error.message || 'Failed to delete customer');
      throw error;
    }
  },
}));
```

**✅ Checklist:**
- [ ] Create Zustand store using `create<ICustomerStore>()`
- [ ] Initialize state with default values
- [ ] Implement all action methods from interface
- [ ] Use `set()` to update state
- [ ] Use `get()` to access current state if needed
- [ ] Handle async operations with try/catch
- [ ] Show success/error messages using Ant Design's `message`
- [ ] Parse response JSON and extract data
- [ ] Update state with response data
- [ ] Handle error states properly

---

### **STEP 10: CREATE INDEX EXPORT**
**Location:** `transit-portal/modules/[feature]/index.ts`

**Example:**
```typescript
export * from './customer.types';
export * from './customer.endpoints';
export * from './customer.store';
```

**✅ Checklist:**
- [ ] Export all types
- [ ] Export all endpoints
- [ ] Export store hook

---

### **STEP 11: CREATE FRONTEND PAGE COMPONENT**
**Location:** `transit-portal/app/admin/[feature]/page.tsx`

**Example Structure:**
```typescript
'use client';

import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Space, Tag, Input, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { useCustomerStore } from '@/modules/mot/customer';
import type { ColumnsType } from 'antd/es/table';
import { ICustomer } from '@/modules/mot/customer';
import { useRouter } from 'next/navigation';

const CustomerPage: React.FC = () => {
  const router = useRouter();
  const { customers, loading, getCustomers, deleteCustomer } = useCustomerStore();
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    getCustomers();
  }, []);

  const handleDelete = async (id: number) => {
    try {
      await deleteCustomer(id);
    } catch (error) {
      // Error already handled in store
    }
  };

  const columns: ColumnsType<ICustomer> = [
    {
      title: 'Business Name',
      dataIndex: 'businessName',
      key: 'businessName',
    },
    {
      title: 'Contact Person',
      dataIndex: 'contactPerson',
      key: 'contactPerson',
    },
    {
      title: 'Email',
      dataIndex: 'contactEmail',
      key: 'contactEmail',
    },
    {
      title: 'Status',
      dataIndex: 'isVerified',
      key: 'isVerified',
      render: (isVerified: boolean) => (
        <Tag color={isVerified ? 'green' : 'orange'}>
          {isVerified ? 'Verified' : 'Pending'}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: ICustomer) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => router.push(`/admin/customer/edit/${record.id}`)}
          >
            Edit
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Card>
      <Space style={{ marginBottom: 16 }}>
        <Input
          placeholder="Search customers..."
          prefix={<SearchOutlined />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: 300 }}
        />
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => router.push('/admin/customer/create')}
        >
          Create Customer
        </Button>
      </Space>

      <Table
        columns={columns}
        dataSource={customers}
        loading={loading}
        rowKey="id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} customers`,
        }}
      />
    </Card>
  );
};

export default CustomerPage;
```

**✅ Checklist:**
- [ ] Use `'use client'` directive for client components
- [ ] Import required hooks and components
- [ ] Use Zustand store hook
- [ ] Fetch data in `useEffect` on mount
- [ ] Create table columns with proper types
- [ ] Add action buttons (Edit, Delete, etc.)
- [ ] Handle loading states
- [ ] Handle error states
- [ ] Add search/filter functionality
- [ ] Add pagination if needed
- [ ] Use Ant Design components consistently

---

### **STEP 12: CREATE FORM COMPONENT**
**Location:** `transit-portal/app/admin/[feature]/create/page.tsx` or `components/[Feature]Form.tsx`

**Example Structure:**
```typescript
'use client';

import React, { useEffect } from 'react';
import { Form, Input, Button, Card, Space, message } from 'antd';
import { SaveOutlined, ArrowLeftOutlined } from 'lucide-react';
import { useCustomerStore, ICustomerPayload } from '@/modules/mot/customer';
import { useRouter } from 'next/navigation';

const CreateCustomerForm: React.FC = () => {
  const router = useRouter();
  const [form] = Form.useForm();
  const { createCustomer, loading } = useCustomerStore();

  const onFinish = async (values: any) => {
    try {
      const payload: ICustomerPayload = {
        businessName: values.businessName,
        tinNumber: values.tinNumber,
        businessLicense: values.businessLicense,
        contactPerson: values.contactPerson,
        contactPhone: values.contactPhone,
        contactEmail: values.contactEmail,
        businessAddress: values.businessAddress,
        city: values.city,
        state: values.state,
        postalCode: values.postalCode,
        businessType: values.businessType,
        importLicense: values.importLicense,
        importLicenseExpiry: values.importLicenseExpiry,
        userId: values.userId,
      };

      await createCustomer(payload);
      router.push('/admin/customer');
    } catch (error) {
      // Error already handled in store
    }
  };

  return (
    <Card>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{}}
      >
        <Form.Item
          name="businessName"
          label="Business Name"
          rules={[{ required: true, message: 'Please enter business name' }]}
        >
          <Input placeholder="Enter business name" />
        </Form.Item>

        <Form.Item
          name="tinNumber"
          label="TIN Number"
          rules={[{ required: true, message: 'Please enter TIN number' }]}
        >
          <Input placeholder="Enter TIN number" />
        </Form.Item>

        {/* Add more form fields */}

        <Form.Item>
          <Space>
            <Button
              type="primary"
              htmlType="submit"
              icon={<SaveOutlined />}
              loading={loading}
            >
              Create Customer
            </Button>
            <Button onClick={() => router.back()}>
              <ArrowLeftOutlined /> Cancel
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default CreateCustomerForm;
```

**✅ Checklist:**
- [ ] Create form component with Ant Design `Form`
- [ ] Use `Form.useForm()` hook
- [ ] Define form fields with validation rules
- [ ] Map form values to payload interface
- [ ] Call store action on form submit
- [ ] Handle loading state during submission
- [ ] Navigate after successful creation
- [ ] Show proper error messages

---

## 🔗 **PHASE 3: BACKEND-FRONTEND COMMUNICATION**

### **STEP 13: CONFIGURE API BASE URL**
**Location:** `transit-portal/modules/utils/axios/`

**Check Configuration:**
```typescript
// Check if base URL is correctly set
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
```

**✅ Checklist:**
- [ ] Verify API base URL in axios configuration
- [ ] Check environment variables
- [ ] Ensure CORS is configured on backend
- [ ] Test API connectivity

---

### **STEP 14: HANDLE AUTHENTICATION TOKEN**
**Location:** `transit-portal/modules/utils/axios/`

**Token Handling:**
- Tokens are automatically added from cookies/localStorage
- Check axios interceptor configuration
- Verify token is sent in `Authorization: Bearer <token>` header

**✅ Checklist:**
- [ ] Verify token is stored after login
- [ ] Check token is included in API requests
- [ ] Handle token expiration/refresh
- [ ] Redirect to login on 401 errors

---

### **STEP 15: TEST END-TO-END FLOW**

**Testing Checklist:**
1. **Backend API Test:**
   ```bash
   # Test endpoint with curl or Postman
   curl -X POST http://localhost:5000/api/v1/Customer/Create \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer <token>" \
     -d '{"businessName":"Test","userId":1}'
   ```

2. **Frontend Integration Test:**
   - [ ] Open frontend page
   - [ ] Fill form with data
   - [ ] Submit form
   - [ ] Verify API call in browser DevTools Network tab
   - [ ] Check response data format
   - [ ] Verify UI updates correctly
   - [ ] Test error scenarios

3. **End-to-End Flow:**
   - [ ] Create entity from frontend
   - [ ] Verify data in database
   - [ ] Update entity from frontend
   - [ ] Delete entity from frontend
   - [ ] Test all CRUD operations

---

## 📝 **COMMON PATTERNS & BEST PRACTICES**

### **Backend Patterns:**
- ✅ Always use domain factory methods (`Customer.Create()`)
- ✅ Return `OperationResult<T>` from handlers
- ✅ Use `HandleSuccessResponse()` / `HandleErrorResponse()` in controllers
- ✅ Authenticate users with `JwtHelper.GetCurrentUserId()`
- ✅ Use Mapster for DTO mapping
- ✅ Follow CQRS pattern (Commands/Queries)

### **Frontend Patterns:**
- ✅ Use Zustand for state management
- ✅ Create separate types file for TypeScript interfaces
- ✅ Use Ant Design components consistently
- ✅ Handle loading and error states
- ✅ Show user-friendly messages
- ✅ Use `'use client'` for interactive components

### **Communication Patterns:**
- ✅ Always check `data.error` in frontend responses
- ✅ Use consistent response format: `{ error: boolean, response: { data: T } }`
- ✅ Handle network errors gracefully
- ✅ Show loading indicators during async operations

---

## 🎯 **QUICK REFERENCE: FILE STRUCTURE**

```
Backend:
├── Transit.Domain/Models/[Feature]/        # Domain models
├── Transit.Application/
│   ├── Commands/[Feature]/                 # Commands
│   └── Handlers/[Feature]/                 # Handlers
└── Transit.API/
    └── Controllers/[Feature]/              # API controllers

Frontend:
├── transit-portal/
│   ├── modules/[feature]/
│   │   ├── [feature].types.ts             # TypeScript interfaces
│   │   ├── [feature].endpoints.ts          # API endpoints
│   │   ├── [feature].store.ts              # Zustand store
│   │   └── index.ts                        # Exports
│   └── app/admin/[feature]/
│       ├── page.tsx                        # List page
│       ├── create/page.tsx                 # Create form
│       └── [id]/page.tsx                   # Detail/Edit page
```

---

## 🚀 **READY TO START!**

Follow these steps in order, and you'll have a complete feature integrated from backend to frontend. Each step builds on the previous one, ensuring a clean and maintainable codebase.
