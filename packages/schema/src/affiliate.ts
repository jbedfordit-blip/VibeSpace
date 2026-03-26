import { z } from 'zod';

export const AffiliateNetworkSchema = z.enum([
  'awin',
  'shareasale',
  'impact',
  'direct',
  'unknown',
]);
export type AffiliateNetwork = z.infer<typeof AffiliateNetworkSchema>;

export const AffiliateDomainSchema = z.object({
  domain: z.string(),
  network: AffiliateNetworkSchema,
  program_id: z.string().optional(),
  commission_rate: z.number().min(0).max(1).optional(),
});
export type AffiliateDomain = z.infer<typeof AffiliateDomainSchema>;

export const ClickEventSchema = z.object({
  id: z.string().uuid(),
  product_id: z.string().uuid(),
  space_id: z.string().uuid(),
  creator_id: z.string().uuid(),
  timestamp: z.string().datetime(),
  user_agent: z.string().default(''),
  referrer: z.string().default(''),
});
export type ClickEvent = z.infer<typeof ClickEventSchema>;
