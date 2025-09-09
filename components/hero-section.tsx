"use client";
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowRight, Palette, Heart, Star } from 'lucide-react';
import { Product } from '@/lib/products';
import { ProductSlider } from './shop/product-slider';
import { useSystemSettings } from '@/context/settings-context';

interface HeroSectionProps {
  featuredProducts: Product[];
}

export function HeroSection({ featuredProducts }: HeroSectionProps) {
  const { storeName } = useSystemSettings();
  
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-50/80 via-purple-50/60 to-orange-50/40 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900">
      <div className="container mx-auto px-4 py-20 sm:py-28 md:py-36 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 items-center min-h-0 gap-8 sm:gap-12 md:gap-16">
        {/* Hero Text */}
        <div className="w-full text-center md:text-left space-y-6 sm:space-y-8 max-w-2xl mx-auto md:mx-0">
          <h1 className="font-inter text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-extrabold tracking-tight leading-tight drop-shadow-sm text-gray-900 dark:text-white">
            <span 
              className="bg-gradient-to-r from-amber-600 via-rose-500 via-violet-600 via-emerald-500 via-cyan-500 to-amber-600 bg-clip-text text-transparent"
              style={{
                backgroundSize: '500% 100%',
                animation: 'artisticFlow 8s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                filter: 'drop-shadow(0 0 10px rgba(147, 51, 234, 0.3)) drop-shadow(0 0 20px rgba(236, 72, 153, 0.2))',
              }}
            >
              {storeName || 'My Store'}
            </span>
          </h1>
          <p className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-800 dark:text-white/90">
            Where Colors Dance and Stories Unfold
          </p>
          <p className="text-base sm:text-lg leading-relaxed text-gray-700 dark:text-white/70">
            Discover contemporary paintings that transcend the ordinary. Each piece is a journey through emotion, technique, and artistic vision—created to inspire and transform spaces.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <Button asChild size="lg" className="text-lg px-8 font-bold shadow-xl bg-gradient-to-r from-blue-600 via-purple-600 to-orange-400 hover:from-blue-700 hover:to-orange-500 text-white border-0 transition-all duration-200 scale-100 hover:scale-105">
              <Link href="/shop">
                Explore Collection
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8 font-bold border border-gray-200 dark:border-white/60 bg-white text-gray-900 hover:bg-gray-100 hover:text-blue-800 hover:border-blue-700 dark:hover:bg-white/90 dark:hover:text-blue-200 transition-all duration-200 scale-100 hover:scale-105 shadow-sm">
              <Link href="/about">
                About the Artist
              </Link>
            </Button>
          </div>
        </div>
        {/* Modern Product/Designs Slider - Latest Products */}
        <div className="w-full flex justify-center md:justify-end h-full items-center">
          <div className="w-full max-w-full flex justify-center items-center h-full">
            <ProductSlider products={featuredProducts} className="pl-2 md:pl-8" />
          </div>
        </div>
      </div>
      {/* Decorative elements */}
      <div className="absolute top-20 left-10 opacity-20">
        <Palette className="h-16 w-16 text-blue-400 dark:text-blue-500 rotate-12" />
      </div>
      <div className="absolute bottom-20 right-10 opacity-20">
        <Heart className="h-12 w-12 text-purple-400 dark:text-purple-500 -rotate-12" />
      </div>
      <div className="absolute top-1/2 left-1/4 opacity-10">
        <Star className="h-8 w-8 text-orange-400 dark:text-orange-500 rotate-45" />
      </div>
    </section>
  );
}
