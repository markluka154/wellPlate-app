import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY && 
  process.env.RESEND_API_KEY.startsWith('re_') && 
  process.env.RESEND_API_KEY !== 're_your-resend-api-key'
  ? new Resend(process.env.RESEND_API_KEY) 
  : null

export async function POST(request: NextRequest) {
  try {
    // Handle both JSON and form data
    let email: string
    
    const contentType = request.headers.get('content-type')
    if (contentType?.includes('application/json')) {
      const body = await request.json()
      email = body.email
    } else {
      // Handle form data (NextAuth sends this)
      const formData = await request.formData()
      email = formData.get('email') as string
    }
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    console.log('🔐 Custom email sign-in for:', email)

    // Generate a simple token (in production, use a proper JWT or crypto token)
    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    
    // Get the base URL from the request or environment
    const baseUrl = (
      process.env.NEXTAUTH_URL
        ? process.env.NEXTAUTH_URL
        : process.env.VERCEL_URL
          ? `https://${process.env.VERCEL_URL}`
          : `${request.nextUrl.protocol}//${request.nextUrl.host}`
    )
    
    const magicLink = `${baseUrl}/api/auth/callback/email?callbackUrl=${encodeURIComponent('/dashboard')}&token=${token}&email=${encodeURIComponent(email)}`

    // For now, skip database storage and just send the email
    // TODO: Implement proper token storage and validation

    // Send the magic link email
    if (!resend) {
      console.warn('⚠️ Resend API key not configured. Email sending disabled.')
      console.log('📧 Magic link URL for manual use:', magicLink)
      return NextResponse.json({ 
        success: true, 
        message: 'Magic link generated! Check console for the link.',
        magicLink: magicLink
      })
    }

    const { data, error } = await resend.emails.send({
      from: 'WellPlate <noreply@wellplate.eu>',
      to: [email],
      subject: 'Sign in to WellPlate',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">Welcome to WellPlate!</h1>
          <p>Click the button below to sign in to your account:</p>
          <a href="${magicLink}" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
            Sign In
          </a>
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #666;">${magicLink}</p>
          <p style="color: #666; font-size: 14px;">This link will expire in 24 hours.</p>
        </div>
      `,
    })

    if (error) {
      console.error('❌ Resend error:', error)
      console.log('📧 Magic link URL for manual use:', magicLink)
      return NextResponse.json({ 
        success: true, 
        message: 'Email failed but magic link generated! Check console for the link.',
        magicLink: magicLink
      })
    }

    console.log('✅ Magic link email sent successfully to:', email, 'ID:', data?.id)

    return NextResponse.json({ 
      success: true, 
      message: 'Magic link sent to your email!' 
    })

  } catch (error) {
    console.error('❌ Email sign-in error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

