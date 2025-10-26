import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getPrismaClient } from '@/lib/prisma'

// GET /api/family/shopping-list - Get shopping list for active meal plan
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const prisma = getPrismaClient()

    // Get family profile
    const familyProfile = await prisma.familyProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true }
    })

    if (!familyProfile) {
      return NextResponse.json({ error: 'Family profile not found' }, { status: 404 })
    }

    // Get active meal plan
    const mealPlan = await prisma.familyMealPlan.findFirst({
      where: {
        familyProfileId: familyProfile.id,
        isActive: true,
        weekStartDate: { lte: new Date() },
        weekEndDate: { gte: new Date() }
      },
      include: {
        shoppingList: {
          include: {
            items: true
          }
        }
      },
      orderBy: { weekStartDate: 'desc' }
    })

    if (!mealPlan) {
      return NextResponse.json({
        shoppingList: null,
        message: 'No active meal plan found'
      })
    }

    // Return existing shopping list if it exists
    if (mealPlan.shoppingList) {
      return NextResponse.json({
        shoppingList: mealPlan.shoppingList,
        message: 'Shopping list retrieved successfully'
      })
    }

    // No shopping list yet
    return NextResponse.json({
      shoppingList: null,
      message: 'No shopping list generated yet'
    })
  } catch (error) {
    console.error('Error fetching shopping list:', error)
    return NextResponse.json(
      { error: 'Failed to fetch shopping list' },
      { status: 500 }
    )
  }
}

// POST /api/family/shopping-list - Generate shopping list from meal plan
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const prisma = getPrismaClient()

    // Get family profile
    const familyProfile = await prisma.familyProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true }
    })

    if (!familyProfile) {
      return NextResponse.json({ error: 'Family profile not found' }, { status: 404 })
    }

    // Get active meal plan
    const mealPlan = await prisma.familyMealPlan.findFirst({
      where: {
        familyProfileId: familyProfile.id,
        isActive: true,
        weekStartDate: { lte: new Date() },
        weekEndDate: { gte: new Date() }
      },
      orderBy: { weekStartDate: 'desc' }
    })

    if (!mealPlan) {
      return NextResponse.json({ error: 'No active meal plan found' }, { status: 404 })
    }

    // Parse meals
    let meals: any[] = []
    if (typeof mealPlan.meals === 'string') {
      try {
        meals = JSON.parse(mealPlan.meals)
      } catch (e) {
        meals = []
      }
    } else if (Array.isArray(mealPlan.meals)) {
      meals = mealPlan.meals
    }

    if (meals.length === 0) {
      return NextResponse.json({ error: 'No meals found in meal plan' }, { status: 404 })
    }

    // Extract ingredients from all meals
    const allIngredients = new Map<string, any>()

    meals.forEach((meal: any) => {
      if (!meal.ingredients || !Array.isArray(meal.ingredients)) return

      meal.ingredients.forEach((ing: any) => {
        const name = ing.name || ing.item || 'Unknown'
        const quantity = parseFloat(ing.quantity || ing.qty || '1')
        const unit = ing.unit || ing.units || 'unit'
        const key = `${name.toLowerCase().trim()}|${unit}`

        if (allIngredients.has(key)) {
          const existing = allIngredients.get(key)
          existing.quantity += quantity
        } else {
          allIngredients.set(key, {
            name: name,
            quantity: quantity,
            unit: unit,
            category: categorizeIngredient(name)
          })
        }
      })
    })

    // Convert to shopping items
    const shoppingItems = Array.from(allIngredients.values()).map((ing, index) => {
      return {
        name: ing.name,
        quantity: ing.quantity,
        unit: ing.unit,
        category: ing.category,
        estimatedPrice: estimatePrice(ing.name, ing.category),
        isPurchased: false,
        usedInMeals: [] // TODO: Track which meals use this ingredient
      }
    })

    // Check if shopping list already exists
    const existingShoppingList = await prisma.shoppingList.findUnique({
      where: { familyMealPlanId: mealPlan.id }
    })

    let shoppingList

    if (existingShoppingList) {
      // Delete old items and create new ones
      await prisma.shoppingItem.deleteMany({
        where: { shoppingListId: existingShoppingList.id }
      })

      // Update shopping list
      shoppingList = await prisma.shoppingList.update({
        where: { id: existingShoppingList.id },
        data: {
          isCompleted: false,
          completedAt: null,
          estimatedTotal: calculateEstimatedTotal(shoppingItems),
          items: {
            create: shoppingItems.map(item => ({
              name: item.name,
              quantity: item.quantity,
              unit: item.unit,
              category: item.category,
              estimatedPrice: item.estimatedPrice,
              isPurchased: false,
              usedInMeals: []
            }))
          }
        },
        include: {
          items: true
        }
      })
    } else {
      // Create new shopping list
      shoppingList = await prisma.shoppingList.create({
        data: {
          familyMealPlanId: mealPlan.id,
          items: {
            create: shoppingItems.map(item => ({
              name: item.name,
              quantity: item.quantity,
              unit: item.unit,
              category: item.category,
              estimatedPrice: item.estimatedPrice,
              isPurchased: false,
              usedInMeals: []
            }))
          },
          estimatedTotal: calculateEstimatedTotal(shoppingItems)
        },
        include: {
          items: true
        }
      })
    }

    return NextResponse.json({
      shoppingList,
      message: 'Shopping list generated successfully'
    })
  } catch (error) {
    console.error('Error generating shopping list:', error)
    return NextResponse.json(
      { error: 'Failed to generate shopping list' },
      { status: 500 }
    )
  }
}

// Helper function to categorize ingredients
function categorizeIngredient(name: string): string {
  const lowerName = name.toLowerCase()

  // Proteins
  if (lowerName.includes('chicken') || lowerName.includes('beef') || lowerName.includes('pork') ||
      lowerName.includes('turkey') || lowerName.includes('lamb')) {
    return 'Protein - Meat'
  }
  if (lowerName.includes('fish') || lowerName.includes('salmon') || lowerName.includes('tuna') ||
      lowerName.includes('cod') || lowerName.includes('shrimp')) {
    return 'Protein - Seafood'
  }
  if (lowerName.includes('egg') || lowerName.includes('tofu') || lowerName.includes('tempeh') ||
      lowerName.includes('legume') || lowerName.includes('bean')) {
    return 'Protein - Other'
  }

  // Dairy
  if (lowerName.includes('milk') || lowerName.includes('cheese') || lowerName.includes('yogurt') ||
      lowerName.includes('butter') || lowerName.includes('cream')) {
    return 'Dairy'
  }

  // Vegetables
  if (lowerName.includes('tomato') || lowerName.includes('onion') || lowerName.includes('garlic') ||
      lowerName.includes('pepper') || lowerName.includes('cucumber')) {
    return 'Vegetables'
  }
  if (lowerName.includes('lettuce') || lowerName.includes('spinach') || lowerName.includes('kale') ||
      lowerName.includes('broccoli') || lowerName.includes('carrot')) {
    return 'Vegetables'
  }

  // Fruits
  if (lowerName.includes('apple') || lowerName.includes('banana') || lowerName.includes('orange') ||
      lowerName.includes('berry') || lowerName.includes('fruit')) {
    return 'Fruits'
  }

  // Grains
  if (lowerName.includes('rice') || lowerName.includes('pasta') || lowerName.includes('bread') ||
      lowerName.includes('quinoa') || lowerName.includes('oats')) {
    return 'Grains & Starches'
  }

  // Oils & Condiments
  if (lowerName.includes('oil') || lowerName.includes('vinegar') || lowerName.includes('sauce') ||
      lowerName.includes('soy') || lowerName.includes('salt')) {
    return 'Oils & Condiments'
  }

  // Nuts & Seeds
  if (lowerName.includes('nut') || lowerName.includes('almond') || lowerName.includes('walnut') ||
      lowerName.includes('seed')) {
    return 'Nuts & Seeds'
  }

  return 'Other'
}

// Helper function to estimate price (in EUR)
function estimatePrice(name: string, category: string): number {
  const lowerName = name.toLowerCase()
  
  // Category-based pricing
  switch (category) {
    case 'Protein - Meat':
      return 8.99
    case 'Protein - Seafood':
      return 12.99
    case 'Protein - Other':
      return 4.99
    case 'Dairy':
      return 3.99
    case 'Vegetables':
      return 2.49
    case 'Fruits':
      return 3.49
    case 'Grains & Starches':
      return 2.99
    case 'Oils & Condiments':
      return 3.99
    case 'Nuts & Seeds':
      return 5.99
    default:
      return 2.99
  }
}

// Helper function to calculate total estimated cost
function calculateEstimatedTotal(items: any[]): number {
  return items.reduce((total, item) => {
    return total + (item.estimatedPrice || 0)
  }, 0)
}

