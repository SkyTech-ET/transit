"use client";
import { useEffect } from "react";
import { Card, Table, Tag, Button, Avatar, Space } from "antd";
import { UserAddOutlined, MoreOutlined } from "@ant-design/icons";
import { useCustomerStore } from "@/modules/customers/customer.store";

export default function CustomersPage() {
  const { customers, loading, getCustomers } = useCustomerStore();

  useEffect(() => {
    getCustomers();
  }, []);

  const columns = [
    {
      title: "Customer",
      dataIndex: "name",
      key: "name",
      render: (text: string, record: any) => (
        <Space>
          <Avatar src={record.avatar} />
          <div>
            <p className="font-medium">{text}</p>
            <p className="text-xs text-gray-500">#{record.id.toString().padStart(3, "0")}</p>
          </div>
        </Space>
      ),
    },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Phone", dataIndex: "phone", key: "phone" },
    {
      title: "Service",
      dataIndex: "service",
      key: "service",
      render: (service: string) => (
        <Tag color="blue" className="rounded-full px-2 text-xs">
          {service}
        </Tag>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const color =
          status === "Active" ? "green" : status === "Pending" ? "gold" : "red";
        return (
          <Tag color={color} className="rounded-full px-2 text-xs">
            {status}
          </Tag>
        );
      },
    },
    {
      title: "",
      key: "actions",
      render: () => <MoreOutlined className="cursor-pointer text-gray-400" />,
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-lg font-semibold">Customer List</h2>
          <p className="text-sm text-gray-500">
            View and manage all customer accounts and their services
          </p>
        </div>
        <Button type="primary" icon={<UserAddOutlined />}  href="/admin/customers/create">
          Add Customer
        </Button>
      </div>

      <Card className="shadow-sm">
        <Table
          columns={columns}
          dataSource={customers}
          rowKey="id"
          loading={loading}
          pagination={false}
        />
      </Card>
    </div>
  );
}
