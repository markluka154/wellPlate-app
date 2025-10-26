import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getPrismaClient } from '@/lib/prisma'

// PUT /api/family/leftovers/[id] - Update leftover (mark as used, update quantity)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const prisma = getPrismaClient()
    const body = await request.json()

    // Verify leftover belongs to user's family
    const leftover = await prisma.leftover.findUnique({
      where: { id: params.id },
      include: {
        familyMealPlan: {
          include: {
            familyProfile: {
              select: { userId: true }
            }
          }
        }
      }
    })

    if (!leftover) {
      return NextResponse.json({ error: 'Leftover not found' }, { status: 404 })
    }

    if (leftover.familyMealPlan.familyProfile.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Update leftover
    const updated = await prisma.leftover.update({
      where: { id: params.id },
      data: {
        ...(body.quantity !== undefined && { quantity: parseFloat(body.quantity) }),
        ...(body.isUsed !== undefined && { isUsed: body.isUsed }),
        ...(body.usedInMeal !== undefined && { usedInMeal: body.usedInMeal }),
        ...(body.usedAt !== undefined && { usedAt: body.usedAt ? new Date(body.usedAt) : null }),
        ...(body.canBeUsedIn && { canBeUsedIn: body.canBeUsedIn })
      }
    })

    return NextResponse.json({
      success: true,
      leftover: updated
    })
  } catch (error) {
    console.error('Error updating leftover:', error)
    return NextResponse.json(
      { error: 'Failed to update leftover' },
      { status: 500 }
    )
  }
}

// DELETE /api/family/leftovers/[id] - Delete leftover
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const prisma = getPrismaClient()

    // Verify leftover belongs to user's family
    const leftover = await prisma.leftover.findUnique({
      where: { id: params.id },
      include: {
        familyMealPlan: {
          include: {
            familyProfile: {
              select: { userId: true }
            }
          }
        }
      }
    })

    if (!leftover) {
      return NextResponse.json({ error: 'Leftover not found' }, { status: 404 })
    }

    if (leftover.familyMealPlan.familyProfile.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Delete leftover
    await prisma.leftover.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      success: true,
      message: 'Leftover deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting leftover:', error)
    return NextResponse.json(
      { error: 'Failed to delete leftover' },
      { status: 500 }
    )
  }
}

