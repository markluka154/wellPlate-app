import { NextRequest, NextResponse } from 'next/server'

// Mark as dynamic to prevent static generation
export const dynamic = 'force-dynamic'

// Dynamic imports to prevent build-time issues
const loadDependencies = async () => {
  const { stripe } = await import('@/lib/stripe')
  const { prisma } = await import('@/lib/supabase')
  const { getStripePriceId } = await import('@/lib/pricing')
  return { stripe, prisma, getStripePriceId }
}

export async function GET(request: NextRequest) {
  try {
    const { stripe, getStripePriceId } = await loadDependencies()
    
    const { searchParams } = new URL(request.url)
    const plan = searchParams.get('plan')

    if (!plan || !['PRO_MONTHLY', 'PRO_ANNUAL', 'FAMILY_MONTHLY'].includes(plan)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    // Check if Stripe is configured
    if (!stripe || !process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.startsWith('sk_test_your')) {
      console.warn('⚠️ Stripe not configured. Redirecting to demo success page.')
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/dashboard?demo_upgrade=true&plan=${plan}`)
    }

    const priceId = getStripePriceId(plan as any)

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXTAUTH_URL}/dashboard?success=true`,
      cancel_url: `${process.env.NEXTAUTH_URL}/pricing`,
    })

    return NextResponse.redirect(session.url!)

  } catch (error) {
    console.error('Checkout error:', error)
    // Fallback to demo mode if Stripe fails
    const plan = new URL(request.url).searchParams.get('plan')
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/dashboard?demo_upgrade=true&plan=${plan}`)
  }
}
