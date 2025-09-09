'use client';

import { useState, useEffect } from 'react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronRight, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSystemSettings } from '@/hooks/useSystemSettings';
import { formatCurrency } from '@/lib/utils';

// Define types based on your database schema
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
}

interface Category {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  isActive: boolean;
  productCount?: number;
}

// Define banner interface
interface Banner {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  buttonText: string;
  buttonLink: string;
  colorClass: string;
}

export default function ProductCategoriesSlider() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'banners' | 'products' | 'categories'>('banners');
  const { settings } = useSystemSettings();

  // Sample banner data - In a real application, this would come from an API/CMS
  const banners: Banner[] = [
    {
      id: '1',
      title: 'Summer Art Collection',
      subtitle: 'Discover vibrant new artworks perfect for brightening your space',
      imageUrl: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=2574',
      buttonText: 'Shop Collection',
      buttonLink: '/shop?collection=summer',
      colorClass: 'from-yellow-500/80 to-orange-500/80'
    },
    {
      id: '2',
      title: 'Limited Edition Prints',
      subtitle: 'Exclusive art prints, signed and numbered by our featured artists',
      imageUrl: 'https://images.unsplash.com/photo-1579783901586-d88db74b4fe4?q=80&w=2748',
      buttonText: 'View Limited Editions',
      buttonLink: '/shop?type=limited',
      colorClass: 'from-blue-600/80 to-purple-600/80'
    },
    {
      id: '3',
      title: 'Artist Spotlight: Sarah Chen',
      subtitle: 'Explore the stunning contemporary landscapes by our featured artist',
      imageUrl: 'https://images.unsplash.com/photo-1577720643272-265e7139aa33?q=80&w=2574',
      buttonText: 'See Artist Works',
      buttonLink: '/artists/sarah-chen',
      colorClass: 'from-emerald-600/80 to-teal-600/80'
    }
  ];
  
  // Fetch products and categories
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch featured products
        const productsResponse = await fetch('/api/shop/products?featured=true&limit=8');
        const productsData = await productsResponse.json();
        
        // Fetch active categories with limit
        const categoriesResponse = await fetch('/api/shop/categories?active=true&limit=6');
        const categoriesData = await categoriesResponse.json();
        
        if (productsData.success) {
          setProducts(productsData.products || []);
        }
        
        if (categoriesData.success) {
          setCategories(categoriesData.categories || []);
        }
        
        console.log('Categories loaded:', categoriesData.categories?.length || 0);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  return (
    <section className="relative overflow-hidden py-12 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col mb-8">
          <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
            <div>
              <h2 className="text-3xl font-bold font-display">
                {activeTab === 'banners' ? 'Featured Collections' : 
                 activeTab === 'products' ? 'Featured Artwork' : 'Browse Categories'}
              </h2>
              <p className="text-muted-foreground mt-2">
                {activeTab === 'banners' ? 'Explore our specially curated art collections' :
                 activeTab === 'products'
                  ? 'Discover our curated collection of contemporary art'
                  : 'Explore our diverse range of art categories'}
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant={activeTab === 'banners' ? 'default' : 'outline'} 
                onClick={() => setActiveTab('banners')}
                className="rounded-full"
              >
                Collections
              </Button>
              <Button 
                variant={activeTab === 'products' ? 'default' : 'outline'} 
                onClick={() => setActiveTab('products')}
                className="rounded-full"
              >
                Products
              </Button>
              <Button 
                variant={activeTab === 'categories' ? 'default' : 'outline'} 
                onClick={() => setActiveTab('categories')}
                className="rounded-full"
              >
                Categories
              </Button>
            </div>
          </div>

          {loading && activeTab !== 'banners' ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === 'banners' ? (
                <Carousel opts={{ align: "center", loop: true }} className="w-full">
                  <CarouselContent>
                    {banners.map((banner) => (
                      <CarouselItem key={banner.id} className="md:basis-4/5 lg:basis-3/4">
                        <div className="relative h-[400px] md:h-[450px] overflow-hidden rounded-2xl">
                          {/* Use a gradient overlay for the banner */}
                          <div className={`absolute inset-0 bg-gradient-to-r ${banner.colorClass} dark:opacity-90 opacity-75 z-10 rounded-2xl`}>
                          </div>
                          
                          <Image 
                            src={banner.imageUrl || `/placeholder-banner-${parseInt(banner.id) % 3 + 1}.jpg`} 
                            alt={banner.title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 75vw, 60vw"
                            priority
                          />
                          
                          <div className="absolute inset-0 z-20 flex flex-col justify-center p-8 md:p-16">
                            <div className="max-w-xl">
                              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 font-display drop-shadow-md">
                                {banner.title}
                              </h2>
                              <p className="text-lg md:text-xl text-white/90 mb-8 max-w-lg drop-shadow-md">
                                {banner.subtitle}
                              </p>
                              <Button asChild size="lg" className="rounded-full font-medium text-base px-6 group">
                                <Link href={banner.buttonLink}>
                                  {banner.buttonText}
                                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                </Link>
                              </Button>
                            </div>
                          </div>
                          
                          {/* Banner number indicator */}
                          <div className="absolute bottom-4 right-4 z-20 bg-black/40 backdrop-blur-sm rounded-full px-3 py-1 text-white/90 text-sm font-medium">
                            {parseInt(banner.id)} / {banners.length}
                          </div>
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  
                  <div className="hidden md:flex">
                    <CarouselPrevious className="left-4 bg-white/20 hover:bg-white/40 backdrop-blur-sm border-0" />
                    <CarouselNext className="right-4 bg-white/20 hover:bg-white/40 backdrop-blur-sm border-0" />
                  </div>
                  
                  {/* Carousel indicators */}
                  <div className="flex justify-center gap-2 mt-4">
                    {banners.map((banner, idx) => (
                      <div 
                        key={`indicator-${banner.id}`}
                        className={`w-2.5 h-2.5 rounded-full transition-all ${
                          idx === 0
                            ? 'bg-primary w-8'
                            : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                </Carousel>
              ) : activeTab === 'products' ? (
                <Carousel
                  opts={{ align: "start", loop: products.length > 4 }}
                  className="w-full"
                >
                  <CarouselContent className="-ml-2 md:-ml-4">
                    {products.length > 0 ? products.slice(0, 8).map((product) => (
                      <CarouselItem key={product.id} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                        <Link href={`/shop/${product.slug || product.id}`}>
                          <Card className="overflow-hidden h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 dark:bg-gray-800 dark:border-gray-700">
                            <div className="relative aspect-square overflow-hidden">
                              {product.imageUrl ? (
                                <Image 
                                  src={product.imageUrl} 
                                  alt={product.name}
                                  fill
                                  className="object-cover transition-transform hover:scale-105"
                                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                                  <span className="text-gray-400 dark:text-gray-500">No image</span>
                                </div>
                              )}
                              {product.stockQuantity <= 0 && (
                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                  <Badge variant="destructive" className="text-lg py-1.5">Sold Out</Badge>
                                </div>
                              )}
                            </div>
                            <CardContent className="p-4">
                              <div className="flex justify-between items-start mb-2">
                                <h3 className="font-medium truncate dark:text-white">{product.name}</h3>
                                <Badge variant="outline" className="dark:border-gray-600 dark:text-gray-300">
                                  {formatCurrency(product.price, settings?.currency || 'INR')}
                                </Badge>
                              </div>
                              {product.category && (
                                <div className="text-sm text-muted-foreground dark:text-gray-400">
                                  {product.category.name}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        </Link>
                      </CarouselItem>
                    )) : (
                      <CarouselItem className="pl-2 md:pl-4 basis-full">
                        <Card className="overflow-hidden border-0 shadow-lg dark:bg-gray-800 dark:border-gray-700 py-12">
                          <div className="w-full flex flex-col items-center justify-center gap-4">
                            <p className="text-muted-foreground">No products found</p>
                            <Button variant="outline" asChild>
                              <Link href="/shop">Browse Shop</Link>
                            </Button>
                          </div>
                        </Card>
                      </CarouselItem>
                    )}
                  </CarouselContent>
                  {products.length > 4 && (
                    <div className="hidden md:flex">
                      <CarouselPrevious className="left-2" />
                      <CarouselNext className="right-2" />
                    </div>
                  )}
                </Carousel>
              ) : (
                <Carousel opts={{ align: "start", loop: categories.length > 3 }} className="w-full">
                  <CarouselContent className="-ml-2 md:-ml-4">
                    {categories.length > 0 ? categories.map((category) => (
                      <CarouselItem key={category.id} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                        <Link href={`/shop?category=${category.id}`}>
                          <Card className="overflow-hidden border-0 shadow-lg dark:bg-gray-800 dark:border-gray-700">
                            <div className="relative h-48 overflow-hidden">
                              {category.imageUrl ? (
                                <Image 
                                  src={category.imageUrl} 
                                  alt={category.name}
                                  fill
                                  className="object-cover transition-transform hover:scale-105"
                                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                                  <span className="text-gray-400 dark:text-gray-500">No image</span>
                                </div>
                              )}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent">
                                <div className="absolute bottom-0 left-0 p-4 w-full">
                                  <h3 className="text-xl font-bold text-white mb-1">{category.name}</h3>
                                  {category.description && (
                                    <p className="text-sm text-gray-200 line-clamp-2">
                                      {category.description}
                                    </p>
                                  )}
                                  <div className="flex items-center justify-between mt-2">
                                    <div className="flex items-center text-white/80 text-sm">
                                      <span>Explore</span>
                                      <ChevronRight className="h-4 w-4 ml-1" />
                                    </div>
                                    {category.productCount !== undefined && (
                                      <Badge variant="secondary" className="bg-white/20 text-white border-0">
                                        {category.productCount} items
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </Card>
                        </Link>
                      </CarouselItem>
                    )) : (
                      <CarouselItem className="pl-2 md:pl-4 basis-full">
                        <Card className="overflow-hidden border-0 shadow-lg dark:bg-gray-800 dark:border-gray-700 py-12">
                          <div className="w-full flex flex-col items-center justify-center gap-4">
                            <p className="text-muted-foreground">No categories found</p>
                            <Button variant="outline" asChild>
                              <Link href="/shop">Browse Shop</Link>
                            </Button>
                          </div>
                        </Card>
                      </CarouselItem>
                    )}
                  </CarouselContent>
                  {categories.length > 3 && (
                    <div className="hidden md:flex">
                      <CarouselPrevious className="left-2" />
                      <CarouselNext className="right-2" />
                    </div>
                  )}
                </Carousel>
              )}
            </motion.div>
          )}
          
          <div className="text-center mt-8">
            <Button 
              asChild 
              variant="outline" 
              className="rounded-full px-6 dark:border-gray-700 dark:hover:bg-gray-800"
            >
              <Link href={
                activeTab === 'banners' 
                  ? '/shop/collections' 
                  : activeTab === 'products' 
                    ? '/shop' 
                    : '/shop/categories'
              }>
                View All {
                  activeTab === 'banners' 
                    ? 'Collections' 
                    : activeTab === 'products' 
                      ? 'Products' 
                      : 'Categories'
                }
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
