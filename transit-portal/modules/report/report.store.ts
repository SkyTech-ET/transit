import { create } from "zustand";
import { getAllReportSort, getReportsByOrgSort, getAllReport, getReportsByOrg } from "./report.endpoints";
import { IReportPayload, IReportState, IReportStore } from "./report.types";
import { RecordStatus } from "../common/common.types";

const defaultInitState: IReportState = {
    error: null,
    dashboard: [],
    report: null,
    reportSort: [],
    listLoading: false,
    reportPerVendor: null,
    reportPerOrderSort: [],
    reportPerOrganization: [],
    reportPerOrganizationSort: [],
    reportSortOrder: []
};


export const useReportStore = create<IReportStore>((set) => ({
    ...defaultInitState,
    getAllReport: async (payload: IReportPayload) => {
        set({ listLoading: true, error: null });
        return new Promise((resolve, reject) => {
            getAllReport(payload)
                .then((res: any) => {

                    set({
                        report: {
                            orders: res.activeOrdersCount, packages: res.activePackagesCount,
                            subscriptions: res.activeSubscriptionsCount, users: res.activeUsersCount, organizations: res.activeVendorsCount
                        }, listLoading: false, error: null
                    });

                    set({
                        report: {
                            orders: res.activeOrdersCount, packages: res.activePackagesCount,
                            subscriptions: res.activeSubscriptionsCount, users: res.activeUsersCount, organizations: res.activeVendorsCount
                        }, listLoading: false, error: null
                    });
                    resolve(res)
                })
                .catch((err) => {
                    set({ listLoading: false, error: err.message || "Failed to fetch Reports." });
                    reject(err)
                });
        })
    },
    getReportsByOrg: async (orgId: number) => {
        set({ listLoading: true, error: null });
        return new Promise((resolve, reject) => {
            getReportsByOrg(orgId)
                .then(async (res: any) => {
                    if (!res.errors) {
                        set({ listLoading: false, error: null, reportPerVendor: { orders: res.count.activeOrdersCount, packages: res.count.activePackagesCount, menus: res.count.activeServicesCount, users: res.count.activeUsersCount } });
                    } else {
                        set({ listLoading: false, error: null });
                    }
                    resolve(res)
                })
                .catch((err) => {
                    set({ listLoading: false, error: err.message || "Failed to fetch Reports." });
                    reject(err)
                });
        })
    },
    getAllReportSort: async (payload: IReportPayload) => {
        set({ listLoading: true, error: null });
        return new Promise((resolve, reject) => {
            getAllReportSort(payload)
                .then((res: any) => {

                    set({ reportSort: res, reportPerOrganizationSort: res, listLoading: false, error: null });

                    // set({
                    //     report: {
                    //         orders: res.activeOrdersCount, packages: res.activePackagesCount,
                    //         subscriptions: res.activeSubscriptionsCount, users: res.activeUsersCount, organizations: res.activeVendorsCount
                    //     }, listLoading: false, error: null
                    // });
                    resolve(res)
                })
                .catch((err) => {
                    set({ listLoading: false, error: err.message || "Failed to fetch Reports." });
                    reject(err)
                });
        })
    },
    getReportsByOrgSort: async (orgId: number) => {
        set({ listLoading: true, error: null });
        return new Promise((resolve, reject) => {
            getReportsByOrgSort(orgId)
                .then(async (res: any) => {
                    if (!res.errors) {
                        set({ reportSortOrder: res, reportPerOrderSort: res, error: null, listLoading: false });
                    } else {
                        set({ listLoading: false, error: null });
                    }
                    resolve(res)
                })
                .catch((err) => {
                    set({ listLoading: false, error: err.message || "Failed to fetch Reports." });
                    reject(err)
                });
        })
    },
}));
