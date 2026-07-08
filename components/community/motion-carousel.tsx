// components/community/motion-carousel.tsx
'use client';

import * as React from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { type EmblaOptionsType } from 'embla-carousel';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

interface MotionCarouselProps {
  slides: number[];
  options?: EmblaOptionsType;
  className?: string;
  renderSlide?: (index: number) => React.ReactNode;
}

export function MotionCarousel({ slides, options, className, renderSlide }: MotionCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, ...options });
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  React.useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on('select', onSelect);
    onSelect();
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi]);

  return (
    <div className={cn('w-full', className)}>
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {slides.map((slide, i) => (
            <div key={slide} className="min-w-0 shrink-0 grow-0 basis-full px-2">
              <motion.div
                animate={{ scale: i === selectedIndex ? 1 : 0.92, opacity: i === selectedIndex ? 1 : 0.6 }}
                transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                className="flex h-64 items-center justify-center rounded-xl bg-card shadow"
              >
                {renderSlide ? renderSlide(slide) : `Slide ${slide + 1}`}
              </motion.div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 flex justify-center gap-2">
        {slides.map((_, i) => (
          <motion.button
            key={i}
            onClick={() => emblaApi?.scrollTo(i)}
            className="h-2 rounded-full bg-primary"
            animate={{ width: i === selectedIndex ? 20 : 8, opacity: i === selectedIndex ? 1 : 0.4 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          />
        ))}
      </div>
    </div>
  );
}