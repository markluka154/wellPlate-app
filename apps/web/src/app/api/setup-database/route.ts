import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Creating all database tables...')

    // Create User table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "User" (
        "id" TEXT NOT NULL,
        "email" TEXT NOT NULL,
        "name" TEXT,
        "image" TEXT,
        "emailVerified" TIMESTAMP(3),
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "User_pkey" PRIMARY KEY ("id")
      )
    `
    console.log('✅ User table created')

    // Create Account table (for NextAuth)
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Account" (
        "id" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "type" TEXT NOT NULL,
        "provider" TEXT NOT NULL,
        "providerAccountId" TEXT NOT NULL,
        "refresh_token" TEXT,
        "access_token" TEXT,
        "expires_at" INTEGER,
        "token_type" TEXT,
        "scope" TEXT,
        "id_token" TEXT,
        "session_state" TEXT,
        CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
      )
    `
    console.log('✅ Account table created')

    // Create Session table (for NextAuth)
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Session" (
        "id" TEXT NOT NULL,
        "sessionToken" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "expires" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
      )
    `
    console.log('✅ Session table created')

    // Create VerificationToken table (for NextAuth)
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "VerificationToken" (
        "identifier" TEXT NOT NULL,
        "token" TEXT NOT NULL,
        "expires" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "VerificationToken_pkey" PRIMARY KEY ("identifier", "token")
      )
    `
    console.log('✅ VerificationToken table created')

    // Create Subscription table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Subscription" (
        "id" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "plan" TEXT NOT NULL DEFAULT 'FREE',
        "status" TEXT NOT NULL DEFAULT 'active',
        "stripeCustomerId" TEXT,
        "stripeSubscriptionId" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
      )
    `
    console.log('✅ Subscription table created')

    // Create MealPreference table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "MealPreference" (
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

    // Create MealPlan table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "MealPlan" (
        "id" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "jsonData" JSONB NOT NULL,
        "calories" INTEGER NOT NULL,
        "macros" JSONB NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "MealPlan_pkey" PRIMARY KEY ("id")
      )
    `
    console.log('✅ MealPlan table created')

    // Create Document table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Document" (
        "id" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "mealPlanId" TEXT NOT NULL,
        "pdfPath" TEXT NOT NULL,
        "signedUrl" TEXT,
        "expiresAt" TIMESTAMP(3) NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
      )
    `
    console.log('✅ Document table created')

    // Create indexes
    await prisma.$executeRaw`CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email")`
    await prisma.$executeRaw`CREATE UNIQUE INDEX IF NOT EXISTS "Subscription_userId_key" ON "Subscription"("userId")`
    await prisma.$executeRaw`CREATE UNIQUE INDEX IF NOT EXISTS "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId")`
    await prisma.$executeRaw`CREATE UNIQUE INDEX IF NOT EXISTS "Session_sessionToken_key" ON "Session"("sessionToken")`

    console.log('✅ All tables and indexes created successfully!')

    return NextResponse.json({ 
      success: true, 
      message: 'All database tables created successfully!' 
    })

  } catch (error) {
    console.error('❌ Error creating tables:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}
