import Link from 'next/link';
import type { CSSProperties } from 'react';

const navStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '1.5rem',
  padding: '0.75rem 2rem',
  background: '#3d2b1f',
  borderBottom: '2px solid #8b7355',
  fontFamily: 'Georgia, serif',
};

const brandStyle: CSSProperties = {
  fontSize: '1.1rem',
  color: '#f5e6c8',
  fontWeight: 'normal',
  letterSpacing: '0.08em',
  marginRight: 'auto',
};

const linkStyle: CSSProperties = {
  color: '#c8a96e',
  fontSize: '0.9rem',
  textDecoration: 'none',
  letterSpacing: '0.04em',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <nav style={navStyle}>
        <span style={brandStyle}>Vibespace Dashboard</span>
        <Link href="/dashboard" style={linkStyle}>
          Dashboard
        </Link>
        <Link href="/demo" style={linkStyle}>
          Demo
        </Link>
        <Link href="/" style={linkStyle}>
          Home
        </Link>
      </nav>
      {children}
    </div>
  );
}
