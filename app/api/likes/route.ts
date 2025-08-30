import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { error } from 'console'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

  const { blogPostId, commentId } = await request.json()

    if (!blogPostId && !commentId) {
      return NextResponse.json({ error: 'Content ID required' }, { status: 400 })
    }

    // Check if user already liked this content
    const existingLike = await prisma.like.findFirst({
      where: {
        userId: session.user.id,
        ...(blogPostId && { blogPostId }),
        ...(commentId && { commentId })
      }
    })

    if (existingLike) {
      // If same type, remove like (toggle)
      if (existingLike) {
        // Remove like (toggle)
        await prisma.like.delete({ where: { id: existingLike.id } })

        if (blogPostId) {
          await prisma.blogPost.update({
            where: { id: blogPostId },
            data: { likeCount: { decrement: 1 } }
          })
        }

        return NextResponse.json({ liked: false })
      } else {
        // Create new like
        const like = await prisma.like.create({
          data: {
            userId: session.user.id,
            blogPostId,
            commentId
          }
        })

        if (blogPostId) {
          await prisma.blogPost.update({
            where: { id: blogPostId },
            data: { likeCount: { increment: 1 } }
          })
        }

        return NextResponse.json({ liked: true })
      }
    } else {
      // Create new like
      const like = await prisma.like.create({
        data: {
          userId: session.user.id,
          blogPostId,
          commentId
        }
      })

      if (blogPostId) {
        await prisma.blogPost.update({
          where: { id: blogPostId },
          data: { likeCount: { increment: 1 } }
        })
      }

      return NextResponse.json({ liked: true })
    }
  } catch (error) {
    console.error('Error toggling like:', error)
    return NextResponse.json({ error: 'Failed to toggle like' }, { status: 500 })
  }
}
