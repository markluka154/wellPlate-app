import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

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
    const userEmail = request.headers.get('x-user-email') || searchParams.get('email')

    console.log('Checkout request:', { plan, userEmail })

    if (!plan || !['PRO_MONTHLY', 'PRO_ANNUAL', 'FAMILY_MONTHLY'].includes(plan)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    if (!userEmail) {
      console.error('No email found')
      return NextResponse.json({ error: 'User email required' }, { status: 401 })
    }

    const isDemoUser = userEmail === 'markluka154@gmail.com'
    
    if (isDemoUser) {
      console.log('Demo user, using demo mode')
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/dashboard?demo_upgrade=true&plan=${plan}`)
    }

    const { stripe, getStripePriceId } = await loadDependencies()
    
    if (!stripe || !process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: 'Payment system not configured' }, { status: 503 })
    }

    const priceId = getStripePriceId(plan as any)

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXTAUTH_URL}/dashboard?success=true`,
      cancel_url: `${process.env.NEXTAUTH_URL}/pricing`,
      customer_email: userEmail,
      metadata: { plan, userEmail },
    })

    if (!session.url) {
      throw new Error('No checkout URL returned')
    }

    console.log('Redirecting to Stripe:', session.id)
    return NextResponse.redirect(session.url)

  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json({ 
      error: 'Failed to create checkout session',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}