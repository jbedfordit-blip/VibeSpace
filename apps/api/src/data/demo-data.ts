import type { SceneConfig, ProductRecord } from '@vibespace/schema';

// Fixed UUIDs for demo data
const DEMO_SPACE_ID = 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d';
const DEMO_CREATOR_ID = 'f0e1d2c3-b4a5-4697-8889-9a0b1c2d3e4f';

const DEMO_PRODUCTS: {
  id: string;
  name: string;
  price: number;
  description: string;
  slot_id: string;
  destination_url: string;
}[] = [
  {
    id: '10000000-0000-4000-8000-000000000001',
    name: 'Leather Journal',
    price: 34.99,
    description: 'Hand-stitched leather journal with aged parchment pages',
    slot_id: 'slot-1',
    destination_url: 'https://www.etsy.com/listing/leather-journal',
  },
  {
    id: '10000000-0000-4000-8000-000000000002',
    name: 'Ceramic Mug',
    price: 22.0,
    description: 'Glazed stoneware mug with hobbit-hole motif',
    slot_id: 'slot-2',
    destination_url: 'https://www.etsy.com/listing/ceramic-mug',
  },
  {
    id: '10000000-0000-4000-8000-000000000003',
    name: 'Brass Compass',
    price: 48.5,
    description: 'Working brass compass with engraved lid',
    slot_id: 'slot-3',
    destination_url: 'https://www.uncommongoods.com/product/brass-compass',
  },
  {
    id: '10000000-0000-4000-8000-000000000004',
    name: 'Beeswax Candle',
    price: 15.99,
    description: 'Pure beeswax pillar candle with herbal scent',
    slot_id: 'slot-4',
    destination_url: 'https://www.etsy.com/listing/beeswax-candle',
  },
  {
    id: '10000000-0000-4000-8000-000000000005',
    name: 'Woven Basket',
    price: 29.0,
    description: 'Hand-woven willow basket for bread or gathering',
    slot_id: 'slot-5',
    destination_url: 'https://www.etsy.com/listing/woven-basket',
  },
  {
    id: '10000000-0000-4000-8000-000000000006',
    name: 'Carved Pipe',
    price: 42.0,
    description: 'Hand-carved briar wood pipe with long stem',
    slot_id: 'slot-6',
    destination_url: 'https://www.etsy.com/listing/carved-pipe',
  },
  {
    id: '10000000-0000-4000-8000-000000000007',
    name: 'Herbal Tea Tin',
    price: 18.5,
    description: 'Artisan herbal blend in a decorative tin canister',
    slot_id: 'slot-7',
    destination_url: 'https://www.uncommongoods.com/product/herbal-tea-tin',
  },
  {
    id: '10000000-0000-4000-8000-000000000008',
    name: 'Copper Goblet',
    price: 56.0,
    description: 'Hammered copper goblet with vine engravings',
    slot_id: 'slot-8',
    destination_url: 'https://www.amazon.com/dp/copper-goblet',
  },
];

function placeholderImage(name: string, w = 300, h = 300): string {
  const encoded = encodeURIComponent(name);
  return `https://placehold.co/${w}x${h}/8B7355/F5E6C8?text=${encoded}`;
}

function redirectUrl(productId: string): string {
  return `/go?pid=${productId}&sid=${DEMO_SPACE_ID}&cid=${DEMO_CREATOR_ID}`;
}

// Build ProductRecord entries for the mock store
export const demoProductRecords: ProductRecord[] = DEMO_PRODUCTS.map((p) => ({
  id: p.id,
  name: p.name,
  description: p.description,
  price: p.price,
  currency: 'USD',
  source_url: p.destination_url,
  destination_url: p.destination_url,
  redirect_url: redirectUrl(p.id),
  image_url: placeholderImage(p.name),
  affiliate_status: 'unmatched' as const,
  creator_id: DEMO_CREATOR_ID,
  space_id: DEMO_SPACE_ID,
  slot_id: p.slot_id,
  pipeline_status: 'ready' as const,
  created_at: new Date().toISOString(),
}));

// Build a lookup map: product_id -> ProductRecord
export const demoProductMap = new Map<string, ProductRecord>(
  demoProductRecords.map((p) => [p.id, p]),
);

// Full SceneConfig for the demo space
export const demoSceneConfig: SceneConfig = {
  id: DEMO_SPACE_ID,
  identity: {
    creator_id: DEMO_CREATOR_ID,
    creator_name: 'Bilbo Baggins',
    title: 'Hobbit Merchant Interior',
    description:
      'A cozy hobbit-hole shop filled with artisan wares and curiosities.',
  },
  template: {
    background_url:
      'https://placehold.co/1920x1080/3d2b1f/f5e6c8?text=Hobbit+Shop',
    width: 1920,
    height: 1080,
    lighting: {
      warmth: 75,
      brightness: 45,
      contrast: 55,
      atmosphere: 'medium',
    },
  },
  slots: [
    {
      id: 'slot-1',
      label: 'Left Shelf Top',
      x: 120,
      y: 200,
      width: 180,
      height: 180,
      z_index: 10,
      parallax_multiplier: 0.05,
      surface_type: 'back-wall',
      accepts: ['journal', 'book', 'flat'],
    },
    {
      id: 'slot-2',
      label: 'Left Shelf Bottom',
      x: 120,
      y: 420,
      width: 180,
      height: 180,
      z_index: 10,
      parallax_multiplier: 0.05,
      surface_type: 'back-wall',
      accepts: ['mug', 'bowl', 'candle'],
    },
    {
      id: 'slot-3',
      label: 'Center Table Left',
      x: 480,
      y: 550,
      width: 200,
      height: 200,
      z_index: 20,
      parallax_multiplier: 0.1,
      surface_type: 'fore-surface',
      accepts: ['tool', 'utensil', 'flat'],
    },
    {
      id: 'slot-4',
      label: 'Center Table Right',
      x: 720,
      y: 550,
      width: 180,
      height: 180,
      z_index: 20,
      parallax_multiplier: 0.1,
      surface_type: 'fore-surface',
      accepts: ['candle', 'mug'],
    },
    {
      id: 'slot-5',
      label: 'Floor Left',
      x: 200,
      y: 750,
      width: 220,
      height: 220,
      z_index: 30,
      parallax_multiplier: 0.15,
      surface_type: 'foreground',
      accepts: ['basket', 'furniture'],
    },
    {
      id: 'slot-6',
      label: 'Right Shelf',
      x: 1500,
      y: 300,
      width: 180,
      height: 180,
      z_index: 10,
      parallax_multiplier: 0.05,
      surface_type: 'back-wall',
      accepts: ['tool', 'utensil'],
    },
    {
      id: 'slot-7',
      label: 'Window Sill',
      x: 960,
      y: 280,
      width: 160,
      height: 160,
      z_index: 15,
      parallax_multiplier: 0.08,
      surface_type: 'mid',
      accepts: ['candle', 'mug', 'flat'],
    },
    {
      id: 'slot-8',
      label: 'Counter',
      x: 1200,
      y: 600,
      width: 200,
      height: 200,
      z_index: 25,
      parallax_multiplier: 0.12,
      surface_type: 'fore-surface',
      accepts: ['goblet', 'mug', 'bowl'],
    },
  ],
  layers: [
    {
      id: 'bg',
      type: 'room-shell',
      asset_url:
        'https://placehold.co/1920x1080/3d2b1f/f5e6c8?text=Hobbit+Shop',
      x: 0,
      y: 0,
      width: 1920,
      height: 1080,
      z_index: 0,
      parallax_multiplier: 0,
      opacity: 1,
      blend_mode: 'normal',
      interactive: false,
    },
    {
      id: 'shelf-left',
      type: 'furniture',
      asset_url:
        'https://placehold.co/400x800/6b5039/f5e6c8?text=Wooden+Shelf',
      x: 60,
      y: 100,
      width: 400,
      height: 800,
      z_index: 5,
      parallax_multiplier: 0.03,
      opacity: 1,
      blend_mode: 'normal',
      interactive: false,
    },
    {
      id: 'table-center',
      type: 'furniture',
      asset_url:
        'https://placehold.co/600x400/7a6244/f5e6c8?text=Oak+Table',
      x: 400,
      y: 480,
      width: 600,
      height: 400,
      z_index: 15,
      parallax_multiplier: 0.08,
      opacity: 1,
      blend_mode: 'normal',
      interactive: false,
    },
    {
      id: 'shelf-right',
      type: 'furniture',
      asset_url:
        'https://placehold.co/350x700/6b5039/f5e6c8?text=Display+Cabinet',
      x: 1420,
      y: 150,
      width: 350,
      height: 700,
      z_index: 5,
      parallax_multiplier: 0.03,
      opacity: 1,
      blend_mode: 'normal',
      interactive: false,
    },
    {
      id: 'counter-right',
      type: 'furniture',
      asset_url:
        'https://placehold.co/500x350/8b7355/f5e6c8?text=Counter',
      x: 1100,
      y: 530,
      width: 500,
      height: 350,
      z_index: 20,
      parallax_multiplier: 0.1,
      opacity: 1,
      blend_mode: 'normal',
      interactive: false,
    },
    // Product layers
    ...DEMO_PRODUCTS.map((p, i) => ({
      id: `product-${p.slot_id}`,
      type: 'product' as const,
      asset_url: placeholderImage(p.name),
      x: 0,
      y: 0,
      z_index: 50 + i,
      parallax_multiplier: 0,
      opacity: 1,
      blend_mode: 'normal' as const,
      product_id: p.id,
      slot_id: p.slot_id,
      interactive: true,
    })),
    {
      id: 'dust-atmosphere',
      type: 'atmosphere',
      asset_url:
        'https://placehold.co/1920x1080/ffffff/ffffff?text=+',
      x: 0,
      y: 0,
      width: 1920,
      height: 1080,
      z_index: 100,
      parallax_multiplier: 0,
      opacity: 0.08,
      blend_mode: 'screen',
      interactive: false,
    },
  ],
  products: DEMO_PRODUCTS.map((p) => ({
    product_id: p.id,
    slot_id: p.slot_id,
    name: p.name,
    description: p.description,
    price: p.price,
    currency: 'USD',
    redirect_url: redirectUrl(p.id),
    sprite_url: placeholderImage(p.name),
    shadow_url: placeholderImage(`${p.name}+Shadow`, 300, 100),
    source_store: new URL(p.destination_url).hostname,
  })),
  product_panel: {
    background_color: '#f5e6c8',
    text_color: '#3d2b1f',
    accent_color: '#c8a96e',
    font_family: 'Georgia, serif',
    border_style: '2px solid #8b7355',
  },
  scene_animation: {
    particles: true,
    particle_type: 'dust',
    particle_density: 20,
    ambient_movement: true,
  },
};

export const DEMO_SPACE_IDS = {
  spaceId: DEMO_SPACE_ID,
  creatorId: DEMO_CREATOR_ID,
};
