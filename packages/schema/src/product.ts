import { z } from 'zod';

export const PipelineStatusSchema = z.enum([
  'pending',
  'processing',
  'ready',
  'flagged',
  'error',
]);
export type PipelineStatus = z.infer<typeof PipelineStatusSchema>;

export const AffiliateStatusSchema = z.enum([
  'matched',
  'unmatched',
  'direct',
]);
export type AffiliateStatus = z.infer<typeof AffiliateStatusSchema>;

export const ProductRecordSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(200),
  description: z.string().max(2000).default(''),
  price: z.number().nonnegative(),
  currency: z.string().length(3).default('USD'),
  source_url: z.string().url().optional(),
  destination_url: z.string().min(1),
  redirect_url: z.string().url().optional(),
  image_url: z.string().url().optional(),
  raw_image_path: z.string().optional(),
  sprite_url: z.string().optional(),
  shadow_url: z.string().optional(),
  affiliate_status: AffiliateStatusSchema.default('unmatched'),
  commission_rate: z.number().min(0).max(1).optional(),
  creator_id: z.string().uuid(),
  space_id: z.string().uuid().optional(),
  slot_id: z.string().optional(),
  pipeline_status: PipelineStatusSchema.default('pending'),
  created_at: z.string().datetime().optional(),
});

export type ProductRecord = z.infer<typeof ProductRecordSchema>;

export const CreateProductInputSchema = ProductRecordSchema.omit({
  id: true,
  redirect_url: true,
  sprite_url: true,
  shadow_url: true,
  pipeline_status: true,
  created_at: true,
}).partial({
  affiliate_status: true,
  commission_rate: true,
  space_id: true,
  slot_id: true,
  raw_image_path: true,
});

export type CreateProductInput = z.infer<typeof CreateProductInputSchema>;
