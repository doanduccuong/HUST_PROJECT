import { ApiClient } from "./apiClient";

export class CustomerApi {
  async checkin(file) {
    const formData = new FormData();
    formData.append("file", file);

    const response = await ApiClient.post("/api/v1/customers/checkin", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    
    return response.data;
  }

  async register(file, name) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("name", name);

    const response = await ApiClient.post("/api/v1/customers/register", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    
    return response.data;
  }

  async getCustomers() {
    const response = await ApiClient.get("/api/v1/customers");
    return response.data;
  }
}
