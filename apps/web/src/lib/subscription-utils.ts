import { getPrismaClient } from './prisma'

export async function checkFamilyAccess(userId: string): Promise<{ hasAccess: boolean; plan: string; needsUpgrade: boolean }> {
  try {
    const prisma = getPrismaClient()
    
    const subscription = await prisma.subscription.findUnique({
      where: { userId }
    })

    if (!subscription) {
      return { hasAccess: false, plan: 'FREE', needsUpgrade: true }
    }

    const hasFamilyAccess = subscription.plan === 'FAMILY_MONTHLY' && subscription.status === 'active'
    const needsUpgrade = !hasFamilyAccess

    return {
      hasAccess: hasFamilyAccess,
      plan: subscription.plan || 'FREE',
      needsUpgrade
    }
  } catch (error) {
    console.error('Error checking family access:', error)
    return { hasAccess: false, plan: 'FREE', needsUpgrade: true }
  }
}

export function getUpgradeMessage(currentPlan: string): string {
  switch (currentPlan) {
    case 'FREE':
      return 'Upgrade to Family Pack to unlock all family features!'
    case 'PRO_MONTHLY':
    case 'PRO_ANNUAL':
      return 'Upgrade to Family Pack to add your family members and manage meals for everyone!'
    default:
      return 'Upgrade to Family Pack to access family features!'
  }
}

