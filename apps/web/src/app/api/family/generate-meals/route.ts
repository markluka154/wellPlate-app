import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getPrismaClient } from '@/lib/prisma'
import type { Session } from 'next-auth'

export const dynamic = 'force-dynamic'

const MEAL_POOL = [
  { name: 'Classic Beef Tacos', cookTime: 30, protein: 'beef', kidFriendly: true, difficulty: 'easy', description: 'Seasoned ground beef in warm tortillas with fresh toppings' },
  { name: 'Baked Chicken Parmesan', cookTime: 45, protein: 'chicken', kidFriendly: true, difficulty: 'medium', description: 'Crispy breaded chicken topped with marinara and cheese' },
  { name: 'Beef and Broccoli Stir Fry', cookTime: 25, protein: 'beef', kidFriendly: true, difficulty: 'easy', description: 'Tender beef with broccoli in savory sauce' },
  { name: 'Turkey Meatball Spaghetti', cookTime: 40, protein: 'turkey', kidFriendly: true, difficulty: 'easy', description: 'Homemade meatballs with spaghetti in tomato sauce' },
  { name: 'Salmon with Roasted Vegetables', cookTime: 35, protein: 'fish', kidFriendly: false, difficulty: 'easy', description: 'Baked salmon with colorful roasted vegetables' },
  { name: 'Chicken Fajita Bowls', cookTime: 30, protein: 'chicken', kidFriendly: true, difficulty: 'easy', description: 'Spiced chicken with peppers, rice, and toppings' },
  { name: 'Pork Tenderloin with Sweet Potatoes', cookTime: 45, protein: 'pork', kidFriendly: true, difficulty: 'medium', description: 'Juicy pork with roasted sweet potatoes' },
  { name: 'Spaghetti Carbonara', cookTime: 25, protein: 'pork', kidFriendly: true, difficulty: 'medium', description: 'Creamy pasta with bacon and parmesan' },
  { name: 'Chicken Tikka Masala', cookTime: 40, protein: 'chicken', kidFriendly: true, difficulty: 'medium', description: 'Spiced chicken in creamy tomato sauce' },
  { name: 'Beef Chili', cookTime: 60, protein: 'beef', kidFriendly: true, difficulty: 'easy', description: 'Hearty beef chili with beans and vegetables' },
  { name: 'Teriyaki Chicken Bowl', cookTime: 35, protein: 'chicken', kidFriendly: true, difficulty: 'easy', description: 'Chicken glazed with teriyaki sauce served over rice' },
  { name: 'Pasta Primavera', cookTime: 25, protein: 'vegetarian', kidFriendly: true, difficulty: 'easy', description: 'Fresh vegetables in creamy sauce over pasta' },
]

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as Session | null

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const prisma = getPrismaClient()
    const { mealType, count, specialRequests } = await request.json()

    // Get user's family profile
    const familyProfile = await prisma.familyProfile.findUnique({
      where: { userId: session.user.id },
      include: {
        members: {
          include: {
            foodPreferences: true,
            mealReactions: {
              take: 10,
              orderBy: { createdAt: 'desc' }
            }
          }
        }
      }
    })

    if (!familyProfile) {
      return NextResponse.json({ error: 'Family profile not found' }, { status: 404 })
    }

    const familyMembers = familyProfile.members

    if (familyMembers.length === 0) {
      return NextResponse.json({ error: 'No family members found' }, { status: 400 })
    }

    // Generate meals based on family preferences
    const generatedMeals = await generateFamilyMeals(familyMembers, count || 7, mealType)

    return NextResponse.json({
      meals: generatedMeals,
      familySize: familyMembers.length,
      totalMembersCompatible: generatedMeals.reduce((sum, m) => sum + m.familyCompatibility, 0)
    })

  } catch (error) {
    console.error('Error generating family meals:', error)
    return NextResponse.json(
      { error: 'Failed to generate family meals' },
      { status: 500 }
    )
  }
}

interface FamilyMeal {
  id: string
  name: string
  cookTime: number
  familyCompatibility: number
  compatibilityScore: number
  portions: Array<{
    memberId: string
    memberName: string
    calories: number
    servingSize: string
  }>
  tags: string[]
  warnings: string[]
  description: string
}

async function generateFamilyMeals(members: any[], count: number, mealType: string = 'dinner'): Promise<FamilyMeal[]> {
  // Combine all allergies
  const allAllergies = new Set<string>()
  members.forEach(m => {
    (m.allergies || []).forEach((allergy: string) => allAllergies.add(allergy.toLowerCase()))
  })

  // Combine all dietary restrictions
  const allDietaryRestrictions = new Set<string>()
  members.forEach(m => {
    (m.dietaryRestrictions || []).forEach((restriction: string) => allDietaryRestrictions.add(restriction.toLowerCase()))
  })

  // Calculate base calories for each member
  const memberCalories = members.map(member => {
    // Base calorie calculation based on age and activity level
    let baseCalories = 1800
    if (member.age < 10) baseCalories = 1200
    else if (member.age < 18) baseCalories = 1800
    else if (member.age > 60) baseCalories = 1600
    
    // Adjust for activity level (1-5 scale)
    const activityMultiplier = (member.activityLevel || 3) / 5
    const adjustedCalories = baseCalories * (0.8 + activityMultiplier * 0.4)
    
    return {
      memberId: member.id,
      memberName: member.name,
      baseCalories: Math.round(adjustedCalories),
      weight: member.weightKg || 70,
      height: member.heightCm || 170,
      age: member.age,
      allergies: member.allergies || [],
      dietaryRestrictions: member.dietaryRestrictions || [],
      healthGoals: member.healthGoals || []
    }
  })

  // Filter and select meals from pool
  const suitableMeals = MEAL_POOL.filter(meal => {
    // Check if meal contains allergens
    const mealHasAllergen = meal.protein && allAllergies.has(meal.protein.toLowerCase())
    return !mealHasAllergen
  })

  // Select random meals
  const shuffled = [...suitableMeals].sort(() => 0.5 - Math.random())
  const selectedMeals = shuffled.slice(0, Math.min(count, shuffled.length))

  // Generate meal data for each selected meal
  return selectedMeals.map((meal, idx) => {
    // Calculate compatibility score
    let compatibleCount = members.length
    const warnings: string[] = []
    
    // Check for kid-friendly issues
    if (!meal.kidFriendly) {
      const kidsCount = members.filter(m => m.age < 18).length
      if (kidsCount > 0) {
        compatibleCount -= kidsCount
        warnings.push(`${kidsCount} kid(s) may not like this meal`)
      }
    }

    // Generate portions for each family member
    const portions = memberCalories.map(member => {
      // Base calorie for this meal (dinner is 600-700 cal, adjust for family)
      const mealCalories = Math.round(member.baseCalories * 0.35) // ~35% of daily calories for dinner
      
      // Adjust based on meal complexity
      let adjustedCalories = mealCalories
      if (meal.difficulty === 'easy') adjustedCalories = Math.round(mealCalories * 0.9)
      if (meal.difficulty === 'medium') adjustedCalories = mealCalories
      if (meal.difficulty === 'hard') adjustedCalories = Math.round(mealCalories * 1.1)

      return {
        memberId: member.memberId,
        memberName: member.memberName,
        calories: adjustedCalories,
        servingSize: calculateServingSize(adjustedCalories, meal.name)
      }
    })

    return {
      id: `meal-${idx + 1}`,
      name: meal.name,
      cookTime: meal.cookTime,
      familyCompatibility: compatibleCount,
      compatibilityScore: Math.round((compatibleCount / members.length) * 100),
      portions,
      tags: generateTags(meal, members),
      warnings: warnings.length > 0 ? warnings : [],
      description: meal.description
    }
  })
}

function calculateServingSize(calories: number, mealName: string): string {
  // Rough estimate based on calories
  if (calories < 400) return '250-300g'
  if (calories < 500) return '300-350g'
  if (calories < 600) return '350-400g'
  return '400-450g'
}

function generateTags(meal: any, members: any[]): string[] {
  const tags: string[] = []
  
  if (meal.kidFriendly) tags.push('kid-friendly')
  if (meal.protein === 'chicken') tags.push('high-protein')
  if (meal.cookTime < 30) tags.push('quick')
  if (meal.difficulty === 'easy') tags.push('easy-prep')
  
  const hasActiveKids = members.some(m => m.age < 18 && (m.activityLevel || 3) > 3)
  if (hasActiveKids) tags.push('energizing')
  
  return tags
}

