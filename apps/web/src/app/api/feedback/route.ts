import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { feedbackSchema } from '@/lib/zod-schemas'

export const dynamic = 'force-dynamic'

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

    return NextResponse.json({
      message: 'Feedback submitted successfully',
      bonusAdded,
      bonusRemaining,
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
