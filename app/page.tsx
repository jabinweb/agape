'use client'

import React from 'react';

import { ArrowRight, Palette, Heart, Star } from 'lucide-react';
import CollectionSection from '@/components/shop/collection-section';
import { InstagramSection } from '@/components/instagram-section';
import { HeroSection } from '@/components/hero-section';
import { FeaturedSection } from '@/components/shop/featured-section';
import { useSystemSettings } from '@/hooks/useSystemSettings';
import { useEffect, useState } from 'react';

export default function HomePage() {
  const { storeName } = useSystemSettings();
  const [featuredProducts, setFeaturedProducts] = useState([]);

  useEffect(() => {
    // Since this is now a client component, we need to fetch products on mount
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/shop/products?featured=true&limit=6');
        if (response.ok) {
          const data = await response.json();
          setFeaturedProducts(data.products || []);
        }
      } catch (error) {
        console.error('Error fetching featured products:', error);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      
  {/* Hero Section with latest products */}
  <HeroSection featuredProducts={featuredProducts} />

  {/* Collection Section */}
  <CollectionSection />

  {/* Featured Works Section - Modular */}
  <FeaturedSection />

  {/* Instagram Section */}
  <InstagramSection />

      {/* Why Choose Our Art */}
      <section className="py-24 bg-gradient-to-br from-blue-50/60 via-purple-50/40 to-orange-50/30 dark:from-gray-900/80 dark:via-purple-900/30 dark:to-gray-900/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-4 gradient-text drop-shadow-lg">
              Why Choose {storeName || 'ATELIER 7X'}
            </h2>
            <p className="text-lg text-gray-700 dark:text-gray-200 max-w-2xl mx-auto">
              More than just paintings—we create experiences that transform spaces and inspire souls.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Card 1 */}
            <div className="group bg-white/40 dark:bg-gray-900/40 rounded-2xl shadow-xl p-8 text-center transition-all duration-200 hover:scale-105 hover:shadow-2xl backdrop-blur-lg border border-white/20">
              <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center bg-gradient-to-br from-blue-400 via-purple-400 to-orange-400 shadow-lg mb-4">
                <Palette className="h-8 w-8 text-white drop-shadow" />
              </div>
              <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-2">Original Artworks</h3>
              <p className="text-base text-gray-700 dark:text-gray-200">
                Each piece is an original creation, painted with passion and attention to detail.<br />
                No prints, no reproductions—only authentic art.
              </p>
            </div>
            {/* Card 2 */}
            <div className="group bg-white/40 dark:bg-gray-900/40 rounded-2xl shadow-xl p-8 text-center transition-all duration-200 hover:scale-105 hover:shadow-2xl backdrop-blur-lg border border-white/20">
              <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center bg-gradient-to-br from-pink-400 via-purple-400 to-blue-400 shadow-lg mb-4">
                <Heart className="h-8 w-8 text-white drop-shadow" />
              </div>
              <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-2">Emotional Connection</h3>
              <p className="text-base text-gray-700 dark:text-gray-200">
                Art that speaks to the soul. Every brushstroke is infused with emotion,<br />
                creating pieces that resonate on a deeper level.
              </p>
            </div>
            {/* Card 3 */}
            <div className="group bg-white/40 dark:bg-gray-900/40 rounded-2xl shadow-xl p-8 text-center transition-all duration-200 hover:scale-105 hover:shadow-2xl backdrop-blur-lg border border-white/20">
              <div className="w-16 h-16 mx-auto rounded-full flex items-center justify-center bg-gradient-to-br from-yellow-400 via-orange-400 to-pink-400 shadow-lg mb-4">
                <Star className="h-8 w-8 text-white drop-shadow" />
              </div>
              <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-2">Museum Quality</h3>
              <p className="text-base text-gray-700 dark:text-gray-200">
                Professional-grade materials and techniques ensure your investment<br />
                will be treasured for generations to come.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}