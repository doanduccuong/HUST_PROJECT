import { z } from "zod";

export const CheckinResponseSchema = z.object({
  status: z.string(),
  identified: z.boolean(),
  name: z.string().optional(),
  distance: z.number().optional(),
  message: z.string().optional(),
});

export const RegisterResponseSchema = z.object({
  status: z.string(),
  message: z.string(),
  path: z.string().optional(),
});
