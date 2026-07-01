import api from "./axios";

export const attendanceApi = {
  mark: () => api.post("/attendance/mark"),
  today: () => api.get("/attendance/today"),
  history: (params) => api.get("/attendance/history", { params }),
};