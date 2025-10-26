import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getPrismaClient } from '@/lib/prisma'

// PUT /api/family/shopping-list/items/[id] - Update shopping item (mark as purchased, etc.)
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

    // Get the shopping item
    const shoppingItem = await prisma.shoppingItem.findUnique({
      where: { id: params.id },
      include: {
        shoppingList: {
          include: {
            familyMealPlan: {
              include: {
                familyProfile: {
                  include: { budget: true }
                }
              }
            }
          }
        }
      }
    })

    if (!shoppingItem) {
      return NextResponse.json({ error: 'Shopping item not found' }, { status: 404 })
    }

    // Verify it belongs to user's family
    if (shoppingItem.shoppingList.familyMealPlan.familyProfile.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Update the shopping item
    const updatedItem = await prisma.shoppingItem.update({
      where: { id: params.id },
      data: {
        ...(body.isPurchased !== undefined && { isPurchased: body.isPurchased }),
        ...(body.actualPrice !== undefined && { actualPrice: body.actualPrice })
      }
    })

    // If marking as purchased AND not already tracked, create budget expense
    if (body.isPurchased && !body.wasAlreadyPurchased && body.shouldTrackExpense) {
      const familyProfile = shoppingItem.shoppingList.familyMealPlan.familyProfile
      
      if (familyProfile.budget) {
        const priceToUse = body.actualPrice || updatedItem.estimatedPrice || 0

        // Create budget expense
        await prisma.budgetExpense.create({
          data: {
            familyBudgetId: familyProfile.budget.id,
            item: updatedItem.name,
            quantity: updatedItem.quantity,
            unitPrice: priceToUse / updatedItem.quantity,
            totalPrice: priceToUse,
            category: updatedItem.category,
            purchaseDate: new Date(),
            usedInMeals: []
          }
        })

        // Update budget's current week spend
        await prisma.familyBudget.update({
          where: { id: familyProfile.budget.id },
          data: {
            currentWeekSpend: {
              increment: priceToUse
            }
          }
        })
      }
    }

    return NextResponse.json({
      success: true,
      item: updatedItem
    })
  } catch (error) {
    console.error('Error updating shopping item:', error)
    return NextResponse.json(
      { error: 'Failed to update shopping item' },
      { status: 500 }
    )
  }
}

