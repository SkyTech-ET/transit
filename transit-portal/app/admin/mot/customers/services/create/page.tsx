"use client";

import React, { useState, useEffect } from "react";
import { Card, Form, Input, Select, InputNumber, Button, message, Row, Col } from "antd";
import { Save, ArrowLeft } from "lucide-react";
import { useServiceStore, ServiceType, RiskLevel } from "@/modules/mot/service";
import { useUserStore } from "@/modules/user";
import { usePermissionStore } from "@/modules/utils/permission/permission.store";
import { useRouter } from "next/navigation";

const { Option } = Select;
const { TextArea } = Input;

const CustomerCreateServicePage = () => {
  const router = useRouter();
  const { createCustomerService, loading } = useServiceStore();
  const { currentUser } = usePermissionStore();
  const [form] = Form.useForm();

  const handleSubmit = async (values: any) => {
    try {
      // Remove customerId from the payload since the backend will automatically set it
      const serviceData = {
        serviceNumber: `SRV-${Date.now()}`, // Generate a unique service number
        itemDescription: values.itemDescription,
        routeCategory: values.routeCategory,
        declaredValue: values.declaredValue,
        taxCategory: values.taxCategory,
        countryOfOrigin: values.countryOfOrigin,
        serviceType: values.serviceType,
        riskLevel: values.riskLevel,
        customerId: currentUser?.id || 0, // Use current user as customer
        priority: values.priority,
        specialInstructions: values.specialInstructions
      };
      
      console.log('🔍 DEBUG: Customer creating service with data:', serviceData);
      
      await createCustomerService(serviceData);
      message.success("Service request created successfully");
      router.push("/admin/mot/customers/services");
    } catch (error) {
      console.error('🔍 DEBUG: Error creating service:', error);
      message.error("Failed to create service request");
    }
  };

  const handleCancel = () => {
    router.push("/admin/mot/customers/services");
  };

  return (
    <div className="p-6">
      <Card
        title={
          <div className="flex items-center gap-2">
            <ArrowLeft 
              className="cursor-pointer" 
              onClick={handleCancel}
            />
            <span>Create New Service Request</span>
          </div>
        }
      >
        <div className="mb-4 p-4 bg-blue-50 rounded-lg">
          <p className="text-blue-800">
            <strong>Customer:</strong> {currentUser?.firstName} {currentUser?.lastName} ({currentUser?.email})
          </p>
          <p className="text-sm text-blue-600 mt-1">
            This service will be automatically associated with your customer account.
          </p>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="max-w-4xl"
        >
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="serviceType"
                label="Service Type"
                rules={[{ required: true, message: "Please select service type" }]}
              >
                <Select placeholder="Select service type">
                  {Object.entries(ServiceType)
                    .filter(([_, value]) => typeof value === 'number')
                    .map(([key, value]) => (
                      <Option key={value} value={value}>
                        {key}
                      </Option>
                    ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="itemDescription"
                label="Item Description"
                rules={[{ required: true, message: "Please enter item description" }]}
              >
                <TextArea rows={3} placeholder="Enter detailed item description" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="routeCategory"
                label="Route Category"
                rules={[{ required: true, message: "Please enter route category" }]}
              >
                <Input placeholder="Enter route category" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="countryOfOrigin"
                label="Country of Origin"
                rules={[{ required: true, message: "Please enter country of origin" }]}
              >
                <Input placeholder="Enter country of origin" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="declaredValue"
                label="Declared Value"
                rules={[{ required: true, message: "Please enter declared value" }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="Enter declared value"
                  formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value!.replace(/\$\s?|(,*)/g, '')}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="taxCategory"
                label="Tax Category"
                rules={[{ required: true, message: "Please enter tax category" }]}
              >
                <Input placeholder="Enter tax category" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="riskLevel"
                label="Risk Level"
                rules={[{ required: true, message: "Please select risk level" }]}
              >
                <Select placeholder="Select risk level">
                  {Object.entries(RiskLevel)
                    .filter(([_, value]) => typeof value === 'number')
                    .map(([key, value]) => (
                      <Option key={value} value={value}>
                        {key}
                      </Option>
                    ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="priority"
                label="Priority"
                rules={[{ required: true, message: "Please select priority" }]}
              >
                <Select placeholder="Select priority">
                  <Option value="Low">Low</Option>
                  <Option value="Medium">Medium</Option>
                  <Option value="High">High</Option>
                  <Option value="Urgent">Urgent</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="specialInstructions"
                label="Special Instructions"
              >
                <TextArea rows={2} placeholder="Any special instructions or requirements" />
              </Form.Item>
            </Col>
          </Row>

          <div className="flex justify-end gap-2 mt-6">
            <Button onClick={handleCancel}>
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              icon={<Save />}
            >
              Create Service Request
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default CustomerCreateServicePage;
