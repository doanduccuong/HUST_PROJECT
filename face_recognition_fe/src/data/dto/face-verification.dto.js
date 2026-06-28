import { z } from "zod";

export const AppliedWeightsSchema = z.object({
  alpha_1_upper: z.number().nullable().optional(),
  alpha_2_middle: z.number().nullable().optional(),
  alpha_3_lower: z.number().nullable().optional(),
  beta_dynamic: z.number().nullable().optional(),
});

export const SimilaritiesSchema = z.object({
  upper_face: z.number().nullable().optional(),
  middle_face: z.number().nullable().optional(),
  lower_face: z.number().nullable().optional(),
  dynamic_facs: z.number().nullable().optional(),
});

export const VerificationResultSchema = z.object({
  verified: z.boolean().nullable().optional(),
  matching_score: z.number().nullable().optional(),
  mask_detected: z.boolean().nullable().optional(),
  similarities: SimilaritiesSchema.nullable().optional(),
  applied_weights: AppliedWeightsSchema.nullable().optional(),
  target_bbox: z.array(z.number()).nullable().optional(),
  target_landmarks: z.array(z.array(z.number())).nullable().optional(),
  gallery_bbox: z.array(z.number()).nullable().optional(),
  gallery_landmarks: z.array(z.array(z.number())).nullable().optional(),
  target_dims: z.array(z.number()).nullable().optional(),
  gallery_dims: z.array(z.number()).nullable().optional(),
  
  // New standard DeepFace and local patch verification fields
  distance: z.number().nullable().optional(),
  threshold: z.number().nullable().optional(),
  fused_distance: z.number().nullable().optional(),
  fused_threshold: z.number().nullable().optional(),
  eyes_distance: z.number().nullable().optional(),
  nose_distance: z.number().nullable().optional(),
  mouth_distance: z.number().nullable().optional(),
  eyes_weight: z.number().nullable().optional(),
  nose_weight: z.number().nullable().optional(),
  mouth_weight: z.number().nullable().optional(),
  model: z.string().nullable().optional(),
  detector_backend: z.string().nullable().optional(),
  similarity_metric: z.string().nullable().optional(),
});

export const FaceVerificationDTOSchema = z.object({
  status: z.string().optional(),
  message: z.string().optional(),
  data: z.object({
    filename_current: z.string().optional(),
    filename_gallery: z.string().optional(),
    verification: VerificationResultSchema.optional(),
  }).nullable().optional(),
});
