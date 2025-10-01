import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { getServerSession } from "next-auth"

// Stripe instance
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16", // stable Stripe API version
})

// Your real Price IDs from Stripe
const priceMap: Record<string, string> = {
  PRO_MONTHLY: "price_1SDLwYJRslGm2z7T2BrjzEP4",
  PRO_ANNUAL: "price_1SDLxLJRslGm2z7Td0qfarao",
  FAMILY_MONTHLY: "price_1SDLxsJRslGm2z7TuTKM8Zpv",
}

export async function GET(req: NextRequest) {
  const session = await getServerSession()

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const plan = searchParams.get("plan")

  if (!plan || !priceMap[plan]) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 })
  }

  try {
    const checkout = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceMap[plan],
          quantity: 1,
        },
      ],
      customer_email: session.user.email,
      success_url: `${process.env.NEXTAUTH_URL}/dashboard?success=true`,
      cancel_url: `${process.env.NEXTAUTH_URL}/pricing`,
      metadata: {
        plan,
        userEmail: session.user.email,
      },
    })

    return NextResponse.redirect(checkout.url!, { status: 303 })
  } catch (err: any) {
    console.error("Stripe error:", err)
    return NextResponse.json(
      { error: "Failed to create checkout session", details: err.message },
      { status: 500 }
    )
  }
}

