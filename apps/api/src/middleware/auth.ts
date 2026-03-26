import { createMiddleware } from 'hono/factory';

/**
 * POC auth middleware.
 * - Skips auth for /go and /spaces/demo routes (public endpoints)
 * - For all other routes, requires x-creator-id header
 */
export const authMiddleware = createMiddleware(async (c, next) => {
  const path = c.req.path;

  // Public routes: redirect endpoint and demo space
  if (path.startsWith('/go') || path === '/spaces/demo') {
    return next();
  }

  const creatorId = c.req.header('x-creator-id');

  if (!creatorId) {
    return c.json({ error: 'Missing x-creator-id header' }, 401);
  }

  // Attach creator ID to context for downstream handlers
  c.set('creatorId', creatorId);

  return next();
});
