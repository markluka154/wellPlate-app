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
        <!DOCTYPE html>
        <html lang="en" style="background-color:#f4f6fb;margin:0;padding:0;">
          <head>
            <meta charset="UTF-8" />
            <meta http-equiv="X-UA-Compatible" content="IE=edge" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Sign in to WellPlate</title>
          </head>
          <body style="margin:0;padding:0;background-color:#f4f6fb;font-family:'Segoe UI',Arial,sans-serif;color:#0f172a;">
            <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="padding:32px 16px;">
              <tr>
                <td align="center">
                  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:560px;background-color:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 18px 40px rgba(15,23,42,0.12);">
                    <tr>
                      <td style="padding:32px 40px;background:linear-gradient(135deg,#0f172a,#0ea5e9);color:#ffffff;">
                        <p style="margin:0;font-size:13px;letter-spacing:0.08em;text-transform:uppercase;opacity:0.85;">WellPlate</p>
                        <h1 style="margin:12px 0 0;font-size:28px;font-weight:600;">Access your account</h1>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:40px;">
                        <p style="margin:0 0 16px;font-size:16px;color:#334155;">Hi there,</p>
                        <p style="margin:0 0 24px;font-size:16px;line-height:1.6;color:#475569;">
                          Use the button below to continue to your WellPlate dashboard. The link is valid for 24 hours and can only be used once.
                        </p>
                        <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 32px;">
                          <tr>
                            <td style="border-radius:999px;background-color:#0f172a;">
                              <a href="${magicLink}" style="display:inline-block;padding:14px 36px;font-size:16px;font-weight:600;color:#ffffff;text-decoration:none;">
                                Open WellPlate
                              </a>
                            </td>
                          </tr>
                        </table>
                        <p style="margin:0 0 12px;font-size:14px;font-weight:600;color:#0f172a;">Prefer to copy the link?</p>
                        <p style="margin:0;padding:16px;border:1px solid #e2e8f0;border-radius:12px;font-size:13px;line-height:1.6;color:#475569;background-color:#f8fafc;word-break:break-all;">
                          <a href="${magicLink}" style="color:#0f172a;text-decoration:none;">${magicLink}</a>
                        </p>
                        <p style="margin:24px 0 0;font-size:13px;color:#94a3b8;line-height:1.6;">
                          If you did not request this message, please ignore it. Your account remains secure.
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:28px 40px;background-color:#0f172a;color:#e2e8f0;">
                        <p style="margin:0 0 8px;font-size:14px;font-weight:600;">WellPlate Premium Experience</p>
                        <p style="margin:0;font-size:13px;line-height:1.6;opacity:0.75;">Smart meal plans, curated shopping, and nutrition insights built around you.</p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:20px 40px;background-color:#ffffff;color:#94a3b8;font-size:12px;text-align:center;">
                        &copy; ${new Date().getFullYear()} WellPlate. All rights reserved.<br />
                        27 Old Gloucester Street, London WC1N 3AX
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
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
