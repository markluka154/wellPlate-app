import { NextRequest, NextResponse } from 'next/server'

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || '788765987308138'
const ACCESS_TOKEN = process.env.META_CAPI_TOKEN!

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    
    // Extract test_event_code from payload if present
    const { test_event_code, ...eventData } = body
    
    // Build the URL with test_event_code as query parameter if present
    let url = `https://graph.facebook.com/v18.0/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`
    if (test_event_code) {
      url += `&test_event_code=${test_event_code}`
    }

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: [eventData] }),
    })

    const data = await res.json()
    
    if (!res.ok) {
      console.error('Meta CAPI Error Response:', data)
    }
    
    return NextResponse.json(data, { status: res.status })
  } catch (error) {
    console.error('Meta CAPI Error:', error)
    return NextResponse.json({ error: 'CAPI request failed' }, { status: 500 })
  }
}
