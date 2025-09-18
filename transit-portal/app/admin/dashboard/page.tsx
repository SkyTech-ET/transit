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
      <div className="flex flex-col gap-4 rounded-m py-3">
        <DashboardPageHeader isAdmin={isAdmin} defaultValue={filterPayload} />

        <div className="flex md:flex-row md:px-6 flex-col gap-6">
          {isAdmin && <ReportCardItem title="Vendors" value={report?.organizations ?? 0} prefix={<ShopOutlined />} bgColor="orange" />}
          {isAdmin && <ReportCardItem title="Orders" value={report?.orders ?? 0} prefix={<SolutionOutlined />} bgColor="green" />}
          {isAdmin && <ReportCardItem title="Packages" value={report?.packages ?? 0} prefix={<GiftOutlined />} bgColor="blue" />}
          {isAdmin && <ReportCardItem title="Active Subscriptions" value={report?.subscriptions ?? 0} prefix={<ReconciliationOutlined />} bgColor="green" />}
          {isAdmin && <ReportCardItem title="Users" value={report?.users ?? 0} prefix={<Users />} bgColor="green" />}
          {!isAdmin &&<ReportCardItem title="Orders" value={reportPerVendor?.orders ?? 0} prefix={<SolutionOutlined />} bgColor="orange" />}
          {!isAdmin &&<ReportCardItem title="Packages" value={reportPerVendor?.packages ?? 0} prefix={<GiftOutlined />} bgColor="green" />}
          {!isAdmin && <ReportCardItem title="Menus" value={reportPerVendor?.menus ?? 0} prefix={<TableOutlined />} bgColor="blue" />}
          {!isAdmin &&<ReportCardItem title="Users" value={report?.users ?? 0} prefix={<Users />} bgColor="green" />}
        </div>

        {
          isAdmin && <div className="px-6 py-4"><ReportPerOrganizationTable reports={reportPerOrganizationSort} loading={listLoading}
            canView={checkPermission(permissions, permission.dashboard.getAllSort)} /></div>
        } 


        {
    !isAdmin && (
        <div>
            <div className="p-6">
                <h1 className="text-lg font-bold">Recent Orders Summary</h1>
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
