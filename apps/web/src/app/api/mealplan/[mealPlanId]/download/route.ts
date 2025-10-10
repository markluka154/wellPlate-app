import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const loadDependencies = async () => {
  const { Client } = await import('pg')
  const supabaseModule = await import('@/lib/supabase')
  const { generateMealPlanPDF } = await import('@/lib/pdf')

  return {
    Client,
    createSignedUrl: supabaseModule.createSignedUrl,
    generateMealPlanPDF,
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { mealPlanId: string } }
) {
  let client: any = null

  try {
    const mealPlanId = params?.mealPlanId

    if (!mealPlanId) {
      return NextResponse.json({ error: 'Meal plan ID is required' }, { status: 400 })
    }

    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ error: 'Database configuration missing' }, { status: 500 })
    }

    const { Client, createSignedUrl, generateMealPlanPDF } = await loadDependencies()
    client = new Client({
      connectionString: process.env.DATABASE_URL,
    })

    await client.connect()

    const buildFallbackResponse = async () => {
      try {
        const mealPlanResult = await client.query(
          'SELECT "jsonData", "userId" FROM "MealPlan" WHERE id = $1 LIMIT 1',
          [mealPlanId]
        )

        if (mealPlanResult.rows.length === 0) {
          return null
        }

        const mealPlanJson = mealPlanResult.rows[0].jsonData
        const userId = mealPlanResult.rows[0].userId

        const userResult = await client.query(
          'SELECT email FROM "User" WHERE id = $1 LIMIT 1',
          [userId]
        )

        const fallbackEmail = userResult.rows[0]?.email || 'user@wellplate.eu'
        const parsedMealPlan =
          typeof mealPlanJson === 'string' ? JSON.parse(mealPlanJson) : mealPlanJson
        const fallbackBuffer = await generateMealPlanPDF(parsedMealPlan, fallbackEmail)
        const dataUrl = `data:application/pdf;base64,${fallbackBuffer.toString('base64')}`

        return NextResponse.json({
          downloadUrl: null,
          dataUrl,
          expiresAt: null,
          refreshed: false,
        })
      } catch (fallbackError) {
        console.warn('[download] Fallback PDF generation failed:', fallbackError)
        return null
      }
    }

    const documentResult = await client.query(
      'SELECT id, "mealPlanId", "pdfPath", "signedUrl", "expiresAt", "createdAt" FROM "Document" WHERE "mealPlanId" = $1 ORDER BY "createdAt" DESC LIMIT 1',
      [mealPlanId]
    )

    if (documentResult.rows.length === 0) {
      const fallbackResponse = await buildFallbackResponse()
      if (fallbackResponse) {
        return fallbackResponse
      }
      return NextResponse.json({ error: 'No PDF available for this meal plan' }, { status: 404 })
    }

    const document = documentResult.rows[0]

    if (!document.pdfPath) {
      const fallbackResponse = await buildFallbackResponse()
      if (fallbackResponse) {
        return fallbackResponse
      }
      return NextResponse.json({ error: 'PDF path is missing for this meal plan' }, { status: 500 })
    }

    let downloadUrl: string | null = document.signedUrl || null
    let expiresAt: Date | null = document.expiresAt ? new Date(document.expiresAt) : null
    let refreshed = false

    if (typeof createSignedUrl === 'function') {
      try {
        downloadUrl = await createSignedUrl(document.pdfPath, 60 * 30)
        expiresAt = new Date(Date.now() + 30 * 60 * 1000)
        refreshed = true
      } catch (error) {
        console.warn('[download] Unable to refresh Supabase signed URL:', error)
      }
    }

    if (!downloadUrl) {
      const fallbackResponse = await buildFallbackResponse()
      if (fallbackResponse) {
        return fallbackResponse
      }
      return NextResponse.json({ error: 'PDF download is temporarily unavailable' }, { status: 503 })
    }

    if (refreshed && expiresAt) {
      try {
        await client.query(
          'UPDATE "Document" SET "signedUrl" = $1, "expiresAt" = $2, "updatedAt" = NOW() WHERE id = $3',
          [downloadUrl, expiresAt.toISOString(), document.id]
        )
      } catch (updateError) {
        console.warn('[download] Failed to persist refreshed signed URL:', updateError)
      }
    }

    return NextResponse.json({
      downloadUrl,
      dataUrl: null,
      expiresAt: expiresAt ? expiresAt.toISOString() : null,
      refreshed,
    })
  } catch (error) {
    console.error('[download] Meal plan PDF download error:', error)
    return NextResponse.json(
      { error: 'Failed to generate download link for this meal plan' },
      { status: 500 }
    )
  } finally {
    if (client) {
      try {
        await client.end()
      } catch (closeError) {
        console.warn('[download] Failed to close database connection after download request:', closeError)
      }
    }
  }
}


