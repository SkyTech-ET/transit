import React from "react";
import { eventRoutes } from "@/modules/event/event.routes";
import { serviceRoutes } from "@/modules/service/service.routes";
import { bookingRoutes } from "@/modules/booking";
import { reportRoutes } from "@/modules/report";
import { userRoutes } from "@/modules/user/user.routes";
import { roleRoutes } from "@/modules/role/role.routes";
import permission from "@/modules/utils/permission/permission";
import { privilegeRoutes } from "@/modules/privilege/privilege.routes";
import { vendorRoutes } from "@/modules/vendor/vendor.routes";
import {Tag, Package,Repeat,Contact,Clipboard,Utensils,Menu, Image, Building2, Cog, PieChart, ShieldCheck, User, UserCog } from "lucide-react";
import { bannerRoutes } from "@/modules/banner/banner.routes";
import { packageRoutes } from "@/modules/package/package.routes";
import { subscriptionRoutes } from "@/modules/subscription";
import { vendorSubscriptionRoutes } from "@/modules/vendorSubscription";
import { contactRoutes } from "@/modules/contact";
import { subscriptionPackageRoutes } from "@/modules/subscriptionPackages";
import { tagRoutes } from "@/modules/tag";

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
    key: "7",
    label: "Orders",
    icon: <Utensils size={18} />,
    path: bookingRoutes.getall,
    permission: permission.booking.getAll
  },
  {
    key: "8",
    label: "Packages",
    icon: <Package size={18} />,
    path: packageRoutes.getall,
    permission: permission.package.getAll
  },
  {
    key: "9",
    label: "Menus",
    icon: <Menu size={18} />,
    path: serviceRoutes.getall,
    permission: permission.service.getAll
  },
  {
    key: "10",
    label: "Banners",
    icon: <Image size={18} />,
    path: bannerRoutes.getall,
    permission: permission.banner.getAll
  },
  {
    key: "12",
    label: "Subscriptions",
    icon: <Repeat size={18} />,
    path: vendorSubscriptionRoutes.getall,
    permission: permission.subscription.getAll
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
    label: "Vendors",
    icon: <Building2 size={18} />,
    path: vendorRoutes.getall,
    permission: permission.vendor.getAll,
  },
  
  {
    key: "3",
    label: "Events",
    icon: <Clipboard size={18} />,
    path: eventRoutes.getall,
    permission: permission.event.getAll
  },

  {
    key: "4",
    label: "Subscriptions",
    icon: <Repeat size={18} />,
    path: subscriptionRoutes.getall,
    permission: permission.subscription.getAll
  },
  {
    key: "11",
    label: "Contact Us",
    icon: <Contact size={18} />,
    path: contactRoutes.getall,
    permission: permission.contact.getAll
  },
   {
    key: "5",
    label: "Master Data",
    icon: <ShieldCheck size={18} />,
    path: "",
    items: [
   
      {
        key: "5.1",
        label: "Subscription Packages",
        icon: <Repeat size={18} />,
        path: subscriptionPackageRoutes.getall,
        permission: permission.subscription.getAll
      },
      {
        key: "5.2",
        label: "Tags",
        icon: <Tag size={18} />,
        path: tagRoutes.getall,
        permission: permission.tag.getAll
      },
    ],
  },
  {
    key: "6",
    label: "Access Management",
    icon: <ShieldCheck size={18} />,
    path: "",
    items: [
      {
        key: "6.1",
        label: "Users",
        icon: <User size={18} />,
        path: userRoutes.getall,
        permission: permission.user.getAll
      },
      {
        key: "6.2",
        label: "Roles",
        icon: <UserCog size={18} />,
        path: roleRoutes.getall,
        permission: permission.role.getAll
      },
      {
        key: "6.3",
        label: "Privileges",
        icon: <Cog size={18} />,
        path: privilegeRoutes.getall,
        permission: permission.privilege.getAll
      },
     
     
    ],
  },
 
]
