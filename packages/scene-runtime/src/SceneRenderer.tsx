import React, { useState, useCallback, useMemo, CSSProperties } from 'react';
import type { SceneConfig } from '@vibespace/schema';
import { useParallax } from './useParallax';
import { LayerRenderer } from './LayerRenderer';
import { ProductPanel } from './ProductPanel';
import { AtmosphereOverlay } from './AtmosphereOverlay';

export interface SceneRendererProps {
  config: SceneConfig;
  onProductClick?: (productId: string) => void;
}

export const SceneRenderer: React.FC<SceneRendererProps> = ({
  config,
  onProductClick,
}) => {
  const parallaxOffset = useParallax();
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  const productMap = useMemo(() => {
    const map = new Map<string, SceneConfig['products'][0]>();
    for (const p of config.products) {
      map.set(p.product_id, p);
    }
    return map;
  }, [config.products]);

  const selectedProduct = selectedProductId
    ? productMap.get(selectedProductId) ?? null
    : null;

  const handleLayerClick = useCallback(
    (productId: string) => {
      setSelectedProductId(productId);
      onProductClick?.(productId);
    },
    [onProductClick]
  );

  const handlePanelClose = useCallback(() => {
    setSelectedProductId(null);
  }, []);

  const sortedLayers = useMemo(
    () => [...config.layers].sort((a, b) => a.z_index - b.z_index),
    [config.layers]
  );

  const containerStyle = useMemo<CSSProperties>(() => ({
    position: 'relative',
    width: '100%',
    aspectRatio: `${config.template.width} / ${config.template.height}`,
    overflow: 'hidden',
    background: '#000',
  }), [config.template.width, config.template.height]);

  const bgStyle = useMemo<CSSProperties>(() => ({
    position: 'absolute',
    inset: 0,
    zIndex: 0,
  }), []);

  const bgImgStyle = useMemo<CSSProperties>(() => ({
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
  }), []);

  return (
    <div style={containerStyle}>
      {/* Background */}
      <div style={bgStyle}>
        <img
          src={config.template.background_url}
          alt={config.identity.title}
          style={bgImgStyle}
          draggable={false}
        />
      </div>

      {/* Layers */}
      {sortedLayers.map((layer) => {
        const product = layer.product_id
          ? productMap.get(layer.product_id)
          : undefined;

        return (
          <LayerRenderer
            key={layer.id}
            layer={layer}
            parallaxOffset={parallaxOffset}
            product={product}
            onClick={
              layer.interactive && layer.product_id
                ? () => handleLayerClick(layer.product_id!)
                : undefined
            }
          />
        );
      })}

      {/* Atmosphere */}
      <AtmosphereOverlay
        animation={config.scene_animation}
        width={config.template.width}
        height={config.template.height}
      />

      {/* Product Panel */}
      <ProductPanel
        product={selectedProduct}
        panelConfig={config.product_panel}
        onClose={handlePanelClose}
      />
    </div>
  );
};

export default SceneRenderer;
