import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getPrismaClient } from '@/lib/prisma'

// POST /api/family/generate-week - Generate a week of meals for the family
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

    // Get family members to understand preferences
    const members = await prisma.familyMember.findMany({
      where: { familyProfileId: familyProfile.id }
    })

    // Generate 7 days of meals
    const today = new Date()
    const weekStart = new Date(today)
    weekStart.setHours(0, 0, 0, 0)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 7)

    // Meal pool with variety (randomly select 7 different meals each time)
    const mealPool = [
      { 
        name: 'Grilled Chicken & Roasted Vegetables',
        description: 'Classic family favorite with seasonal vegetables',
        time: '30 min',
        type: 'balanced',
        calories: 450,
        ingredients: [
          { name: 'Chicken Breast', quantity: 500, unit: 'g' },
          { name: 'Bell Peppers', quantity: 3, unit: 'pieces' },
          { name: 'Zucchini', quantity: 2, unit: 'pieces' },
          { name: 'Olive Oil', quantity: 30, unit: 'ml' },
          { name: 'Salt', quantity: 1, unit: 'tsp' },
          { name: 'Black Pepper', quantity: 1, unit: 'tsp' }
        ]
      },
      { 
        name: 'Pasta with Marinara Sauce',
        description: 'Kid-friendly pasta with fresh vegetables',
        time: '20 min',
        type: 'comfort',
        calories: 380,
        ingredients: [
          { name: 'Pasta', quantity: 400, unit: 'g' },
          { name: 'Tomatoes', quantity: 800, unit: 'g' },
          { name: 'Onion', quantity: 1, unit: 'piece' },
          { name: 'Garlic', quantity: 3, unit: 'cloves' },
          { name: 'Olive Oil', quantity: 20, unit: 'ml' },
          { name: 'Basil', quantity: 10, unit: 'g' }
        ]
      },
      { 
        name: 'Tacos & Rice',
        description: 'Build your own tacos with all the fixings',
        time: '25 min',
        type: 'interactive',
        calories: 480,
        ingredients: [
          { name: 'Ground Beef', quantity: 500, unit: 'g' },
          { name: 'Taco Shells', quantity: 12, unit: 'pieces' },
          { name: 'Rice', quantity: 300, unit: 'g' },
          { name: 'Lettuce', quantity: 200, unit: 'g' },
          { name: 'Tomatoes', quantity: 2, unit: 'pieces' },
          { name: 'Cheddar Cheese', quantity: 200, unit: 'g' },
          { name: 'Sour Cream', quantity: 200, unit: 'g' }
        ]
      },
      { 
        name: 'Salmon & Sweet Potato',
        description: 'Healthy omega-3 rich meal',
        time: '35 min',
        type: 'healthy',
        calories: 420,
        ingredients: [
          { name: 'Salmon Fillet', quantity: 600, unit: 'g' },
          { name: 'Sweet Potato', quantity: 800, unit: 'g' },
          { name: 'Broccoli', quantity: 400, unit: 'g' },
          { name: 'Lemon', quantity: 2, unit: 'pieces' },
          { name: 'Olive Oil', quantity: 30, unit: 'ml' },
          { name: 'Salt', quantity: 1, unit: 'tsp' }
        ]
      },
      { 
        name: 'Sheet Pan Sausage & Veggies',
        description: 'One-pan meal for easy cleanup',
        time: '30 min',
        type: 'easy',
        calories: 440,
        ingredients: [
          { name: 'Italian Sausage', quantity: 800, unit: 'g' },
          { name: 'Potatoes', quantity: 800, unit: 'g' },
          { name: 'Bell Peppers', quantity: 3, unit: 'pieces' },
          { name: 'Onion', quantity: 1, unit: 'piece' },
          { name: 'Olive Oil', quantity: 30, unit: 'ml' },
          { name: 'Italian Seasoning', quantity: 15, unit: 'g' }
        ]
      },
      { 
        name: 'Pizza Night',
        description: 'Homemade pizza with lots of toppings',
        time: '40 min',
        type: 'fun',
        calories: 520,
        ingredients: [
          { name: 'Pizza Dough', quantity: 500, unit: 'g' },
          { name: 'Tomato Sauce', quantity: 200, unit: 'ml' },
          { name: 'Mozzarella Cheese', quantity: 300, unit: 'g' },
          { name: 'Pepperoni', quantity: 150, unit: 'g' },
          { name: 'Mushrooms', quantity: 200, unit: 'g' },
          { name: 'Olives', quantity: 100, unit: 'g' }
        ]
      },
      { 
        name: 'Sunday Roast',
        description: 'Slow-cooked comfort meal',
        time: '60 min',
        type: 'traditional',
        calories: 500,
        ingredients: [
          { name: 'Beef Roast', quantity: 1.5, unit: 'kg' },
          { name: 'Potatoes', quantity: 1, unit: 'kg' },
          { name: 'Carrots', quantity: 500, unit: 'g' },
          { name: 'Onions', quantity: 2, unit: 'pieces' },
          { name: 'Garlic', quantity: 4, unit: 'cloves' },
          { name: 'Beef Broth', quantity: 500, unit: 'ml' },
          { name: 'Rosemary', quantity: 10, unit: 'g' }
        ]
      },
      { 
        name: 'Thai Green Curry',
        description: 'Aromatic coconut curry with vegetables',
        time: '30 min',
        type: 'flavorful',
        calories: 460,
        ingredients: [
          { name: 'Chicken Thighs', quantity: 600, unit: 'g' },
          { name: 'Coconut Milk', quantity: 400, unit: 'ml' },
          { name: 'Green Curry Paste', quantity: 50, unit: 'g' },
          { name: 'Bell Peppers', quantity: 2, unit: 'pieces' },
          { name: 'Bamboo Shoots', quantity: 200, unit: 'g' },
          { name: 'Jasmine Rice', quantity: 300, unit: 'g' },
          { name: 'Lime', quantity: 2, unit: 'pieces' }
        ]
      },
      { 
        name: 'Beef Stir Fry',
        description: 'Quick and colorful Asian-style stir fry',
        time: '25 min',
        type: 'quick',
        calories: 420,
        ingredients: [
          { name: 'Beef Strips', quantity: 500, unit: 'g' },
          { name: 'Broccoli', quantity: 300, unit: 'g' },
          { name: 'Carrots', quantity: 200, unit: 'g' },
          { name: 'Soy Sauce', quantity: 30, unit: 'ml' },
          { name: 'Ginger', quantity: 20, unit: 'g' },
          { name: 'Garlic', quantity: 3, unit: 'cloves' },
          { name: 'Sesame Oil', quantity: 15, unit: 'ml' }
        ]
      },
      { 
        name: 'Mediterranean Bowl',
        description: 'Fresh and healthy Mediterranean flavors',
        time: '20 min',
        type: 'healthy',
        calories: 390,
        ingredients: [
          { name: 'Quinoa', quantity: 300, unit: 'g' },
          { name: 'Cherry Tomatoes', quantity: 300, unit: 'g' },
          { name: 'Cucumber', quantity: 200, unit: 'g' },
          { name: 'Feta Cheese', quantity: 150, unit: 'g' },
          { name: 'Olives', quantity: 100, unit: 'g' },
          { name: 'Olive Oil', quantity: 30, unit: 'ml' },
          { name: 'Lemon', quantity: 1, unit: 'piece' }
        ]
      },
      { 
        name: 'Chicken Burrito Bowls',
        description: 'Build your own burrito bowl',
        time: '30 min',
        type: 'interactive',
        calories: 480,
        ingredients: [
          { name: 'Chicken Breast', quantity: 500, unit: 'g' },
          { name: 'Brown Rice', quantity: 400, unit: 'g' },
          { name: 'Black Beans', quantity: 400, unit: 'g' },
          { name: 'Corn', quantity: 200, unit: 'g' },
          { name: 'Avocado', quantity: 2, unit: 'pieces' },
          { name: 'Salsa', quantity: 200, unit: 'g' },
          { name: 'Cheddar Cheese', quantity: 200, unit: 'g' }
        ]
      },
      { 
        name: 'Lasagna',
        description: 'Classic cheesy lasagna',
        time: '50 min',
        type: 'comfort',
        calories: 520,
        ingredients: [
          { name: 'Lasagna Noodles', quantity: 250, unit: 'g' },
          { name: 'Ground Beef', quantity: 500, unit: 'g' },
          { name: 'Ricotta Cheese', quantity: 500, unit: 'g' },
          { name: 'Mozzarella Cheese', quantity: 300, unit: 'g' },
          { name: 'Tomato Sauce', quantity: 400, unit: 'ml' },
          { name: 'Onion', quantity: 1, unit: 'piece' },
          { name: 'Garlic', quantity: 3, unit: 'cloves' }
        ]
      },
      { 
        name: 'Baked Cod with Vegetables',
        description: 'Light and flaky white fish',
        time: '30 min',
        type: 'healthy',
        calories: 380,
        ingredients: [
          { name: 'Cod Fillets', quantity: 600, unit: 'g' },
          { name: 'Asparagus', quantity: 400, unit: 'g' },
          { name: 'Cherry Tomatoes', quantity: 300, unit: 'g' },
          { name: 'Lemon', quantity: 2, unit: 'pieces' },
          { name: 'Olive Oil', quantity: 30, unit: 'ml' },
          { name: 'Dill', quantity: 10, unit: 'g' }
        ]
      },
      { 
        name: 'Chicken Teriyaki Bowls',
        description: 'Sweet and savory Japanese-inspired meal',
        time: '30 min',
        type: 'flavorful',
        calories: 450,
        ingredients: [
          { name: 'Chicken Breast', quantity: 500, unit: 'g' },
          { name: 'Teriyaki Sauce', quantity: 200, unit: 'ml' },
          { name: 'White Rice', quantity: 400, unit: 'g' },
          { name: 'Broccoli', quantity: 400, unit: 'g' },
          { name: 'Carrots', quantity: 200, unit: 'g' },
          { name: 'Sesame Seeds', quantity: 20, unit: 'g' }
        ]
      },
      { 
        name: 'Vegetarian Chili',
        description: 'Hearty plant-based chili',
        time: '35 min',
        type: 'comfort',
        calories: 400,
        ingredients: [
          { name: 'Kidney Beans', quantity: 400, unit: 'g' },
          { name: 'Black Beans', quantity: 400, unit: 'g' },
          { name: 'Tomatoes', quantity: 800, unit: 'g' },
          { name: 'Bell Peppers', quantity: 2, unit: 'pieces' },
          { name: 'Onion', quantity: 1, unit: 'piece' },
          { name: 'Chili Powder', quantity: 15, unit: 'g' },
          { name: 'Cheddar Cheese', quantity: 200, unit: 'g' }
        ]
      },
      { 
        name: 'Pork Chops with Apples',
        description: 'Savory pork with sweet apples',
        time: '35 min',
        type: 'balanced',
        calories: 470,
        ingredients: [
          { name: 'Pork Chops', quantity: 600, unit: 'g' },
          { name: 'Apples', quantity: 3, unit: 'pieces' },
          { name: 'Potatoes', quantity: 600, unit: 'g' },
          { name: 'Onion', quantity: 1, unit: 'piece' },
          { name: 'Thyme', quantity: 10, unit: 'g' },
          { name: 'Butter', quantity: 30, unit: 'g' }
        ]
      },
      { 
        name: 'Mushroom Risotto',
        description: 'Creamy Italian risotto',
        time: '40 min',
        type: 'gourmet',
        calories: 420,
        ingredients: [
          { name: 'Arborio Rice', quantity: 300, unit: 'g' },
          { name: 'Mushrooms', quantity: 400, unit: 'g' },
          { name: 'Onion', quantity: 1, unit: 'piece' },
          { name: 'Parmesan Cheese', quantity: 150, unit: 'g' },
          { name: 'White Wine', quantity: 150, unit: 'ml' },
          { name: 'Vegetable Broth', quantity: 500, unit: 'ml' }
        ]
      },
      { 
        name: 'Grilled Steak with Potatoes',
        description: 'Classic steak dinner',
        time: '25 min',
        type: 'gourmet',
        calories: 550,
        ingredients: [
          { name: 'Ribeye Steak', quantity: 800, unit: 'g' },
          { name: 'Potatoes', quantity: 800, unit: 'g' },
          { name: 'Asparagus', quantity: 300, unit: 'g' },
          { name: 'Butter', quantity: 40, unit: 'g' },
          { name: 'Rosemary', quantity: 10, unit: 'g' }
        ]
      },
      { 
        name: 'Stuffed Bell Peppers',
        description: 'Flavorful stuffed peppers',
        time: '45 min',
        type: 'comfort',
        calories: 380,
        ingredients: [
          { name: 'Bell Peppers', quantity: 4, unit: 'pieces' },
          { name: 'Ground Turkey', quantity: 500, unit: 'g' },
          { name: 'Rice', quantity: 200, unit: 'g' },
          { name: 'Tomatoes', quantity: 400, unit: 'g' },
          { name: 'Onion', quantity: 1, unit: 'piece' },
          { name: 'Cheddar Cheese', quantity: 200, unit: 'g' }
        ]
      },
      { 
        name: 'Fish Tacos',
        description: 'Light and fresh fish tacos',
        time: '30 min',
        type: 'healthy',
        calories: 420,
        ingredients: [
          { name: 'White Fish', quantity: 600, unit: 'g' },
          { name: 'Tortillas', quantity: 12, unit: 'pieces' },
          { name: 'Cabbage', quantity: 300, unit: 'g' },
          { name: 'Cilantro', quantity: 20, unit: 'g' },
          { name: 'Lime', quantity: 3, unit: 'pieces' },
          { name: 'Avocado', quantity: 2, unit: 'pieces' }
        ]
      },
      { 
        name: 'Chicken Fajitas',
        description: 'Sizzling fajitas with peppers and onions',
        time: '25 min',
        type: 'interactive',
        calories: 460,
        ingredients: [
          { name: 'Chicken Strips', quantity: 500, unit: 'g' },
          { name: 'Bell Peppers', quantity: 4, unit: 'pieces' },
          { name: 'Onion', quantity: 2, unit: 'pieces' },
          { name: 'Tortillas', quantity: 12, unit: 'pieces' },
          { name: 'Cheddar Cheese', quantity: 200, unit: 'g' },
          { name: 'Sour Cream', quantity: 200, unit: 'g' }
        ]
      },
      { 
        name: 'Spaghetti Carbonara',
        description: 'Creamy Italian pasta',
        time: '20 min',
        type: 'gourmet',
        calories: 520,
        ingredients: [
          { name: 'Spaghetti', quantity: 400, unit: 'g' },
          { name: 'Bacon', quantity: 200, unit: 'g' },
          { name: 'Eggs', quantity: 4, unit: 'pieces' },
          { name: 'Parmesan Cheese', quantity: 200, unit: 'g' },
          { name: 'Black Pepper', quantity: 2, unit: 'tsp' }
        ]
      },
      { 
        name: 'Beef Stew',
        description: 'Hearty slow-cooked stew',
        time: '90 min',
        type: 'comfort',
        calories: 480,
        ingredients: [
          { name: 'Beef Chuck', quantity: 800, unit: 'g' },
          { name: 'Potatoes', quantity: 800, unit: 'g' },
          { name: 'Carrots', quantity: 400, unit: 'g' },
          { name: 'Onions', quantity: 2, unit: 'pieces' },
          { name: 'Beef Broth', quantity: 500, unit: 'ml' },
          { name: 'Tomato Paste', quantity: 50, unit: 'g' }
        ]
      },
      { 
        name: 'Shrimp Scampi',
        description: 'Garlic butter shrimp pasta',
        time: '20 min',
        type: 'gourmet',
        calories: 440,
        ingredients: [
          { name: 'Shrimp', quantity: 600, unit: 'g' },
          { name: 'Linguine', quantity: 300, unit: 'g' },
          { name: 'Butter', quantity: 60, unit: 'g' },
          { name: 'Garlic', quantity: 4, unit: 'cloves' },
          { name: 'White Wine', quantity: 100, unit: 'ml' },
          { name: 'Lemon', quantity: 2, unit: 'pieces' }
        ]
      },
      { 
        name: 'Tofu Stir Fry',
        description: 'Protein-packed vegetarian stir fry',
        time: '25 min',
        type: 'healthy',
        calories: 360,
        ingredients: [
          { name: 'Tofu', quantity: 400, unit: 'g' },
          { name: 'Broccoli', quantity: 300, unit: 'g' },
          { name: 'Carrots', quantity: 200, unit: 'g' },
          { name: 'Bell Peppers', quantity: 2, unit: 'pieces' },
          { name: 'Soy Sauce', quantity: 40, unit: 'ml' },
          { name: 'Ginger', quantity: 20, unit: 'g' }
        ]
      },
      { 
        name: 'Lamb Chops with Mint Sauce',
        description: 'Elegant lamb with fresh mint',
        time: '30 min',
        type: 'gourmet',
        calories: 500,
        ingredients: [
          { name: 'Lamb Chops', quantity: 600, unit: 'g' },
          { name: 'Potatoes', quantity: 600, unit: 'g' },
          { name: 'Green Beans', quantity: 300, unit: 'g' },
          { name: 'Mint', quantity: 20, unit: 'g' },
          { name: 'Yogurt', quantity: 200, unit: 'g' },
          { name: 'Lemon', quantity: 1, unit: 'piece' }
        ]
      },
      { 
        name: 'BBQ Chicken Sliders',
        description: 'Pulled chicken sliders',
        time: '50 min',
        type: 'fun',
        calories: 450,
        ingredients: [
          { name: 'Chicken Thighs', quantity: 800, unit: 'g' },
          { name: 'BBQ Sauce', quantity: 200, unit: 'ml' },
          { name: 'Slider Buns', quantity: 12, unit: 'pieces' },
          { name: 'Coleslaw', quantity: 400, unit: 'g' },
          { name: 'Pickles', quantity: 100, unit: 'g' }
        ]
      },
      { 
        name: 'Ratatouille',
        description: 'French vegetable stew',
        time: '45 min',
        type: 'healthy',
        calories: 320,
        ingredients: [
          { name: 'Eggplant', quantity: 400, unit: 'g' },
          { name: 'Zucchini', quantity: 300, unit: 'g' },
          { name: 'Tomatoes', quantity: 600, unit: 'g' },
          { name: 'Bell Peppers', quantity: 2, unit: 'pieces' },
          { name: 'Onion', quantity: 1, unit: 'piece' },
          { name: 'Garlic', quantity: 4, unit: 'cloves' },
          { name: 'Olive Oil', quantity: 40, unit: 'ml' }
        ]
      }
    ]

    // Randomly shuffle and select 7 meals
    const shuffled = mealPool.sort(() => 0.5 - Math.random())
    const selectedMeals = shuffled.slice(0, 7)

    // Assign dates to selected meals
    const weeklyMeals = selectedMeals.map((meal, index) => {
      const mealDate = new Date(weekStart.getTime() + index * 24*60*60*1000)
      return {
        ...meal,
        date: mealDate.toISOString(),
        status: today <= mealDate ? 'shopping' : 'planned'
      }
    })

    // Check if there's an existing active meal plan
    const existingPlan = await prisma.familyMealPlan.findFirst({
      where: {
        familyProfileId: familyProfile.id,
        isActive: true
      }
    })

    if (existingPlan) {
      // Update existing plan
      await prisma.familyMealPlan.update({
        where: { id: existingPlan.id },
        data: {
          weekStartDate: weekStart,
          weekEndDate: weekEnd,
          meals: JSON.stringify(weeklyMeals)
        }
      })

      return NextResponse.json({
        success: true,
        message: 'Week meal plan updated',
        meals: weeklyMeals
      })
    } else {
      // Create new meal plan
      await prisma.familyMealPlan.create({
        data: {
          familyProfileId: familyProfile.id,
          weekStartDate: weekStart,
          weekEndDate: weekEnd,
          meals: JSON.stringify(weeklyMeals),
          isActive: true
        }
      })

      return NextResponse.json({
        success: true,
        message: 'Week meal plan generated successfully',
        meals: weeklyMeals
      })
    }
  } catch (error) {
    console.error('Error generating week plan:', error)
    return NextResponse.json(
      { error: 'Failed to generate week plan' },
      { status: 500 }
    )
  }
}

