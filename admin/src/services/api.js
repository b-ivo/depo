import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/api`;

const api = axios.create({
  baseURL: API_URL,
});

// Add token automatically to every protected request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("adminToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Normalize backend errors: expose the API message and error code on the
// thrown error while keeping the original axios error shape intact.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const data = error.response?.data;

    if (data) {
      if (data.message) {
        error.message = data.message;
      }

      if (data.code) {
        error.code = data.code;
      }
    }

    return Promise.reject(error);
  },
);

export default api;