'use client';

import React, { useState, useEffect, type CSSProperties, type FormEvent } from 'react';
import {
  fetchProducts,
  createProduct,
  extractMetadata,
  fetchAnalytics,
  type AnalyticsData,
} from '@/lib/api';
import type { ProductRecord, PipelineStatus } from '@vibespace/schema';

/* ------------------------------------------------------------------ */
/*  Theme constants                                                    */
/* ------------------------------------------------------------------ */

const BG_DARK = '#1a1a1a';
const BG_PANEL = '#2a2018';
const BG_PARCHMENT = '#f5e6c8';
const TEXT_LIGHT = '#f5e6c8';
const TEXT_DARK = '#3d2b1f';
const ACCENT = '#c8a96e';
const BORDER = '#8b7355';

/* ------------------------------------------------------------------ */
/*  Shared styles                                                      */
/* ------------------------------------------------------------------ */

const pageStyle: CSSProperties = {
  padding: '2rem',
  maxWidth: '1200px',
  margin: '0 auto',
  fontFamily: 'Georgia, serif',
  color: TEXT_LIGHT,
};

const sectionStyle: CSSProperties = {
  marginBottom: '2.5rem',
};

const sectionTitleStyle: CSSProperties = {
  fontSize: '1.4rem',
  color: ACCENT,
  borderBottom: `1px solid ${BORDER}`,
  paddingBottom: '0.5rem',
  marginBottom: '1rem',
};

const cardStyle: CSSProperties = {
  background: BG_PANEL,
  border: `1px solid ${BORDER}`,
  borderRadius: '6px',
  padding: '1rem 1.25rem',
  marginBottom: '0.75rem',
};

const inputStyle: CSSProperties = {
  display: 'block',
  width: '100%',
  padding: '0.5rem 0.75rem',
  marginBottom: '0.75rem',
  background: '#1a1a1a',
  border: `1px solid ${BORDER}`,
  borderRadius: '4px',
  color: TEXT_LIGHT,
  fontFamily: 'Georgia, serif',
  fontSize: '0.9rem',
};

const labelStyle: CSSProperties = {
  display: 'block',
  marginBottom: '0.25rem',
  fontSize: '0.85rem',
  color: ACCENT,
};

const buttonStyle: CSSProperties = {
  padding: '0.6rem 1.5rem',
  background: 'transparent',
  color: ACCENT,
  border: `2px solid ${BORDER}`,
  borderRadius: '4px',
  fontFamily: 'Georgia, serif',
  fontSize: '0.9rem',
  cursor: 'pointer',
  letterSpacing: '0.05em',
};

const tabBarStyle: CSSProperties = {
  display: 'flex',
  gap: '0',
  marginBottom: '1rem',
};

function tabStyle(active: boolean): CSSProperties {
  return {
    padding: '0.5rem 1.25rem',
    background: active ? BG_PANEL : 'transparent',
    color: active ? ACCENT : BORDER,
    border: `1px solid ${BORDER}`,
    borderBottom: active ? `1px solid ${BG_PANEL}` : `1px solid ${BORDER}`,
    cursor: 'pointer',
    fontFamily: 'Georgia, serif',
    fontSize: '0.85rem',
  };
}

const badgeColors: Record<string, { bg: string; color: string }> = {
  pending: { bg: '#6b5b3e', color: TEXT_LIGHT },
  processing: { bg: '#7a6a2e', color: TEXT_LIGHT },
  ready: { bg: '#3e6b4a', color: TEXT_LIGHT },
  flagged: { bg: '#8b4040', color: TEXT_LIGHT },
  error: { bg: '#8b2020', color: TEXT_LIGHT },
};

function badgeStyle(status: string): CSSProperties {
  const c = badgeColors[status] || badgeColors.pending;
  return {
    display: 'inline-block',
    padding: '0.15rem 0.6rem',
    borderRadius: '3px',
    fontSize: '0.75rem',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    background: c.bg,
    color: c.color,
    letterSpacing: '0.04em',
  };
}

const gridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
  gap: '1rem',
};

const placeholderStyle: CSSProperties = {
  color: BORDER,
  fontStyle: 'italic',
  padding: '1rem 0',
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

type AddTab = 'direct' | 'url' | 'feed';

export default function DashboardPage() {
  /* State */
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [addTab, setAddTab] = useState<AddTab>('direct');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  /* Direct upload form */
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [destinationUrl, setDestinationUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  /* URL extract form */
  const [extractUrl, setExtractUrl] = useState('');

  /* API/Feed form */
  const [feedUrl, setFeedUrl] = useState('');

  /* Fetch data on mount */
  useEffect(() => {
    async function load() {
      try {
        const [prods, stats] = await Promise.allSettled([
          fetchProducts(),
          fetchAnalytics(),
        ]);
        if (prods.status === 'fulfilled') setProducts(prods.value);
        if (stats.status === 'fulfilled') setAnalytics(stats.value);
      } catch {
        /* API may not be running */
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  /* Handlers */
  async function handleDirectSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');
    try {
      const product = await createProduct({
        name,
        description,
        price: parseFloat(price) || 0,
        currency: 'USD',
        destination_url: destinationUrl,
        image_url: imageUrl || undefined,
        creator_id: '00000000-0000-0000-0000-000000000001',
      });
      setProducts((prev) => [...prev, product]);
      setMessage(`Product "${product.name}" created.`);
      setName('');
      setDescription('');
      setPrice('');
      setDestinationUrl('');
      setImageUrl('');
    } catch (err) {
      setMessage(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleExtract(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');
    try {
      const meta = await extractMetadata(extractUrl);
      setMessage(
        `Extracted: ${meta.name} — $${meta.price}. Switch to Direct Upload to refine and save.`
      );
      setName(meta.name);
      setDescription(meta.description);
      setPrice(String(meta.price));
      setImageUrl(meta.image_url);
      setDestinationUrl(meta.source_url);
      setAddTab('direct');
    } catch (err) {
      setMessage(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleFeed(e: FormEvent) {
    e.preventDefault();
    setMessage('Feed import is not yet available. Coming soon.');
  }

  /* Click count lookup helper */
  function clicksFor(productId: string): number {
    if (!analytics) return 0;
    const entry = analytics.products.find((p) => p.product_id === productId);
    return entry?.clicks ?? 0;
  }

  return (
    <div style={pageStyle}>
      {/* ------ My Spaces ------ */}
      <section style={sectionStyle}>
        <h2 style={sectionTitleStyle}>My Spaces</h2>
        <div style={cardStyle}>
          <p style={placeholderStyle}>
            No custom spaces yet. Visit the{' '}
            <a href="/demo" style={{ color: ACCENT }}>
              demo
            </a>{' '}
            to see an example.
          </p>
        </div>
      </section>

      {/* ------ My Products ------ */}
      <section style={sectionStyle}>
        <h2 style={sectionTitleStyle}>My Products</h2>
        {loading ? (
          <p style={placeholderStyle}>Loading products&hellip;</p>
        ) : products.length === 0 ? (
          <p style={placeholderStyle}>
            No products yet. Add one below.
          </p>
        ) : (
          <div style={gridStyle}>
            {products.map((p) => (
              <div key={p.id} style={cardStyle}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'start',
                    marginBottom: '0.4rem',
                  }}
                >
                  <strong style={{ color: TEXT_LIGHT }}>{p.name}</strong>
                  <span style={badgeStyle(p.pipeline_status)}>
                    {p.pipeline_status}
                  </span>
                </div>
                <div style={{ fontSize: '0.85rem', color: BORDER }}>
                  ${p.price.toFixed(2)} {p.currency}
                </div>
                <div
                  style={{
                    fontSize: '0.8rem',
                    color: ACCENT,
                    marginTop: '0.3rem',
                  }}
                >
                  {clicksFor(p.id)} clicks
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ------ Add Product ------ */}
      <section style={sectionStyle}>
        <h2 style={sectionTitleStyle}>Add Product</h2>

        <div style={tabBarStyle}>
          <button
            style={tabStyle(addTab === 'direct')}
            onClick={() => setAddTab('direct')}
          >
            Direct Upload
          </button>
          <button
            style={tabStyle(addTab === 'url')}
            onClick={() => setAddTab('url')}
          >
            URL Extract
          </button>
          <button
            style={tabStyle(addTab === 'feed')}
            onClick={() => setAddTab('feed')}
          >
            API / Feed
          </button>
        </div>

        {message && (
          <div
            style={{
              padding: '0.6rem 1rem',
              marginBottom: '1rem',
              background: message.startsWith('Error') ? '#5a2020' : '#2a3a20',
              border: `1px solid ${message.startsWith('Error') ? '#8b4040' : '#4a6a3a'}`,
              borderRadius: '4px',
              fontSize: '0.85rem',
              color: TEXT_LIGHT,
            }}
          >
            {message}
          </div>
        )}

        {/* --- Direct Upload --- */}
        {addTab === 'direct' && (
          <form onSubmit={handleDirectSubmit} style={cardStyle}>
            <label style={labelStyle}>Product Name</label>
            <input
              style={inputStyle}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Leather Journal"
              required
            />

            <label style={labelStyle}>Description</label>
            <textarea
              style={{ ...inputStyle, minHeight: '70px', resize: 'vertical' }}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A hand-bound journal with aged parchment pages."
            />

            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Price (USD)</label>
                <input
                  style={inputStyle}
                  type="number"
                  step="0.01"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="24.99"
                  required
                />
              </div>
              <div style={{ flex: 2 }}>
                <label style={labelStyle}>Destination URL</label>
                <input
                  style={inputStyle}
                  value={destinationUrl}
                  onChange={(e) => setDestinationUrl(e.target.value)}
                  placeholder="https://store.example.com/product/123"
                  required
                />
              </div>
            </div>

            <label style={labelStyle}>Image URL</label>
            <input
              style={inputStyle}
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/images/journal.jpg"
            />

            <button type="submit" style={buttonStyle} disabled={submitting}>
              {submitting ? 'Saving...' : 'Add Product'}
            </button>
          </form>
        )}

        {/* --- URL Extract --- */}
        {addTab === 'url' && (
          <form onSubmit={handleExtract} style={cardStyle}>
            <label style={labelStyle}>Product Page URL</label>
            <input
              style={inputStyle}
              value={extractUrl}
              onChange={(e) => setExtractUrl(e.target.value)}
              placeholder="https://www.amazon.com/dp/B08XYZ..."
              required
            />
            <p
              style={{
                fontSize: '0.8rem',
                color: BORDER,
                marginBottom: '0.75rem',
              }}
            >
              We will extract name, price, description, and image from the
              product page.
            </p>
            <button type="submit" style={buttonStyle} disabled={submitting}>
              {submitting ? 'Extracting...' : 'Extract Metadata'}
            </button>
          </form>
        )}

        {/* --- API / Feed --- */}
        {addTab === 'feed' && (
          <form onSubmit={handleFeed} style={cardStyle}>
            <label style={labelStyle}>Feed / API Endpoint</label>
            <input
              style={inputStyle}
              value={feedUrl}
              onChange={(e) => setFeedUrl(e.target.value)}
              placeholder="https://store.example.com/products.json"
            />
            <p
              style={{
                fontSize: '0.8rem',
                color: BORDER,
                marginBottom: '0.75rem',
              }}
            >
              Import products from a JSON feed or Shopify/WooCommerce API
              endpoint. (Coming soon)
            </p>
            <button type="submit" style={buttonStyle} disabled={submitting}>
              Import Feed
            </button>
          </form>
        )}
      </section>

      {/* ------ Analytics ------ */}
      <section style={sectionStyle}>
        <h2 style={sectionTitleStyle}>Analytics</h2>
        {!analytics ? (
          <div style={cardStyle}>
            <p style={placeholderStyle}>
              Analytics data unavailable. Connect the API to see click
              tracking.
            </p>
          </div>
        ) : (
          <>
            <div style={cardStyle}>
              <span style={{ color: ACCENT, fontSize: '2rem' }}>
                {analytics.total_clicks}
              </span>
              <span
                style={{
                  marginLeft: '0.75rem',
                  color: BORDER,
                  fontSize: '0.9rem',
                }}
              >
                total clicks
              </span>
            </div>
            {analytics.products.length > 0 && (
              <div style={gridStyle}>
                {analytics.products.map((p) => (
                  <div key={p.product_id} style={cardStyle}>
                    <strong style={{ color: TEXT_LIGHT }}>{p.name}</strong>
                    <div
                      style={{
                        fontSize: '0.85rem',
                        color: ACCENT,
                        marginTop: '0.25rem',
                      }}
                    >
                      {p.clicks} clicks
                    </div>
                    <div style={{ fontSize: '0.75rem', color: BORDER }}>
                      Last click: {new Date(p.last_click).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
