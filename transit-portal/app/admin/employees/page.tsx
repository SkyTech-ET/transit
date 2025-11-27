"use client";
import { useEffect, useState } from "react";
import {
  Card,
  Table,
  Tag,
  Button,
  Input,
  Space,
  Popconfirm,
  Drawer,
  Descriptions,
} from "antd";
import { Eye, PencilLine, Trash2, Users, Plus } from "lucide-react";
import { useUserStore } from "@/modules/user";
import { useRouter } from "next/navigation";

const EmployeeListPage = () => {
  const router = useRouter();
  const { users, loading, getUsers, deleteUser } = useUserStore();

  const [search, setSearch] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Employee role IDs
  const employeeRoles = [3, 4, 5];

  // Role name map
  const roleMap: Record<number, string> = {
    3: "Data Encoder",
    5: "Assessor",
    4: "Case Executor",
  };

  // Role color map
  const roleColorMap: Record<number, string> = {
    3: "purple",
    4: "blue",
    5: "green",
  };

  useEffect(() => {
    getUsers(2); // fetch active users
  }, []);

  // Open drawer with selected employee
  const handleView = (record: any) => {
    setSelectedEmployee(record);
    setIsDrawerOpen(true);
  };

  // Filter employees + search
  const employees = users.filter((user) => {
    const hasEmployeeRole = user.userRoles?.some((r) =>
      employeeRoles.includes(r.roleId)
    );

    if (!hasEmployeeRole) return false;

    const keyword = search.toLowerCase();
    return (
      user.username?.toLowerCase().includes(keyword) ||
      user.firstName?.toLowerCase().includes(keyword) ||
      user.lastName?.toLowerCase().includes(keyword) ||
      user.email?.toLowerCase().includes(keyword)
    );
  });

  const columns = [
    {
      title: "Name",
      dataIndex: "firstName",
      render: (_: any, record: any) => (
        <div>
          <p className="font-medium">
            {record.firstName} {record.lastName}
          </p>
          <span className="text-xs text-gray-500">{record.username}</span>
        </div>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
    },
    {
      title: "Phone",
      dataIndex: "phone",
    },
    {
      title: "Role",
      dataIndex: "userRoles",
      render: (roles: any[]) =>
        roles
          ?.filter((r) => employeeRoles.includes(r.roleId))
          .map((r, index) => (
            <Tag color={roleColorMap[r.roleId]} key={index}>
              {roleMap[r.roleId] || `Role ${r.roleId}`}
            </Tag>
          )),
    },
    {
      title: "Status",
      dataIndex: "recordStatus",
      render: (status: number) => (
        <Tag color={status === 2 ? "green" : "red"}>
          {status === 2 ? "Active" : "Inactive"}
        </Tag>
      ),
    },
    {
      title: "Actions",
      render: (_: any, record: any) => (
        <Space>
          <Button icon={<Eye size={16} />} onClick={() => handleView(record)} />

          <Button
            icon={<PencilLine size={16} />}
            onClick={() => router.push(`/admin/user/edit/${record.id}`)}
          />

          <Popconfirm
            title="Delete employee?"
            onConfirm={() => deleteUser(record.id)}
          >
            <Button danger icon={<Trash2 size={16} />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card className="p-6">
      {/* Header */}
      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Users size={20} /> Employee Management
        </h2>

        <Space>
          <Input
            placeholder="Search employees..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64"
          />

          <Button
            type="primary"
            icon={<Plus size={16} />}
            onClick={() => router.push("/admin/user/create")}
          >
            Add Employee
          </Button>
        </Space>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        dataSource={employees}
        loading={loading}
        rowKey="id"
      />

      {/* Employee Detail Drawer */}
      <Drawer
        title="Employee Details"
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        width={420}
      >
        {selectedEmployee && (
          <div className="space-y-4">
            {/* Profile Section */}
            <div className="flex items-center gap-3">
              <img
                src={`${process.env.NEXT_PUBLIC_API_URL}/${selectedEmployee.profilePhoto}`}
                alt="profile"
                className="w-16 h-16 rounded-full object-cover border"
              />
              <div>
                <p className="text-lg font-semibold">
                  {selectedEmployee.firstName} {selectedEmployee.lastName}
                </p>
                <p className="text-gray-500 text-sm">
                  {selectedEmployee.username}
                </p>
              </div>
            </div>

            {/* Info Section */}
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="Email">
                {selectedEmployee.email}
              </Descriptions.Item>

              <Descriptions.Item label="Phone">
                {selectedEmployee.phone}
              </Descriptions.Item>

              <Descriptions.Item label="Role">
                {selectedEmployee.userRoles?.map((r: any, i: number) => (
                  <Tag color={roleColorMap[r.roleId]} key={i}>
                    {roleMap[r.roleId]}
                  </Tag>
                ))}
              </Descriptions.Item>

              <Descriptions.Item label="Status">
                <Tag
                  color={
                    selectedEmployee.recordStatus === 2 ? "green" : "red"
                  }
                >
                  {selectedEmployee.recordStatus === 2
                    ? "Active"
                    : "Inactive"}
                </Tag>
              </Descriptions.Item>

              <Descriptions.Item label="Registered">
                {new Date(
                  selectedEmployee.registeredDate
                ).toLocaleString()}
              </Descriptions.Item>

              <Descriptions.Item label="Last Updated">
                {new Date(
                  selectedEmployee.lastUpdateDate
                ).toLocaleString()}
              </Descriptions.Item>
            </Descriptions>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2">
              <Button
                type="primary"
                onClick={() =>
                  router.push(`/admin/user/edit/${selectedEmployee.id}`)
                }
              >
                Edit
              </Button>
              <Button onClick={() => setIsDrawerOpen(false)}>Close</Button>
            </div>
          </div>
        )}
      </Drawer>
    </Card>
  );
};

export default EmployeeListPage;
