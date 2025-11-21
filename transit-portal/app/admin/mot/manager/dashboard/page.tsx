"use client";

import React, { useEffect } from "react";
import { Card, Row, Col, Statistic, Progress, Table, Tag, Typography } from "antd";
import { 
  Users, 
  FileText, 
  CheckCircle, 
  Clock, 
  TrendingUp
} from "lucide-react";
import { useDashboardStore } from "@/modules/mot/dashboard";
import { ServiceStatus } from "@/modules/mot/service";

const ManagerDashboard = () => {
  const { managerDashboard, loading, getManagerDashboard } = useDashboardStore();

  useEffect(() => {
    getManagerDashboard();
  }, [getManagerDashboard]);

  if (!managerDashboard && !loading) {
    return <div className="p-6">No data available</div>;
  }

  const recentServicesColumns = [
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
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: ServiceStatus) => (
        <Tag color={status === ServiceStatus.Completed ? 'green' : status === ServiceStatus.InProgress ? 'blue' : 'orange'}>
          {ServiceStatus[status]}
        </Tag>
      ),
    },
    {
      title: 'Created Date',
      dataIndex: 'registeredDate',
      key: 'registeredDate',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <Typography.Title level={2}>Manager Dashboard</Typography.Title>
        <Typography.Text type="secondary">
          Overview of MOT system performance and team activities
        </Typography.Text>
      </div>

      {/* Key Metrics */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Services"
              value={managerDashboard?.totalServices || 0}
              prefix={<FileText size={20} />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Completed Services"
              value={managerDashboard?.completedServices || 0}
              prefix={<CheckCircle size={20} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Pending Services"
              value={managerDashboard?.pendingServices || 0}
              prefix={<Clock size={20} />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Active Staff"
              value={managerDashboard?.activeStaff || 0}
              prefix={<Users size={20} />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Performance Indicators */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} md={12}>
          <Card title="Service Completion Rate">
            <Progress
              percent={managerDashboard?.totalServices ? 
                Math.round((managerDashboard.completedServices / managerDashboard.totalServices) * 100) : 0}
              strokeColor="#52c41a"
              format={(percent) => `${percent?.toFixed(1)}%`}
            />
            <div className="mt-2 text-sm text-gray-500">
              {managerDashboard?.completedServices || 0} of {managerDashboard?.totalServices || 0} services completed
            </div>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="Customer Verification Rate">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {managerDashboard?.totalCustomers ? 
                  Math.round((managerDashboard.verifiedCustomers / managerDashboard.totalCustomers) * 100) : 0}%
              </div>
              <Progress
                percent={managerDashboard?.totalCustomers ? 
                  (managerDashboard.verifiedCustomers / managerDashboard.totalCustomers) * 100 : 0}
                strokeColor="#52c41a"
                showInfo={false}
              />
              <div className="mt-2 text-sm text-gray-500">
                {managerDashboard?.verifiedCustomers || 0} of {managerDashboard?.totalCustomers || 0} customers verified
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* Recent Services */}
        <Col xs={24} lg={16}>
          <Card title="Recent Services" className="h-full">
            <Table
              dataSource={managerDashboard?.recentServices || []}
              columns={recentServicesColumns}
              rowKey="id"
              pagination={false}
              size="small"
              loading={loading}
            />
          </Card>
        </Col>

        {/* Monthly Stats */}
        <Col xs={24} lg={8}>
          <Card title="Monthly Service Stats" className="h-full">
            <div className="space-y-4">
              {managerDashboard?.monthlyServiceStats?.slice(0, 5).map((stat, index) => (
                <div key={index}>
                  <div className="flex justify-between mb-2">
                    <span>{new Date(stat.year, stat.month - 1).toLocaleString('default', { month: 'short', year: 'numeric' })}</span>
                    <span>{stat.completedServices}/{stat.totalServices}</span>
                      </div>
                  <Progress 
                    percent={stat.completionRate} 
                    size="small" 
                    strokeColor="#52c41a"
                  />
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ManagerDashboard;