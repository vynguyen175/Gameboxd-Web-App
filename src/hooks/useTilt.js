import { useRef, useCallback, useEffect } from 'react';

export default function useTilt({ maxTilt = 8, scale = 1.02, speed = 400 } = {}) {
  const ref = useRef(null);
  const animationRef = useRef(null);

  const handleMouseMove = useCallback((e) => {
    const el = ref.current;
    if (!el) return;

    if (animationRef.current) cancelAnimationFrame(animationRef.current);

    animationRef.current = requestAnimationFrame(() => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -maxTilt;
      const rotateY = ((x - centerX) / centerX) * maxTilt;

      el.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${scale}, ${scale}, ${scale})`;
      el.style.transition = `transform ${speed * 0.1}ms ease`;
    });
  }, [maxTilt, scale, speed]);

  const handleMouseLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    el.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    el.style.transition = `transform ${speed}ms cubic-bezier(0.34, 1.56, 0.64, 1)`;
  }, [speed]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Disable tilt on touch devices
    const isTouch = window.matchMedia('(hover: none)').matches;
    if (isTouch) return;

    el.addEventListener('mousemove', handleMouseMove);
    el.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      el.removeEventListener('mousemove', handleMouseMove);
      el.removeEventListener('mouseleave', handleMouseLeave);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [handleMouseMove, handleMouseLeave]);

  return ref;
}
