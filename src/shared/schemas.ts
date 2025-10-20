/**
 * Schema di validazione centralizzato con Zod
 * Questi schema forniscono validazione runtime per tutti i dati dell'applicazione
 */
import { z } from 'zod';

// =============================================================================
// USER SCHEMAS
// =============================================================================

export const userSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(255).optional(),
  email: z.string().email(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const createUserSchema = userSchema.pick({
  name: true,
  email: true,
});

export type User = z.infer<typeof userSchema>;
export type CreateUser = z.infer<typeof createUserSchema>;

// =============================================================================
// STYLE REFERENCE SCHEMAS
// =============================================================================

export const technicalStyleSchema = z.object({
  medium: z.string(),
  texture: z.string(),
  lighting: z.string(),
});

export const complexitySchema = z.object({
  level: z.number().min(0).max(10),
  detail_density: z.number().min(0).max(10),
  color_variety: z.number().min(0).max(10),
});

export const rgbColorSchema = z.object({
  r: z.number().min(0).max(255),
  g: z.number().min(0).max(255),
  b: z.number().min(0).max(255),
  color_name: z.string(),
  description: z.string(),
});

export const styleReferenceSchema = z.object({
  id: z.number().or(z.string()),
  code: z.string().min(1),
  name: z.string().min(1),
  category: z.string().min(1),
  subcategory: z.string().optional(),
  patternAnalysis: z.string().optional(),
  creativeInterpretation: z.string().optional(),
  keywords: z.array(z.string()).optional(),
  moodTags: z.array(z.string()).optional(),
  useCases: z.array(z.string()).optional(),
  era: z.string().optional(),
  subjects: z.array(z.string()).optional(),
  technicalStyle: technicalStyleSchema.optional(),
  complexity: complexitySchema.optional(),
  rgbPalette: z.array(rgbColorSchema).optional(),
  thumbnailUrl: z.string().url().optional(),
  images: z.array(z.string().url()).optional(),
  socialMedia: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const createStyleReferenceSchema = styleReferenceSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type StyleReference = z.infer<typeof styleReferenceSchema>;
export type CreateStyleReference = z.infer<typeof createStyleReferenceSchema>;

// =============================================================================
// PROJECT SCHEMAS
// =============================================================================

export const projectSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  styleId: z.string().optional(),
  status: z.enum(['draft', 'in_progress', 'completed', 'archived']).default('draft'),
  videoUrl: z.string().url().optional(),
  metadata: z.record(z.any()).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const createProjectSchema = projectSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type Project = z.infer<typeof projectSchema>;
export type CreateProject = z.infer<typeof createProjectSchema>;

// =============================================================================
// CONVERSATION SCHEMAS (Orchestrator V2)
// =============================================================================

export const conversationSessionSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  projectId: z.string().uuid().optional(),
  status: z.enum(['active', 'completed', 'abandoned']).default('active'),
  metadata: z.record(z.any()).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const createConversationSessionSchema = conversationSessionSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type ConversationSession = z.infer<typeof conversationSessionSchema>;
export type CreateConversationSession = z.infer<typeof createConversationSessionSchema>;

export const conversationMessageSchema = z.object({
  id: z.string().uuid(),
  sessionId: z.string().uuid(),
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string().min(1),
  metadata: z.record(z.any()).optional(),
  createdAt: z.date(),
});

export const createConversationMessageSchema = conversationMessageSchema.omit({
  id: true,
  createdAt: true,
});

export type ConversationMessage = z.infer<typeof conversationMessageSchema>;
export type CreateConversationMessage = z.infer<typeof createConversationMessageSchema>;

export const detectedIntentSchema = z.object({
  id: z.string().uuid(),
  sessionId: z.string().uuid(),
  purpose: z.enum(['brand', 'personal', 'tutorial', 'entertainment', 'unknown']).optional(),
  platform: z.enum(['instagram', 'tiktok', 'youtube', 'website', 'unknown']).optional(),
  style: z.enum(['cinematic', 'casual', 'minimalist', 'energetic', 'unknown']).optional(),
  mediaType: z.enum(['image', 'video', 'music', 'mixed', 'unknown']).optional(),
  budgetSensitivity: z.enum(['low', 'medium', 'high', 'unknown']).optional(),
  hasScript: z.boolean().default(false),
  hasVisuals: z.boolean().default(false),
  inferredSpecs: z.record(z.any()).optional(),
  confidence: z.number().min(0).max(1).default(0),
  updatedAt: z.date(),
});

export const createDetectedIntentSchema = detectedIntentSchema.omit({
  id: true,
  updatedAt: true,
});

export type DetectedIntent = z.infer<typeof detectedIntentSchema>;
export type CreateDetectedIntent = z.infer<typeof createDetectedIntentSchema>;

// =============================================================================
// API RESPONSE SCHEMAS
// =============================================================================

export const apiErrorSchema = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.any().optional(),
  }),
});

export const apiSuccessSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.object({
    success: z.literal(true),
    data: dataSchema,
  });

export type ApiError = z.infer<typeof apiErrorSchema>;
export type ApiSuccess<T> = {
  success: true;
  data: T;
};

// =============================================================================
// ORCHESTRATOR REQUEST/RESPONSE SCHEMAS
// =============================================================================

export const orchestratorRequestSchema = z.object({
  message: z.string().min(1),
  sessionId: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
  context: z.record(z.any()).optional(),
});

export const orchestratorResponseSchema = z.object({
  message: z.string(),
  sessionId: z.string().uuid(),
  phase: z.enum(['discovery', 'planning', 'execution', 'review']),
  needsUserInput: z.boolean(),
  metadata: z.record(z.any()).optional(),
});

export type OrchestratorRequest = z.infer<typeof orchestratorRequestSchema>;
export type OrchestratorResponse = z.infer<typeof orchestratorResponseSchema>;

// =============================================================================
// VALIDATION HELPERS
// =============================================================================

/**
 * Valida i dati contro uno schema Zod e ritorna un risultato type-safe
 */
export function validate<T>(
  schema: z.ZodType<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: z.ZodError } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error };
}

/**
 * Valida i dati e lancia un errore se non validi
 */
export function validateOrThrow<T>(schema: z.ZodType<T>, data: unknown): T {
  return schema.parse(data);
}
