export * from './schema';

// POC: In-memory mock store for development without Supabase
// Swap to drizzle + postgres connection when Supabase is configured

import type { ProductRecord } from '@vibespace/schema';

export interface MockStore {
  products: Map<string, ProductRecord>;
  clicks: Array<{
    id: string;
    product_id: string;
    space_id: string;
    creator_id: string;
    timestamp: string;
    user_agent: string;
    referrer: string;
  }>;
}

export function createMockStore(): MockStore {
  return {
    products: new Map(),
    clicks: [],
  };
}

// Singleton for POC
let _store: MockStore | null = null;
export function getMockStore(): MockStore {
  if (!_store) _store = createMockStore();
  return _store;
}
