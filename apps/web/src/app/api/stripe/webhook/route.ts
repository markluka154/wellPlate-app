import { NextRequest, NextResponse } from 'next/server'

// Dynamic imports to prevent build-time issues
const loadDependencies = async () => {
  const { stripe } = await import('@/lib/stripe')
  const { prisma } = await import('@/lib/supabase')
  return { stripe, prisma }
}

export async function POST(request: NextRequest) {
  try {
    // Load dependencies dynamically
    const { stripe, prisma } = await loadDependencies()

    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      return NextResponse.json({ error: 'No signature' }, { status: 400 })
    }

    if (!stripe) {
      console.error('Stripe not configured')
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 })
    }

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      console.error('Stripe webhook secret not configured')
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
    }

    let event: any

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      )
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object
        const userId = session.metadata?.userId

        if (!userId) {
          console.error('No userId in session metadata')
          break
        }

        // Get the subscription
        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        )

        // Update user's subscription
        const updatedSubscription = await prisma.subscription.upsert({
          where: { userId },
          update: {
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: subscription.id,
            plan: subscription.items.data[0].price.nickname === 'Pro Monthly' ? 'PRO_MONTHLY' : 'PRO_ANNUAL',
            status: subscription.status === 'active' ? 'active' : 'canceled',
          },
          create: {
            userId,
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: subscription.id,
            plan: subscription.items.data[0].price.nickname === 'Pro Monthly' ? 'PRO_MONTHLY' : 'PRO_ANNUAL',
            status: subscription.status === 'active' ? 'active' : 'canceled',
          },
        })

        // Track Facebook Pixel event for successful subscription
        if (subscription.status === 'active') {
          const planType = subscription.items.data[0].price.nickname === 'Pro Monthly' ? 'PRO_MONTHLY' : 'PRO_ANNUAL'
          const price = (subscription.items.data[0].price.unit_amount || 0) / 100 // Convert from cents, default to 0 if null
          
          console.log(`📊 Facebook Pixel: Tracking subscription - ${planType} - €${price}`)
          
          // Note: Facebook Pixel tracking will happen on the frontend when user visits success page
          // The webhook just logs the event for debugging
        }

        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object
        const userId = subscription.metadata?.userId

        if (!userId) {
          // Find user by customer ID
          const user = await prisma.user.findFirst({
            where: {
              subscription: {
                stripeCustomerId: subscription.customer as string,
              },
            },
          })

          if (user) {
            await prisma.subscription.update({
              where: { userId: user.id },
              data: {
                status: subscription.status === 'active' ? 'active' : 'canceled',
              },
            })
          }
        }

        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object
        const userId = subscription.metadata?.userId

        if (!userId) {
          // Find user by customer ID
          const user = await prisma.user.findFirst({
            where: {
              subscription: {
                stripeCustomerId: subscription.customer as string,
              },
            },
          })

          if (user) {
            await prisma.subscription.update({
              where: { userId: user.id },
              data: {
                status: 'canceled',
              },
            })
          }
        }

        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

// Add GET method for testing
export async function GET() {
  return NextResponse.json({ 
    status: 'Stripe webhook endpoint',
    timestamp: new Date().toISOString()
  })
}