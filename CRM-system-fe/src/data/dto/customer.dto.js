import { z } from "zod";

export const CheckinResponseSchema = z.object({
  status: z.string(),
  identified: z.boolean(),
  name: z.string().optional(),
  distance: z.number().optional(),
  message: z.string().optional(),
  emotion: z.string().optional(),
  gaze_direction: z.string().optional(),
  gaze_yaw: z.number().optional(),
  distance_m: z.number().optional(),
  standing_position: z.string().optional(),
  user_image: z.string().nullable().optional(),
});

export const RegisterResponseSchema = z.object({
  status: z.string(),
  message: z.string(),
  path: z.string().optional(),
});
