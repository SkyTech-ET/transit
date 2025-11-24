import http from "@/modules/utils/axios";

const dashboardEndpoints = Object.freeze({
  getDashboard: "/CaseExecutor/dashboard",
});

export const getDashboardData = () => {
  return http.get({
    url: dashboardEndpoints.getDashboard,
  });
};
