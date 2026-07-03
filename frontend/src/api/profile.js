import api from "./axios";

export const profileApi = {
  update: (formData) => {
    return api.post("/profile", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  changePassword: (data) => api.post("/profile/change-password", data),
};