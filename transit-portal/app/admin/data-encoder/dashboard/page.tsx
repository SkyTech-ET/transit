"use client";

import React, { useEffect } from "react";
import { Card, Row, Col, Statistic, Button, Space, Table, Tag } from "antd";
import { 
  PlusOutlined, 
  SolutionOutlined, 
  UserOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined
} from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { useServiceStore, ServiceStatus } from "@/modules/mot/service";
import { useUserStore } from "@/modules/user";
import { useCustomerStore } from "@/modules/mot/customer";

const DataEncoderDashboard = () => {
  const router = useRouter();
  const { services, getAllServices } = useServiceStore();
  const { users, getUsers } = useUserStore();
  const { customers, getAllCustomers } = useCustomerStore();

  useEffect(() => {
    getAllServices();
    getUsers(2); // Active users
    getAllCustomers();
  }, [getAllServices, getUsers, getAllCustomers]);

  // Filter customers (users with Customer role)
  const customerUsers = users?.filter(user =>
    user.roles?.some(role =>
      role.id === 6 || role.id === 8 // Customer role IDs
    )
  ) || [];

  // Calculate statistics
  const totalServices = services?.length || 0;
  const totalCustomers = customerUsers.length;
  const totalBusinessCustomers = customers?.length || 0;
  const draftServices = services?.filter(service => service.status === ServiceStatus.Draft).length || 0;
  const submittedServices = services?.filter(service => service.status === ServiceStatus.Submitted).length || 0;

  const recentServices = services?.slice(0, 5) || [];
  const recentCustomers = customerUsers.slice(0, 5);

  const serviceColumns = [
    {
      title: 'Service Number',
      dataIndex: 'serviceNumber',
      key: 'serviceNumber',
    },
    {
      title: 'Customer',
      dataIndex: 'customer',
      key: 'customer',
      render: (customer: any) => customer ? `${customer.firstName} ${customer.lastName}` : 'N/A',
    },
    {
      title: 'Type',
      dataIndex: 'serviceType',
      key: 'serviceType',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'Draft' ? 'orange' : status === 'Submitted' ? 'blue' : 'green'}>
          {status}
        </Tag>
      ),
    },
  ];

  const customerColumns = [
    {
      title: 'Name',
      dataIndex: 'firstName',
      key: 'name',
      render: (firstName: string, record: any) => `${firstName} ${record.lastName}`,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Status',
      dataIndex: 'isVerified',
      key: 'status',
      render: (isVerified: boolean) => (
        <Tag color={isVerified ? 'green' : 'orange'}>
          {isVerified ? 'Verified' : 'Pending'}
        </Tag>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Data Encoder Dashboard</h1>
        <p className="text-gray-600">Data entry and service creation</p>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Total Services"
              value={totalServices}
              prefix={<SolutionOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Total Customers"
              value={totalCustomers}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Draft Services"
              value={draftServices}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Submitted Services"
              value={submittedServices}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Card title="Quick Actions" className="mb-6">
        <Space wrap>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => router.push('/admin/mot/services/create')}
          >
            Create Service
          </Button>
          <Button 
            icon={<UserOutlined />}
            onClick={() => router.push('/admin/user/create')}
          >
            Create Customer User
          </Button>
          <Button 
            icon={<SolutionOutlined />}
            onClick={() => router.push('/admin/mot/services')}
          >
            Manage Services
          </Button>
          <Button 
            icon={<UserOutlined />}
            onClick={() => router.push('/admin/mot/customers')}
          >
            Manage Customers
          </Button>
        </Space>
      </Card>

      {/* Recent Activity */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Recent Services" size="small">
            <Table
              columns={serviceColumns}
              dataSource={recentServices}
              rowKey="id"
              pagination={false}
              size="small"
              locale={{
                emptyText: 'No services created yet'
              }}
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Recent Customers" size="small">
            <Table
              columns={customerColumns}
              dataSource={recentCustomers}
              rowKey="id"
              pagination={false}
              size="small"
              locale={{
                emptyText: 'No customers created yet'
              }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DataEncoderDashboard;



