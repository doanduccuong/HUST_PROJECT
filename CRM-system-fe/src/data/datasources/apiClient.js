import axios from "axios";

// Khởi tạo instance của Axios tương tự như Dio bên Flutter
export const ApiClient = axios.create({
  baseURL: "http://localhost:8081",
  timeout: 15000,
});

// Cấu hình Request Interceptor tự động chèn JWT token vào headers
ApiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("crm_token");
      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
