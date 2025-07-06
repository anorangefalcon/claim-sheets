import axios from "axios";
import toast from "react-hot-toast";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }

    const message = error.response?.data?.message || "An error occurred";
    toast.error(message);

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post("/auth/login", credentials),
  register: (userData) => api.post("/auth/register", userData),
};

// Claim Sheets API
export const claimSheetsAPI = {
  getAll: () => api.get("/claim-sheets"),
  getById: (id) => api.get(`/claim-sheets/${id}`),
  create: (data) => api.post("/claim-sheets", data),
  update: (id, data) => api.put(`/claim-sheets/${id}`, data),
  delete: (id) => api.delete(`/claim-sheets/${id}`),
};

// Expenses API
export const expensesAPI = {
  getByClaimSheet: (claimSheetId) =>
    api.get(`/expenses/claim-sheet/${claimSheetId}`),
  getById: (id) => api.get(`/expenses/${id}`),
  create: (data) => api.post("/expenses", data),
  update: (id, data) => api.put(`/expenses/${id}`, data),
  delete: (id) => api.delete(`/expenses/${id}`),
  reorder: (claimSheetId, expenses) =>
    api.put(`/expenses/reorder/${claimSheetId}`, { expenses }),
};

// Bill Upload API
export const billUploadAPI = {
  uploadBills: (formData) =>
    api.post("/bill-upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),
};

export default api;
