"use client";

import React, { useEffect, useState } from "react";
import { Card, Table, Button, Space, Typography, Empty, Select, DatePicker, Row, Col, Statistic, Progress, message } from "antd";
import { BarChart3, Download, Filter, Calendar, TrendingUp, Users, FileText, CheckCircle, Clock } from "lucide-react";
import { usePermissionStore } from "@/modules/utils";
import permission from "@/modules/utils/permission/permission";

const { RangePicker } = DatePicker;
const { Option } = Select;

interface ReportData {
  id: number;
  reportType: string;
  period: string;
  totalServices: number;
  completedServices: number;
  pendingServices: number;
  rejectedServices: number;
  averageProcessingTime: number;
  customerSatisfaction: number;
  generatedDate: string;
  generatedBy: string;
}

interface ServiceStats {
  total: number;
  completed: number;
  pending: number;
  rejected: number;
  inProgress: number;
}

const ReportsPage = () => {
  const { checkPermission, permissions } = usePermissionStore();
  const [reports, setReports] = useState<ReportData[]>([]);
  const [serviceStats, setServiceStats] = useState<ServiceStats>({
    total: 0,
    completed: 0,
    pending: 0,
    rejected: 0,
    inProgress: 0
  });
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState<any>(null);
  const [reportType, setReportType] = useState<string>('all');

  // Mock data - replace with actual API call
  useEffect(() => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setReports([
        {
          id: 1,
          reportType: "Monthly Service Report",
          period: "January 2024",
          totalServices: 150,
          completedServices: 120,
          pendingServices: 20,
          rejectedServices: 10,
          averageProcessingTime: 3.5,
          customerSatisfaction: 4.2,
          generatedDate: '2024-01-31T23:59:59Z',
          generatedBy: 'System Admin'
        },
        {
          id: 2,
          reportType: "Weekly Performance Report",
          period: "Week 4, January 2024",
          totalServices: 45,
          completedServices: 38,
          pendingServices: 5,
          rejectedServices: 2,
          averageProcessingTime: 2.8,
          customerSatisfaction: 4.5,
          generatedDate: '2024-01-28T23:59:59Z',
          generatedBy: 'Manager A'
        },
        {
          id: 3,
          reportType: "Customer Satisfaction Report",
          period: "Q4 2023",
          totalServices: 500,
          completedServices: 480,
          pendingServices: 15,
          rejectedServices: 5,
          averageProcessingTime: 4.1,
          customerSatisfaction: 4.3,
          generatedDate: '2023-12-31T23:59:59Z',
          generatedBy: 'Quality Manager'
        }
      ]);

      setServiceStats({
        total: 150,
        completed: 120,
        pending: 20,
        rejected: 10,
        inProgress: 15
      });

      setLoading(false);
    }, 1000);
  }, []);

  const handleGenerateReport = async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      message.success('Report generated successfully');
      setLoading(false);
    } catch (error) {
      message.error('Failed to generate report');
      setLoading(false);
    }
  };

  const handleDownloadReport = (reportId: number) => {
    // Simulate download
    message.success('Report download started');
  };

  const getCompletionRate = () => {
    return serviceStats.total > 0 ? (serviceStats.completed / serviceStats.total) * 100 : 0;
  };

  const getPendingRate = () => {
    return serviceStats.total > 0 ? (serviceStats.pending / serviceStats.total) * 100 : 0;
  };

  const columns = [
    {
      title: "Report Type",
      dataIndex: "reportType",
      key: "reportType",
    },
    {
      title: "Period",
      dataIndex: "period",
      key: "period",
    },
    {
      title: "Total Services",
      dataIndex: "totalServices",
      key: "totalServices",
      render: (value: number) => (
        <Statistic value={value} valueStyle={{ fontSize: '16px' }} />
      ),
    },
    {
      title: "Completed",
      dataIndex: "completedServices",
      key: "completedServices",
      render: (value: number) => (
        <Statistic 
          value={value} 
          valueStyle={{ fontSize: '16px', color: '#52c41a' }} 
        />
      ),
    },
    {
      title: "Pending",
      dataIndex: "pendingServices",
      key: "pendingServices",
      render: (value: number) => (
        <Statistic 
          value={value} 
          valueStyle={{ fontSize: '16px', color: '#faad14' }} 
        />
      ),
    },
    {
      title: "Avg. Processing Time",
      dataIndex: "averageProcessingTime",
      key: "averageProcessingTime",
      render: (value: number) => `${value} days`,
    },
    {
      title: "Satisfaction",
      dataIndex: "customerSatisfaction",
      key: "customerSatisfaction",
      render: (value: number) => (
        <div className="flex items-center gap-2">
          <span>{value}/5</span>
          <Progress 
            percent={(value / 5) * 100} 
            size="small" 
            showInfo={false}
            strokeColor={value >= 4 ? '#52c41a' : value >= 3 ? '#faad14' : '#ff4d4f'}
          />
        </div>
      ),
    },
    {
      title: "Generated Date",
      dataIndex: "generatedDate",
      key: "generatedDate",
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: ReportData) => (
        <Space size="middle">
          <Button
            icon={<Download size={16} />}
            onClick={() => handleDownloadReport(record.id)}
          >
            Download
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <BarChart3 size={24} className="text-blue-600" />
        <Typography.Title level={2} className="mb-0">Reports & Analytics</Typography.Title>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Services"
              value={serviceStats.total}
              prefix={<FileText size={20} />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Completed"
              value={serviceStats.completed}
              prefix={<CheckCircle size={20} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Pending"
              value={serviceStats.pending}
              prefix={<Clock size={20} />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Completion Rate"
              value={getCompletionRate()}
              suffix="%"
              prefix={<TrendingUp size={20} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Progress Indicators */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} md={12}>
          <Card title="Service Completion Progress">
            <Progress
              percent={getCompletionRate()}
              strokeColor="#52c41a"
              format={(percent) => `${percent?.toFixed(1)}% Completed`}
            />
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="Pending Services">
            <Progress
              percent={getPendingRate()}
              strokeColor="#faad14"
              format={(percent) => `${percent?.toFixed(1)}% Pending`}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters and Actions */}
      <Card className="mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter size={16} />
            <span>Filters:</span>
          </div>
          <Select
            placeholder="Report Type"
            style={{ width: 150 }}
            value={reportType}
            onChange={setReportType}
          >
            <Option value="all">All Reports</Option>
            <Option value="monthly">Monthly</Option>
            <Option value="weekly">Weekly</Option>
            <Option value="daily">Daily</Option>
            <Option value="custom">Custom</Option>
          </Select>
          <RangePicker
            placeholder={['Start Date', 'End Date']}
            value={dateRange}
            onChange={setDateRange}
          />
          <Button
            type="primary"
            icon={<BarChart3 size={16} />}
            onClick={handleGenerateReport}
            loading={loading}
          >
            Generate Report
          </Button>
        </div>
      </Card>

      {/* Reports Table */}
      <Card bordered>
        <Table
          dataSource={reports}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="No reports found"
              />
            ),
          }}
        />
      </Card>
    </div>
  );
};

export default ReportsPage;