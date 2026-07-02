import api from "./axios";

export const reportApi = {
  individual: (params) => api.get("/admin/reports/individual", { params }),
  system: (params) => api.get("/admin/reports/system", { params }),

  export: async (params) => {
    const response = await api.get("/admin/reports/export", {
      params,
      responseType: "blob",
    });

    const contentDisposition = response.headers["content-disposition"];
    let filename = `report.${params.format === "excel" ? "xlsx" : params.format}`;
    if (contentDisposition) {
      const match = contentDisposition.match(/filename="?(.+)"?/);
      if (match?.[1]) filename = match[1].replace(/"/g, "");
    }

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};

export const gradeSettingApi = {
  list: () => api.get("/admin/grade-settings"),
  update: (grades) => api.patch("/admin/grade-settings", { grades }),
};