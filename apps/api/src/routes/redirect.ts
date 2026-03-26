import { Hono } from 'hono';
import { LRUCache } from 'lru-cache';
import { getMockStore } from '@vibespace/db';
import type { ProductRecord } from '@vibespace/schema';
import { demoProductMap } from '../data/demo-data';

const app = new Hono();

// LRU cache for product lookups: max 500 entries, 5-minute TTL
const productCache = new LRUCache<string, ProductRecord>({
  max: 500,
  ttl: 5 * 60 * 1000, // 5 minutes
});

function lookupProduct(productId: string): ProductRecord | undefined {
  // Check cache first
  const cached = productCache.get(productId);
  if (cached) return cached;

  // Check demo products
  const demo = demoProductMap.get(productId);
  if (demo) {
    productCache.set(productId, demo);
    return demo;
  }

  // Check mock store
  const store = getMockStore();
  const product = store.products.get(productId);
  if (product) {
    productCache.set(productId, product);
    return product;
  }

  return undefined;
}

/**
 * GET /go?pid=[product_id]&sid=[space_id]&cid=[creator_id]
 * Fast redirect endpoint. Logs click asynchronously, returns 302.
 */
app.get('/go', (c) => {
  const pid = c.req.query('pid');
  const sid = c.req.query('sid');
  const cid = c.req.query('cid');

  if (!pid) {
    return c.json({ error: 'Missing pid parameter' }, 400);
  }

  const product = lookupProduct(pid);

  if (!product) {
    return c.json({ error: 'Product not found' }, 404);
  }

  // Log click asynchronously -- do not block the redirect
  if (sid && cid) {
    setTimeout(() => {
      try {
        const store = getMockStore();
        store.clicks.push({
          id: crypto.randomUUID(),
          product_id: pid,
          space_id: sid,
          creator_id: cid,
          timestamp: new Date().toISOString(),
          user_agent: c.req.header('user-agent') ?? '',
          referrer: c.req.header('referer') ?? '',
        });
      } catch {
        // Silently swallow logging errors -- redirect must not fail
      }
    }, 0);
  }

  return c.redirect(product.destination_url, 302);
});

export default app;
