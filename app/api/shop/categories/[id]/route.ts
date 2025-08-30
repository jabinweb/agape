import { NextRequest, NextResponse } from "next/server";
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { productCategoryUpdateSchema } from '@/lib/validations/product-category';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET /api/shop/categories/[id]
 * Retrieves a specific product category by ID
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;

    // Find the category
    const category = await prisma.productCategory.findUnique({
      where: { id },
      include: {
        products: {
          where: { isActive: true },
          take: 8, // Include a few sample products
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            name: true,
            price: true,
            imageUrl: true,
            slug: true,
            stockQuantity: true
          }
        },
        _count: {
          select: { products: true }
        }
      }
    });

    if (!category) {
      return NextResponse.json({
        success: false,
        error: 'Category not found'
      }, { status: 404 });
    }

    // Format the response
    interface FormattedProduct {
      id: string;
      name: string;
      price: number;
      imageUrl: string | null;
      slug: string;
      stockQuantity: number;
    }

    interface FormattedCategory {
      id: string;
      name: string;
      description: string | null;
      slug: string;
      imageUrl: string | null;
      createdAt: Date;
      updatedAt: Date;
      productCount: number;
      products: FormattedProduct[];
    }

    const formattedCategory: FormattedCategory = {
      ...category,
      slug: category.slug ?? '',
      productCount: category._count.products,
      products: category.products.map((product: any): FormattedProduct => ({
        ...product,
        price: Number(product.price)
      }))
    };

    // Remove _count from the response
    const { _count, ...categoryData } = category;

    return NextResponse.json({
      category: { ...categoryData, ...formattedCategory },
      success: true
    });
  } catch (error) {
    console.error('Error fetching product category:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch product category'
    }, { status: 500 });
  }
}

/**
 * PUT /api/shop/categories/[id]
 * Update a product category (admin only)
 */
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    // Verify user is authenticated and is an admin
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized. Admin access required.' 
      }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // Check if category exists
    const existingCategory = await prisma.productCategory.findUnique({
      where: { id }
    });

    if (!existingCategory) {
      return NextResponse.json({
        success: false,
        error: 'Category not found'
      }, { status: 404 });
    }

    // Validate with zod schema
    try {
      const validatedData = productCategoryUpdateSchema.parse(body);
      
      // Update the category
      const updatedCategory = await prisma.productCategory.update({
        where: { id },
        data: validatedData
      });
      
      return NextResponse.json({
        category: updatedCategory,
        success: true,
        message: 'Category updated successfully'
      });
    } catch (error) {
      return NextResponse.json({
        success: false,
        error: 'Invalid category data',
        details: error
      }, { status: 400 });
    }
  } catch (error) {
    console.error('Error updating product category:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update product category'
    }, { status: 500 });
  }
}

/**
 * DELETE /api/shop/categories/[id]
 * Delete a product category (admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    // Verify user is authenticated and is an admin
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized. Admin access required.' 
      }, { status: 401 });
    }

    const { id } = await params;

    // Check if category has products
    const productsCount = await prisma.product.count({
      where: { categoryId: id }
    });

    if (productsCount > 0) {
      return NextResponse.json({
        success: false,
        error: 'Cannot delete a category with associated products',
        productsCount
      }, { status: 400 });
    }

    // Delete the category
    await prisma.productCategory.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting product category:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to delete product category'
    }, { status: 500 });
  }
}
