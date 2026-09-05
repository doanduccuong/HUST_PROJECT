import axios from "axios";

// Khởi tạo instance của Axios tương tự như Dio bên Flutter
export const ApiClient = axios.create({
  baseURL: "",
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

// Response Interceptor để tự động xử lý khi Token hết hạn (401/403)
ApiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("crm_token");
        localStorage.removeItem("crm_user");
        window.location.reload();
      }
    }
    return Promise.reject(error);
  }
);
