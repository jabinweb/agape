'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProductCard } from '@/components/shop/product-card';
import { useEffect, useState } from 'react';
import type { Product } from '@/lib/products';
import { Skeleton } from '@/components/ui/skeleton';

export function FeaturedSection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFeaturedProducts() {
      try {
        const response = await fetch('/api/shop/products/featured');
        const data = await response.json();
        if (data.success) {
          setProducts(data.products.slice(0, 4));
          console.log(`Loaded ${data.products.length} featured products`);
        } else {
          console.error('Failed to load featured products:', data.error);
        }
      } catch (error) {
        console.error('Error loading featured products:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadFeaturedProducts();
  }, []);

  return (
    <section className="py-24 bg-gradient-to-b from-white/80 via-blue-50/60 to-purple-50/40 dark:from-gray-950 dark:via-gray-900/80 dark:to-purple-950/40 relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-5xl font-extrabold mb-4 text-gray-900 dark:text-white drop-shadow-lg">
            <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-orange-400 bg-clip-text text-transparent">Featured Products</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Handpicked masterpieces that showcase the depth and diversity of contemporary art. Each product tells a unique story waiting to become part of yours.
          </p>
        </div>
        <div className="relative">
          <div className="absolute -top-10 -left-10 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-400/10 rounded-full blur-2xl z-0" />
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-gradient-to-tr from-orange-400/20 to-pink-400/10 rounded-full blur-2xl z-0" />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 relative z-10">
            {loading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="flex flex-col space-y-3">
                  <Skeleton className="h-80 w-full rounded-xl" />
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-1/4" />
                  </div>
                  <div className="flex justify-between pt-2">
                    <Skeleton className="h-9 w-1/3" />
                    <Skeleton className="h-9 w-1/3" />
                  </div>
                </div>
              ))
            ) : products.length > 0 ? (
              products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  featured={true}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-10 text-muted-foreground">
                No featured products found. Check back soon for new additions!
              </div>
            )}
          </div>
        </div>
        <div className="text-center mt-14">
          <Button asChild variant="outline" size="lg" className="text-lg px-8 font-bold border-2 border-gray-200 bg-white text-gray-900 hover:bg-primary/10 hover:text-primary transition-all duration-200 shadow-md">
            <Link href="/shop">
              View All Products
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}