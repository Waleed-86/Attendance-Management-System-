import api from "./axios";

export const adminUserApi = {
  list: (params) => api.get("/admin/users", { params }),
  create: (data) => api.post("/admin/users", data),
  show: (id) => api.get(`/admin/users/${id}`),
  update: (id, data) => api.patch(`/admin/users/${id}`, data),
  destroy: (id) => api.delete(`/admin/users/${id}`),
};