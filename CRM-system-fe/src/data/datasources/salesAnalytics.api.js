import { ApiClient } from "./apiClient";

export class SalesAnalyticsApi {
  async getPerformance() {
    const response = await ApiClient.get("/api/v1/dashboard/sales-performance");
    return response.data;
  }
}
