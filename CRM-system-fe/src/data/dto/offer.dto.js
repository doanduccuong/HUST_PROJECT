import { z } from "zod";

export const OfferCatalogResponseSchema = z.object({
  total: z.number(),
  active: z.number(),
  inactive: z.number(),
  revenueFieldMeaning: z.string(),
  offers: z.array(z.object({
    id: z.number(),
    name: z.string(),
    status: z.string(),
    advertiser: z.string().nullable().optional(),
    categories: z.string().nullable().optional(),
    tags: z.string().nullable().optional(),
    currency: z.string().nullable().optional(),
    goalType: z.string().nullable().optional(),
    goalRevenue: z.number().nullable().optional(),
    goalPayout: z.number().nullable().optional(),
  })),
});
