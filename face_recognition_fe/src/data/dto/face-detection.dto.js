import { z } from "zod";

export const Stage1ResultSchema = z.object({
  face_detected: z.boolean().optional(),
  mask_detected: z.boolean().optional(),
  mask_probability: z.number().optional(),
  bbox: z.array(z.number()).optional(),
  landmarks: z.array(z.array(z.number())).optional(),
});

export const FaceDetectionDTOSchema = z.object({
  status: z.string().optional(),
  message: z.string().optional(),
  data: z.object({
    filename: z.string().optional(),
    size: z.number().optional(),
    stage1: Stage1ResultSchema.optional(),
  }).optional(),
});
