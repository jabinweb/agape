import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'



export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id || !['ADMIN', 'STAFF'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get total customers (from User table where role is not ADMIN/STAFF)
    const totalCustomers = await prisma.user.count({
      where: { 
        role: { 
          in: ['USER', 'MEMBER'] 
        } 
      }
    })
    
    // Get total products
    const totalProducts = await prisma.product.count()
    
    // Get total blog posts
    const totalBlogPosts = await prisma.blogPost.count()
    
    // Get total orders
    const totalOrders = await prisma.order.count()
    
    // Get total revenue (sum of all completed orders)
      const totalRevenue = await prisma.order.aggregate({
        where: {
          status: 'DELIVERED'
        },
        _sum: { 
          totalAmount: true 
        }
      })

    return NextResponse.json({
      stats: {
        totalCustomers,
        totalProducts,
        totalBlogPosts,
        totalOrders,
        totalRevenue: totalRevenue._sum.totalAmount || 0
      }
    })
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json({ error: 'Failed to fetch dashboard stats' }, { status: 500 })
  }
}
