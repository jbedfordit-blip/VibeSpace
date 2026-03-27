import { Hono } from 'hono';
import * as cheerio from 'cheerio';
import affiliateDomains from '../data/affiliate-domains.json';
import type { AffiliateDomain } from '@vibespace/schema';

const app = new Hono();

interface ExtractedMetadata {
  title: string;
  description: string;
  image_url: string | null;
  price: number | null;
  currency: string;
  source: 'json-ld' | 'open-graph' | 'fallback';
  affiliate: AffiliateDomain | null;
  raw_url: string;
}

/**
 * Try to extract product data from schema.org JSON-LD
 */
function extractJsonLd(
  $: cheerio.CheerioAPI,
): Partial<ExtractedMetadata> | null {
  const scripts = $('script[type="application/ld+json"]');
  for (let i = 0; i < scripts.length; i++) {
    try {
      const raw = $(scripts[i]).html();
      if (!raw) continue;
      const data = JSON.parse(raw);

      // Handle @graph arrays
      const items = data['@graph'] ? data['@graph'] : [data];
      for (const item of items) {
        if (
          item['@type'] === 'Product' ||
          item['@type']?.includes?.('Product')
        ) {
          const offers = item.offers || item.Offers;
          const offer = Array.isArray(offers) ? offers[0] : offers;

          return {
            title: item.name ?? '',
            description: item.description ?? '',
            image_url: Array.isArray(item.image)
              ? item.image[0]
              : item.image ?? null,
            price: offer?.price ? parseFloat(offer.price) : null,
            currency: offer?.priceCurrency ?? 'USD',
            source: 'json-ld',
          };
        }
      }
    } catch {
      // Malformed JSON-LD, skip
    }
  }
  return null;
}

/**
 * Try to extract data from Open Graph meta tags
 */
function extractOpenGraph(
  $: cheerio.CheerioAPI,
): Partial<ExtractedMetadata> | null {
  const ogTitle =
    $('meta[property="og:title"]').attr('content') ?? null;
  const ogDesc =
    $('meta[property="og:description"]').attr('content') ?? null;
  const ogImage =
    $('meta[property="og:image"]').attr('content') ?? null;
  const ogPrice =
    $('meta[property="og:price:amount"]').attr('content') ??
    $('meta[property="product:price:amount"]').attr('content') ??
    null;
  const ogCurrency =
    $('meta[property="og:price:currency"]').attr('content') ??
    $('meta[property="product:price:currency"]').attr('content') ??
    'USD';

  if (ogTitle || ogImage) {
    return {
      title: ogTitle ?? '',
      description: ogDesc ?? '',
      image_url: ogImage,
      price: ogPrice ? parseFloat(ogPrice) : null,
      currency: ogCurrency,
      source: 'open-graph',
    };
  }

  return null;
}

/**
 * Fallback: use <title> and find the largest image by width/height attributes
 */
function extractFallback(
  $: cheerio.CheerioAPI,
): Partial<ExtractedMetadata> {
  const title = $('title').text().trim();

  // Find largest image by declared width/height
  let largestArea = 0;
  let largestSrc: string | null = null;

  $('img').each((_, el) => {
    const w = parseInt($(el).attr('width') ?? '0', 10);
    const h = parseInt($(el).attr('height') ?? '0', 10);
    const area = w * h;
    if (area > largestArea) {
      largestArea = area;
      largestSrc = $(el).attr('src') ?? null;
    }
  });

  // If no image found via attributes, grab the first <img> with a src
  if (!largestSrc) {
    largestSrc = $('img[src]').first().attr('src') ?? null;
  }

  return {
    title,
    description: $('meta[name="description"]').attr('content') ?? '',
    image_url: largestSrc,
    price: null,
    currency: 'USD',
    source: 'fallback',
  };
}

/**
 * Look up the domain against the affiliate domains list
 */
function lookupAffiliate(url: string): AffiliateDomain | null {
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, '');
    const domains = affiliateDomains as AffiliateDomain[];
    return domains.find((d) => hostname === d.domain || hostname.endsWith(`.${d.domain}`)) ?? null;
  } catch {
    return null;
  }
}

/**
 * POST /metadata/extract
 * Accept { url: string }, fetch and parse, return extracted metadata.
 */
app.post('/extract', async (c) => {
  const body = await c.req.json();
  const url = body?.url;

  if (!url || typeof url !== 'string') {
    return c.json({ error: 'Missing or invalid url field' }, 400);
  }

  // Validate URL format
  try {
    new URL(url);
  } catch {
    return c.json({ error: 'Invalid URL format' }, 400);
  }

  let html: string;
  try {
    const resp = await fetch(url, {
      headers: {
        'User-Agent':
          'VibeSpace-MetadataBot/1.0 (+https://vibespace.app)',
        Accept: 'text/html,application/xhtml+xml',
      },
      signal: AbortSignal.timeout(10_000),
    });
    if (!resp.ok) {
      return c.json(
        { error: `Failed to fetch URL: HTTP ${resp.status}` },
        502,
      );
    }
    html = await resp.text();
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Unknown fetch error';
    return c.json({ error: `Failed to fetch URL: ${message}` }, 502);
  }

  const $ = cheerio.load(html);

  // Priority extraction: JSON-LD > Open Graph > Fallback
  const jsonLd = extractJsonLd($);
  const og = extractOpenGraph($);
  const fallback = extractFallback($);

  const merged: ExtractedMetadata = {
    title: jsonLd?.title || og?.title || fallback.title || '',
    description:
      jsonLd?.description || og?.description || fallback.description || '',
    image_url:
      jsonLd?.image_url || og?.image_url || fallback.image_url || null,
    price: jsonLd?.price ?? og?.price ?? fallback.price ?? null,
    currency:
      jsonLd?.currency || og?.currency || fallback.currency || 'USD',
    source: jsonLd ? 'json-ld' : og ? 'open-graph' : 'fallback',
    affiliate: lookupAffiliate(url),
    raw_url: url,
  };

  return c.json(merged);
});

export default app;
