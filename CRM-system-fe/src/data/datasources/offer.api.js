import { ApiClient } from "./apiClient";

export class OfferApi {
  async list(search = "") {
    const response = await ApiClient.get("/api/v1/offers", {
      params: { limit: 250, search },
    });
    return response.data;
  }
}
