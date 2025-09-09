"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingBag, Eye } from 'lucide-react';
import { useCart } from '@/context/cart-context';
import { useSystemSettings } from '@/context/settings-context';

// Define our own Product type that can accept both static and dynamic data
export interface Product {
  id: string;
  title: string;
  category?: string;
  year?: number;
  medium?: string;
  dimensions?: string;
  price: number;
  imageUrl?: string;
  image?: string; // Support both imageUrl and image for compatibility
  slug?: string;
  featured?: boolean;
  style?: string;
  inStock?: boolean; // New field to indicate stock status
}

interface ProductCardProps {
  product: Product;
  featured?: boolean;
}

export function ProductCard({ product, featured = false }: ProductCardProps) {
  const { addItem } = useCart();
  const { currency, currencySymbol } = useSystemSettings();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.imageUrl || product.image || 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop&auto=format',
      medium: product.medium || 'Mixed Media',
      size: product.dimensions || '',
    });
  };

  return (
    <Card
      className={`product-card group overflow-hidden rounded-3xl shadow-xl border-2 border-white/10 bg-white/60 dark:bg-gray-900/60 backdrop-blur-md transition-transform duration-200 hover:scale-[1.025] hover:shadow-2xl`}
    >
      <div className="relative aspect-square overflow-hidden">
        <Image
          src={product.imageUrl || product.image || 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop&auto=format'}
          alt={product.title}
          fill
          sizes={featured ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 100vw, 25vw"}
          className="object-cover image-zoom"
          priority={featured}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop&auto=format';
          }}
        />
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-blue-900/40 to-purple-900/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-3 backdrop-blur-sm">
          <Button asChild variant="secondary" size="sm" className="font-bold rounded-full shadow-md hover:scale-105 transition-transform">
            <Link href={`/shop/${product.slug || product.id}`}>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </Link>
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleAddToCart}
            disabled={!product.inStock}
            className="font-bold bg-white rounded-full hover:bg-gray-100 shadow-md hover:scale-105 transition-transform"
          >
            <ShoppingBag className="mr-2 h-4 w-4" />
            Add to Cart
          </Button>
        </div>

        {/* Featured badge */}
        {product.featured && (
          <Badge className="absolute top-3 left-3 bg-gradient-to-r from-blue-500 via-purple-500 to-orange-400 text-white font-bold shadow-md px-3 py-1 rounded-full border-2 border-white/80">
            Featured
          </Badge>
        )}
        {/* Out of stock badge */}
        {!product.inStock && (
          <Badge variant="secondary" className="absolute top-3 right-3 bg-gray-400/90 text-white font-bold px-3 py-1 rounded-full border-2 border-white/80">
            Sold Out
          </Badge>
        )}
      </div>

      <CardContent className="p-5">
        <div className="space-y-2">
          <h3 className={`font-bold ${featured ? 'text-lg' : 'text-base'} line-clamp-1 text-gray-900 dark:text-white`}>{product.title}</h3>
          <p className="text-sm text-blue-900/80 dark:text-blue-200/80">
            {product.medium} • {product.dimensions}
          </p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xl font-extrabold bg-gradient-to-r from-blue-500 via-purple-500 to-orange-400 bg-clip-text text-transparent drop-shadow">
              {product.price.toLocaleString(undefined, {
                style: 'currency',
                currency: currency,
                minimumFractionDigits: 0,
                maximumFractionDigits: 2,
              })}
            </span>
            <Badge variant="outline" className="text-xs border-blue-400/60 text-blue-700 dark:text-blue-200 bg-white/60 dark:bg-gray-900/60">
              {product.style}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}