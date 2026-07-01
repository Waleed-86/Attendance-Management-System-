import api from "./axios";

export const leaveApi = {
  submit: (data) => api.post("/leave", data),
  myLeaves: (params) => api.get("/leave/my", { params }),
};

export const adminLeaveApi = {
  list: (params) => api.get("/admin/leave", { params }),
  review: (id, data) => api.patch(`/admin/leave/${id}/review`, data),
};