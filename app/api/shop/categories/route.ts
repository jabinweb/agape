import { NextRequest, NextResponse } from "next/server";
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { productCategorySchema } from '@/lib/validations/product-category';

/**
 * GET /api/shop/categories
 * Retrieves product categories for the shop
 */
export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const activeOnly = searchParams.get('active') !== 'false'; // Default to true
    const limit = parseInt(searchParams.get('limit') || '100');
    const page = parseInt(searchParams.get('page') || '1');
    const skip = (page - 1) * limit;

    // Find product categories with filtering options
    const categories = await prisma.productCategory.findMany({
      where: {
        ...(activeOnly ? { isActive: true } : {}),
      },
      orderBy: [
        { name: 'asc' },
      ],
      take: limit,
      skip: skip,
      select: {
        id: true,
        name: true,
        description: true,
        imageUrl: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            products: true
          }
        }
      }
    });

    // Count total categories for pagination
    const totalCount = await prisma.productCategory.count({
      where: {
        ...(activeOnly ? { isActive: true } : {}),
      }
    });

    // Format the response
    interface CategoryFromDb {
        id: string;
        name: string;
        description: string | null;
        imageUrl: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        _count: {
            products: number;
        };
    }

    interface FormattedCategory {
        id: string;
        name: string;
        description: string | null;
        imageUrl: string | null;
        isActive: boolean;
        productCount: number;
        createdAt: Date;
        updatedAt: Date;
    }

    const formattedCategories: FormattedCategory[] = (categories as CategoryFromDb[]).map((category) => ({
        id: category.id,
        name: category.name,
        description: category.description,
        imageUrl: category.imageUrl,
        isActive: category.isActive,
        productCount: category._count.products,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt
    }));

    return NextResponse.json({
      categories: formattedCategories,
      pagination: {
        total: totalCount,
        page,
        limit,
        pages: Math.ceil(totalCount / limit)
      },
      success: true
    });
  } catch (error) {
    console.error('Error fetching product categories:', error);
    return NextResponse.json({
      categories: [],
      success: false,
      error: 'Failed to fetch product categories'
    }, { status: 500 });
  }
}

/**
 * POST /api/shop/categories
 * Create a new product category (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    // Verify user is authenticated and is an admin
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ 
        success: false,
        error: 'Unauthorized. Admin access required.' 
      }, { status: 401 });
    }

    // Parse the request body
    const body = await request.json();
    
    // Validate with zod schema
    try {
      const validatedData = productCategorySchema.parse(body);
      
      // Create the category with validated data
      const category = await prisma.productCategory.create({
        data: validatedData
      });
      
      return NextResponse.json({
        category,
        success: true,
        message: 'Category created successfully'
      });
    } catch (error) {
      return NextResponse.json({
        success: false,
        error: 'Invalid category data',
        details: error
      }, { status: 400 });
    }
  } catch (error) {
    console.error('Error creating product category:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create product category'
    }, { status: 500 });
  }
}
