import { useEffect, useRef, useState, useCallback } from 'react';

export interface ParallaxOffset {
  offsetX: number;
  offsetY: number;
}

const DAMPING = 0.08;

export function useParallax(): ParallaxOffset {
  const [offset, setOffset] = useState<ParallaxOffset>({ offsetX: 0, offsetY: 0 });
  const targetRef = useRef({ x: 0, y: 0 });
  const currentRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number>(0);

  const animate = useCallback(() => {
    const dx = targetRef.current.x - currentRef.current.x;
    const dy = targetRef.current.y - currentRef.current.y;

    currentRef.current.x += dx * DAMPING;
    currentRef.current.y += dy * DAMPING;

    if (Math.abs(dx) > 0.001 || Math.abs(dy) > 0.001) {
      setOffset({
        offsetX: currentRef.current.x,
        offsetY: currentRef.current.y,
      });
    }

    rafRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      targetRef.current = { x, y };
    };

    const handleDeviceOrientation = (e: DeviceOrientationEvent) => {
      const gamma = e.gamma ?? 0; // left-right tilt [-90, 90]
      const beta = e.beta ?? 0;   // front-back tilt [-180, 180]
      const x = Math.max(-1, Math.min(1, gamma / 45));
      const y = Math.max(-1, Math.min(1, (beta - 45) / 45));
      targetRef.current = { x, y };
    };

    const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    if (isMobile) {
      window.addEventListener('deviceorientation', handleDeviceOrientation);
    } else {
      window.addEventListener('mousemove', handleMouseMove);
    }

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (isMobile) {
        window.removeEventListener('deviceorientation', handleDeviceOrientation);
      } else {
        window.removeEventListener('mousemove', handleMouseMove);
      }
      cancelAnimationFrame(rafRef.current);
    };
  }, [animate]);

  return offset;
}

export default useParallax;
