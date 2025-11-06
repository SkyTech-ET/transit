"use client";

import React, { useEffect, useState } from "react";
import { Card, Table, Button, Space, Tag, Typography, Empty, Modal, Form, Input, Select, message, Badge } from "antd";
import { CheckCircle, XCircle, Eye, Clock, User, FileText, Calendar } from "lucide-react";
import { usePermissionStore } from "@/modules/utils";
import permission from "@/modules/utils/permission/permission";

const { TextArea } = Input;
const { Option } = Select;

interface PendingApproval {
  id: number;
  serviceNumber: string;
  customerName: string;
  serviceType: string;
  submittedDate: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected';
  documents: number;
  priority: 'low' | 'medium' | 'high';
  assignedTo?: string;
  notes?: string;
}

const PendingApprovalsPage = () => {
  const { checkPermission, permissions } = usePermissionStore();
  const [approvals, setApprovals] = useState<PendingApproval[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedApproval, setSelectedApproval] = useState<PendingApproval | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [form] = Form.useForm();

  // Mock data - replace with actual API call
  useEffect(() => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setApprovals([
        {
          id: 1,
          serviceNumber: "SR-2024-001",
          customerName: "John Doe",
          serviceType: "Vehicle Registration",
          submittedDate: '2024-01-15T10:30:00Z',
          status: 'pending',
          documents: 5,
          priority: 'high',
          assignedTo: 'Manager A',
          notes: 'Urgent processing required'
        },
        {
          id: 2,
          serviceNumber: "SR-2024-002",
          customerName: "Jane Smith",
          serviceType: "License Renewal",
          submittedDate: '2024-01-15T09:15:00Z',
          status: 'under_review',
          documents: 3,
          priority: 'medium',
          assignedTo: 'Assessor B',
          notes: 'Additional documents requested'
        },
        {
          id: 3,
          serviceNumber: "SR-2024-003",
          customerName: "Bob Johnson",
          serviceType: "Permit Application",
          submittedDate: '2024-01-14T16:45:00Z',
          status: 'pending',
          documents: 7,
          priority: 'low',
          assignedTo: 'Case Executor C',
          notes: 'Standard processing'
        },
        {
          id: 4,
          serviceNumber: "SR-2024-004",
          customerName: "Alice Brown",
          serviceType: "Vehicle Inspection",
          submittedDate: '2024-01-14T14:20:00Z',
          status: 'under_review',
          documents: 4,
          priority: 'high',
          assignedTo: 'Data Encoder D',
          notes: 'Inspection scheduled'
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const handleViewDetails = (approval: PendingApproval) => {
    setSelectedApproval(approval);
    setModalVisible(true);
  };

  const handleAction = (approval: PendingApproval, type: 'approve' | 'reject') => {
    setSelectedApproval(approval);
    setActionType(type);
    setActionModalVisible(true);
    form.resetFields();
  };

  const handleSubmitAction = async (values: any) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setApprovals(prev => 
        prev.map(approval => 
          approval.id === selectedApproval?.id 
            ? { 
                ...approval, 
                status: actionType === 'approve' ? 'approved' : 'rejected',
                notes: values.notes || approval.notes
              }
            : approval
        )
      );

      message.success(`Service ${actionType === 'approve' ? 'approved' : 'rejected'} successfully`);
      setActionModalVisible(false);
      setModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error('Failed to process approval');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'orange';
      case 'under_review': return 'blue';
      case 'approved': return 'green';
      case 'rejected': return 'red';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'red';
      case 'medium': return 'orange';
      case 'low': return 'green';
      default: return 'default';
    }
  };

  const pendingCount = approvals.filter(a => a.status === 'pending').length;
  const underReviewCount = approvals.filter(a => a.status === 'under_review').length;

  const columns = [
    {
      title: "Service Number",
      dataIndex: "serviceNumber",
      key: "serviceNumber",
      width: 120,
    },
    {
      title: "Customer",
      dataIndex: "customerName",
      key: "customerName",
      width: 120,
    },
    {
      title: "Service Type",
      dataIndex: "serviceType",
      key: "serviceType",
      width: 150,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status: string) => (
        <Tag color={getStatusColor(status)}>
          {status.replace('_', ' ').toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Priority",
      dataIndex: "priority",
      key: "priority",
      width: 100,
      render: (priority: string) => (
        <Tag color={getPriorityColor(priority)}>
          {priority.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Documents",
      dataIndex: "documents",
      key: "documents",
      width: 100,
      render: (count: number) => (
        <Space>
          <FileText size={16} />
          {count}
        </Space>
      ),
    },
    {
      title: "Assigned To",
      dataIndex: "assignedTo",
      key: "assignedTo",
      width: 120,
    },
    {
      title: "Submitted Date",
      dataIndex: "submittedDate",
      key: "submittedDate",
      width: 120,
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Actions",
      key: "actions",
      width: 200,
      render: (_: any, record: PendingApproval) => (
        <Space size="middle">
          <Button
            icon={<Eye size={16} />}
            onClick={() => handleViewDetails(record)}
          >
            View
          </Button>
          {record.status === 'pending' && checkPermission(permissions, permission.motCustomer.approve) && (
            <>
              <Button
                type="primary"
                icon={<CheckCircle size={16} />}
                onClick={() => handleAction(record, 'approve')}
              >
                Approve
              </Button>
              <Button
                danger
                icon={<XCircle size={16} />}
                onClick={() => handleAction(record, 'reject')}
              >
                Reject
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Clock size={24} className="text-orange-600" />
        <Typography.Title level={2} className="mb-0">
          Pending Approvals
          <Badge count={pendingCount + underReviewCount} style={{ marginLeft: 8 }} />
        </Typography.Title>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-orange-600">{pendingCount}</p>
            </div>
            <Clock className="text-orange-600" size={24} />
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600">Under Review</p>
              <p className="text-2xl font-bold text-blue-600">{underReviewCount}</p>
            </div>
            <User className="text-blue-600" size={24} />
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-600">{approvals.length}</p>
            </div>
            <FileText className="text-gray-600" size={24} />
          </div>
        </Card>
      </div>

      <Card bordered>
        <Table
          dataSource={approvals}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="No pending approvals found"
              />
            ),
          }}
        />
      </Card>

      {/* Details Modal */}
      <Modal
        title="Approval Details"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setModalVisible(false)}>
            Close
          </Button>,
        ]}
        width={800}
      >
        {selectedApproval && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <strong>Service Number:</strong> {selectedApproval.serviceNumber}
              </div>
              <div>
                <strong>Customer:</strong> {selectedApproval.customerName}
              </div>
              <div>
                <strong>Service Type:</strong> {selectedApproval.serviceType}
              </div>
              <div>
                <strong>Status:</strong> 
                <Tag color={getStatusColor(selectedApproval.status)} className="ml-2">
                  {selectedApproval.status.replace('_', ' ').toUpperCase()}
                </Tag>
              </div>
              <div>
                <strong>Priority:</strong> 
                <Tag color={getPriorityColor(selectedApproval.priority)} className="ml-2">
                  {selectedApproval.priority.toUpperCase()}
                </Tag>
              </div>
              <div>
                <strong>Documents:</strong> {selectedApproval.documents}
              </div>
              <div>
                <strong>Assigned To:</strong> {selectedApproval.assignedTo}
              </div>
              <div>
                <strong>Submitted Date:</strong> {new Date(selectedApproval.submittedDate).toLocaleString()}
              </div>
            </div>
            {selectedApproval.notes && (
              <div>
                <strong>Notes:</strong>
                <div className="mt-2 p-3 bg-gray-50 rounded">
                  {selectedApproval.notes}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Action Modal */}
      <Modal
        title={`${actionType === 'approve' ? 'Approve' : 'Reject'} Service Request`}
        open={actionModalVisible}
        onCancel={() => setActionModalVisible(false)}
        footer={null}
        width={500}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmitAction}
        >
          <Form.Item
            label="Notes"
            name="notes"
            rules={[{ required: actionType === 'reject', message: 'Please provide a reason for rejection' }]}
          >
            <TextArea
              rows={4}
              placeholder={actionType === 'approve' ? 'Optional approval notes...' : 'Please provide reason for rejection...'}
            />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {actionType === 'approve' ? 'Approve' : 'Reject'}
              </Button>
              <Button onClick={() => setActionModalVisible(false)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PendingApprovalsPage;







