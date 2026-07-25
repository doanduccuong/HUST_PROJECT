import { z } from "zod";

export const SalesPerformanceResponseSchema = z.object({
  paidRevenue: z.number(),
  paidOrders: z.number(),
  totalOrders: z.number(),
  paidConversionRate: z.number(),
  sales: z.array(z.object({
    staffId: z.number(),
    name: z.string().nullable().optional(),
    username: z.string(),
    specialty: z.string(),
    orderCount: z.number(),
    paidOrderCount: z.number(),
    paidRevenue: z.number(),
    averagePaidOrderValue: z.number(),
    paidConversionRate: z.number(),
    interactionCount: z.number(),
    callsHandled: z.number(),
    averageExperienceDelta: z.number().nullable().optional(),
  })),
});
