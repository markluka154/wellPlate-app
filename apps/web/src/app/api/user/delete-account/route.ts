import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function DELETE(request: NextRequest) {
  try {
    // Get user email from request headers
    const userEmail = request.headers.get('x-user-email')
    if (!userEmail) {
      return NextResponse.json({ error: 'User email required' }, { status: 401 })
    }

    console.log('🗑️ Deleting account for user:', userEmail)

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

    // Log deletion for audit purposes
    console.log('📋 Account deletion audit:', {
      userId: user.id,
      email: user.email,
      mealPlansCount: user.mealPlans.length,
      preferencesCount: user.mealPreferences.length,
      subscriptionPlan: user.subscription?.plan,
      deletionDate: new Date().toISOString()
    })

    // Delete user and all related data (cascade will handle related records)
    await prisma.user.delete({
      where: { id: user.id }
    })

    // Note: Due to Prisma cascade deletes, the following will be automatically deleted:
    // - mealPreferences (cascade delete)
    // - mealPlans (cascade delete)
    // - documents (cascade delete)
    // - subscription (cascade delete)
    // - accounts (cascade delete)
    // - sessions (cascade delete)

    console.log('✅ Account deletion completed for:', userEmail)

    return NextResponse.json({
      success: true,
      message: 'Account and all associated data have been permanently deleted',
      deletionDate: new Date().toISOString(),
      deletedData: {
        personalData: true,
        healthData: true,
        mealPlans: true,
        documents: true,
        subscription: true,
        authentication: true
      }
    })

  } catch (error) {
    console.error('❌ Error deleting user account:', error)
    return NextResponse.json(
      { error: 'Failed to delete account' },
      { status: 500 }
    )
  }
}
