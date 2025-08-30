import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/products/featured
 * Return featured products
 */
export async function GET(request: NextRequest) {
  try {
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          { featured: true },
          { tags: { has: 'featured' } }
        ]
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
      take: 8
    });

    // Transform the products to match the frontend format
    const transformedProducts = products.map(product => ({
      id: product.id,
      title: product.name,
      price: Number(product.price),
      regularPrice: product.regularPrice ? Number(product.regularPrice) : undefined,
      salePrice: product.salePrice ? Number(product.salePrice) : undefined,
      image: product.imageUrl || 
        (product.images?.[0]?.url) || 
        'https://images.pexels.com/photos/1266808/pexels-photo-1266808.jpeg?auto=compress&cs=tinysrgb&w=1200',
      description: product.description || '',
      medium: product.tags?.find((tag: string) => tag.startsWith('medium:'))?.replace('medium:', '') || 'Mixed Media',
      style: product.tags?.find((tag: string) => tag.startsWith('style:'))?.replace('style:', '') || 'Contemporary',
      dimensions: product.width && product.height ? 
        `${product.width} × ${product.height} ${product.length ? `× ${product.length}` : ''} cm` : 
        product.tags?.find((tag: string) => tag.startsWith('dimensions:'))?.replace('dimensions:', '') || '',
      featured: product.featured || product.tags?.includes('featured') || false,
      inStock: product.stockQuantity > 0,
      slug: product.slug,
      categoryId: product.categoryId,
      categoryName: product.category?.name,
      images: product.images?.map(img => ({ 
        id: img.id, 
        url: img.url, 
        alt: img.alt 
      }))
    }));

    return NextResponse.json({
      success: true,
      products: transformedProducts
    });
  } catch (error) {
    console.error('Error fetching featured products:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch featured products'
    }, { status: 500 });
  }
}
