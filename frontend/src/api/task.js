import api from "./axios";

export const taskApi = {
  myTasks: (params) => api.get("/tasks", { params }),
  show: (id) => api.get(`/tasks/${id}`),
  start: (id) => api.post(`/tasks/${id}/start`),
  submit: (id, data) => api.post(`/tasks/${id}/submit`, data),
};

export const adminTaskApi = {
  list: (params) => api.get("/admin/tasks", { params }),
  create: (data) => api.post("/admin/tasks", data),
  review: (id, data) => api.patch(`/admin/tasks/${id}/review`, data),
  assignableUsers: () => api.get("/admin/tasks/assignable-users"),
};