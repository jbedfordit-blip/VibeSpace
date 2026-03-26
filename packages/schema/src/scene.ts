import { z } from 'zod';

export const LightingSchemaZ = z.object({
  warmth: z.number().min(0).max(100).default(50),
  brightness: z.number().min(0).max(100).default(50),
  contrast: z.number().min(0).max(100).default(50),
  atmosphere: z.enum(['light', 'light-medium', 'medium', 'heavy']).default('medium'),
});
export type LightingSchema = z.infer<typeof LightingSchemaZ>;

export const SlotDefinitionSchema = z.object({
  id: z.string(),
  label: z.string(),
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
  z_index: z.number(),
  parallax_multiplier: z.number().default(0),
  surface_type: z.enum(['back-wall', 'mid', 'foreground', 'back-surface', 'fore-surface']),
  accepts: z.array(z.string()).default([]),
});
export type SlotDefinition = z.infer<typeof SlotDefinitionSchema>;

export const LayerSchema = z.object({
  id: z.string(),
  type: z.enum([
    'room-shell',
    'furniture',
    'furniture-shadow',
    'product',
    'product-shadow',
    'atmosphere',
    'ui',
  ]),
  asset_url: z.string(),
  x: z.number().default(0),
  y: z.number().default(0),
  width: z.number().optional(),
  height: z.number().optional(),
  z_index: z.number(),
  parallax_multiplier: z.number().default(0),
  opacity: z.number().min(0).max(1).default(1),
  blend_mode: z.string().default('normal'),
  product_id: z.string().uuid().optional(),
  slot_id: z.string().optional(),
  interactive: z.boolean().default(false),
});
export type Layer = z.infer<typeof LayerSchema>;

export const ProductPanelConfigSchema = z.object({
  background_color: z.string().default('#f5e6c8'),
  text_color: z.string().default('#3d2b1f'),
  accent_color: z.string().default('#c8a96e'),
  font_family: z.string().default('Georgia, serif'),
  border_style: z.string().default('2px solid #8b7355'),
});
export type ProductPanelConfig = z.infer<typeof ProductPanelConfigSchema>;

export const SceneAnimationSchema = z.object({
  particles: z.boolean().default(false),
  particle_type: z.enum(['dust', 'sparkle', 'smoke', 'none']).default('none'),
  particle_density: z.number().min(0).max(100).default(20),
  ambient_movement: z.boolean().default(false),
});
export type SceneAnimation = z.infer<typeof SceneAnimationSchema>;

export const SceneConfigSchema = z.object({
  id: z.string().uuid(),
  identity: z.object({
    creator_id: z.string().uuid(),
    creator_name: z.string(),
    title: z.string(),
    description: z.string().default(''),
  }),
  template: z.object({
    background_url: z.string(),
    width: z.number().default(1920),
    height: z.number().default(1080),
    lighting: LightingSchemaZ,
  }),
  slots: z.array(SlotDefinitionSchema),
  layers: z.array(LayerSchema),
  products: z.array(z.object({
    product_id: z.string().uuid(),
    slot_id: z.string(),
    name: z.string(),
    description: z.string().default(''),
    price: z.number(),
    currency: z.string().default('USD'),
    redirect_url: z.string(),
    sprite_url: z.string(),
    shadow_url: z.string().optional(),
    source_store: z.string().default(''),
  })),
  product_panel: ProductPanelConfigSchema.default({}),
  scene_animation: SceneAnimationSchema.default({}),
});

export type SceneConfig = z.infer<typeof SceneConfigSchema>;
