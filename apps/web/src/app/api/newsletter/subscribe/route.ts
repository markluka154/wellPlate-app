import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 })
    }

    const { Client } = await import('pg')
    const client = new Client({
      connectionString: process.env.DATABASE_URL,
    })

    await client.connect()

    // Create newsletter_subscribers table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS "NewsletterSubscriber" (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        email TEXT UNIQUE NOT NULL,
        subscribed BOOLEAN DEFAULT true,
        "createdAt" TIMESTAMPTZ DEFAULT NOW(),
        "updatedAt" TIMESTAMPTZ DEFAULT NOW()
      )
    `)

    // Insert or update subscriber
    const result = await client.query(
      `INSERT INTO "NewsletterSubscriber" (email, subscribed, "createdAt", "updatedAt") 
       VALUES ($1, $2, NOW(), NOW())
       ON CONFLICT (email) 
       DO UPDATE SET subscribed = true, "updatedAt" = NOW()
       RETURNING id, email, subscribed`,
      [email, true]
    )

    await client.end()

    return NextResponse.json({ 
      success: true, 
      message: 'Successfully subscribed to newsletter',
      subscriber: result.rows[0]
    })

  } catch (error) {
    console.error('Newsletter subscription error:', error)
    return NextResponse.json({ 
      error: 'Failed to subscribe to newsletter' 
    }, { status: 500 })
  }
}

