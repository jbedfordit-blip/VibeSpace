import type { SceneConfig, ProductRecord, CreateProductInput } from '@vibespace/schema';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`API ${res.status}: ${res.statusText} — ${body}`);
  }

  return res.json() as Promise<T>;
}

export async function fetchDemoScene(): Promise<SceneConfig> {
  return apiFetch<SceneConfig>('/spaces/demo');
}

export async function fetchProducts(): Promise<ProductRecord[]> {
  return apiFetch<ProductRecord[]>('/products');
}

export async function createProduct(
  input: CreateProductInput
): Promise<ProductRecord> {
  return apiFetch<ProductRecord>('/products', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function extractMetadata(
  url: string
): Promise<{
  name: string;
  description: string;
  price: number;
  image_url: string;
  source_url: string;
}> {
  return apiFetch('/products/extract', {
    method: 'POST',
    body: JSON.stringify({ url }),
  });
}

export interface AnalyticsData {
  total_clicks: number;
  products: Array<{
    product_id: string;
    name: string;
    clicks: number;
    last_click: string;
  }>;
}

export async function fetchAnalytics(): Promise<AnalyticsData> {
  return apiFetch<AnalyticsData>('/analytics');
}
