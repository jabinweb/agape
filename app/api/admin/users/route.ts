import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has appropriate role
    if (!['ADMIN', 'STAFF'].includes(session.user?.role as string)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const rolesParam = searchParams.get('roles')
    const search = searchParams.get('search')

    // Parse roles parameter
    const roles = rolesParam ? rolesParam.split(',') : []

    const users = await prisma.user.findMany({
      where: {
        AND: [
          roles.length > 0 ? { role: { in: roles as any[] } } : {},
          search ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } }
            ]
          } : {}
        ]
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json({ users })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}
