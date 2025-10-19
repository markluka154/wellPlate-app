import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Get user email from request headers
    const userEmail = request.headers.get('x-user-email')
    if (!userEmail) {
      return NextResponse.json({ error: 'User email required' }, { status: 401 })
    }

    console.log('📤 Exporting data for user:', userEmail)

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      include: {
        mealPreferences: true,
        mealPlans: {
          include: {
            documents: true
          }
        },
        subscription: true,
        accounts: true,
        sessions: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Prepare export data
    const exportData = {
      exportInfo: {
        exportDate: new Date().toISOString(),
        userEmail: user.email,
        dataVersion: '1.0',
        format: 'JSON'
      },
      personalData: {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      },
      healthData: user.mealPreferences.map(pref => ({
        id: pref.id,
        age: pref.age,
        weightKg: pref.weightKg,
        heightCm: pref.heightCm,
        sex: pref.sex,
        goal: pref.goal,
        dietType: pref.dietType,
        allergies: pref.allergies,
        dislikes: pref.dislikes,
        cookingEffort: pref.cookingEffort,
        caloriesTarget: pref.caloriesTarget,
        mealsPerDay: pref.mealsPerDay,
        includeProteinShakes: pref.includeProteinShakes,
        createdAt: pref.createdAt,
        updatedAt: pref.updatedAt
      })),
      mealPlans: user.mealPlans.map(plan => ({
        id: plan.id,
        calories: plan.calories,
        macros: plan.macros,
        jsonData: plan.jsonData,
        createdAt: plan.createdAt,
        documents: plan.documents.map(doc => ({
          id: doc.id,
          pdfPath: doc.pdfPath,
          expiresAt: doc.expiresAt,
          createdAt: doc.createdAt
        }))
      })),
      subscription: user.subscription ? {
        plan: user.subscription.plan,
        status: user.subscription.status,
        stripeCustomerId: user.subscription.stripeCustomerId,
        stripeSubscriptionId: user.subscription.stripeSubscriptionId,
        createdAt: user.subscription.createdAt,
        updatedAt: user.subscription.updatedAt
      } : null,
      authentication: {
        accounts: user.accounts.map(acc => ({
          provider: acc.provider,
          type: acc.type
        })),
        sessions: user.sessions.map(session => ({
          id: session.id,
          expires: session.expires
        }))
      },
      gdprInfo: {
        dataController: 'WellPlate',
        contactEmail: 'privacy@wellplate.eu',
        legalBasis: 'Consent and Contract Performance',
        retentionPeriod: 'Account active + 2 years for meal plans',
        dataCategories: [
          'Personal identification data',
          'Health and dietary data',
          'Generated meal plans',
          'Payment information',
          'Authentication data'
        ]
      }
    }

    console.log('✅ Data export completed for:', userEmail)

    return NextResponse.json(exportData, {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="wellplate-data-export-${userEmail}-${new Date().toISOString().split('T')[0]}.json"`
      }
    })

  } catch (error) {
    console.error('❌ Error exporting user data:', error)
    return NextResponse.json(
      { error: 'Failed to export data' },
      { status: 500 }
    )
  }
}
