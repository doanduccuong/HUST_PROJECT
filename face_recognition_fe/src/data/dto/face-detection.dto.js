import { z } from "zod";

export const Stage1ResultSchema = z.object({
  face_detected: z.boolean().nullable().optional(),
  mask_detected: z.boolean().nullable().optional(),
  mask_probability: z.number().nullable().optional(),
  bbox: z.array(z.number()).nullable().optional(),
  landmarks: z.array(z.array(z.number())).nullable().optional(),
  emotions: z.record(z.number()).nullable().optional(),
  cs_score: z.number().nullable().optional(),
  msr_score: z.number().nullable().optional(),
  age: z.number().nullable().optional(),
  gender: z.string().nullable().optional(),
  race: z.string().nullable().optional(),
});

export const FaceDetectionDTOSchema = z.object({
  status: z.string().optional(),
  message: z.string().optional(),
  data: z.object({
    filename: z.string().optional(),
    size: z.number().optional(),
    stage1: Stage1ResultSchema.optional(),
  }).nullable().optional(),
});
