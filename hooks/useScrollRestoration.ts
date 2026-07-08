// hooks/useScrollRestoration.ts
'use client';

import { useEffect, useRef } from 'react';

const scrollPositions = new Map<string, number>();

export function useScrollRestoration(key: string) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const saved = scrollPositions.get(key);
    if (saved != null) {
      // wait a frame so content has actually rendered/laid out first
      requestAnimationFrame(() => {
        el.scrollTop = saved;
      });
    }

    const handleScroll = () => {
      scrollPositions.set(key, el.scrollTop);
    };

    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, [key]);

  return ref;
}