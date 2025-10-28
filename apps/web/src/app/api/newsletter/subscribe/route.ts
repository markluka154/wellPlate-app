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

    // Send notification email to admin
    try {
      const { Resend } = await import('resend')
      const resend = new Resend(process.env.RESEND_API_KEY)

      await resend.emails.send({
        from: 'WellPlate <getwellplate@gmail.com>',
        to: 'getwellplate@gmail.com',
        subject: '🎉 New Newsletter Subscriber!',
        html: `
          <!DOCTYPE html>
          <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
              <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #10b981;">New Newsletter Subscriber! 🎉</h2>
                <p>A new person has subscribed to your WellPlate newsletter:</p>
                <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                  <strong>Email:</strong> ${email}<br>
                  <strong>Date:</strong> ${new Date().toLocaleString()}
                </div>
                <p style="color: #666; font-size: 14px;">
                  Total subscribers can be viewed in your Supabase database.
                </p>
              </div>
            </body>
          </html>
        `,
      })
      console.log('✅ Notification email sent to admin')
    } catch (emailError) {
      console.error('⚠️ Failed to send notification email:', emailError)
      // Don't fail the subscription if email fails
    }

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

