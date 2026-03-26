import { Hono } from 'hono';
import { getMockStore } from '@vibespace/db';
import { demoSceneConfig, DEMO_SPACE_IDS } from '../data/demo-data';
import type { SceneConfig } from '@vibespace/schema';

const app = new Hono();

// In-memory space storage (separate from product mock store)
const spacesStore = new Map<string, SceneConfig>();

// Seed the demo space
spacesStore.set(DEMO_SPACE_IDS.spaceId, demoSceneConfig);

/**
 * GET /spaces/demo -- Return the demo space scene config
 */
app.get('/demo', (c) => {
  return c.json(demoSceneConfig);
});

/**
 * GET /spaces/:id -- Get a space by ID
 */
app.get('/:id', (c) => {
  const id = c.req.param('id');
  const space = spacesStore.get(id);

  if (!space) {
    return c.json({ error: 'Space not found' }, 404);
  }

  return c.json(space);
});

/**
 * POST /spaces -- Create a new space
 */
app.post('/', async (c) => {
  const body = await c.req.json();

  const id = crypto.randomUUID();
  const creatorId =
    c.req.header('x-creator-id') ?? body.identity?.creator_id;

  if (!creatorId) {
    return c.json({ error: 'Missing creator_id' }, 400);
  }

  const space: SceneConfig = {
    id,
    identity: {
      creator_id: creatorId,
      creator_name: body.identity?.creator_name ?? 'Creator',
      title: body.identity?.title ?? 'Untitled Space',
      description: body.identity?.description ?? '',
    },
    template: {
      background_url: body.template?.background_url ?? '',
      width: body.template?.width ?? 1920,
      height: body.template?.height ?? 1080,
      lighting: {
        warmth: body.template?.lighting?.warmth ?? 50,
        brightness: body.template?.lighting?.brightness ?? 50,
        contrast: body.template?.lighting?.contrast ?? 50,
        atmosphere: body.template?.lighting?.atmosphere ?? 'medium',
      },
    },
    slots: body.slots ?? [],
    layers: body.layers ?? [],
    products: body.products ?? [],
    product_panel: body.product_panel ?? {
      background_color: '#f5e6c8',
      text_color: '#3d2b1f',
      accent_color: '#c8a96e',
      font_family: 'Georgia, serif',
      border_style: '2px solid #8b7355',
    },
    scene_animation: body.scene_animation ?? {
      particles: false,
      particle_type: 'none',
      particle_density: 20,
      ambient_movement: false,
    },
  };

  spacesStore.set(id, space);

  return c.json(space, 201);
});

/**
 * PUT /spaces/:id -- Update an existing space
 */
app.put('/:id', async (c) => {
  const id = c.req.param('id');
  const existing = spacesStore.get(id);

  if (!existing) {
    return c.json({ error: 'Space not found' }, 404);
  }

  const body = await c.req.json();

  const updated: SceneConfig = {
    ...existing,
    identity: {
      ...existing.identity,
      ...body.identity,
    },
    template: {
      ...existing.template,
      ...body.template,
      lighting: {
        ...existing.template.lighting,
        ...body.template?.lighting,
      },
    },
    slots: body.slots ?? existing.slots,
    layers: body.layers ?? existing.layers,
    products: body.products ?? existing.products,
    product_panel: body.product_panel
      ? { ...existing.product_panel, ...body.product_panel }
      : existing.product_panel,
    scene_animation: body.scene_animation
      ? { ...existing.scene_animation, ...body.scene_animation }
      : existing.scene_animation,
  };

  spacesStore.set(id, updated);

  return c.json(updated);
});

export default app;
