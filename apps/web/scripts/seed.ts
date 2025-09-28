import { PrismaClient } from '@prisma/client'
import { type MealPlanResponse } from '@wellplate/shared'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create test user
  const testUser = await prisma.user.upsert({
    where: { email: 'test@wellplate.com' },
    update: {},
    create: {
      email: 'test@wellplate.com',
      name: 'Test User',
      emailVerified: new Date(),
    },
  })

  console.log('✅ Created test user:', testUser.email)

  // Create FREE subscription for test user
  const subscription = await prisma.subscription.upsert({
    where: { userId: testUser.id },
    update: {},
    create: {
      userId: testUser.id,
      plan: 'FREE',
      status: 'active',
    },
  })

  console.log('✅ Created subscription:', subscription.plan)

  // Create sample meal preferences
  const existingMealPreference = await prisma.mealPreference.findFirst({
    where: { userId: testUser.id },
  })

  let mealPreference
  if (existingMealPreference) {
    mealPreference = existingMealPreference
    console.log('✅ Meal preferences already exist')
  } else {
    mealPreference = await prisma.mealPreference.create({
      data: {
        userId: testUser.id,
        age: 30,
        weightKg: 70,
        heightCm: 170,
        sex: 'male',
        goal: 'maintain',
        dietType: 'omnivore',
        allergies: ['nuts'],
        dislikes: ['mushrooms'],
        cookingEffort: 'quick',
        caloriesTarget: 2000,
      },
    })
    console.log('✅ Created meal preferences')
  }

  // Create sample meal plan
  const sampleMealPlan: MealPlanResponse = {
    plan: [
      {
        day: 1,
        meals: [
          {
            name: 'Greek Yogurt Parfait',
            kcal: 420,
            protein_g: 28,
            carbs_g: 45,
            fat_g: 14,
            ingredients: [
              { item: 'Greek yogurt', qty: '200g' },
              { item: 'Berries', qty: '100g' },
              { item: 'Honey', qty: '1 tbsp' },
              { item: 'Granola', qty: '30g' },
            ],
            steps: [
              'Mix yogurt with honey',
              'Layer yogurt, berries, and granola',
              'Serve immediately',
            ],
          },
          {
            name: 'Grilled Chicken Salad',
            kcal: 450,
            protein_g: 35,
            carbs_g: 25,
            fat_g: 20,
            ingredients: [
              { item: 'Chicken breast', qty: '150g' },
              { item: 'Mixed greens', qty: '100g' },
              { item: 'Cherry tomatoes', qty: '50g' },
              { item: 'Olive oil', qty: '1 tbsp' },
            ],
            steps: [
              'Grill chicken breast',
              'Chop vegetables',
              'Mix with olive oil dressing',
              'Top with grilled chicken',
            ],
          },
          {
            name: 'Salmon with Quinoa',
            kcal: 520,
            protein_g: 40,
            carbs_g: 35,
            fat_g: 25,
            ingredients: [
              { item: 'Salmon fillet', qty: '150g' },
              { item: 'Quinoa', qty: '80g' },
              { item: 'Broccoli', qty: '100g' },
              { item: 'Lemon', qty: '1/2' },
            ],
            steps: [
              'Cook quinoa according to package',
              'Steam broccoli',
              'Pan-sear salmon',
              'Serve with lemon',
            ],
          },
        ],
      },
      // Add more days as needed...
    ],
    totals: {
      kcal: 2000,
      protein_g: 130,
      carbs_g: 200,
      fat_g: 70,
    },
    groceries: [
      { category: 'Dairy', items: ['Greek yogurt (1kg)'] },
      { category: 'Produce', items: ['Berries (700g)', 'Mixed greens (500g)', 'Cherry tomatoes (350g)', 'Broccoli (700g)'] },
      { category: 'Protein', items: ['Chicken breast (1kg)', 'Salmon fillet (1kg)'] },
      { category: 'Grains', items: ['Granola (300g)', 'Quinoa (560g)'] },
      { category: 'Pantry', items: ['Honey (250g)', 'Olive oil (500ml)', 'Lemons (6)'] },
    ],
  }

  const mealPlan = await prisma.mealPlan.create({
    data: {
      userId: testUser.id,
      jsonData: sampleMealPlan as any,
      calories: sampleMealPlan.totals.kcal,
      macros: {
        protein_g: sampleMealPlan.totals.protein_g,
        carbs_g: sampleMealPlan.totals.carbs_g,
        fat_g: sampleMealPlan.totals.fat_g,
      },
    },
  })

  console.log('✅ Created sample meal plan')

  // Create sample document
  const document = await prisma.document.create({
    data: {
      userId: testUser.id,
      mealPlanId: mealPlan.id,
      pdfPath: `mealplans/${testUser.id}/${mealPlan.id}.pdf`,
      signedUrl: 'https://example.com/sample-pdf.pdf',
    },
  })

  console.log('✅ Created sample document')

  console.log('🎉 Database seeded successfully!')
  console.log('')
  console.log('Test user credentials:')
  console.log('Email: test@wellplate.com')
  console.log('Plan: FREE')
  console.log('')
  console.log('You can now:')
  console.log('1. Sign in with test@wellplate.com')
  console.log('2. View the sample meal plan in the dashboard')
  console.log('3. Test the meal plan generation (limited to 1 per month on FREE plan)')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
