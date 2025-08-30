import { prisma } from '@/lib/prisma';
import { cache } from 'react';

export interface ProductReview {
  id: string;
  rating: number;
  title?: string;
  content?: string;
  status: string;
  productId: string;
  userId: string;
  userName?: string;
  userImage?: string;
  createdAt: Date;
  images?: string[];
  isVerifiedPurchase: boolean;
  helpfulCount: number;
}

/**
 * Get reviews for a specific product
 */
export const getProductReviews = cache(async (
  productId: string,
  options: {
    page?: number;
    perPage?: number;
    includeUnapproved?: boolean;
  } = {}
): Promise<{
  reviews: ProductReview[];
  totalCount: number;
  averageRating: number;
}> => {
  const {
    page = 1,
    perPage = 10,
    includeUnapproved = false
  } = options;
  
  try {
    // Get reviews for this product
    const whereClause = {
      productId,
      status: includeUnapproved ? undefined : "approved"
    };
    
    const [reviews, totalCount, aggregations] = await Promise.all([
      // Get paginated reviews
      prisma.productReview.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              name: true,
              image: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip: (page - 1) * perPage,
        take: perPage
      }),
      
      // Get total count
      prisma.productReview.count({
        where: whereClause
      }),
      
      // Get rating aggregations
      prisma.productReview.aggregate({
        where: whereClause,
        _avg: {
          rating: true
        },
        _count: true
      })
    ]);
    
    // Transform reviews to our interface
    const transformedReviews = reviews.map(review => ({
      id: review.id,
      rating: review.rating,
      title: review.title || undefined,
      content: review.content || undefined,
      status: review.status,
      productId: review.productId,
      userId: review.userId,
      userName: review.user?.name || undefined,
      userImage: review.user?.image || undefined,
      createdAt: review.createdAt,
      images: review.images,
      isVerifiedPurchase: review.isVerifiedPurchase,
      helpfulCount: review.helpfulCount
    }));
    
    return {
      reviews: transformedReviews,
      totalCount,
      averageRating: aggregations._avg.rating || 0
    };
  } catch (error) {
    console.error(`Error fetching reviews for product ${productId}:`, error);
    return {
      reviews: [],
      totalCount: 0,
      averageRating: 0
    };
  }
});

/**
 * Create a new product review
 */
export async function createProductReview(
  data: {
    productId: string;
    userId: string;
    rating: number;
    title?: string;
    content?: string;
    images?: string[];
  }
): Promise<ProductReview | null> {
  try {
    // Check if user has already reviewed this product
    const existingReview = await prisma.productReview.findFirst({
      where: {
        productId: data.productId,
        userId: data.userId
      }
    });
    
    if (existingReview) {
      // Update existing review
      const updatedReview = await prisma.productReview.update({
        where: {
          id: existingReview.id
        },
        data: {
          rating: data.rating,
          title: data.title,
          content: data.content,
          images: data.images || [],
          status: "pending", // Reset to pending for moderation
          updatedAt: new Date()
        },
        include: {
          user: {
            select: {
              name: true,
              image: true
            }
          }
        }
      });
      
      // Update product average rating
      await updateProductRating(data.productId);
      
      return {
        id: updatedReview.id,
        rating: updatedReview.rating,
        title: updatedReview.title || undefined,
        content: updatedReview.content || undefined,
        status: updatedReview.status,
        productId: updatedReview.productId,
        userId: updatedReview.userId,
        userName: updatedReview.user?.name || undefined,
        userImage: updatedReview.user?.image || undefined,
        createdAt: updatedReview.createdAt,
        images: updatedReview.images,
        isVerifiedPurchase: updatedReview.isVerifiedPurchase,
        helpfulCount: updatedReview.helpfulCount
      };
    } else {
      // Create new review
      const newReview = await prisma.productReview.create({
        data: {
          rating: data.rating,
          title: data.title,
          content: data.content,
          images: data.images || [],
          productId: data.productId,
          userId: data.userId,
          // Check if user has purchased the product
          isVerifiedPurchase: await hasUserPurchasedProduct(data.userId, data.productId)
        },
        include: {
          user: {
            select: {
              name: true,
              image: true
            }
          }
        }
      });
      
      // Update product average rating
      await updateProductRating(data.productId);
      
      return {
        id: newReview.id,
        rating: newReview.rating,
        title: newReview.title || undefined,
        content: newReview.content || undefined,
        status: newReview.status,
        productId: newReview.productId,
        userId: newReview.userId,
        userName: newReview.user?.name || undefined,
        userImage: newReview.user?.image || undefined,
        createdAt: newReview.createdAt,
        images: newReview.images,
        isVerifiedPurchase: newReview.isVerifiedPurchase,
        helpfulCount: newReview.helpfulCount
      };
    }
  } catch (error) {
    console.error("Error creating product review:", error);
    return null;
  }
}

/**
 * Check if a user has purchased a specific product
 */
async function hasUserPurchasedProduct(userId: string, productId: string): Promise<boolean> {
  try {
    // Check if user has any completed orders with this product
    const orderCount = await prisma.orderItem.count({
      where: {
        productId,
        order: {
          userId,
          status: {
            in: ["DELIVERED", "SHIPPED"]
          }
        }
      }
    });
    
    return orderCount > 0;
  } catch (error) {
    console.error("Error checking user purchase history:", error);
    return false;
  }
}

/**
 * Update a product's average rating and review count
 */
async function updateProductRating(productId: string): Promise<void> {
  try {
    // Get approved reviews for this product
    const aggregations = await prisma.productReview.aggregate({
      where: {
        productId,
        status: "approved"
      },
      _avg: {
        rating: true
      },
      _count: true
    });
    
    // Update the product
    await prisma.product.update({
      where: {
        id: productId
      },
      data: {
        averageRating: aggregations._avg.rating || 0,
        reviewCount: aggregations._count
      }
    });
  } catch (error) {
    console.error(`Error updating rating for product ${productId}:`, error);
  }
}
