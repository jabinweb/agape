'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';

export default function CollectionSection() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch('/api/shop/categories');
        const data = await res.json();
        setCategories(data.categories || []);
      } catch (error) {
        setCategories([]);
      } finally {
        setLoading(false);
      }
    }
    fetchCategories();
  }, []);

  if (loading) {
    return <div className="text-center py-20">Loading categories...</div>;
  }

  return (
    <section className="py-20 bg-gradient-to-br from-blue-50 via-purple-50 to-orange-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">Our Collection</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Explore by category and discover the styles that define our gallery.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mb-10">
          {categories.map((category: any) => (
            <Link
              key={category.id}
              href={`/shop?category=${encodeURIComponent(category.id)}`}
              className="block rounded-2xl bg-white/30 dark:bg-gray-900/30 shadow-xl p-0 text-center font-bold text-2xl text-blue-700 dark:text-blue-200 hover:bg-gradient-to-br hover:from-blue-200/80 hover:to-purple-200/80 dark:hover:from-blue-900/60 dark:hover:to-purple-900/60 transition-all duration-200 border-2 border-white/20 hover:border-blue-400 overflow-hidden group backdrop-blur-lg backdrop-saturate-150"
            >
              <div className="relative w-full h-48 mb-4 overflow-hidden">
                {category.sampleProduct?.imageUrl ? (
                  <Image
                    src={category.sampleProduct.imageUrl}
                    alt={category.name}
                    fill
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, 400px"
                  />
                ) : category.imageUrl ? (
                  <Image
                    src={category.imageUrl}
                    alt={category.name}
                    fill
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, 400px"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-200 to-purple-200 dark:from-blue-800 dark:to-purple-800" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              </div>
              <div className="py-6 flex flex-col items-center">
                <span className="block text-xl">{category.name}</span>
                {category.productCount !== undefined && (
                  <span className="text-sm font-normal mt-1 text-blue-600 dark:text-blue-300">
                    {category.productCount} {category.productCount === 1 ? 'item' : 'items'}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
        <div className="text-center">
          <Button asChild size="lg" className="text-lg px-8 bg-white text-blue-700 font-bold border-2 border-blue-200 hover:bg-blue-50 hover:text-blue-900 transition-all duration-200 shadow-md">
            <Link href="/shop">Browse Full Collection</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
