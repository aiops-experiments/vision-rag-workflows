'use client';

import { useRef, useEffect, useCallback } from 'react';

interface Particle {
  x: number;
  y: number;
  radius: number;
  opacity: number;
  vx: number;
  vy: number;
  wobbleOffset: number;
  wobbleSpeed: number;
}

interface Props {
  /** Number of particles (default 30) */
  count?: number;
  className?: string;
}

/**
 * Canvas-based ambient particle animation inspired by eden.so.
 * Renders small luminous sage-green dots that drift slowly, creating
 * a "firefly in a garden" atmosphere.
 */
export default function ParticleBackground({ count = 30, className = '' }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const sizeRef = useRef({ w: 0, h: 0 });

  const createParticle = useCallback((w: number, h: number): Particle => ({
    x: Math.random() * w,
    y: Math.random() * h,
    radius: 1 + Math.random() * 2,               // 1–3px
    opacity: 0.15 + Math.random() * 0.2,          // 0.15–0.35
    vx: (Math.random() - 0.5) * 0.3,              // slow horizontal drift
    vy: -(0.1 + Math.random() * 0.3),             // slow upward drift
    wobbleOffset: Math.random() * Math.PI * 2,
    wobbleSpeed: 0.002 + Math.random() * 0.003,
  }), []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;

    function resize() {
      const parent = canvas!.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas!.width = rect.width * dpr;
      canvas!.height = rect.height * dpr;
      canvas!.style.width = `${rect.width}px`;
      canvas!.style.height = `${rect.height}px`;
      ctx!.scale(dpr, dpr);
      sizeRef.current = { w: rect.width, h: rect.height };
    }

    function initParticles() {
      const { w, h } = sizeRef.current;
      particlesRef.current = Array.from({ length: count }, () => createParticle(w, h));
    }

    function animate() {
      const { w, h } = sizeRef.current;
      if (!ctx || w === 0) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      ctx.clearRect(0, 0, w, h);
      time++;

      for (const p of particlesRef.current) {
        // Update position with drift + sinusoidal wobble
        const wobble = Math.sin(time * p.wobbleSpeed + p.wobbleOffset) * 0.3;
        p.x += p.vx + wobble;
        p.y += p.vy;

        // Wrap around edges
        if (p.x < -5) p.x = w + 5;
        if (p.x > w + 5) p.x = -5;
        if (p.y < -5) p.y = h + 5;
        if (p.y > h + 5) p.y = -5;

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(209, 213, 219, ${p.opacity})`;
        ctx.fill();
      }

      animationRef.current = requestAnimationFrame(animate);
    }

    // Initial setup
    resize();
    initParticles();
    animate();

    // Observe container resize
    const observer = new ResizeObserver(() => {
      resize();
    });
    if (canvas.parentElement) {
      observer.observe(canvas.parentElement);
    }

    return () => {
      cancelAnimationFrame(animationRef.current);
      observer.disconnect();
    };
  }, [count, createParticle]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{ zIndex: 0 }}
    />
  );
}
