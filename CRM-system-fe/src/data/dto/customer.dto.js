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

export const FaceSearchResponseSchema = z.object({
  searchId: z.string(),
  traceId: z.string(),
  status: z.enum(["MATCH", "REVIEW", "NEW_CUSTOMER", "QUALITY_REJECTED"]),
  modelVersion: z.string(),
  quality: z.object({
    score: z.number(),
    accepted: z.boolean(),
    reasons: z.array(z.string()),
  }),
  currentExpression: z.object({
    dominant: z.string(),
    confidence: z.number(),
    probabilities: z.record(z.string(), z.number()),
  }),
  currentExperience: z.object({
    state: z.string(),
    confidence: z.number(),
    basis: z.string(),
    limitation: z.string(),
  }),
  candidates: z.array(z.object({
    customerId: z.number(),
    name: z.string(),
    gender: z.string().nullable().optional(),
    age: z.number().nullable().optional(),
    avatarUrl: z.string().nullable().optional(),
    distance: z.number(),
    similarity: z.number(),
  })),
});

const NullableDateSchema = z.string().nullable().optional();

export const Customer360ResponseSchema = z.object({
  customer: z.object({
    id: z.number(),
    name: z.string(),
    gender: z.string().nullable().optional(),
    age: z.number().nullable().optional(),
    avatarUrl: z.string().nullable().optional(),
    createdAt: NullableDateSchema,
  }),
  currentExperience: z.object({
    rawExpression: z.string().nullable().optional(),
    expressionConfidence: z.number(),
    experienceState: z.string().nullable().optional(),
    stateConfidence: z.number(),
    expressionProbabilities: z.record(z.string(), z.number()),
    observedAt: NullableDateSchema,
    source: z.string(),
  }).nullable(),
  commerce: z.object({
    orderCount: z.number(),
    paidOrderCount: z.number(),
    paidRevenue: z.number(),
    averagePaidOrderValue: z.number(),
  }),
  orders: z.array(z.object({
    id: z.number(),
    code: z.string(),
    productName: z.string().nullable().optional(),
    amount: z.number(),
    currency: z.string(),
    status: z.string(),
    assignedSale: z.string().nullable().optional(),
    createdAt: NullableDateSchema,
    paidAt: NullableDateSchema,
  })),
  salesInteractions: z.array(z.object({
    id: z.number(),
    interactionType: z.string(),
    channel: z.string(),
    saleName: z.string(),
    outcome: z.string().nullable().optional(),
    notes: z.string().nullable().optional(),
    startedAt: NullableDateSchema,
    endedAt: NullableDateSchema,
  })),
  purchaseExperienceHistory: z.array(z.object({
    orderId: z.number(),
    orderCode: z.string(),
    prePurchaseState: z.string().nullable().optional(),
    postPurchaseState: z.string().nullable().optional(),
    prePurchaseScore: z.number().nullable().optional(),
    postPurchaseScore: z.number().nullable().optional(),
    delta: z.number().nullable().optional(),
    confidence: z.number(),
    evidenceCount: z.number(),
    calculatedAt: NullableDateSchema,
  })),
});
