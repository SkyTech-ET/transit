"use client";

import React, { useEffect, useState } from "react";
import { Card, Row, Col, Statistic, Progress, Table, Tag, Button, Space, Typography, List, Avatar, Badge, Upload } from "antd";
import { 
  FileText, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Eye,
  Edit,
  Upload as UploadIcon,
  Download,
  Database,
  BarChart3
} from "lucide-react";

interface DataEncoderStats {
  documentsProcessed: number;
  dataEntriesCompleted: number;
  pendingDataEntries: number;
  accuracyRate: number;
  averageProcessingTime: number;
  filesUploaded: number;
}

interface DataEntryTask {
  id: number;
  taskNumber: string;
  customerName: string;
  dataType: string;
  priority: 'low' | 'medium' | 'high';
  assignedDate: string;
  dueDate: string;
  status: 'pending' | 'in_progress' | 'completed' | 'on_hold' | 'needs_review';
  documentsCount: number;
  dataFields: number;
  completionPercentage: number;
}

interface RecentDataEntry {
  id: number;
  taskNumber: string;
  customerName: string;
  dataType: string;
  completedDate: string;
  accuracy: number;
  status: 'completed' | 'needs_review' | 'approved';
}

const DataEncoderDashboard = () => {
  const [stats, setStats] = useState<DataEncoderStats>({
    documentsProcessed: 0,
    dataEntriesCompleted: 0,
    pendingDataEntries: 0,
    accuracyRate: 0,
    averageProcessingTime: 0,
    filesUploaded: 0
  });
  const [dataEntryTasks, setDataEntryTasks] = useState<DataEntryTask[]>([]);
  const [recentDataEntries, setRecentDataEntries] = useState<RecentDataEntry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setStats({
        documentsProcessed: 156,
        dataEntriesCompleted: 89,
        pendingDataEntries: 12,
        accuracyRate: 96.8,
        averageProcessingTime: 1.8,
        filesUploaded: 234
      });

      setDataEntryTasks([
        {
          id: 1,
          taskNumber: "DE-2024-001",
          customerName: "John Doe",
          dataType: "Vehicle Registration Data",
          priority: 'high',
          assignedDate: '2024-01-15T09:00:00Z',
          dueDate: '2024-01-16T17:00:00Z',
          status: 'in_progress',
          documentsCount: 5,
          dataFields: 25,
          completionPercentage: 75
        },
        {
          id: 2,
          taskNumber: "DE-2024-002",
          customerName: "Jane Smith",
          dataType: "License Information",
          priority: 'medium',
          assignedDate: '2024-01-15T10:30:00Z',
          dueDate: '2024-01-17T17:00:00Z',
          status: 'pending',
          documentsCount: 3,
          dataFields: 18,
          completionPercentage: 0
        },
        {
          id: 3,
          taskNumber: "DE-2024-003",
          customerName: "Bob Johnson",
          dataType: "Permit Application Data",
          priority: 'low',
          assignedDate: '2024-01-14T14:20:00Z',
          dueDate: '2024-01-18T17:00:00Z',
          status: 'needs_review',
          documentsCount: 7,
          dataFields: 32,
          completionPercentage: 100
        },
        {
          id: 4,
          taskNumber: "DE-2024-004",
          customerName: "Alice Brown",
          dataType: "Inspection Records",
          priority: 'high',
          assignedDate: '2024-01-15T11:15:00Z',
          dueDate: '2024-01-16T12:00:00Z',
          status: 'completed',
          documentsCount: 4,
          dataFields: 20,
          completionPercentage: 100
        }
      ]);

      setRecentDataEntries([
        {
          id: 1,
          taskNumber: "DE-2024-000",
          customerName: "Mike Wilson",
          dataType: "Vehicle Registration Data",
          completedDate: '2024-01-15T08:30:00Z',
          accuracy: 98.5,
          status: 'approved'
        },
        {
          id: 2,
          taskNumber: "DE-2024-001",
          customerName: "Sarah Davis",
          dataType: "License Information",
          completedDate: '2024-01-14T16:45:00Z',
          accuracy: 95.2,
          status: 'needs_review'
        },
        {
          id: 3,
          taskNumber: "DE-2024-002",
          customerName: "Tom Anderson",
          dataType: "Permit Application Data",
          completedDate: '2024-01-14T14:20:00Z',
          accuracy: 99.1,
          status: 'completed'
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
      case 'needs_review': return 'purple';
      default: return 'default';
    }
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 98) return 'green';
    if (accuracy >= 95) return 'orange';
    return 'red';
  };

  const handleStartDataEntry = (taskId: number) => {
    setDataEntryTasks(prev => 
      prev.map(task => 
        task.id === taskId 
          ? { ...task, status: 'in_progress' as const }
          : task
      )
    );
  };

  const taskColumns = [
    {
      title: 'Task Number',
      dataIndex: 'taskNumber',
      key: 'taskNumber',
      width: 120,
    },
    {
      title: 'Customer',
      dataIndex: 'customerName',
      key: 'customerName',
      width: 120,
    },
    {
      title: 'Data Type',
      dataIndex: 'dataType',
      key: 'dataType',
      width: 180,
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
      title: 'Progress',
      dataIndex: 'completionPercentage',
      key: 'completionPercentage',
      width: 120,
      render: (percentage: number) => (
        <Progress 
          percent={percentage} 
          size="small" 
          strokeColor={percentage === 100 ? '#52c41a' : '#1890ff'}
        />
      ),
    },
    {
      title: 'Data Fields',
      dataIndex: 'dataFields',
      key: 'dataFields',
      width: 100,
      render: (count: number) => (
        <Space>
          <Database size={16} />
          {count}
        </Space>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (_: any, record: DataEntryTask) => (
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
              onClick={() => handleStartDataEntry(record.id)}
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
        <Typography.Title level={2}>Data Encoder Dashboard</Typography.Title>
        <Typography.Text type="secondary">
          Manage data entry tasks and document processing
        </Typography.Text>
      </div>

      {/* Key Metrics */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Documents Processed"
              value={stats.documentsProcessed}
              prefix={<FileText size={20} />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Data Entries Completed"
              value={stats.dataEntriesCompleted}
              prefix={<CheckCircle size={20} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Pending Entries"
              value={stats.pendingDataEntries}
              prefix={<Clock size={20} />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Files Uploaded"
              value={stats.filesUploaded}
              prefix={<UploadIcon size={20} />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Performance Indicators */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} md={12}>
          <Card title="Data Entry Completion Rate">
            <Progress
              percent={(stats.dataEntriesCompleted / (stats.dataEntriesCompleted + stats.pendingDataEntries)) * 100}
              strokeColor="#52c41a"
              format={(percent) => `${percent?.toFixed(1)}%`}
            />
            <div className="mt-2 text-sm text-gray-500">
              {stats.dataEntriesCompleted} of {stats.dataEntriesCompleted + stats.pendingDataEntries} entries completed
            </div>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="Data Accuracy Rate">
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
                Average accuracy of data entries
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {/* Data Entry Tasks */}
        <Col xs={24} lg={16}>
          <Card 
            title="Data Entry Tasks" 
            className="h-full"
            extra={
              <Space>
                <Upload>
                  <Button icon={<UploadIcon size={16} />} size="small">
                    Upload
                  </Button>
                </Upload>
                <Badge count={stats.pendingDataEntries} showZero>
                  <Button type="primary" size="small">
                    View All Tasks
                  </Button>
                </Badge>
              </Space>
            }
          >
            <Table
              dataSource={dataEntryTasks}
              columns={taskColumns}
              rowKey="id"
              pagination={{ pageSize: 5 }}
              size="small"
            />
          </Card>
        </Col>

        {/* Recent Data Entries */}
        <Col xs={24} lg={8}>
          <Card title="Recent Data Entries" className="h-full">
            <List
              dataSource={recentDataEntries}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Avatar 
                        size="small" 
                        style={{ 
                          backgroundColor: getAccuracyColor(item.accuracy) === 'green' ? '#52c41a' : 
                                          getAccuracyColor(item.accuracy) === 'orange' ? '#faad14' : '#ff4d4f'
                        }}
                      >
                        {item.accuracy.toFixed(0)}%
                      </Avatar>
                    }
                    title={
                      <div className="flex justify-between items-start">
                        <span className="text-sm">{item.taskNumber}</span>
                        <Tag color={getStatusColor(item.status)}>
                          {item.status.replace('_', ' ')}
                        </Tag>
                      </div>
                    }
                    description={
                      <div className="text-xs text-gray-500">
                        <div>{item.customerName}</div>
                        <div>{item.dataType}</div>
                        <div>{new Date(item.completedDate).toLocaleString()}</div>
                        <div className="mt-1">
                          Accuracy: <span className="font-medium">{item.accuracy}%</span>
                        </div>
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

export default DataEncoderDashboard;