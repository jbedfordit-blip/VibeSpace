import React, { useMemo, CSSProperties } from 'react';
import type { SceneAnimation } from '@vibespace/schema';

export interface AtmosphereOverlayProps {
  animation: SceneAnimation;
  width: number;
  height: number;
}

// Generate a unique keyframe name to inject once
const KEYFRAME_ID = 'vibespace-dust-float';
let stylesInjected = false;

function injectKeyframes() {
  if (stylesInjected || typeof document === 'undefined') return;
  stylesInjected = true;

  const sheet = document.createElement('style');
  sheet.textContent = `
@keyframes ${KEYFRAME_ID} {
  0% {
    transform: translate(0, 0) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translate(var(--dx), var(--dy)) rotate(360deg);
    opacity: 0;
  }
}
@keyframes vibespace-sparkle {
  0%, 100% { opacity: 0; transform: scale(0.5); }
  50% { opacity: 1; transform: scale(1.2); }
}
@keyframes vibespace-smoke {
  0% {
    transform: translateY(0) scale(1);
    opacity: 0.6;
  }
  100% {
    transform: translateY(-80px) scale(2);
    opacity: 0;
  }
}
`;
  document.head.appendChild(sheet);
}

function buildParticles(
  animation: SceneAnimation,
  width: number,
  height: number,
): React.ReactNode[] {
  if (!animation.particles || animation.particle_type === 'none') return [];

  injectKeyframes();

  const count = Math.max(1, Math.round(animation.particle_density * 0.4));
  const particles: React.ReactNode[] = [];

  for (let i = 0; i < count; i++) {
    const left = Math.random() * 100;
    const top = Math.random() * 100;
    const duration = 6 + Math.random() * 10;
    const delay = Math.random() * duration;
    const dx = (Math.random() - 0.5) * 120;
    const dy = (Math.random() - 0.5) * 80 - 40; // bias upward

    let size: number;
    let background: string;
    let animationName: string;
    let borderRadius = '50%';

    switch (animation.particle_type) {
      case 'sparkle':
        size = 2 + Math.random() * 3;
        background = 'rgba(255, 248, 220, 0.9)';
        animationName = 'vibespace-sparkle';
        break;
      case 'smoke':
        size = 8 + Math.random() * 16;
        background = 'rgba(180, 170, 155, 0.25)';
        animationName = 'vibespace-smoke';
        break;
      case 'dust':
      default:
        size = 1.5 + Math.random() * 2.5;
        background = 'rgba(210, 190, 160, 0.6)';
        animationName = KEYFRAME_ID;
        break;
    }

    const style: CSSProperties & Record<string, string | number> = {
      position: 'absolute',
      left: `${left}%`,
      top: `${top}%`,
      width: size,
      height: size,
      borderRadius,
      background,
      pointerEvents: 'none',
      animation: `${animationName} ${duration}s ${delay}s infinite`,
      willChange: 'transform, opacity',
      '--dx': `${dx}px`,
      '--dy': `${dy}px`,
    } as CSSProperties;

    particles.push(<div key={`particle-${i}`} style={style} />);
  }

  return particles;
}

export const AtmosphereOverlay: React.FC<AtmosphereOverlayProps> = ({
  animation,
  width,
  height,
}) => {
  const vignetteStyle = useMemo<CSSProperties>(() => ({
    position: 'absolute',
    inset: 0,
    zIndex: 9000,
    pointerEvents: 'none',
    background: 'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.45) 100%)',
  }), []);

  const particleContainerStyle = useMemo<CSSProperties>(() => ({
    position: 'absolute',
    inset: 0,
    zIndex: 9001,
    pointerEvents: 'none',
    overflow: 'hidden',
  }), []);

  const particles = useMemo(
    () => buildParticles(animation, width, height),
    [animation, width, height]
  );

  return (
    <>
      <div style={vignetteStyle} aria-hidden="true" />
      {particles.length > 0 && (
        <div style={particleContainerStyle} aria-hidden="true">
          {particles}
        </div>
      )}
    </>
  );
};

export default AtmosphereOverlay;
