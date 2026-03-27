import { Hono } from 'hono';
import { getMockStore } from '@vibespace/db';
import { CreateProductInputSchema } from '@vibespace/schema';
import type { ProductRecord } from '@vibespace/schema';

const app = new Hono();

const REDIRECT_BASE =
  process.env.VIBESPACE_REDIRECT_BASE ?? 'http://localhost:3001';

/**
 * POST /products -- Create a new product (Path 3: Direct Upload)
 */
app.post('/', async (c) => {
  const body = await c.req.json();
  const parsed = CreateProductInputSchema.safeParse(body);

  if (!parsed.success) {
    return c.json(
      { error: 'Invalid input', details: parsed.error.flatten() },
      400,
    );
  }

  const input = parsed.data;
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  const product: ProductRecord = {
    id,
    name: input.name,
    description: input.description ?? '',
    price: input.price,
    currency: input.currency ?? 'USD',
    source_url: input.source_url,
    destination_url: input.destination_url,
    redirect_url: `${REDIRECT_BASE}/go?pid=${id}`,
    image_url: input.image_url,
    raw_image_path: input.raw_image_path,
    affiliate_status: input.affiliate_status ?? 'unmatched',
    commission_rate: input.commission_rate,
    creator_id: input.creator_id,
    space_id: input.space_id,
    slot_id: input.slot_id,
    pipeline_status: 'pending',
    created_at: now,
  };

  const store = getMockStore();
  store.products.set(id, product);

  return c.json(product, 201);
});

/**
 * GET /products -- List all products, optionally filtered by creator_id
 */
app.get('/', (c) => {
  const creatorId = c.req.query('creator_id');
  const store = getMockStore();
  let products = Array.from(store.products.values());

  if (creatorId) {
    products = products.filter((p) => p.creator_id === creatorId);
  }

  return c.json(products);
});

/**
 * GET /products/:id -- Get a single product
 */
app.get('/:id', (c) => {
  const id = c.req.param('id');
  const store = getMockStore();
  const product = store.products.get(id);

  if (!product) {
    return c.json({ error: 'Product not found' }, 404);
  }

  return c.json(product);
});

/**
 * PUT /products/:id -- Update product details
 */
app.put('/:id', async (c) => {
  const id = c.req.param('id');
  const store = getMockStore();
  const existing = store.products.get(id);

  if (!existing) {
    return c.json({ error: 'Product not found' }, 404);
  }

  const body = await c.req.json();

  // Merge updates onto existing record, preserving fields not sent
  const updated: ProductRecord = {
    ...existing,
    name: body.name ?? existing.name,
    description: body.description ?? existing.description,
    price: body.price ?? existing.price,
    currency: body.currency ?? existing.currency,
    source_url: body.source_url ?? existing.source_url,
    destination_url: body.destination_url ?? existing.destination_url,
    image_url: body.image_url ?? existing.image_url,
    raw_image_path: body.raw_image_path ?? existing.raw_image_path,
    affiliate_status: body.affiliate_status ?? existing.affiliate_status,
    commission_rate: body.commission_rate ?? existing.commission_rate,
    space_id: body.space_id ?? existing.space_id,
    slot_id: body.slot_id ?? existing.slot_id,
    pipeline_status: body.pipeline_status ?? existing.pipeline_status,
  };

  store.products.set(id, updated);

  return c.json(updated);
});

/**
 * DELETE /products/:id -- Delete a product
 */
app.delete('/:id', (c) => {
  const id = c.req.param('id');
  const store = getMockStore();

  if (!store.products.has(id)) {
    return c.json({ error: 'Product not found' }, 404);
  }

  store.products.delete(id);

  return c.json({ deleted: true, id });
});

export default app;
