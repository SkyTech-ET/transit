import React from "react";
import { reportRoutes } from "@/modules/report";
import { userRoutes } from "@/modules/user/user.routes";
import { roleRoutes } from "@/modules/role/role.routes";
import permission from "@/modules/utils/permission/permission";
import { privilegeRoutes } from "@/modules/privilege/privilege.routes";
import {Tag, Package,Repeat,Contact,Clipboard,Utensils,Menu, Image, Building2, Cog, PieChart, ShieldCheck, User, UserCog, Truck, FileText, MessageSquare, Users, CheckCircle, AlertCircle } from "lucide-react";
import { contactRoutes } from "@/modules/contact";
import { serviceRoutes as motServiceRoutes } from "@/modules/mot/service/service.routes";
import { customerRoutes } from "@/modules/mot/customer/customer.routes";
import { documentRoutes } from "@/modules/mot/document/document.routes";
import { messagingRoutes } from "@/modules/mot/messaging/messaging.routes";
import { notificationRoutes } from "@/modules/mot/notification/notification.routes";

export interface MenuItem {
  key: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  items?: MenuItem[];
  permission?: string;
}

export const menuItems: MenuItem[] = [
  {
    key: "1",
    label: "Dashboard",
    icon: <PieChart size={18} />,
    path: reportRoutes.dashboard,
  },
  {
    key: "2",
    label: "My Services",
    icon: <Truck size={18} />,
    path: customerRoutes.services,
    permission: permission.motService.getAll
  },
  {
    key: "3",
    label: "My Documents",
    icon: <FileText size={18} />,
    path: documentRoutes.serviceDocuments,
    permission: permission.motDocument.getAll
  },
  {
    key: "4",
    label: "Messages",
    icon: <MessageSquare size={18} />,
    path: messagingRoutes.inbox,
    permission: permission.motMessage.getAll
  },
  {
    key: "5",
    label: "Notifications",
    icon: <MessageSquare size={18} />,
    path: notificationRoutes.notifications,
    permission: permission.motNotification.getAll
  },
];


export const adminMenus = [
  {
    key: "1",
    label: "Dashboard",
    icon: <PieChart size={18} />,
    path: reportRoutes.dashboard,
  },
  {
    key: "2",
    label: "Contact Us",
    icon: <Contact size={18} />,
    path: contactRoutes.getall,
    permission: permission.contact.getAll
  },
  {
    key: "3",
    label: "Access Management",
    icon: <ShieldCheck size={18} />,
    path: "",
    items: [
      {
        key: "3.1",
        label: "Users",
        icon: <User size={18} />,
        path: userRoutes.getall,
        permission: permission.user.getAll
      },
      {
        key: "3.2",
        label: "Roles",
        icon: <UserCog size={18} />,
        path: roleRoutes.getall,
        permission: permission.role.getAll
      },
      {
        key: "3.3",
        label: "Privileges",
        icon: <Cog size={18} />,
        path: privilegeRoutes.getall,
        permission: permission.privilege.getAll
      },
    ],
  },
  {
    key: "4",
    label: "MOT System",
    icon: <Truck size={18} />,
    path: "",
    items: [
      {
        key: "4.1",
        label: "Services",
        icon: <Truck size={18} />,
        path: motServiceRoutes.getAll,
        permission: permission.motService.getAll
      },
      {
        key: "4.2",
        label: "Customers",
        icon: <Users size={18} />,
        path: customerRoutes.getAll,
        permission: permission.motCustomer.getAll
      },
      {
        key: "4.3",
        label: "Documents",
        icon: <FileText size={18} />,
        path: documentRoutes.serviceDocuments,
        permission: permission.motDocument.getAll
      },
      {
        key: "4.4",
        label: "Messages",
        icon: <MessageSquare size={18} />,
        path: messagingRoutes.inbox,
        permission: permission.motMessage.getAll
      },
      {
        key: "4.5",
        label: "Pending Approvals",
        icon: <AlertCircle size={18} />,
        path: customerRoutes.pendingApprovals,
        permission: permission.motCustomer.approve
      },
      {
        key: "4.6",
        label: "Notifications",
        icon: <MessageSquare size={18} />,
        path: notificationRoutes.notifications,
        permission: permission.motNotification.getAll
      },
      {
        key: "4.7",
        label: "Reports",
        icon: <PieChart size={18} />,
        path: "/admin/mot/reports",
        permission: permission.motReport.getAll
      },
    ],
  },
]
