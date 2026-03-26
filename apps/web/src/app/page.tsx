import Link from 'next/link';
import type { CSSProperties } from 'react';

const containerStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '100vh',
  padding: '2rem',
  textAlign: 'center',
  background: 'radial-gradient(ellipse at center, #2a2018 0%, #1a1a1a 70%)',
};

const logoStyle: CSSProperties = {
  fontSize: '4rem',
  fontFamily: 'Georgia, serif',
  color: '#f5e6c8',
  letterSpacing: '0.15em',
  marginBottom: '0.5rem',
  fontWeight: 'normal',
};

const taglineStyle: CSSProperties = {
  fontSize: '1.25rem',
  color: '#c8a96e',
  fontStyle: 'italic',
  marginBottom: '3rem',
  maxWidth: '400px',
};

const dividerStyle: CSSProperties = {
  width: '120px',
  height: '1px',
  background: 'linear-gradient(to right, transparent, #8b7355, transparent)',
  marginBottom: '3rem',
};

const linkStyle: CSSProperties = {
  display: 'inline-block',
  padding: '0.875rem 2.5rem',
  background: 'transparent',
  color: '#c8a96e',
  border: '2px solid #8b7355',
  borderRadius: '4px',
  fontSize: '1rem',
  fontFamily: 'Georgia, serif',
  letterSpacing: '0.1em',
  textTransform: 'uppercase' as const,
  transition: 'all 0.3s ease',
  textDecoration: 'none',
};

const subtextStyle: CSSProperties = {
  marginTop: '3rem',
  fontSize: '0.85rem',
  color: '#8b7355',
};

export default function HomePage() {
  return (
    <main style={containerStyle}>
      <h1 style={logoStyle}>Vibespace</h1>
      <p style={taglineStyle}>Build your world. Sell what&apos;s in it.</p>
      <div style={dividerStyle} />
      <Link href="/demo" style={linkStyle}>
        Enter the Shop
      </Link>
      <p style={subtextStyle}>
        A new way to showcase and sell products in immersive spaces.
      </p>
    </main>
  );
}
