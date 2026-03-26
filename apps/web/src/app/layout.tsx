import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Vibespace',
  description: 'Build your world. Sell what\'s in it.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        style={{
          background: '#1a1a1a',
          fontFamily: 'Georgia, "Times New Roman", serif',
        }}
      >
        {children}
      </body>
    </html>
  );
}
