import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{
    slug: string;
  }>;
}

/**
 * GET /api/shop/products/[slug]/related
 * Fetch related products based on the same category
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;
    const limit = 8; // Maximum number of related products to return
    
    // First, get the current product to find its category
    const product = await prisma.product.findUnique({
      where: { slug },
      select: {
        id: true,
        categoryId: true
      }
    });

    console.log(`Looking up product by slug: "${slug}"`);

    if (!product) {
      console.log(`No product found with slug: "${slug}"`);
      return NextResponse.json({ 
        success: false, 
        error: 'Product not found' 
      }, { status: 404 });
    }
    
    console.log(`Found product ID: ${product.id}, categoryId: ${product.categoryId || 'none'}`);
    
    if (!product.categoryId) {
      console.log('Product has no category, cannot find related products');
      return NextResponse.json({
        success: true,
        products: []
      });
    }

    // Find related products in the same category, excluding the current product
    const relatedProducts = await prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        id: {
          not: product.id // Exclude the current product using its ID
        },
        isActive: true // Only include active products
      },
      include: {
        category: {
          select: {
            id: true,
            name: true
          }
        }
      },
      take: limit,
      orderBy: {
        createdAt: 'desc' // Show newest products first
      }
    });

    // Format the related products for the response
    const formattedRelatedProducts = relatedProducts.map(product => ({
      id: product.id,
      name: product.name,
      description: product.description,
      price: Number(product.price),
      imageUrl: product.imageUrl || null,
      images: product.imageUrl ? [product.imageUrl] : [],
      stock: product.stockQuantity,
      slug: product.slug,
      sku: product.sku || `PROD-${product.id.substring(0, 8).toUpperCase()}`,
      category: product.category
    }));

    return NextResponse.json({
      success: true,
      products: formattedRelatedProducts
    });
  } catch (error) {
    console.error('Error fetching related products:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch related products' 
    }, { status: 500 });
  }
}
