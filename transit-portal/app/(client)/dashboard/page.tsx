"use client";

import { useEffect, useState } from "react";



import { Card, Table, Tag, Avatar, Button, Row, Col, Statistic } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import { Truck, Users, FileText, CheckCircle } from "lucide-react";
import { useParams } from "next/navigation"; // optional for route param
import { useCustomerStore } from "@/modules/mot/customer";
import { useServiceStore, ServiceStatus } from "@/modules/mot/service";
import { useDocumentStore } from "@/modules/mot/document";

export default function ClientDashboard() {
  const { getCustomerById, currentCustomer } = useCustomerStore();
  const { getServiceById, services, loading } = useServiceStore();
  const { documents } = useDocumentStore();

  const { id: routeId } = useParams(); // e.g. /customer/dashboard/3
  const [dashboardData, setDashboardData] = useState({
    totalServices: 0,
    pendingServices: 0,
    inProgressServices: 0,
    completedServices: 0,
    totalDocuments: 0,
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Determine customer ID (can come from auth, route, or be static)
      const customerId = routeId ? Number(routeId) : 1; // default for testing

      await Promise.all([
        getCustomerById(customerId),
        getServiceById(customerId), // assuming services belong to this customer
      ]);

      // Compute metrics once data fetched
      const pending = services.filter(s => s.status === ServiceStatus.Pending).length;
      const inProgress = services.filter(s => s.status === ServiceStatus.InProgress).length;
      const completed = services.filter(s => s.status === ServiceStatus.Completed).length;

      setDashboardData({
        totalServices: services.length,
        pendingServices: pending,
        inProgressServices: inProgress,
        completedServices: completed,
        totalDocuments: documents.length,
      });
    } catch (err) {
      console.error("Error loading dashboard:", err);
    }
  };

  // Service Table Columns
  const columns = [
    { title: "Service ID", dataIndex: "id" },
    { title: "Type", dataIndex: "type" },
    {
      title: "Status",
      dataIndex: "status",
      render: (status: string) => (
        <Tag color={status === "In Progress" ? "orange" : "green"}>{status}</Tag>
      ),
    },
    {
      title: "Case Executor",
      dataIndex: "executor",
      render: (name: string) => <Avatar>{name[0]}</Avatar>,
    },
    { title: "Last Updated", dataIndex: "updatedAt" },
    {
      title: "Actions",
      render: () => <Button type="link">View Details</Button>,
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card loading={loading} title="Ongoing Services">{/* <CheckCircle /> */}{dashboardData.inProgressServices}</Card>
        <Card loading={loading}  title="Pending Approval" >{dashboardData.pendingServices}</Card>
        <Card loading={loading} title="Completed">{dashboardData.completedServices}</Card>
        <Card loading={loading} title="Total Services">{dashboardData.totalServices}</Card>
      </div>

      {/* Customer Info */}
      {currentCustomer && (
        <Card title="Customer Information" className="mt-4">
          <p><b>Business Name:</b> {currentCustomer.businessName}</p>
          <p><b>Contact Person:</b> {currentCustomer.contactPerson}</p>
          <p><b>Email:</b> {currentCustomer.contactEmail}</p>
          <p><b>Phone:</b> {currentCustomer.contactPhone}</p>
        </Card>
      )}

      {/* Services Table */}
      <Card title="Recent Service Requests">
        <Table
          rowKey="id"
          columns={columns}
          dataSource={services}
          loading={loading}
          pagination={false}
        />
      </Card>

      {/* Documents */}
      <Card title="Recent Documents">
        {documents.length > 0 ? (
          documents.map((d, i) => (
            <div key={i} className="flex justify-between items-center py-2 border-b">
              <span>{d.fileName}</span>
              <Button type="link" icon={<DownloadOutlined />}>
                {Math.round(d.fileSize / 1024)} KB
              </Button>
            </div>
          ))
        ) : (
          <p>No documents uploaded yet.</p>
        )}
      </Card>
    </div>
  );
}
