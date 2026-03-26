'use client';

import React, { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import type { SceneConfig } from '@vibespace/schema';
import { SceneRenderer } from '@vibespace/scene-runtime';
import { fetchDemoScene } from '@/lib/api';

/* ------------------------------------------------------------------ */
/*  Hardcoded fallback scene — Hobbit merchant shop                   */
/* ------------------------------------------------------------------ */

const DEMO_CREATOR_ID = '00000000-0000-0000-0000-000000000001';
const DEMO_SPACE_ID = '00000000-0000-0000-0000-000000000010';

const products = [
  { tag: 'journal',  name: 'Leather Journal',    price: 24.99 },
  { tag: 'mug',      name: 'Ceramic Mug',        price: 18.50 },
  { tag: 'compass',  name: 'Brass Compass',       price: 42.00 },
  { tag: 'candle',   name: 'Beeswax Candle',      price: 12.75 },
  { tag: 'basket',   name: 'Woven Basket',        price: 34.00 },
  { tag: 'pipe',     name: 'Carved Pipe',         price: 28.00 },
  { tag: 'tea',      name: 'Herbal Tea Tin',      price: 15.99 },
  { tag: 'goblet',   name: 'Copper Goblet',       price: 38.50 },
] as const;

function pid(i: number) {
  return `00000000-0000-0000-0000-0000000001${String(i).padStart(2, '0')}`;
}

function slotId(i: number) {
  return `slot-${i + 1}`;
}

/* Arrange products in 2 rows of 4 across a 1920x1080 canvas */
function slotPosition(i: number) {
  const col = i % 4;
  const row = Math.floor(i / 4);
  return {
    x: 160 + col * 420,
    y: 300 + row * 360,
  };
}

const FALLBACK_CONFIG: SceneConfig = {
  id: DEMO_SPACE_ID,
  identity: {
    creator_id: DEMO_CREATOR_ID,
    creator_name: 'Hobbit Merchant',
    title: "The Hobbit's Merchant Shop",
    description: 'A cozy hobbit-hole shop filled with handcrafted wares.',
  },
  template: {
    background_url:
      'https://placehold.co/1920x1080/3d2b1f/f5e6c8?text=Hobbit+Shop',
    width: 1920,
    height: 1080,
    lighting: {
      warmth: 75,
      brightness: 55,
      contrast: 40,
      atmosphere: 'medium',
    },
  },
  slots: products.map((_, i) => {
    const pos = slotPosition(i);
    return {
      id: slotId(i),
      label: `Shelf ${i + 1}`,
      x: pos.x,
      y: pos.y,
      width: 300,
      height: 300,
      z_index: 10 + i,
      parallax_multiplier: 0,
      surface_type: 'mid' as const,
      accepts: [],
    };
  }),
  layers: products.map((p, i) => {
    const pos = slotPosition(i);
    return {
      id: `layer-product-${i}`,
      type: 'product' as const,
      asset_url: `https://placehold.co/300x300/8B7355/F5E6C8?text=${encodeURIComponent(p.name.replace(' ', '+'))}`,
      x: pos.x,
      y: pos.y,
      width: 300,
      height: 300,
      z_index: 10 + i,
      parallax_multiplier: 0,
      opacity: 1,
      blend_mode: 'normal',
      product_id: pid(i),
      slot_id: slotId(i),
      interactive: true,
    };
  }),
  products: products.map((p, i) => ({
    product_id: pid(i),
    slot_id: slotId(i),
    name: p.name,
    description: `A finely crafted ${p.name.toLowerCase()} from the Shire.`,
    price: p.price,
    currency: 'USD',
    redirect_url: '#',
    sprite_url: `https://placehold.co/300x300/8B7355/F5E6C8?text=${encodeURIComponent(p.name.replace(' ', '+'))}`,
    source_store: '',
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
    particle_density: 25,
    ambient_movement: false,
  },
};

/* ------------------------------------------------------------------ */
/*  Styles                                                             */
/* ------------------------------------------------------------------ */

const wrapperStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100vh',
  background: '#1a1a1a',
};

const titleBarStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '0.75rem 1.5rem',
  background: '#3d2b1f',
  borderBottom: '2px solid #8b7355',
  flexShrink: 0,
};

const titleStyle: CSSProperties = {
  fontSize: '1.1rem',
  color: '#f5e6c8',
  fontFamily: 'Georgia, serif',
  letterSpacing: '0.05em',
};

const sceneWrapperStyle: CSSProperties = {
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '1rem',
  overflow: 'hidden',
};

const sceneContainerStyle: CSSProperties = {
  width: '100%',
  maxWidth: '1400px',
};

const loadingStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100vh',
  color: '#c8a96e',
  fontFamily: 'Georgia, serif',
  fontSize: '1.25rem',
};

const errorBannerStyle: CSSProperties = {
  textAlign: 'center',
  padding: '0.5rem',
  background: '#5a3a1a',
  color: '#c8a96e',
  fontSize: '0.8rem',
  borderBottom: '1px solid #8b7355',
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function DemoPage() {
  const [config, setConfig] = useState<SceneConfig | null>(null);
  const [usedFallback, setUsedFallback] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const scene = await fetchDemoScene();
        if (!cancelled) {
          setConfig(scene);
        }
      } catch {
        if (!cancelled) {
          setConfig(FALLBACK_CONFIG);
          setUsedFallback(true);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return <div style={loadingStyle}>Loading the shop&hellip;</div>;
  }

  if (!config) {
    return <div style={loadingStyle}>Something went wrong.</div>;
  }

  return (
    <div style={wrapperStyle}>
      <header style={titleBarStyle}>
        <span style={titleStyle}>
          The Hobbit&rsquo;s Merchant Shop &mdash; A Vibespace Demo
        </span>
      </header>

      {usedFallback && (
        <div style={errorBannerStyle}>
          API unavailable — showing built-in demo scene
        </div>
      )}

      <main style={sceneWrapperStyle}>
        <div style={sceneContainerStyle}>
          <SceneRenderer config={config} />
        </div>
      </main>
    </div>
  );
}
