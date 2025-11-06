"use client";

import React, { useEffect, useState } from "react";
import { Card, Row, Col, Statistic, Progress, Table, Tag, Button, Space, Typography, List, Avatar, Badge, Timeline } from "antd";
import { 
  FileText, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Eye,
  Edit,
  Calendar,
  User,
  Building,
  Send,
  MessageSquare
} from "lucide-react";

interface CaseExecutorStats {
  assignedCases: number;
  completedCases: number;
  pendingCases: number;
  documentsProcessed: number;
  averageProcessingTime: number;
  customerCommunications: number;
}

interface CaseTask {
  id: number;
  caseNumber: string;
  customerName: string;
  caseType: string;
  priority: 'low' | 'medium' | 'high';
  assignedDate: string;
  dueDate: string;
  status: 'pending' | 'in_progress' | 'completed' | 'on_hold' | 'waiting_customer';
  documentsCount: number;
  lastActivity: string;
  nextAction: string;
}

interface CaseTimeline {
  id: number;
  caseNumber: string;
  action: string;
  timestamp: string;
  user: string;
  status: 'completed' | 'pending' | 'in_progress';
  notes?: string;
}

const CaseExecutorDashboard = () => {
  const [stats, setStats] = useState<CaseExecutorStats>({
    assignedCases: 0,
    completedCases: 0,
    pendingCases: 0,
    documentsProcessed: 0,
    averageProcessingTime: 0,
    customerCommunications: 0
  });
  const [caseTasks, setCaseTasks] = useState<CaseTask[]>([]);
  const [caseTimeline, setCaseTimeline] = useState<CaseTimeline[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setStats({
        assignedCases: 18,
        completedCases: 12,
        pendingCases: 6,
        documentsProcessed: 89,
        averageProcessingTime: 4.2,
        customerCommunications: 24
      });

      setCaseTasks([
        {
          id: 1,
          caseNumber: "CE-2024-001",
          customerName: "John Doe",
          caseType: "Vehicle Registration",
          priority: 'high',
          assignedDate: '2024-01-15T09:00:00Z',
          dueDate: '2024-01-18T17:00:00Z',
          status: 'in_progress',
          documentsCount: 5,
          lastActivity: '2024-01-15T14:30:00Z',
          nextAction: 'Send approval notification'
        },
        {
          id: 2,
          caseNumber: "CE-2024-002",
          customerName: "Jane Smith",
          caseType: "License Renewal",
          priority: 'medium',
          assignedDate: '2024-01-15T10:30:00Z',
          dueDate: '2024-01-19T17:00:00Z',
          status: 'waiting_customer',
          documentsCount: 3,
          lastActivity: '2024-01-15T11:45:00Z',
          nextAction: 'Wait for customer response'
        },
        {
          id: 3,
          caseNumber: "CE-2024-003",
          customerName: "Bob Johnson",
          caseType: "Permit Application",
          priority: 'low',
          assignedDate: '2024-01-14T14:20:00Z',
          dueDate: '2024-01-20T17:00:00Z',
          status: 'pending',
          documentsCount: 7,
          lastActivity: '2024-01-14T16:00:00Z',
          nextAction: 'Review documents'
        },
        {
          id: 4,
          caseNumber: "CE-2024-004",
          customerName: "Alice Brown",
          caseType: "Vehicle Inspection",
          priority: 'high',
          assignedDate: '2024-01-15T11:15:00Z',
          dueDate: '2024-01-17T12:00:00Z',
          status: 'completed',
          documentsCount: 4,
          lastActivity: '2024-01-15T16:20:00Z',
          nextAction: 'Case closed'
        }
      ]);

      setCaseTimeline([
        {
          id: 1,
          caseNumber: "CE-2024-001",
          action: "Case assigned to executor",
          timestamp: '2024-01-15T09:00:00Z',
          user: 'System',
          status: 'completed'
        },
        {
          id: 2,
          caseNumber: "CE-2024-001",
          action: "Documents reviewed",
          timestamp: '2024-01-15T10:30:00Z',
          user: 'Case Executor',
          status: 'completed',
          notes: 'All documents verified and approved'
        },
        {
          id: 3,
          caseNumber: "CE-2024-001",
          action: "Customer notification sent",
          timestamp: '2024-01-15T14:30:00Z',
          user: 'Case Executor',
          status: 'completed'
        },
        {
          id: 4,
          caseNumber: "CE-2024-001",
          action: "Send approval notification",
          timestamp: '2024-01-16T09:00:00Z',
          user: 'Case Executor',
          status: 'pending'
        }
      ]);

      setLoading(false);
    }, 1000);
  }, []);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'red';
      case 'medium': return 'orange';
      case 'low': return 'green';
      default: return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'green';
      case 'in_progress': return 'blue';
      case 'pending': return 'orange';
      case 'on_hold': return 'red';
      case 'waiting_customer': return 'purple';
      default: return 'default';
    }
  };

  const getTimelineColor = (status: string) => {
    switch (status) {
      case 'completed': return 'green';
      case 'pending': return 'orange';
      case 'in_progress': return 'blue';
      default: return 'gray';
    }
  };

  const handleStartCase = (caseId: number) => {
    setCaseTasks(prev => 
      prev.map(task => 
        task.id === caseId 
          ? { ...task, status: 'in_progress' as const }
          : task
      )
    );
  };

  const caseColumns = [
    {
      title: 'Case Number',
      dataIndex: 'caseNumber',
      key: 'caseNumber',
      width: 120,
    },
    {
      title: 'Customer',
      dataIndex: 'customerName',
      key: 'customerName',
      width: 120,
    },
    {
      title: 'Case Type',
      dataIndex: 'caseType',
      key: 'caseType',
      width: 150,
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      width: 100,
      render: (priority: string) => (
        <Tag color={getPriorityColor(priority)}>
          {priority.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {status.replace('_', ' ').toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Documents',
      dataIndex: 'documentsCount',
      key: 'documentsCount',
      width: 100,
      render: (count: number) => (
        <Space>
          <FileText size={16} />
          {count}
        </Space>
      ),
    },
    {
      title: 'Next Action',
      dataIndex: 'nextAction',
      key: 'nextAction',
      width: 150,
      ellipsis: true,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (_: any, record: CaseTask) => (
        <Space size="small">
          <Button
            icon={<Eye size={16} />}
            size="small"
          >
            View
          </Button>
          {record.status === 'pending' && (
            <Button
              type="primary"
              icon={<Edit size={16} />}
              size="small"
              onClick={() => handleStartCase(record.id)}
            >
              Start
          </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <Typography.Title level={2}>Case Executor Dashboard</Typography.Title>
        <Typography.Text type="secondary">
          Manage case execution and customer communications
        </Typography.Text>
      </div>

      {/* Key Metrics */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Assigned Cases"
              value={stats.assignedCases}
              prefix={<FileText size={20} />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Completed Cases"
              value={stats.completedCases}
              prefix={<CheckCircle size={20} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Pending Cases"
              value={stats.pendingCases}
              prefix={<Clock size={20} />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Communications"
              value={stats.customerCommunications}
              prefix={<MessageSquare size={20} />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Performance Indicators */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} md={12}>
          <Card title="Case Completion Rate">
            <Progress
              percent={(stats.completedCases / stats.assignedCases) * 100}
              strokeColor="#52c41a"
              format={(percent) => `${percent?.toFixed(1)}%`}
            />
            <div className="mt-2 text-sm text-gray-500">
              {stats.completedCases} of {stats.assignedCases} cases completed
            </div>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="Average Processing Time">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {stats.averageProcessingTime} days
              </div>
              <div className="text-sm text-gray-500">
                Average time to complete a case
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* Case Tasks */}
        <Col xs={24} lg={16}>
          <Card 
            title="Case Tasks" 
            className="h-full"
            extra={
              <Badge count={stats.pendingCases} showZero>
                <Button type="primary" size="small">
                  View All Cases
              </Button>
              </Badge>
            }
          >
            <Table
              dataSource={caseTasks}
              columns={caseColumns}
              rowKey="id"
              pagination={{ pageSize: 5 }}
              size="small"
            />
          </Card>
        </Col>

        {/* Case Timeline */}
        <Col xs={24} lg={8}>
          <Card title="Recent Case Activity" className="h-full">
            <Timeline
              items={caseTimeline.map(item => ({
                color: getTimelineColor(item.status),
                  children: (
                    <div>
                    <div className="font-medium text-sm">{item.action}</div>
                    <div className="text-xs text-gray-500">
                      {item.caseNumber} • {item.user}
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(item.timestamp).toLocaleString()}
                    </div>
                    {item.notes && (
                      <div className="text-xs text-gray-600 mt-1">
                        {item.notes}
                    </div>
                    )}
                    </div>
                )
              }))}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default CaseExecutorDashboard;