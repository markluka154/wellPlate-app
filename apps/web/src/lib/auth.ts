import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { NextAuthOptions } from 'next-auth'
import EmailProvider from 'next-auth/providers/email'
import GoogleProvider from 'next-auth/providers/google'
import { prisma } from './supabase'

// Dynamic import for Resend to avoid build-time issues
let resendInstance: any = null

async function getResend() {
  if (resendInstance !== null) return resendInstance
  
  if (!process.env.RESEND_API_KEY || 
      !process.env.RESEND_API_KEY.startsWith('re_') || 
      process.env.RESEND_API_KEY === 're_your-resend-api-key') {
    resendInstance = false
    return resendInstance
  }
  
  try {
    const { Resend } = await import('resend')
    resendInstance = new Resend(process.env.RESEND_API_KEY)
    return resendInstance
  } catch (error) {
    console.error('Failed to load Resend:', error)
    resendInstance = false
    return resendInstance
  }
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET || 'fallback-secret-for-development',
  adapter: PrismaAdapter(prisma),
  providers: [
    EmailProvider({
      from: 'WellPlate <hello@wellplate.eu>',
      maxAge: 24 * 60 * 60, // 24 hours
      sendVerificationRequest: async ({ identifier: email, url, provider }) => {
        try {
          console.log('🔐 Sending magic link to:', email)
          console.log('🔗 Magic link URL:', url)
          
          const resend = await getResend()
          
          if (!resend) {
            console.warn('⚠️ Resend API key not configured. Email sending disabled.')
            console.log('📧 Magic link URL for manual use:', url)
            return
          }
          
          const { data, error } = await resend.emails.send({
            from: 'WellPlate <hello@wellplate.eu>',
            to: [email],
            subject: 'Your sign-in link for WellPlate',
            html: `
              <!DOCTYPE html>
              <html>
              <body style="margin:0;padding:0;background-color:#f3f4f6;font-family:Arial,sans-serif;">
                <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3f4f6;padding:40px 0;">
                  <tr>
                    <td align="center">
                      <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;box-shadow:0 2px 4px rgba(0,0,0,0.1);">
                        
                        <!-- Header -->
                        <tr>
                          <td style="background-color:#10b981;padding:40px;text-align:center;border-radius:8px 8px 0 0;">
                            <h1 style="margin:0;color:#ffffff;font-size:32px;font-weight:bold;">WellPlate</h1>
                            <p style="margin:10px 0 0;color:#ffffff;font-size:16px;">Your meal planning journey starts here</p>
                          </td>
                        </tr>

                        <!-- Content -->
                        <tr>
                          <td style="padding:40px;">
                            <h2 style="margin:0 0 20px;color:#1f2937;font-size:24px;">Welcome!</h2>
                            <p style="margin:0 0 30px;color:#4b5563;font-size:16px;line-height:1.6;">
                              Click the button below to securely sign in to your WellPlate account. This link expires in 24 hours.
                            </p>

                            <!-- Button -->
                            <table cellpadding="0" cellspacing="0">
                              <tr>
                                <td style="background-color:#10b981;border-radius:6px;text-align:center;">
                                  <a href="${url}" style="display:inline-block;padding:14px 40px;color:#ffffff;text-decoration:none;font-size:16px;font-weight:600;">
                                    Sign In to WellPlate
                                  </a>
                                </td>
                              </tr>
                            </table>

                            <p style="margin:30px 0 10px;color:#6b7280;font-size:14px;">Or copy this link:</p>
                            <p style="margin:0;padding:12px;background-color:#f9fafb;border-radius:4px;word-break:break-all;font-size:13px;">
                              <a href="${url}" style="color:#3b82f6;">${url}</a>
                            </p>
                          </td>
                        </tr>

                        <!-- Features -->
                        <tr>
                          <td style="padding:0 40px 40px;">
                            <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0fdf4;border-radius:6px;padding:20px;">
                              <tr>
                                <td style="padding:8px 0;color:#374151;font-size:14px;">✓ Generate personalized meal plans in 30 seconds</td>
                              </tr>
                              <tr>
                                <td style="padding:8px 0;color:#374151;font-size:14px;">✓ Complete recipes with nutrition info</td>
                              </tr>
                              <tr>
                                <td style="padding:8px 0;color:#374151;font-size:14px;">✓ Organized shopping lists</td>
                              </tr>
                              <tr>
                                <td style="padding:8px 0;color:#374151;font-size:14px;">✓ Track calories and macros</td>
                              </tr>
                            </table>
                          </td>
                        </tr>

                        <!-- Footer -->
                        <tr>
                          <td style="padding:20px 40px;border-top:1px solid #e5e7eb;text-align:center;">
                            <p style="margin:0 0 10px;color:#9ca3af;font-size:13px;">Link expires in 24 hours</p>
                            <p style="margin:0;color:#9ca3af;font-size:12px;">© ${new Date().getFullYear()} WellPlate</p>
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
            console.log('📧 Magic link URL for manual use:', url)
            return
          }

          console.log('✅ Magic link email sent successfully to:', email, 'ID:', data?.id)
        } catch (error) {
          console.error('❌ Email sending error:', error)
          console.log('📧 Magic link URL for manual use:', url)
        }
      },
    }),
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        (session.user as any).id = user.id
      }
      return session
    },
    async signIn({ user, account, profile }) {
      // Ensure user has a subscription record
      if (user.id) {
        await prisma.subscription.upsert({
          where: { userId: user.id },
          update: {},
          create: {
            userId: user.id,
            plan: 'FREE',
            status: 'active',
          },
        })
      }
      return true
    },
  },
  pages: {
    signIn: '/signin',
  },
  session: {
    strategy: 'database',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // Update session every 24 hours
  },
}