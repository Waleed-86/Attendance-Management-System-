import api from "./axios";

export const attendanceApi = {
  mark: () => api.post("/attendance/mark"),
  today: () => api.get("/attendance/today"),
  history: (params) => api.get("/attendance/history", { params }),
};

export const adminAttendanceApi = {
  list: (params) => api.get("/admin/attendance", { params }),
  users: () => api.get("/admin/attendance/users"),
  create: (data) => api.post("/admin/attendance", data),
  update: (id, data) => api.patch(`/admin/attendance/${id}`, data),
  destroy: (id) => api.delete(`/admin/attendance/${id}`),
};