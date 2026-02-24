'use client';

import { useEffect, useRef } from 'react';

/**
 * IntersectionObserver hook that adds 'visible' class when element enters viewport.
 * Pair with the `.eden-appear` CSS class for fade-in-up scroll animations.
 *
 * Usage:
 *   const ref = useScrollAppear<HTMLDivElement>();
 *   <div ref={ref} className="eden-appear">...</div>
 */
export function useScrollAppear<T extends HTMLElement>(threshold = 0.1) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('visible');
          observer.unobserve(el);
        }
      },
      { threshold },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return ref;
}
