import 'dotenv/config';

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serve } from '@hono/node-server';

import { authMiddleware } from './middleware/auth';
import redirectRoutes from './routes/redirect';
import productRoutes from './routes/products';
import metadataRoutes from './routes/metadata';
import spaceRoutes from './routes/spaces';

// Seed demo products into the mock store on startup
import { demoProductRecords } from './data/demo-data';
import { getMockStore } from '@vibespace/db';

const app = new Hono();

// --- Middleware ---
app.use('*', cors());
app.use('*', authMiddleware);

// --- Route groups ---
app.route('/', redirectRoutes);           // /go
app.route('/products', productRoutes);     // /products/*
app.route('/metadata', metadataRoutes);    // /metadata/*
app.route('/spaces', spaceRoutes);         // /spaces/*

// --- Health check ---
app.get('/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }));

// --- Seed demo data into mock store ---
const store = getMockStore();
for (const product of demoProductRecords) {
  store.products.set(product.id, product);
}

// --- Start server ---
const port = parseInt(process.env.PORT ?? '3001', 10);

serve({ fetch: app.fetch, port }, () => {
  console.log(`VibeSpace API running on http://localhost:${port}`);
});

export default app;
