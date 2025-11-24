import { create } from "zustand";
import { IDashboardResponse } from "./caseExecutor.types";
import { getDashboardData } from "./caseExecutor.endpoints";
import { message } from "antd";

interface DashboardState {
  dashboard: IDashboardResponse | null;
  loading: boolean;
  error: string | null;

  fetchDashboard: () => Promise<void>;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  dashboard: null,
  loading: false,
  error: null,

  fetchDashboard: async () => {
    set({ loading: true, error: null });

    try {
      const response: IDashboardResponse = await getDashboardData();
      set({ dashboard: response, loading: false });
    } catch (error: any) {
      set({ error: error.toString(), loading: false });
      message.error("Failed to load dashboard");
    }
  },
}));
