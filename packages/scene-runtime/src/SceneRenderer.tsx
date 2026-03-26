import React, { useState, useCallback, useMemo, useRef, useEffect, CSSProperties } from 'react';
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
  const [scale, setScale] = useState(1);
  const outerRef = useRef<HTMLDivElement>(null);

  const { width: baseW, height: baseH } = config.template;

  useEffect(() => {
    function updateScale() {
      if (!outerRef.current) return;
      const rect = outerRef.current.getBoundingClientRect();
      setScale(rect.width / baseW);
    }
    updateScale();
    const ro = new ResizeObserver(updateScale);
    if (outerRef.current) ro.observe(outerRef.current);
    return () => ro.disconnect();
  }, [baseW]);

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

  const outerStyle = useMemo<CSSProperties>(() => ({
    position: 'relative',
    width: '100%',
    aspectRatio: `${baseW} / ${baseH}`,
    overflow: 'hidden',
    background: '#000',
  }), [baseW, baseH]);

  const innerStyle = useMemo<CSSProperties>(() => ({
    position: 'absolute',
    inset: 0,
    width: baseW,
    height: baseH,
    transform: `scale(${scale})`,
    transformOrigin: 'top left',
  }), [baseW, baseH, scale]);

  const bgImgStyle = useMemo<CSSProperties>(() => ({
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
    zIndex: 0,
  }), []);

  return (
    <div ref={outerRef} style={outerStyle}>
      <div style={innerStyle}>
        {/* Background */}
        <img
          src={config.template.background_url}
          alt={config.identity.title}
          style={bgImgStyle}
          draggable={false}
        />

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
          width={baseW}
          height={baseH}
        />
      </div>

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
