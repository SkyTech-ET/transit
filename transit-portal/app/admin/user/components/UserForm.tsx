"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FormInstance } from 'antd/lib/form';
import { IUser } from '@/modules/user/user.types';
import { userRoutes } from '@/modules/user/user.routes';
import { useUserStore } from '@/modules/user/user.store';
import { useRoleStore } from '@/modules/role/role.store';
import { Button, Form, Input, Radio, Select } from "antd";
import { RecordStatus } from '@/modules/common/common.types';
import { useVendorStore } from '@/modules/vendor/vendor.store';
import { usePermissionStore } from '@/modules/utils/permission/permission.store';


interface UserFormProps {
    isEdit: boolean
    payload: IUser | null
}


const UserForm = (props: UserFormProps) => {
    const formRef = React.useRef<FormInstance>(null);
    const router = useRouter()
    const [form] = Form.useForm();

    const { roles, getRoles } = useRoleStore();
    const { vendors, getVendors} = useVendorStore();
    const { currentUser, isAdmin } = usePermissionStore()
    const { loading, updateUser, addUser, setAdditionalParams } = useUserStore();

    const handleSubmit = async () => {
        try {
            const values = await formRef.current?.validateFields();
            // if (!isAdmin) {
            //     setAdditionalParams({ orgId: currentUser?.organization.id, roles: [currentUser?.roles[0].id], userId: null })
            // }
            if (isAdmin) {
                setAdditionalParams({ orgId: currentUser?.organization.id, roles: [currentUser?.roles[0].id], userId: null })
            }
            if (props.isEdit) {
                const id = props.payload?.id as any;
                await updateUser(values, id).then((res) => {
                    routeTo()
                });
            }
             else {
                await addUser(values).then((res) => {
                    routeTo()
                });
            }
        } catch (errorInfo) {
            console.error('Failed:', errorInfo);
        }
    };
    const routeTo = () => {
        if (!isAdmin) {
            router.push(userRoutes.byOrg)
            setAdditionalParams({ orgId: null, roles: [], userId: null })
        } else {
            router.push(userRoutes.getall)
        }
    }
    useEffect(() => {
        if (roles.length === 0 && isAdmin) {
            getRoles(RecordStatus.Active);
        }
        if (vendors.length === 0) {
            getVendors(RecordStatus.Active); 
        }
    }, [isAdmin])

    useEffect(() => {
        if (props.payload && Object.keys(props.payload).length > 0) {
            form.setFieldsValue(props.payload!);
        }
        if (props.payload?.roles) {
            form.setFieldsValue({ role: props.payload.roles });
        }
    }, [props.payload!, form]);


    return (<>
        <Form
            form={form}
            ref={formRef}
            name="Add/Edit"
            autoComplete="off"
            onFinish={handleSubmit}
            labelCol={{ span: 24 }}
            requiredMark={true}
        >
               
                    {/* Organization Dropdown */}
                    <div className="flex flex-row space-x-4">
                        <Form.Item
                            name="organizationId"
                            label={<span className="font-semibold">Organization</span>}
                            rules={[{ required: true, message: "Please select your organization!" }]}
                            labelCol={{ span: 24 }}
                            className="md:w-1/3 w-full"
                        >
                            <Select placeholder="Select Organization">
                                {vendors.map((organization) => (
                                    <Select.Option key={organization.id} value={organization.id}>
                                        {organization.name}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </div>
            <div className="flex flex-col  w-full ">
                {/* Name */}
                <div className="flex flex-row space-x-4">
                    <Form.Item
                        name="firstName"
                        label={<span className="font-semibold">First Name</span>}
                        rules={[{ required: true, message: "Please input your company name!" }]}
                        labelCol={{ span: 24 }}
                        className='md:w-1/3 w-full'
                    >
                        <Input
                            placeholder="First Name"
                            style={{ padding: "10px", paddingLeft: "10px", marginTop: "1px" }}
                            variant="filled"
                        />
                    </Form.Item>

                    <Form.Item
                        name="lastName"
                        label={<span className="font-semibold">Last Name</span>}
                        rules={[{ required: true, message: "Please input your company name!" }]}
                        labelCol={{ span: 24 }}
                        className='md:w-1/3 w-full'
                    >
                        <Input
                            placeholder="Last Name"
                            style={{ padding: "10px", paddingLeft: "10px", marginTop: "1px" }}
                            variant="filled"
                        />
                    </Form.Item>
                </div>

                {/* Username and Email */}
                <div className="flex flex-row space-x-4">
                    <Form.Item
                        name="username"
                        label={<span className="font-semibold">Username</span>}
                        rules={[{ required: true, message: "Please input your username!" }]}
                        labelCol={{ span: 24 }}
                        className='md:w-1/3 w-full'
                    >
                        <Input
                            placeholder="Username"
                            style={{ padding: "10px", paddingLeft: "10px", marginTop: "1px" }}
                            variant="filled"
                        />
                    </Form.Item>

                    <Form.Item
                        name="email"
                        label={<span className="font-semibold">Email</span>}
                        rules={[{ required: true, message: "Please input your email!" }]}
                        labelCol={{ span: 24 }}
                        className='md:w-1/3 w-full'
                    >
                        <Input
                            placeholder="Email"
                            style={{ padding: "10px", paddingLeft: "10px", marginTop: "1px" }}
                            variant="filled"
                        />
                    </Form.Item>
                </div>

                {/* Password */}
                {!props.isEdit ?
                    <div className="flex flex-row space-x-4">
                        <Form.Item
                            name="password"
                            label={<span className="font-semibold">Password</span>}
                            rules={[
                                { required: true, message: "Please input your password!" },
                                { min: 8, message: 'Password must be at least 8 characters!' },
                            ]}
                            labelCol={{ span: 24 }}
                            className="md:md:w-1/3 w-full"
                        >
                            <Input.Password
                                placeholder="Password"
                                style={{ padding: "10px", paddingLeft: "10px" }}
                                variant="filled"
                            />
                        </Form.Item>
                        <Form.Item
                            name="confirmpassword"
                            label={<span className="font-semibold">Confirm Password</span>}
                            rules={[
                                {
                                    required: true,
                                    message: "Please confirm your password!",
                                },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (!value || getFieldValue("password") === value) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(
                                            new Error("The  password do not match!")
                                        );
                                    },
                                }),
                            ]}
                            labelCol={{ span: 24 }}
                            className="md:md:w-1/3 w-full"
                        >
                            <Input.Password
                                placeholder="Confirm Password"
                                style={{ padding: "10px", paddingLeft: "10px" }}
                                variant="filled"
                            />
                        </Form.Item>
                    </div> : null
                }
                    <div className='flex flex-row space-x-4'>
                {/* Role and Organization */}
                {
                    isAdmin &&
                        <Form.Item name="roles"
                            label={<span className="font-semibold">Role</span>}
                            rules={[{ required: true, message: "Please select role!" }]}
                            labelCol={{ span: 24 }}
                            className='md:w-1/3 w-full'>
                            <Select defaultValue={props.payload?.roles}>
                                {roles.map((role: any) => {
                                    return (<Select.Option value={role.id}
                                        placeholder="Role"
                                        style={{ padding: "10px", paddingLeft: "10px", marginTop: "1px" }}
                                        variant="filled"
                                    >{role.name}
                                    </Select.Option>)
                                })}
                            </Select>
                        </Form.Item>
                    }
                        <Form.Item
                        name="phoneNumber"
                        label={<span className="font-semibold">Phone Number</span>}
                        rules={[{ required: true, message: "Please input your Phone!" }]}
                        labelCol={{ span: 24 }}
                        className='md:w-1/3 w-full'
                    >
                        <Input
                            placeholder="Phone Number"
                            style={{ padding: "10px", paddingLeft: "10px", marginTop: "1px" }}
                            variant="filled"
                        />
                    </Form.Item>
                    </div>
              

                {/* Record Status */}
                <div>
                    <Form.Item name="recordStatus" label="Status"
                        rules={[{ required: true, message: "Please select record status!" }]}
                    >
                        <Radio.Group optionType="button" >
                            <Radio value={2}>Active</Radio>
                            <Radio value={1}>InActive</Radio>

                        </Radio.Group>
                    </Form.Item>
                </div>

                <div className='flex flex-row space-x-2 w-min'>
                    <Form.Item wrapperCol={{ span: 24 }}>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                            block
                            style={{ width: "100%", height: "2.4rem" }}
                        >
                            {props.payload != null ? 'Save change' : 'Create'}
                        </Button>
                    </Form.Item>
                    {/* <Form.Item wrapperCol={{ span: 24 }}>
                        <Button
                            htmlType="submit"
                            block
                            style={{ width: "100%", height: "2.4rem" }}
                        >
                            Create and create another
                        </Button>
                    </Form.Item> */}
                    <Form.Item wrapperCol={{ span: 24 }}>
                        <Button
                            block
                            style={{ width: "100%", height: "2.4rem" }}
                            onClick={() => { router.push(userRoutes.getall) }}
                        >
                            Cancel
                        </Button>
                    </Form.Item>
                </div>

            </div>
        </Form >
    </>);

}

export default UserForm;