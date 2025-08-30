import { cache } from 'react';
import { prisma } from '@/lib/prisma';

export interface ProductCategory {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
  productCount?: number;
}

/**
 * Get all product categories
 */
export const getAllProductCategories = cache(async (): Promise<ProductCategory[]> => {
  try {
    // Get all active categories with products count
    const categories = await prisma.productCategory.findMany({
      where: {
        isActive: true
      },
      include: {
        _count: {
          select: {
            products: true
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });
    
    // Transform to our interface
    return categories.map(category => ({
      id: category.id,
      name: category.name,
      description: category.description || undefined,
      imageUrl: category.imageUrl || undefined,
      isActive: category.isActive,
      productCount: category._count.products
    }));
  } catch (error) {
    console.error('Error fetching product categories:', error);
    return [];
  }
});

/**
 * Get a random product from each category for display
 */
export const getCategoryWithSampleProducts = cache(async (): Promise<(ProductCategory & { sampleProduct?: any })[]> => {
  try {
    const categories = await getAllProductCategories();
    
    // For each category, get one sample product
    const categoriesWithSamples = await Promise.all(
      categories.map(async (category) => {
        const sampleProduct = await prisma.product.findFirst({
          where: {
            categoryId: category.id,
            isActive: true
          }
        });
        
        return {
          ...category,
          sampleProduct: sampleProduct || undefined
        };
      })
    );
    
    return categoriesWithSamples;
  } catch (error) {
    console.error('Error fetching categories with sample products:', error);
    return [];
  }
});
