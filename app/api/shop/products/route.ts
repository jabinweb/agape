import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { productSchema } from '@/lib/validations/product'
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const featured = searchParams.get('featured') === 'true';
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;

    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        stockQuantity: {
          gt: 0
        },
        ...(featured && { featured: true })
      },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        category: {
          select: {
            id: true,
            name: true
          }
        },
        images: {
          orderBy: {
            sortOrder: 'asc'
          }
        },
        variations: true,
        attributes: true
      },
      ...(limit && { take: limit })
    })

    // Transform products using the same logic as lib/products.ts
    const transformedProducts = products.map((product: any) => ({
      id: product.id,
      title: product.name,
      price: Number(product.price),
      regularPrice: product.regularPrice ? Number(product.regularPrice) : undefined,
      salePrice: product.salePrice ? Number(product.salePrice) : undefined,
      saleStartDate: product.saleStartDate,
      saleEndDate: product.saleEndDate,
      image: product.imageUrl || 
        (product.images?.[0]?.url) || 
        'https://images.pexels.com/photos/1266808/pexels-photo-1266808.jpeg?auto=compress&cs=tinysrgb&w=1200',
      images: product.images?.map((img: any) => ({ 
        id: img.id, 
        url: img.url, 
        alt: img.alt 
      })) || [],
      description: product.description || '',
      medium: product.tags?.find((tag: string) => tag.startsWith('medium:'))?.replace('medium:', '') || 'Mixed Media',
      style: product.tags?.find((tag: string) => tag.startsWith('style:'))?.replace('style:', '') || 'Contemporary',
      dimensions: product.width && product.height ? 
        `${product.width} × ${product.height} ${product.length ? `× ${product.length}` : ''} cm` : 
        product.tags?.find((tag: string) => tag.startsWith('dimensions:'))?.replace('dimensions:', '') || '',
      year: parseInt(product.tags?.find((tag: string) => tag.startsWith('year:'))?.replace('year:', '') || new Date().getFullYear().toString()),
      featured: product.featured || product.tags?.includes('featured') || false,
      inStock: product.stockQuantity > 0,
      slug: product.slug,
      categoryId: product.categoryId,
      categoryName: product.category?.name,
      weight: product.weight,
      width: product.width,
      height: product.height,
      length: product.length,
      material: product.material || 
        product.attributes?.find((attr: any) => attr.name === 'Material')?.value,
      rating: product.averageRating || 0,
      reviewCount: product.reviewCount || 0,
      variations: product.variations?.map((v: any) => ({
        id: v.id,
        name: v.name,
        value: v.value,
        price: v.price ? Number(v.price) : undefined
      })) || [],
      attributes: product.attributes?.map((a: any) => ({
        id: a.id,
        name: a.name,
        value: a.value
      })) || []
    }));

    return NextResponse.json({ 
      products: transformedProducts,
      success: true 
    })
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json({ 
      products: [],
      success: false,
      error: 'Failed to fetch products' 
    })
  }
}