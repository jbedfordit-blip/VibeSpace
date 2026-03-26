import React, { useEffect, useState, useRef, useCallback, CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import type { SceneConfig, ProductPanelConfig } from '@vibespace/schema';

type Product = SceneConfig['products'][0];

export interface ProductPanelProps {
  product: Product | null;
  panelConfig: ProductPanelConfig;
  onClose: () => void;
}

const TRANSITION_MS = 150;
const MOBILE_BREAKPOINT = 768;

export const ProductPanel: React.FC<ProductPanelProps> = ({
  product,
  panelConfig,
  onClose,
}) => {
  const [visible, setVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < MOBILE_BREAKPOINT : false
  );
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Animate in when product is set
  useEffect(() => {
    if (product) {
      // Force a frame so the initial off-screen position is painted before transition
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setVisible(true));
      });
    } else {
      setVisible(false);
    }
  }, [product]);

  // Close on click outside
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    },
    [onClose]
  );

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (product) {
      window.addEventListener('keydown', handleKey);
      return () => window.removeEventListener('keydown', handleKey);
    }
  }, [product, onClose]);

  if (!product) return null;

  const formatPrice = (price: number, currency: string) => {
    try {
      return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(price);
    } catch {
      return `${currency} ${price.toFixed(2)}`;
    }
  };

  const backdropStyle: CSSProperties = {
    position: 'fixed',
    inset: 0,
    zIndex: 10000,
    background: 'rgba(0, 0, 0, 0.4)',
    opacity: visible ? 1 : 0,
    transition: `opacity ${TRANSITION_MS}ms ease-out`,
  };

  const panelStyle: CSSProperties = isMobile
    ? {
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 10001,
        transform: visible ? 'translateY(0)' : 'translateY(100%)',
        transition: `transform ${TRANSITION_MS}ms ease-out`,
        maxHeight: '80vh',
        overflowY: 'auto',
        borderRadius: '16px 16px 0 0',
        background: panelConfig.background_color,
        color: panelConfig.text_color,
        fontFamily: panelConfig.font_family,
        border: panelConfig.border_style,
        borderBottom: 'none',
        padding: 24,
        boxShadow: '0 -4px 30px rgba(0,0,0,0.3)',
      }
    : {
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        zIndex: 10001,
        width: 400,
        maxWidth: '100vw',
        transform: visible ? 'translateX(0)' : 'translateX(100%)',
        transition: `transform ${TRANSITION_MS}ms ease-out`,
        overflowY: 'auto',
        background: panelConfig.background_color,
        color: panelConfig.text_color,
        fontFamily: panelConfig.font_family,
        border: panelConfig.border_style,
        borderRight: 'none',
        padding: 32,
        boxShadow: '-4px 0 30px rgba(0,0,0,0.3)',
      };

  const closeButtonStyle: CSSProperties = {
    position: 'absolute',
    top: 12,
    right: 12,
    background: 'none',
    border: 'none',
    fontSize: 24,
    cursor: 'pointer',
    color: panelConfig.text_color,
    lineHeight: 1,
    padding: '4px 8px',
    borderRadius: 4,
    opacity: 0.7,
    transition: `opacity ${TRANSITION_MS}ms ease-out`,
  };

  const headingStyle: CSSProperties = {
    margin: '0 0 8px',
    fontSize: 24,
    fontWeight: 700,
    fontFamily: panelConfig.font_family,
  };

  const sourceStyle: CSSProperties = {
    margin: '0 0 16px',
    fontSize: 13,
    opacity: 0.7,
    fontStyle: 'italic',
  };

  const descriptionStyle: CSSProperties = {
    margin: '0 0 20px',
    fontSize: 15,
    lineHeight: 1.6,
  };

  const priceStyle: CSSProperties = {
    fontSize: 28,
    fontWeight: 700,
    color: panelConfig.accent_color,
    margin: '0 0 24px',
  };

  const buyButtonStyle: CSSProperties = {
    display: 'block',
    width: '100%',
    padding: '14px 0',
    fontSize: 16,
    fontWeight: 700,
    fontFamily: panelConfig.font_family,
    background: panelConfig.accent_color,
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
    textAlign: 'center',
    letterSpacing: 0.5,
    transition: `opacity ${TRANSITION_MS}ms ease-out`,
  };

  const panel = (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    <div style={backdropStyle} onClick={handleBackdropClick}>
      <div ref={panelRef} style={panelStyle} role="dialog" aria-label={product.name}>
        <button
          style={closeButtonStyle}
          onClick={onClose}
          aria-label="Close panel"
          onMouseEnter={(e) => { (e.currentTarget.style.opacity = '1'); }}
          onMouseLeave={(e) => { (e.currentTarget.style.opacity = '0.7'); }}
        >
          &times;
        </button>

        <h2 style={headingStyle}>{product.name}</h2>

        {product.source_store && (
          <p style={sourceStyle}>from {product.source_store}</p>
        )}

        {product.description && (
          <p style={descriptionStyle}>{product.description}</p>
        )}

        <p style={priceStyle}>
          {formatPrice(product.price, product.currency)}
        </p>

        <button
          style={buyButtonStyle}
          onClick={() => window.open(product.redirect_url, '_blank', 'noopener')}
          onMouseEnter={(e) => { (e.currentTarget.style.opacity = '0.85'); }}
          onMouseLeave={(e) => { (e.currentTarget.style.opacity = '1'); }}
        >
          View &amp; Buy
        </button>
      </div>
    </div>
  );

  return createPortal(panel, document.body);
};

export default ProductPanel;
