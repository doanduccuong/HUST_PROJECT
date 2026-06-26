import { z } from "zod";

export const AppliedWeightsSchema = z.object({
  alpha_1_upper: z.number().optional(),
  alpha_2_middle: z.number().optional(),
  alpha_3_lower: z.number().optional(),
  beta_dynamic: z.number().optional(),
});

export const SimilaritiesSchema = z.object({
  upper_face: z.number().optional(),
  middle_face: z.number().optional(),
  lower_face: z.number().optional(),
  dynamic_facs: z.number().optional(),
});

export const VerificationResultSchema = z.object({
  verified: z.boolean().optional(),
  matching_score: z.number().optional(),
  mask_detected: z.boolean().optional(),
  similarities: SimilaritiesSchema.optional(),
  applied_weights: AppliedWeightsSchema.optional(),
  target_bbox: z.array(z.number()).optional(),
  target_landmarks: z.array(z.array(z.number())).optional(),
  gallery_bbox: z.array(z.number()).optional(),
  gallery_landmarks: z.array(z.array(z.number())).optional(),
  target_dims: z.array(z.number()).optional(),
  gallery_dims: z.array(z.number()).optional(),
});

export const FaceVerificationDTOSchema = z.object({
  status: z.string().optional(),
  message: z.string().optional(),
  data: z.object({
    filename_current: z.string().optional(),
    filename_gallery: z.string().optional(),
    verification: VerificationResultSchema.optional(),
  }).optional(),
});
