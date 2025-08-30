import { prisma } from '@/lib/prisma';
import { cache } from 'react';

export interface Product {
  id: string;
  title: string;
  medium?: string;
  dimensions?: string;
  price: number;
  regularPrice?: number;
  salePrice?: number;
  saleStartDate?: Date;
  saleEndDate?: Date;
  image: string;
  images?: Array<{ id: string, url: string, alt?: string }>;
  description?: string;
  style?: string;
  featured?: boolean;
  inStock: boolean;
  year?: number;
  slug?: string;
  categoryId?: string;
  categoryName?: string;
  weight?: number;
  width?: number;
  height?: number;
  length?: number;
  material?: string;
  rating?: number;
  reviewCount?: number;
  variations?: Array<{ id: string, name: string, value: string, price?: number }>;
  attributes?: Array<{ id: string, name: string, value: string }>;
}

/**
 * Transform database product into our app's product interface
 */
const transformProduct = (dbProduct: any): Product => ({
  id: dbProduct.id,
  title: dbProduct.name,
  price: Number(dbProduct.price),
  regularPrice: dbProduct.regularPrice ? Number(dbProduct.regularPrice) : undefined,
  salePrice: dbProduct.salePrice ? Number(dbProduct.salePrice) : undefined,
  saleStartDate: dbProduct.saleStartDate,
  saleEndDate: dbProduct.saleEndDate,
  image: dbProduct.imageUrl || 
    (dbProduct.images?.[0]?.url) || 
    'https://images.pexels.com/photos/1266808/pexels-photo-1266808.jpeg?auto=compress&cs=tinysrgb&w=1200', // Fallback image
  images: dbProduct.images?.map((img: any) => ({ 
    id: img.id, 
    url: img.url, 
    alt: img.alt 
  })) || [],
  description: dbProduct.description || '',
  medium: dbProduct.tags?.find((tag: string) => tag.startsWith('medium:'))?.replace('medium:', '') || 'Mixed Media',
  style: dbProduct.tags?.find((tag: string) => tag.startsWith('style:'))?.replace('style:', '') || 'Contemporary',
  dimensions: dbProduct.width && dbProduct.height ? 
    `${dbProduct.width} × ${dbProduct.height} ${dbProduct.length ? `× ${dbProduct.length}` : ''} cm` : 
    dbProduct.tags?.find((tag: string) => tag.startsWith('dimensions:'))?.replace('dimensions:', '') || '',
  year: parseInt(dbProduct.tags?.find((tag: string) => tag.startsWith('year:'))?.replace('year:', '') || new Date().getFullYear().toString()),
  featured: dbProduct.featured || dbProduct.tags?.includes('featured') || false,
  inStock: dbProduct.stockQuantity > 0,
  slug: dbProduct.slug,
  categoryId: dbProduct.categoryId,
  categoryName: dbProduct.category?.name,
  weight: dbProduct.weight,
  width: dbProduct.width,
  height: dbProduct.height,
  length: dbProduct.length,
  material: dbProduct.material || 
    dbProduct.attributes?.find((attr: any) => attr.name === 'Material')?.value,
  rating: dbProduct.averageRating || 0,
  reviewCount: dbProduct.reviewCount || 0,
  variations: dbProduct.variations?.map((v: any) => ({
    id: v.id,
    name: v.name,
    value: v.value,
    price: v.price ? Number(v.price) : undefined
  })) || [],
  attributes: dbProduct.attributes?.map((a: any) => ({
    id: a.id,
    name: a.name,
    value: a.value
  })) || []
});

/**
 * Get all products from the database
 */
export const getAllProducts = cache(async (): Promise<Product[]> => {
  try {
    const products = await prisma.product.findMany({
      where: {
        isActive: true
      },
      include: {
        category: true,
        images: true,
        variations: true,
        attributes: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return products.map(transformProduct);
  } catch (error) {
    console.error('Error fetching all products:', error);
    return [];
  }
});

/**
 * Get product by ID from the database
 */
export const getProductById = cache(async (id: string): Promise<Product | null> => {
  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        images: true,
        variations: true,
        attributes: true,
        reviews: {
          where: { status: "approved" },
          take: 10,
          orderBy: { createdAt: 'desc' }
        }
      }
    });
    
    return product ? transformProduct(product) : null;
  } catch (error) {
    console.error(`Error fetching product with ID ${id}:`, error);
    return null;
  }
});

/**
 * Get product by slug from the database
 */
export const getProductBySlug = cache(async (slug: string): Promise<Product | null> => {
  try {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        images: true,
        variations: true,
        attributes: true,
        reviews: {
          where: { status: "approved" },
          take: 10,
          orderBy: { createdAt: 'desc' }
        }
      }
    });
    
    return product ? transformProduct(product) : null;
  } catch (error) {
    console.error(`Error fetching product with slug ${slug}:`, error);
    return null;
  }
});

/**
 * Get all unique styles from products in the database
 */
export const getStyles = cache(async (): Promise<string[]> => {
  try {
    const products = await getAllProducts();
    const styles = products
      .map(product => product.style)
      .filter((style): style is string => !!style);
    
    return [...new Set(styles)];
  } catch (error) {
    console.error('Error fetching styles:', error);
    return [];
  }
});

/**
 * Get all unique mediums from products in the database
 */
export const getMediums = cache(async (): Promise<string[]> => {
  try {
    const products = await getAllProducts();
    const mediums = products
      .map(product => product.medium)
      .filter((medium): medium is string => !!medium);
    
    return [...new Set(mediums)];
  } catch (error) {
    console.error('Error fetching mediums:', error);
    return [];
  }
});

/**
 * Get related products from the same category
 */
export const getRelatedProducts = cache(async (productId: string, categoryId?: string, limit = 3): Promise<Product[]> => {
  if (!categoryId) return [];
  
  try {
    const products = await prisma.product.findMany({
      where: {
        categoryId,
        id: { not: productId }, // Exclude the current product
        isActive: true
      },
      include: {
        category: true,
        images: true,
        variations: true,
        attributes: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    });
    
    return products.map(transformProduct);
  } catch (error) {
    console.error(`Error fetching related products for product ${productId}:`, error);
    return [];
  }
});

/**
 * Get latest products from the database
 */
export const getLatestProducts = cache(async (limit = 5): Promise<Product[]> => {
  try {
    const products = await prisma.product.findMany({
      where: {
        isActive: true
      },
      include: {
        category: true,
        images: true,
        variations: true,
        attributes: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    });
    
    return products.map(transformProduct);
  } catch (error) {
    console.error('Error fetching latest products:', error);
    return [];
  }
});