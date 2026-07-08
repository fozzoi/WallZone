import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

export function useScrollRestoration(id: string) {
  const pathname = usePathname();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const key = `scroll-pos-${id}-${pathname}`;
    const savedPos = sessionStorage.getItem(key);
    
    if (savedPos) {
      el.scrollTop = parseInt(savedPos, 10);
    }

    const handleScroll = () => {
      sessionStorage.setItem(key, el.scrollTop.toString());
    };

    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, [id, pathname]);

  return ref;
}
