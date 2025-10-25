import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { feedbackSchema } from '@/lib/zod-schemas'
import { Resend } from 'resend'

export const dynamic = 'force-dynamic'

const sendFeedbackEmail = async (feedbackData: any, userEmail: string, userName: string) => {
  const resendApiKey = process.env.RESEND_API_KEY

  if (!resendApiKey || !resendApiKey.startsWith('re_')) {
    console.error('RESEND_API_KEY is not configured correctly.')
    return { success: false, error: 'Resend API key not configured.' }
  }

  const resend = new Resend(resendApiKey)

  try {
    const stars = '⭐'.repeat(feedbackData.rating)
    const subject = `📝 New User Feedback: ${feedbackData.rating}/5 stars from ${userName || userEmail}`
    
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>User Feedback</title>
          <style>
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f6fb; margin: 0; padding: 0; }
              .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); overflow: hidden; }
              .header { background: linear-gradient(135deg, #00C46A 0%, #00a85a 100%); color: #ffffff; padding: 25px 30px; text-align: center; }
              .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
              .content { padding: 30px; color: #333333; line-height: 1.6; }
              .content p { margin-bottom: 15px; }
              .feedback-item { background-color: #f9f9f9; border-left: 4px solid #00C46A; padding: 15px; margin-bottom: 20px; border-radius: 4px; }
              .feedback-item strong { color: #00C46A; }
              .rating { font-size: 18px; margin: 10px 0; }
              .footer { background-color: #f0f2f5; color: #777777; text-align: center; padding: 20px 30px; font-size: 12px; border-top: 1px solid #e0e0e0; }
              .user-info { font-size: 13px; color: #555555; margin-top: 20px; border-top: 1px solid #eee; padding-top: 15px; }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <h1>New User Feedback Received!</h1>
              </div>
              <div class="content">
                  <p>A user has submitted feedback through the "Share feedback & unlock 2 more plans" modal:</p>
                  
                  <div class="feedback-item">
                      <p><strong>Overall Rating:</strong></p>
                      <div class="rating">${stars} (${feedbackData.rating}/5)</div>
                  </div>
                  
                  ${feedbackData.liked ? `
                  <div class="feedback-item">
                      <p><strong>What they liked most:</strong></p>
                      <p>${feedbackData.liked}</p>
                  </div>
                  ` : ''}
                  
                  ${feedbackData.improvements ? `
                  <div class="feedback-item">
                      <p><strong>What could be better:</strong></p>
                      <p>${feedbackData.improvements}</p>
                  </div>
                  ` : ''}
                  
                  ${feedbackData.suggestions ? `
                  <div class="feedback-item">
                      <p><strong>Other ideas:</strong></p>
                      <p>${feedbackData.suggestions}</p>
                  </div>
                  ` : ''}
                  
                  <div class="user-info">
                      <p><strong>From:</strong> ${userName || 'N/A'} (${userEmail})</p>
                      <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
                      <p><strong>Bonus Plans Granted:</strong> ${feedbackData.bonusGranted ? 'Yes (+2 plans)' : 'No (already claimed)'}</p>
                  </div>
              </div>
              <div class="footer">
                  This email was sent from WellPlate feedback system.
              </div>
          </div>
      </body>
      </html>
    `

    const { data, error } = await resend.emails.send({
      from: 'WellPlate Feedback <feedback@wellplate.eu>',
      to: 'getwellplate@gmail.com',
      subject: subject,
      html: htmlContent,
    })

    if (error) {
      console.error('Resend email error:', error)
      return { success: false, error: error.message }
    }

    return { success: true, data: data }
  } catch (error: any) {
    console.error('Email sending error:', error)
    return { success: false, error: error.message }
  }
}

const ensureFeedbackTables = async (client: any) => {
  await client.query(`
    CREATE TABLE IF NOT EXISTS "Feedback" (
      id TEXT PRIMARY KEY,
      "userId" TEXT NOT NULL,
      rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
      liked TEXT,
      improvements TEXT,
      suggestions TEXT,
      "bonusGranted" BOOLEAN NOT NULL DEFAULT false,
      "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)

  await client.query(`
    CREATE TABLE IF NOT EXISTS "GenerationBonus" (
      "userId" TEXT PRIMARY KEY,
      remaining INTEGER NOT NULL DEFAULT 0,
      "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `)

  await client.query(`
    CREATE INDEX IF NOT EXISTS "Feedback_userId_idx" ON "Feedback" ("userId")
  `)
}

export async function POST(request: NextRequest) {
  let client: any = null

  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        { error: 'Database configuration missing' },
        { status: 500 }
      )
    }

    const userEmail = request.headers.get('x-user-email')
    if (!userEmail) {
      return NextResponse.json(
        { error: 'User email required' },
        { status: 401 }
      )
    }

    let payload
    try {
      const body = await request.json()
      payload = feedbackSchema.parse(body)
    } catch (parseError: any) {
      const issues =
        parseError?.issues?.map((issue: any) => issue.message) ||
        ['Invalid feedback payload']
      return NextResponse.json(
        { error: 'Invalid feedback submission', issues },
        { status: 400 }
      )
    }

    const { Client } = await import('pg')
    client = new Client({
      connectionString: process.env.DATABASE_URL,
    })

    await client.connect()
    await ensureFeedbackTables(client)

    const trimmedLiked = payload.liked?.trim() || null
    const trimmedImprovements = payload.improvements?.trim() || null
    const trimmedSuggestions = payload.suggestions?.trim() || null

    // Find or create user
    let userResult = await client.query(
      'SELECT id, email, name FROM "User" WHERE email = $1 LIMIT 1',
      [userEmail]
    )

    let user = userResult.rows[0]
    if (!user) {
      const createUser = await client.query(
        'INSERT INTO "User" (id, email, name, "createdAt", "updatedAt") VALUES (gen_random_uuid()::text, $1, $2, NOW(), NOW()) RETURNING id, email, name',
        [userEmail, userEmail.split('@')[0]]
      )
      user = createUser.rows[0]
    }

    // Determine if bonus already granted
    const existingBonus = await client.query(
      'SELECT 1 FROM "Feedback" WHERE "userId" = $1 AND "bonusGranted" = true LIMIT 1',
      [user.id]
    )
    const bonusAlreadyGranted = existingBonus.rows.length > 0

    const feedbackId = randomUUID()

    await client.query(
      `INSERT INTO "Feedback" (id, "userId", rating, liked, improvements, suggestions, "bonusGranted")
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        feedbackId,
        user.id,
        payload.rating,
        trimmedLiked,
        trimmedImprovements,
        trimmedSuggestions,
        !bonusAlreadyGranted,
      ]
    )

    let bonusAdded = false

    if (!bonusAlreadyGranted) {
      await client.query(
        `INSERT INTO "GenerationBonus" ("userId", remaining, "updatedAt")
         VALUES ($1, $2, NOW())
         ON CONFLICT ("userId")
         DO UPDATE SET remaining = "GenerationBonus".remaining + EXCLUDED.remaining,
                       "updatedAt" = NOW()`,
        [user.id, 2]
      )
      bonusAdded = true
    }

    const bonusResult = await client.query(
      'SELECT remaining FROM "GenerationBonus" WHERE "userId" = $1 LIMIT 1',
      [user.id]
    )
    const bonusRemaining = Number(bonusResult.rows[0]?.remaining || 0)

    // Send email notification to admin
    const emailData = {
      rating: payload.rating,
      liked: trimmedLiked,
      improvements: trimmedImprovements,
      suggestions: trimmedSuggestions,
      bonusGranted: !bonusAlreadyGranted
    }
    
    const emailResult = await sendFeedbackEmail(emailData, userEmail, user.name)
    console.log('📧 Feedback email sent:', emailResult.success ? 'Success' : 'Failed')

    return NextResponse.json({
      message: 'Feedback submitted successfully',
      bonusAdded,
      bonusRemaining,
      emailSent: emailResult.success,
    })
  } catch (error) {
    console.error('[feedback] Submission failed:', error)
    return NextResponse.json(
      { error: 'Failed to submit feedback. Please try again later.' },
      { status: 500 }
    )
  } finally {
    if (client) {
      try {
        await client.end()
      } catch (closeError) {
        console.warn('[feedback] Failed to close database connection:', closeError)
      }
    }
  }
}
