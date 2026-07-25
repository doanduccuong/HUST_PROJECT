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

  async identify(file) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("source", "IMPORT");
    const response = await ApiClient.post("/api/v1/customers/identify", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  }

  async confirmIdentity(searchId, customerId) {
    const response = await ApiClient.post(
      `/api/v1/customers/identify/${searchId}/confirm`,
      { customerId },
    );
    return response.data;
  }

  async getProfile360(customerId) {
    const response = await ApiClient.get(
      `/api/v1/customers/${customerId}/profile-360`,
    );
    return response.data;
  }
}
