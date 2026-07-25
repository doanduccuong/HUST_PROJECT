import { OfferRepository } from "../../domain/repositories/offer.repository";
import { OfferCatalogResponseSchema } from "../dto/offer.dto";

export class OfferRepositoryImpl extends OfferRepository {
  constructor(api) {
    super();
    this.api = api;
  }

  async list(search) {
    return OfferCatalogResponseSchema.parse(await this.api.list(search));
  }
}
