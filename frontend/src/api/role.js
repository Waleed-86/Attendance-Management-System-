import api from "./axios";

export const roleApi = {
  list: () => api.get("/admin/roles"),
  create: (data) => api.post("/admin/roles", data),
  update: (id, data) => api.patch(`/admin/roles/${id}`, data),
  destroy: (id) => api.delete(`/admin/roles/${id}`),
  assignToUser: (userId, roleSlug) =>
    api.patch(`/admin/roles/users/${userId}/assign`, { role_slug: roleSlug }),
};