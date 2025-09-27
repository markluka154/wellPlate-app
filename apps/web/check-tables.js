const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkAndCreateTables() {
  try {
    console.log('🔍 Checking existing tables...')

    // Check if Subscription table exists
    try {
      await prisma.$queryRaw`SELECT 1 FROM "Subscription" LIMIT 1`
      console.log('✅ Subscription table already exists')
    } catch (error) {
      console.log('❌ Subscription table does not exist, creating...')
      await prisma.$executeRaw`
        CREATE TABLE "Subscription" (
          "id" TEXT NOT NULL,
          "userId" TEXT NOT NULL,
          "plan" TEXT NOT NULL DEFAULT 'FREE',
          "status" TEXT NOT NULL DEFAULT 'active',
          "stripeCustomerId" TEXT,
          "stripeSubscriptionId" TEXT,
          "stripePriceId" TEXT,
          "stripeCurrentPeriodEnd" TIMESTAMP(3),
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL,
          CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
        )
      `
      console.log('✅ Subscription table created')
    }

    // Check if MealPreference table exists
    try {
      await prisma.$queryRaw`SELECT 1 FROM "MealPreference" LIMIT 1`
      console.log('✅ MealPreference table already exists')
    } catch (error) {
      console.log('❌ MealPreference table does not exist, creating...')
      await prisma.$executeRaw`
        CREATE TABLE "MealPreference" (
          "id" TEXT NOT NULL,
          "userId" TEXT NOT NULL,
          "age" INTEGER NOT NULL,
          "weightKg" DECIMAL(5,2) NOT NULL,
          "heightCm" INTEGER NOT NULL,
          "sex" TEXT NOT NULL,
          "goal" TEXT NOT NULL,
          "dietType" TEXT NOT NULL,
          "allergies" TEXT[],
          "dislikes" TEXT[],
          "cookingEffort" TEXT NOT NULL,
          "caloriesTarget" INTEGER,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL,
          CONSTRAINT "MealPreference_pkey" PRIMARY KEY ("id")
        )
      `
      console.log('✅ MealPreference table created')
    }

    // Check if MealPlan table exists
    try {
      await prisma.$queryRaw`SELECT 1 FROM "MealPlan" LIMIT 1`
      console.log('✅ MealPlan table already exists')
    } catch (error) {
      console.log('❌ MealPlan table does not exist, creating...')
      await prisma.$executeRaw`
        CREATE TABLE "MealPlan" (
          "id" TEXT NOT NULL,
          "userId" TEXT NOT NULL,
          "jsonData" JSONB NOT NULL,
          "calories" INTEGER NOT NULL,
          "macros" JSONB NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL,
          CONSTRAINT "MealPlan_pkey" PRIMARY KEY ("id")
        )
      `
      console.log('✅ MealPlan table created')
    }

    // Check if Document table exists
    try {
      await prisma.$queryRaw`SELECT 1 FROM "Document" LIMIT 1`
      console.log('✅ Document table already exists')
    } catch (error) {
      console.log('❌ Document table does not exist, creating...')
      await prisma.$executeRaw`
        CREATE TABLE "Document" (
          "id" TEXT NOT NULL,
          "userId" TEXT NOT NULL,
          "mealPlanId" TEXT NOT NULL,
          "pdfPath" TEXT NOT NULL,
          "signedUrl" TEXT NOT NULL,
          "expiresAt" TIMESTAMP(3) NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL,
          CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
        )
      `
      console.log('✅ Document table created')
    }

    console.log('✅ All required tables are now available!')

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkAndCreateTables()
