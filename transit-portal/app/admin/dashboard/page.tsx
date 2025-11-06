"use client";

import { useEffect } from "react";
import { useReportStore } from "@/modules/report";
import ReportCardItem from "./components/ReportCardItem";
import permission from "@/modules/utils/permission/permission";
import DashboardPageHeader from "./components/DashboardPageHeader";
import { CalendarCheck, Package, CreditCard, Building, File, Folders, Users } from 'lucide-react';
import ReportPerOrganizationTable from "./components/ReportPerOrganizationTable";
import ReportPerOrderTable from "./components/ReportPerOrderTable";
import { formatAmount, getDefaultFilter, usePermissionStore } from "@/modules/utils";
import React, { useState } from "react";
import { RecordStatus } from "@/modules/common/common.types";
import { ShopOutlined, ShoppingCartOutlined,GiftOutlined,TableOutlined, BoxPlotOutlined,OrderedListOutlined,SolutionOutlined, MenuOutlined, ReconciliationOutlined, UnorderedListOutlined } from '@ant-design/icons';
import RoleBasedDashboard from "./components/RoleBasedDashboard";

const DashboardPage = () => {
  const { isAdmin, currentUser, checkPermission, permissions } = usePermissionStore()
  const { listLoading, report, reportPerVendor, dashboard,reportPerOrderSort, reportPerOrganizationSort,reportPerOrganization, getAllReportSort, getReportsByOrgSort,getAllReport, getReportsByOrg } = useReportStore()
  const [orgIdSort, setOrgId] = useState<any>()
  const [status, setStatus] = useState<RecordStatus>(RecordStatus.Active);
  const filterPayload = getDefaultFilter()


  useEffect(() => {
    if (isAdmin) {
      getAllReport(filterPayload);
      getAllReportSort(filterPayload);
    } else if (currentUser?.organization?.id != null) {
      const orgId = currentUser.organization.id;
      setOrgId(orgId);
      getReportsByOrg(orgId);
      getReportsByOrgSort(orgId);
    }
  }, [isAdmin, currentUser]);
  

  return (
    <>
      <RoleBasedDashboard />
      <div className="flex flex-col gap-4 rounded-m py-3">
        <DashboardPageHeader isAdmin={isAdmin} defaultValue={filterPayload} />

        <div className="flex md:flex-row md:px-6 flex-col gap-6">
          {isAdmin && <ReportCardItem title="Total Services" value={report?.services ?? 0} prefix={<SolutionOutlined />} bgColor="blue" />}
          {isAdmin && <ReportCardItem title="Active Customers" value={report?.customers ?? 0} prefix={<Users />} bgColor="green" />}
          {isAdmin && <ReportCardItem title="Pending Approvals" value={report?.pendingApprovals ?? 0} prefix={<CalendarCheck />} bgColor="orange" />}
          {isAdmin && <ReportCardItem title="Total Documents" value={report?.documents ?? 0} prefix={<File />} bgColor="purple" />}
          {isAdmin && <ReportCardItem title="System Users" value={report?.users ?? 0} prefix={<Users />} bgColor="green" />}
          {!isAdmin && <ReportCardItem title="My Services" value={reportPerVendor?.services ?? 0} prefix={<SolutionOutlined />} bgColor="blue" />}
          {!isAdmin && <ReportCardItem title="My Documents" value={reportPerVendor?.documents ?? 0} prefix={<File />} bgColor="purple" />}
          {!isAdmin && <ReportCardItem title="My Customers" value={reportPerVendor?.customers ?? 0} prefix={<Users />} bgColor="green" />}
          {!isAdmin && <ReportCardItem title="Notifications" value={report?.notifications ?? 0} prefix={<CalendarCheck />} bgColor="orange" />}
        </div>

        {
          isAdmin && <div className="px-6 py-4"><ReportPerOrganizationTable reports={reportPerOrganizationSort} loading={listLoading}
            canView={checkPermission(permissions, permission.dashboard.getAllSort)} /></div>
        } 


        {
    !isAdmin && (
        <div>
            <div className="p-6">
                <h1 className="text-lg font-bold">Recent Services Summary</h1>
            </div>
            <ReportPerOrderTable
                loading={listLoading}
                reports={reportPerOrderSort}
                canView={true}
            />
        </div>
    )
}
      </div>
    </>
  );
};

export default DashboardPage;
