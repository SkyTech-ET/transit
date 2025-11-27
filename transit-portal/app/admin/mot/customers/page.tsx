"use client";

import React, { useEffect, useState } from "react";
import { Card, Table, Button, Space, Tag, Input, Popconfirm } from "antd";
import { Plus, Trash, PencilLine, Users, Truck } from "lucide-react";
import { useUserStore } from "@/modules/user";
import { usePermissionStore } from "@/modules/utils/permission/permission.store";
import { useRouter } from "next/navigation";
import { customerRoutes } from "@/modules/mot/customer";

const CUSTOMER_ROLE_ID = 3; // ✅ Correct Customer Role ID from your backend

const CustomersPage = () => {
  const router = useRouter();

  const {
    users,
    loading,
    getUsers,
    deleteUser
  } = useUserStore();

  const { currentUser } = usePermissionStore();

  const [filters, setFilters] = useState({
    search: "",
  });

  // --------------------------------------------
  // ✅ Detect if current user is customer
  // --------------------------------------------
  const isCurrentUserCustomer = currentUser?.roles?.some(role =>
    role.roleId === CUSTOMER_ROLE_ID ||
    role.roleName?.toLowerCase() === "customer"
  );

  // --------------------------------------------
  // ✅ Filter only customer users (roleId = 2)
  // --------------------------------------------
  const customerUsers = users.filter((user) => {
    const hasCustomerRole = user.userRoles?.some(
      (ur) => ur.roleId === CUSTOMER_ROLE_ID
    );

    if (!hasCustomerRole) return false;

    // If current user IS customer → show ONLY their own data
    if (isCurrentUserCustomer) {
      return user.id === currentUser?.id;
    }

    // Admin / Staff side → show all customers with search filter
    const searchTerm = filters.search.toLowerCase();

    const matchesSearch =
      !filters.search ||
      user.username?.toLowerCase().includes(searchTerm) ||
      user.firstName?.toLowerCase().includes(searchTerm) ||
      user.lastName?.toLowerCase().includes(searchTerm) ||
      user.email?.toLowerCase().includes(searchTerm);

    return matchesSearch;
  });

  // --------------------------------------------
  // Load users on page load
  // --------------------------------------------
  useEffect(() => {
    getUsers(2); // recordStatus = Active
  }, []);

  const handleDelete = (id: number) => {
    deleteUser(id);
  };

  // --------------------------------------------
  // TABLE COLUMNS
  // --------------------------------------------
  const columns = [
    {
      title: "Username",
      dataIndex: "username",
      key: "username",
    },
    {
      title: "First Name",
      dataIndex: "firstName",
      key: "firstName",
    },
    {
      title: "Last Name",
      dataIndex: "lastName",
      key: "lastName",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
    },
   
    {
      title: "Status",
      dataIndex: "recordStatus",
      key: "recordStatus",
      render: (status: number) => (
        <Tag color={status === 2 ? "green" : "red"}>
          {status === 2 ? "Active" : "Inactive"}
        </Tag>
      ),
    },
    {
      title: "Options",
      key: "options",
      render: (_: any, record: any) => (
        <span className="flex gap-2">
          <Button
            type="primary"
            className="bg-red"
            icon={<PencilLine size={18} />}
            onClick={() => router.push(`/admin/user/edit/${record.id}`)}
          />

          {!isCurrentUserCustomer && (
            <Popconfirm title="Sure to delete?" onConfirm={() => handleDelete(record.id)}>
              <Button
                className="bg-red"
                icon={<Trash size={18} color="red" />}
              />
            </Popconfirm>
          )}
        </span>
      ),
    },
  ];

  return (
    <div className="p-6">

      <Card
        title={
          <div className="flex items-center gap-2">
            <Users size={20} />
            <span>
              {isCurrentUserCustomer ? "My Customer Dashboard" : "Customer Management"}
            </span>
          </div>
        }
        extra={
          <Space>
            {isCurrentUserCustomer && (
              <Button
                type="primary"
                icon={<Truck size={16} />}
                onClick={() => router.push(customerRoutes.createService)}
              >
                Create Service Request
              </Button>
            )}

            {!isCurrentUserCustomer && (
              <Button
                type="primary"
                icon={<Plus size={16} />}
                onClick={() => router.push("/admin/user/create")}
              >
                Create Customer User
              </Button>
            )}
          </Space>
        }
      >

        {/* Search bar only for admins */}
        {!isCurrentUserCustomer && (
          <div className="mb-4 flex gap-4">
            <Input
              placeholder="Search customer users..."
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
              style={{ width: 200 }}
            />
          </div>
        )}

        <Table
          columns={columns}
          dataSource={customerUsers}
          loading={loading}
          rowKey="id"
          pagination={{
            total: customerUsers.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
          }}
          locale={{
            emptyText: (
              <div style={{ padding: "40px 0", textAlign: "center" }}>
                <div style={{ fontSize: "16px", color: "#999", marginBottom: "8px" }}>
                  No customer users found
                </div>
                <div style={{ fontSize: "14px", color: "#ccc" }}>
                  {loading
                    ? "Loading customer users..."
                    : "No users with Customer role have been created yet."}
                </div>
              </div>
            ),
          }}
        />

      </Card>
    </div>
  );
};

export default CustomersPage;
