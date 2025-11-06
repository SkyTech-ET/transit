"use client";

import React, { useEffect, useState } from "react";
import { Card, Row, Col, Statistic, Progress, Table, Tag, Button, Space, Typography, List, Avatar, Badge } from "antd";
import { 
  FileText, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Eye,
  Edit,
  Calendar,
  User,
  Building
} from "lucide-react";

interface AssessorStats {
  assignedServices: number;
  completedAssessments: number;
  pendingAssessments: number;
  documentsReviewed: number;
  averageAssessmentTime: number;
  accuracyRate: number;
}

interface AssessmentTask {
  id: number;
  serviceNumber: string;
  customerName: string;
  serviceType: string;
  priority: 'low' | 'medium' | 'high';
  assignedDate: string;
  dueDate: string;
  status: 'pending' | 'in_progress' | 'completed' | 'on_hold';
  documentsCount: number;
  estimatedTime: number;
}

interface RecentAssessment {
  id: number;
  serviceNumber: string;
  customerName: string;
  assessmentResult: 'approved' | 'rejected' | 'needs_revision';
  completedDate: string;
  notes: string;
}

const AssessorDashboard = () => {
  const [stats, setStats] = useState<AssessorStats>({
    assignedServices: 0,
    completedAssessments: 0,
    pendingAssessments: 0,
    documentsReviewed: 0,
    averageAssessmentTime: 0,
    accuracyRate: 0
  });
  const [assessmentTasks, setAssessmentTasks] = useState<AssessmentTask[]>([]);
  const [recentAssessments, setRecentAssessments] = useState<RecentAssessment[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setStats({
        assignedServices: 25,
        completedAssessments: 18,
        pendingAssessments: 7,
        documentsReviewed: 156,
        averageAssessmentTime: 2.5,
        accuracyRate: 94.5
      });

      setAssessmentTasks([
        {
          id: 1,
          serviceNumber: "SR-2024-001",
          customerName: "John Doe",
          serviceType: "Vehicle Registration",
          priority: 'high',
          assignedDate: '2024-01-15T09:00:00Z',
          dueDate: '2024-01-16T17:00:00Z',
          status: 'in_progress',
          documentsCount: 5,
          estimatedTime: 2
        },
        {
          id: 2,
          serviceNumber: "SR-2024-002",
          customerName: "Jane Smith",
          serviceType: "License Renewal",
          priority: 'medium',
          assignedDate: '2024-01-15T10:30:00Z',
          dueDate: '2024-01-17T17:00:00Z',
          status: 'pending',
          documentsCount: 3,
          estimatedTime: 1.5
        },
        {
          id: 3,
          serviceNumber: "SR-2024-003",
          customerName: "Bob Johnson",
          serviceType: "Permit Application",
          priority: 'low',
          assignedDate: '2024-01-14T14:20:00Z',
          dueDate: '2024-01-18T17:00:00Z',
          status: 'on_hold',
          documentsCount: 7,
          estimatedTime: 3
        },
        {
          id: 4,
          serviceNumber: "SR-2024-004",
          customerName: "Alice Brown",
          serviceType: "Vehicle Inspection",
          priority: 'high',
          assignedDate: '2024-01-15T11:15:00Z',
          dueDate: '2024-01-16T12:00:00Z',
          status: 'pending',
          documentsCount: 4,
          estimatedTime: 2.5
        }
      ]);

      setRecentAssessments([
        {
          id: 1,
          serviceNumber: "SR-2024-000",
          customerName: "Mike Wilson",
          assessmentResult: 'approved',
          completedDate: '2024-01-15T08:30:00Z',
          notes: 'All documents verified and requirements met'
        },
        {
          id: 2,
          serviceNumber: "SR-2024-001",
          customerName: "Sarah Davis",
          assessmentResult: 'needs_revision',
          completedDate: '2024-01-14T16:45:00Z',
          notes: 'Missing insurance certificate, please resubmit'
        },
        {
          id: 3,
          serviceNumber: "SR-2024-002",
          customerName: "Tom Anderson",
          assessmentResult: 'rejected',
          completedDate: '2024-01-14T14:20:00Z',
          notes: 'Vehicle does not meet safety requirements'
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
      default: return 'default';
    }
  };

  const getResultColor = (result: string) => {
    switch (result) {
      case 'approved': return 'green';
      case 'needs_revision': return 'orange';
      case 'rejected': return 'red';
      default: return 'default';
    }
  };

  const handleStartAssessment = (taskId: number) => {
    // Simulate starting assessment
    setAssessmentTasks(prev => 
      prev.map(task => 
        task.id === taskId 
          ? { ...task, status: 'in_progress' as const }
          : task
      )
    );
  };

  const taskColumns = [
    {
      title: 'Service Number',
      dataIndex: 'serviceNumber',
      key: 'serviceNumber',
      width: 120,
    },
    {
      title: 'Customer',
      dataIndex: 'customerName',
      key: 'customerName',
      width: 120,
    },
    {
      title: 'Service Type',
      dataIndex: 'serviceType',
      key: 'serviceType',
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
      width: 120,
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
      title: 'Due Date',
      dataIndex: 'dueDate',
      key: 'dueDate',
      width: 120,
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (_: any, record: AssessmentTask) => (
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
              onClick={() => handleStartAssessment(record.id)}
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
        <Typography.Title level={2}>Assessor Dashboard</Typography.Title>
        <Typography.Text type="secondary">
          Manage your assessment tasks and track performance
        </Typography.Text>
      </div>

      {/* Key Metrics */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Assigned Services"
              value={stats.assignedServices}
              prefix={<FileText size={20} />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Completed Assessments"
              value={stats.completedAssessments}
              prefix={<CheckCircle size={20} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Pending Assessments"
              value={stats.pendingAssessments}
              prefix={<Clock size={20} />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Documents Reviewed"
              value={stats.documentsReviewed}
              prefix={<FileText size={20} />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Performance Indicators */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} md={12}>
          <Card title="Assessment Completion Rate">
            <Progress
              percent={(stats.completedAssessments / stats.assignedServices) * 100}
              strokeColor="#52c41a"
              format={(percent) => `${percent?.toFixed(1)}%`}
            />
            <div className="mt-2 text-sm text-gray-500">
              {stats.completedAssessments} of {stats.assignedServices} assessments completed
            </div>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="Accuracy Rate">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {stats.accuracyRate}%
              </div>
              <Progress
                percent={stats.accuracyRate}
                strokeColor="#52c41a"
                showInfo={false}
              />
              <div className="mt-2 text-sm text-gray-500">
                Assessment accuracy based on quality reviews
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* Assessment Tasks */}
        <Col xs={24} lg={16}>
          <Card 
            title="Assessment Tasks" 
            className="h-full"
            extra={
              <Badge count={stats.pendingAssessments} showZero>
                <Button type="primary" size="small">
                  View All Tasks
                </Button>
              </Badge>
            }
          >
            <Table
              dataSource={assessmentTasks}
              columns={taskColumns}
              rowKey="id"
              pagination={{ pageSize: 5 }}
              size="small"
            />
          </Card>
        </Col>

        {/* Recent Assessments */}
        <Col xs={24} lg={8}>
          <Card title="Recent Assessments" className="h-full">
            <List
              dataSource={recentAssessments}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Avatar 
                        size="small" 
                        style={{ 
                          backgroundColor: getResultColor(item.assessmentResult) === 'green' ? '#52c41a' : 
                                          getResultColor(item.assessmentResult) === 'orange' ? '#faad14' : '#ff4d4f'
                        }}
                      >
                        {item.assessmentResult.charAt(0).toUpperCase()}
                      </Avatar>
                    }
                    title={
                      <div className="flex justify-between items-start">
                        <span className="text-sm">{item.serviceNumber}</span>
                        <Tag color={getResultColor(item.assessmentResult)}>
                          {item.assessmentResult.replace('_', ' ')}
                        </Tag>
                      </div>
                    }
                    description={
                      <div className="text-xs text-gray-500">
                        <div>{item.customerName}</div>
                        <div>{new Date(item.completedDate).toLocaleString()}</div>
                        <div className="mt-1">{item.notes}</div>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AssessorDashboard;