"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { ProductCard } from '@/components/shop/product-card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Filter, SlidersHorizontal } from 'lucide-react';
import ProductCategoriesSlider from './products-categories-slider';

// Define types based on database schema
interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  slug: string | null;
  stockQuantity: number;
  categoryId: string | null;
  category: {
    id: string;
    name: string;
  } | null;
  stock?: number;
  style?: string;
  medium?: string;
  year?: number;
  featured?: boolean;
  title?: string;
}

export default function ShopPage() {
  const [sortBy, setSortBy] = useState('featured');
  const [selectedStyle, setSelectedStyle] = useState('all');
  const [selectedMedium, setSelectedMedium] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 2500]);
  const [showFilters, setShowFilters] = useState(false);
  
  // Add state for dynamic data
  const [products, setProducts] = useState<Product[]>([]);
  const [styles, setStyles] = useState<string[]>([]);
  const [mediums, setMediums] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [maxPrice, setMaxPrice] = useState(2500);

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/shop/products');
        const data = await response.json();
        
        if (data.success && data.products) {
          setProducts(data.products);
          
          // Extract unique styles and mediums
          const uniqueStyles = Array.from(new Set(data.products
            .filter((p: Product) => p.style)
            .map((p: Product) => p.style)));
          
          const uniqueMediums = Array.from(new Set(data.products
            .filter((p: Product) => p.medium)
            .map((p: Product) => p.medium)));
            
          // Find max price
          const highestPrice = Math.max(...data.products.map((p: Product) => p.price), 2500);
          
          setStyles(uniqueStyles as string[]);
          setMediums(uniqueMediums as string[]);
          setMaxPrice(highestPrice);
          setPriceRange([0, highestPrice]);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, []);

  const filteredAndSortedPaintings = useMemo(() => {
    let filtered = products.filter(product => {
      const matchesStyle = selectedStyle === 'all' || product.style === selectedStyle;
      const matchesMedium = selectedMedium === 'all' || product.medium === selectedMedium;
      const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
      
      return matchesStyle && matchesMedium && matchesPrice;
    });

    // Sort the filtered results
    switch (sortBy) {
      case 'price-low':
        return filtered.sort((a, b) => a.price - b.price);
      case 'price-high':
        return filtered.sort((a, b) => b.price - a.price);
      case 'newest':
        return filtered.sort((a, b) => (b.year || 0) - (a.year || 0));
      case 'title':
        return filtered.sort((a, b) => (a.title || a.name).localeCompare(b.title || b.name));
      case 'featured':
      default:
        return filtered.sort((a, b) => {
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return 0;
        });
    }
  }, [products, selectedStyle, selectedMedium, priceRange, sortBy]);

  const clearFilters = () => {
    setSelectedStyle('all');
    setSelectedMedium('all');
    setPriceRange([0, maxPrice]);
    setSortBy('featured');
  };

  const activeFiltersCount = [
    selectedStyle !== 'all',
    selectedMedium !== 'all',
    priceRange[0] !== 0 || priceRange[1] !== maxPrice,
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-background">
      
      {/* Modern Product/Categories Slider */}
      <ProductCategoriesSlider />

      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="lg:flex lg:gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-80">
            <Card className="sticky top-24">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Filter className="h-5 w-5" />
                    Filters
                    {activeFiltersCount > 0 && (
                      <Badge variant="secondary" className="ml-2">
                        {activeFiltersCount}
                      </Badge>
                    )}
                  </CardTitle>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setShowFilters(!showFilters)}
                    className="lg:hidden"
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className={`space-y-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                {/* Style Filter */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">Style</label>
                  <Select value={selectedStyle} onValueChange={setSelectedStyle}>
                    <SelectTrigger className="dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                      <SelectItem value="all" className="dark:text-gray-100">All Styles</SelectItem>
                      {styles.length > 0 ? (
                        styles.map(style => (
                          <SelectItem key={style} value={style} className="dark:text-gray-100">{style}</SelectItem>
                        ))
                      ) : (
                        <SelectItem value="loading" disabled className="text-gray-400 dark:text-gray-500">Loading styles...</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Medium Filter */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">Medium</label>
                  <Select value={selectedMedium} onValueChange={setSelectedMedium}>
                    <SelectTrigger className="dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                      <SelectItem value="all" className="dark:text-gray-100">All Mediums</SelectItem>
                      {mediums.length > 0 ? (
                        mediums.map(medium => (
                          <SelectItem key={medium} value={medium} className="dark:text-gray-100">{medium}</SelectItem>
                        ))
                      ) : (
                        <SelectItem value="loading" disabled className="text-gray-400 dark:text-gray-500">Loading mediums...</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Price Range */}
                <div className="space-y-3">
                  <label className="text-sm font-medium">
                    Price Range: ${priceRange[0]} - ${priceRange[1]}
                  </label>
                  <Slider
                    value={priceRange}
                    onValueChange={setPriceRange}
                    max={maxPrice}
                    step={50}
                    className="py-4"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>$0</span>
                    <span>${maxPrice}</span>
                  </div>
                </div>

                {/* Clear Filters */}
                {activeFiltersCount > 0 && (
                  <Button variant="outline" onClick={clearFilters} className="w-full">
                    Clear All Filters
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1 mt-8 lg:mt-0">
            {/* Sort and Results Info */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">
                  {filteredAndSortedPaintings.length} {filteredAndSortedPaintings.length === 1 ? 'artwork' : 'artworks'}
                </span>
              </div>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                  <SelectItem value="featured" className="dark:text-gray-100">Featured First</SelectItem>
                  <SelectItem value="newest" className="dark:text-gray-100">Newest First</SelectItem>
                  <SelectItem value="price-low" className="dark:text-gray-100">Price: Low to High</SelectItem>
                  <SelectItem value="price-high" className="dark:text-gray-100">Price: High to Low</SelectItem>
                  <SelectItem value="title" className="dark:text-gray-100">Title: A to Z</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Paintings Grid */}
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : filteredAndSortedPaintings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredAndSortedPaintings.map((product) => (
                  <ProductCard key={product.id} product={{
                    id: product.id,
                    title: product.title || product.name,
                    category: product.category?.name || 'Unknown Category',
                    year: product.year || new Date().getFullYear(),
                    medium: product.medium || 'Mixed Media',
                    dimensions: product.description?.split(' - ').pop() || '',
                    price: product.price,
                    imageUrl: product.imageUrl || '/placeholder-painting.jpg',
                    slug: product.slug || product.id,
                    featured: product.featured || false,
                    style: product.style || 'Contemporary',
                    inStock: product.stockQuantity > 0 ? true : false
                  }} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-lg text-muted-foreground dark:text-gray-400 mb-4">
                  No artworks found matching your criteria.
                </p>
                <Button onClick={clearFilters} className="dark:bg-blue-600 dark:hover:bg-blue-700 dark:text-white">
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}