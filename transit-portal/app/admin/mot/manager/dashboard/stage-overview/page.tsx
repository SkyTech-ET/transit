"use client";
import { useEffect } from "react";
import { Table, Tag, Avatar, Button, Card, Space } from "antd";
import { EyeOutlined, FilePdfOutlined } from "@ant-design/icons";
import { useServiceRequestsStore } from "@/modules/customers/stage-overview/serviceRequests.store";
import permission from "@/modules/utils/permission/permission";
import { usePermissionStore } from "@/modules/utils";
import { useServiceStore, ServiceStatus, ServiceType, RiskLevel } from "@/modules/mot/service";
import { useUserStore } from "@/modules/user";


const getStatusColor = (status: string) => {
  switch (status) {
    case "Pending":
      return "gold";
    case "Ongoing":
      return "blue";
    case "Completed":
      return "green";
    case "Blocked":
      return "red";
    default:
      return "default";
  }
};

const getTypeColor = (type: string) => (type === "Multimodal" ? "purple" : "cyan");

const getRoleColor = (role: string) => {
  switch (role) {
    case "Case Executer":
      return "purple";
    case "Assessor":
      return "blue";
    case "Data Encoder":
      return "yellow";
    default:
      return "gray";
  }
};

export default function ServiceRequestsPage() {
  /* const { requests, stages, getAllRequests, services, loading } = useServiceRequestsStore();


  useEffect(() => {
    getAllRequests();
  }, []); */

  //const router = useRouter();
  const { checkPermission, permissions } = usePermissionStore();
  const { 
    services, 
    loading, 
    getAllServices, 
    deleteService, 
    updateServiceStatus,
    assignService 
  } = useServiceStore();

  const { 
    users,
    getUsers,
  
  } = useUserStore();

  const serviceColumns = [
    { title: "Service ID", 
      dataIndex: "id", 
      key: "id" },
    { title: "Customer", dataIndex: "customer", key: "customer" },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      render: (type: string) => <Tag color={getTypeColor(type)}>{type}</Tag>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => <Tag color={getStatusColor(status)}>{status}</Tag>,
    },
    { title: "Requested On", dataIndex: "requestedOn", key: "requestedOn" },
    {
      title: "Executor",
      dataIndex: "assignedCaseExecutor",
      key: "assignedCaseExecutor",
      render: (executor: any) => (
        <Space>
          <Avatar src={executor.avatar} />
          {executor.name}
        </Space>
      ),
    },
    { title: "Updates", dataIndex: "updates", key: "updates" },
    {
      title: "Actions",
      key: "actions",
      render: () => (
        <Button type="link" icon={<EyeOutlined />} title="View Details" />
      ),
    },

    
  ];



  const stageColumns = [
    {
      title: "Staff Name",
      dataIndex: "firstName",
      render: (name: string) => (
        <Space>
          <Avatar>{name[0]}</Avatar> {name}
        </Space>
      ),
    },
    {
      title: "Role",
      dataIndex: "roles",
      render: (role: string) => (
        <Tag color={getRoleColor(role)} className="capitalize">
          {role}
        </Tag>
      ),
    },
    { title: "Stage", dataIndex: "stage" },
    { title: "Action", dataIndex: "action" },
    { title: "Time", dataIndex: "time" },
    {
      title: "Status",
      dataIndex: "status",
      render: (status: string) => (
        <Tag color={status === "Done" ? "green" : "orange"}>{status}</Tag>
      ),
    },
    {
      title: "Notes/File",
      dataIndex: "file",
      render: (file?: string) =>
        file ? (
          <Button type="link" icon={<FilePdfOutlined />} />
        ) : (
          <span className="text-gray-400">—</span>
        ),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* ALL SERVICE REQUESTS */}
      <Card title="All Service Requests" loading={loading}>
        <Table
          rowKey="id"
          columns={serviceColumns}
          dataSource={services}
          pagination={{
            total: services.length,
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
          }}
        />
      </Card>

      {/* STAGE OVERVIEW */}
      <Card title="Stage Overview" loading={loading}>
        <Table
          rowKey="id"
          columns={stageColumns}
          dataSource={users}
          pagination={{
            pageSize: 4,
            showSizeChanger: false,
          }}
        />
      </Card> 
    </div>
  );
}
