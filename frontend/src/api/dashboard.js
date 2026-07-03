import api from "./axios";

export const dashboardApi = {
  userStats: () => api.get("/dashboard/stats"),
  adminStats: () => api.get("/admin/dashboard/stats"),
};