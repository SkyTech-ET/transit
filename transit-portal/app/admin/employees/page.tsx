"use client";
import { useEffect, useState } from "react";
import {
  Card,
  Table,
  Tag,
  Avatar,
  Button,
  Input,
  Space,
  Select,
  Pagination,
} from "antd";
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { useEmployeeStore } from "@/modules/employees";
import { IEmployee } from "@/modules/employees";
import { useRouter } from "next/navigation";

const EmployeeListPage = () => {
  const router = useRouter();
  const { employees, loading, getEmployees, deleteEmployee } =
    useEmployeeStore();
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("All");

  useEffect(() => {
    getEmployees();
  }, []);

  const handleDelete = async (id: number) => {
    await deleteEmployee(id);
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      render: (text: string, record: IEmployee) => (
        <div className="flex items-center gap-2">
          <Avatar src={record.avatarUrl} />
          <div>
            <p className="font-medium">{record.name}</p>
            <span className="text-xs text-gray-500">{record.employeeCode}</span>
          </div>
        </div>
      ),
    },
    { title: "Position", dataIndex: "position" },
    {
      title: "Department",
      dataIndex: "department",
      render: (d: string) => (
        <Tag color="blue" className="capitalize">
          {d}
        </Tag>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (status: string) => {
        const color =
          status === "Active"
            ? "green"
            : status === "On Leave"
            ? "gold"
            : "red";
        return <Tag color={color}>{status}</Tag>;
      },
    },
    { title: "Email", dataIndex: "email" },
    {
      title: "Actions",
      render: (_: any, record: IEmployee) => (
        <Space>
          <Button icon={<EyeOutlined />} />
          <Button icon={<EditOutlined />} />
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          />
        </Space>
      ),
    },
  ];

  return (
    <Card className="p-6">
      <div className="flex justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold">Employees</h2>
          <p className="text-gray-500 text-sm">
            Showing {employees.length} employees
          </p>
        </div>

        <Space>
          <Input
            placeholder="Search employees..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-64"
          />
          <Select
            defaultValue="All"
            style={{ width: 150 }}
            onChange={(v) => setDepartment(v)}
            options={[
              { value: "All", label: "All Departments" },
              { value: "HR", label: "HR" },
              { value: "Sales", label: "Sales" },
              { value: "IT", label: "IT" },
            ]}
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => router.push("/admin/user/create")}
          >
            Add Employee
          </Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={employees}
        loading={loading}
        rowKey="id"
        pagination={false}
      />

      <div className="flex justify-end mt-4">
        <Pagination current={1} total={24} pageSize={5} />
      </div>
    </Card>
  );
};

export default EmployeeListPage;
