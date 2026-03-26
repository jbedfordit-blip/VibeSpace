import { z } from 'zod';

export const PerspectiveClassificationSchema = z.enum([
  'top-down',
  'steep-upward',
  'strong-side',
  'minor-elevation',
  'correct',
]);
export type PerspectiveClassification = z.infer<typeof PerspectiveClassificationSchema>;

export const PERSPECTIVE_ADVISORY: Record<PerspectiveClassification, string> = {
  'top-down': 'Shot from above. Upload a front-facing or three-quarter view.',
  'steep-upward': 'Shot from below. A straight-on angle will fit better.',
  'strong-side': 'Side-on shot. A front-facing view displays better on this surface.',
  'minor-elevation': 'Small correction applied automatically.',
  'correct': 'Image looks great for this space.',
};

export const ShadowPrimitiveSchema = z.enum([
  'cylinder',
  'hemisphere',
  'box',
  'sphere',
  'capsule',
  'scaled-box',
]);
export type ShadowPrimitive = z.infer<typeof ShadowPrimitiveSchema>;

export const PRODUCT_TAG_TO_SHADOW: Record<string, ShadowPrimitive> = {
  mug: 'cylinder',
  goblet: 'cylinder',
  candle: 'cylinder',
  bowl: 'hemisphere',
  basket: 'hemisphere',
  journal: 'box',
  book: 'box',
  flat: 'box',
  sculpture: 'sphere',
  tool: 'capsule',
  utensil: 'capsule',
  furniture: 'scaled-box',
};

export const PipelineStageSchema = z.enum([
  'background-removal',
  'perspective-assessment',
  'relighting',
  'shadow-generation',
  'atmospheric-blend',
  'export',
]);
export type PipelineStage = z.infer<typeof PipelineStageSchema>;

export const PipelineJobSchema = z.object({
  id: z.string().uuid(),
  product_id: z.string().uuid(),
  stage: PipelineStageSchema,
  status: z.enum(['queued', 'running', 'completed', 'failed']),
  error_message: z.string().optional(),
  created_at: z.string().datetime().optional(),
});
export type PipelineJob = z.infer<typeof PipelineJobSchema>;

export const PipelineResultSchema = z.object({
  sprite_url: z.string(),
  shadow_url: z.string(),
  slot_assignment: z.string().optional(),
  blend_params: z.object({
    warmth: z.number(),
    brightness: z.number(),
    contrast: z.number(),
    atmosphere: z.string(),
  }),
  affiliate_url: z.string().optional(),
  product_data: z.record(z.unknown()).optional(),
  perspective: PerspectiveClassificationSchema,
  advisory: z.string(),
});
export type PipelineResult = z.infer<typeof PipelineResultSchema>;
