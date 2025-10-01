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
    const { searchParams } = new URL(request.url)
    const plan = searchParams.get('plan')
    
    // Try to get email from header first, then from query parameter
    const userEmail = request.headers.get('x-user-email') || searchParams.get('email')

    console.log('Checkout request:', { plan, userEmail, hasHeader: !!request.headers.get('x-user-email'), hasParam: !!searchParams.get('email') })

    if (!plan || !['PRO_MONTHLY', 'PRO_ANNUAL', 'FAMILY_MONTHLY'].includes(plan)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    if (!userEmail) {
      console.error('No email found in headers or query params')
      return NextResponse.json({ error: 'User email required' }, { status: 401 })
    }

    // Check if this is the demo user
    const isDemoUser = userEmail === 'markluka154@gmail.com'
    
    // Demo user always gets demo mode
    if (isDemoUser) {
      console.log('Demo user detected, using demo mode:', userEmail)
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/dashboard?demo_upgrade=true&plan=${plan}`)
    }

    // For real users, verify Stripe is configured
    const { stripe, prisma, getStripePriceId } = await loadDependencies()
    
    if (!stripe || !process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.startsWith('sk_test_your')) {
      console.error('Stripe not configured for real user:', userEmail)
      return NextResponse.json({ 
        error: 'Payment system is not configured. Please contact support.' 
      }, { status: 503 })
    }

    const priceId = getStripePriceId(plan as any)

    // Get user ID from database
    let userId = null
    try {
      const user = await prisma.user.findUnique({
        where: { email: userEmail }
      })
      userId = user?.id
    } catch (error) {
      console.warn('Could not find user in database:', error)
    }

    // Create Stripe checkout session
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
      customer_email: userEmail,
      metadata: {
        userId: userId || '',
        userEmail: userEmail,
        plan: plan,
      },
    })

    if (!session.url) {
      throw new Error('No checkout URL returned from Stripe')
    }

    console.log('Redirecting to Stripe checkout:', session.id)
    return NextResponse.redirect(session.url)

  } catch (error) {
    console.error('Checkout error:', error)
    
    const { searchParams } = new URL(request.url)
    const userEmail = request.headers.get('x-user-email') || searchParams.get('email')
    const isDemoUser = userEmail === 'markluka154@gmail.com'
    
    // Only demo user gets fallback to demo mode
    if (isDemoUser) {
      const plan = searchParams.get('plan')
      console.log('Demo user fallback to demo mode')
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/dashboard?demo_upgrade=true&plan=${plan}`)
    }
    
    // Real users see error
    return NextResponse.json({ 
      error: 'Failed to create checkout session. Please try again or contact support.',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}