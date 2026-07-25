import { SalesAnalyticsRepository } from "../../domain/repositories/salesAnalytics.repository";
import { SalesPerformanceResponseSchema } from "../dto/salesAnalytics.dto";

export class SalesAnalyticsRepositoryImpl extends SalesAnalyticsRepository {
  constructor(api) {
    super();
    this.api = api;
  }

  async getPerformance() {
    return SalesPerformanceResponseSchema.parse(await this.api.getPerformance());
  }
}
