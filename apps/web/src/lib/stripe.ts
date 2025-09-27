import Stripe from 'stripe'

// Only initialize Stripe if we have a valid API key
export const stripe = process.env.STRIPE_SECRET_KEY && 
  process.env.STRIPE_SECRET_KEY.startsWith('sk_') &&
  !process.env.STRIPE_SECRET_KEY.includes('your-stripe-secret-key')
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
    })
  : null

export async function createCheckoutSession(
  priceId: string,
  customerId?: string,
  userId?: string
): Promise<Stripe.Checkout.Session> {
  if (!stripe) {
    throw new Error('Stripe not configured')
  }

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
    customer: customerId,
    metadata: {
      userId: userId || '',
    },
  })

  return session
}

export async function createCustomer(email: string, name?: string): Promise<Stripe.Customer> {
  if (!stripe) {
    throw new Error('Stripe not configured')
  }
  
  return await stripe.customers.create({
    email,
    name,
  })
}

export async function getSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
  if (!stripe) {
    throw new Error('Stripe not configured')
  }
  
  return await stripe.subscriptions.retrieve(subscriptionId)
}

export async function cancelSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
  if (!stripe) {
    throw new Error('Stripe not configured')
  }
  
  return await stripe.subscriptions.cancel(subscriptionId)
}
