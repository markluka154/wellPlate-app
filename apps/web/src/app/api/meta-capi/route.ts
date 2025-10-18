import { NextRequest, NextResponse } from 'next/server'

const PIXEL_ID = process.env.META_PIXEL_ID!
const ACCESS_TOKEN = process.env.META_CAPI_TOKEN!

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const res = await fetch(
      `https://graph.facebook.com/v18.0/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: [body] }),
      }
    )

    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (error) {
    console.error('Meta CAPI Error:', error)
    return NextResponse.json({ error: 'CAPI request failed' }, { status: 500 })
  }
}
