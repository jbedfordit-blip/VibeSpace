import React, { useState, useMemo, CSSProperties } from 'react';
import type { Layer, SceneConfig } from '@vibespace/schema';
import type { ParallaxOffset } from './useParallax';

type Product = SceneConfig['products'][0];

export interface LayerRendererProps {
  layer: Layer;
  parallaxOffset: ParallaxOffset;
  product?: Product;
  onClick?: () => void;
}

const TRANSITION = '150ms ease-out';

export const LayerRenderer: React.FC<LayerRendererProps> = ({
  layer,
  parallaxOffset,
  product,
  onClick,
}) => {
  const [hovered, setHovered] = useState(false);

  const isInteractive = layer.type === 'product' && layer.interactive;

  const parallaxX = parallaxOffset.offsetX * layer.parallax_multiplier * 20;
  const parallaxY = parallaxOffset.offsetY * layer.parallax_multiplier * 20;

  const containerStyle = useMemo<CSSProperties>(() => {
    const hoverTransform = hovered && isInteractive
      ? 'translateY(-4px) scale(1.02)'
      : '';

    return {
      position: 'absolute',
      left: `${layer.x}px`,
      top: `${layer.y}px`,
      width: layer.width ? `${layer.width}px` : undefined,
      height: layer.height ? `${layer.height}px` : undefined,
      zIndex: layer.z_index,
      opacity: layer.opacity,
      mixBlendMode: layer.blend_mode as CSSProperties['mixBlendMode'],
      transform: `translate(${parallaxX}px, ${parallaxY}px) ${hoverTransform}`.trim(),
      transition: `transform ${TRANSITION}, box-shadow ${TRANSITION}`,
      cursor: isInteractive ? 'pointer' : 'default',
      boxShadow: hovered && isInteractive
        ? '0 8px 25px rgba(200, 169, 110, 0.6)'
        : 'none',
    };
  }, [layer, parallaxX, parallaxY, hovered, isInteractive]);

  const imageStyle = useMemo<CSSProperties>(() => ({
    display: 'block',
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const,
    pointerEvents: 'none' as const,
  }), []);

  const priceTagStyle = useMemo<CSSProperties>(() => ({
    position: 'absolute',
    top: -32,
    left: '50%',
    transform: 'translateX(-50%)',
    background: 'rgba(61, 43, 31, 0.9)',
    color: '#f5e6c8',
    padding: '4px 10px',
    borderRadius: 4,
    fontSize: 13,
    fontFamily: 'Georgia, serif',
    whiteSpace: 'nowrap',
    opacity: hovered && isInteractive ? 1 : 0,
    transition: `opacity ${TRANSITION}`,
    pointerEvents: 'none',
  }), [hovered, isInteractive]);

  const formatPrice = (price: number, currency: string) => {
    try {
      return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(price);
    } catch {
      return `${currency} ${price.toFixed(2)}`;
    }
  };

  return (
    <div
      style={containerStyle}
      onMouseEnter={isInteractive ? () => setHovered(true) : undefined}
      onMouseLeave={isInteractive ? () => setHovered(false) : undefined}
      onClick={isInteractive ? onClick : undefined}
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onKeyDown={isInteractive ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      } : undefined}
    >
      <img
        src={layer.asset_url}
        alt={product?.name ?? layer.id}
        style={imageStyle}
        draggable={false}
      />
      {isInteractive && product && (
        <div style={priceTagStyle}>
          {formatPrice(product.price, product.currency)}
        </div>
      )}
    </div>
  );
};

export default LayerRenderer;
