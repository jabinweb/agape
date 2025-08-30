"use client";
import React, { useRef, useEffect } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/lib/products';
import { useSystemSettings } from '@/hooks/useSystemSettings';

interface ProductSliderProps {
  products: Product[];
}

export function ProductSlider({ products, className = "" }: ProductSliderProps & { className?: string }) {
  // Get currency settings
  const { currency, currencySymbol } = useSystemSettings();
  
  // Track if mouse is over slider
  const hovering = useRef(false);

  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      if (hovering.current) {
        e.preventDefault();
      }
    };
    window.addEventListener('wheel', onWheel, { passive: false } as any);
    return () => window.removeEventListener('wheel', onWheel as EventListener);
  }, []);
  const controls = useAnimation();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });

  // Grab-to-scroll state
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  React.useEffect(() => {
    if (inView) {
      controls.start('visible');
    }
  }, [inView, controls]);

  // Mouse/touch drag handlers
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Only activate grab-to-scroll for left mouse button (button === 0)
    // and not when clicking a link or button
    if (e.button !== 0) return;
    let el = e.target as HTMLElement;
    while (el && el !== ref.current) {
      if (el.tagName === 'A' || el.tagName === 'BUTTON') return;
      el = el.parentElement as HTMLElement;
    }
    isDragging.current = true;
    startX.current = e.clientX;
    scrollLeft.current = ref.current ? ref.current.scrollLeft : 0;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    document.body.style.cursor = 'grabbing';
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging.current || !ref.current) return;
    const dx = e.clientX - startX.current;
    ref.current.scrollLeft = scrollLeft.current - dx;
  };
  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    isDragging.current = false;
    document.body.style.cursor = '';
  };

  return (
  <div
      ref={ref}
      className={`w-full max-w-xs md:max-w-2xl lg:max-w-[1100px] overflow-x-auto product-slider-scrollbar cursor-grab select-none px-2 md:px-4 lg:px-6 py-4 md:py-6 ${className}`}
      style={{ marginLeft: 'auto', marginRight: 'auto' }}
      onWheel={e => {
        const el = e.currentTarget;
        const atStart = el.scrollLeft === 0;
        const atEnd = Math.abs(el.scrollLeft + el.offsetWidth - el.scrollWidth) < 2;
        if ((e.deltaY < 0 && atStart) || (e.deltaY > 0 && atEnd)) {
          // Let the page scroll
          return;
        }
        el.scrollLeft += e.deltaY;
        e.preventDefault();
      }}
  onMouseEnter={() => { hovering.current = true; }}
  onMouseLeave={() => { hovering.current = false; }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
    >
      <motion.div
        className="flex gap-6"
        style={{ minHeight: 0 }}
        initial="hidden"
        animate={controls}
        variants={{
          hidden: {},
          visible: {
            transition: {
              staggerChildren: 0.15,
            },
          },
        }}
      >
        {products.map((product, idx) => (
          <motion.div
            key={product.id}
            className="bg-white/70 dark:bg-white/10 rounded-2xl shadow-[0_8px_32px_rgba(80,80,180,0.12)] p-4 min-w-[35%] max-w-[40%] sm:min-w-[36%] sm:max-w-[36%] md:min-w-[38%] md:max-w-[42%] lg:min-w-[35%] lg:max-w-[35%] xl:min-w-[28%] xl:max-w-[28%] flex-shrink-0 flex flex-col items-center border border-gray-200 dark:border-white/20 backdrop-blur-lg transition-all duration-200 hover:shadow-[0_12px_40px_rgba(80,80,180,0.18)] hover:ring-2 hover:ring-blue-200/40 dark:hover:ring-blue-400/30 group"
            whileHover={{ scale: 1.06, rotate: 1 }}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
          >
            <Link href={`/paintings/${product.id}`} tabIndex={0} className="block w-full focus:outline-none rounded-xl">
              <div className="relative w-full aspect-square mb-4 rounded-xl overflow-hidden bg-white/60 dark:bg-white/10 shadow-[0_4px_16px_rgba(80,80,180,0.10)] select-none">
                {product.image && product.image.trim() !== '' ? (
                  <Image
                    src={product.image}
                    alt={product.title}
                    fill
                    className="object-cover aspect-square select-none"
                    sizes="(max-width: 768px) 100vw, 220px"
                    priority={idx === 0}
                    draggable={false}
                    unselectable="on"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                    <div className="text-gray-400 dark:text-gray-600 text-sm text-center">
                      No Image
                    </div>
                  </div>
                )}
              </div>
              <h3 className="font-semibold text-lg mb-1 line-clamp-1 text-gray-900 dark:text-white text-center">{product.title}</h3>
            </Link>
            <div className="text-center">
              <p className="text-xs mb-1 line-clamp-1 text-blue-600 dark:text-blue-200">{product.medium}</p>
              <span className="font-bold text-base text-blue-500 dark:text-blue-300">
                {currencySymbol}{product.price.toLocaleString(undefined, {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 2
                })}
              </span>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
