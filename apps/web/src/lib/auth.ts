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
              <html lang="en">
              <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Sign in to WellPlate</title>
              </head>
              <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
                  <tr>
                    <td align="center">
                      <!-- Main Container -->
                      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); overflow: hidden; max-width: 600px;">
                        
                        <!-- Header with Gradient -->
                        <tr>
                          <td style="background: linear-gradient(135deg, #10b981 0%, #3b82f6 100%); padding: 48px 40px; text-align: center;">
                            <div style="width: 64px; height: 64px; background-color: rgba(255, 255, 255, 0.2); border-radius: 16px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px; backdrop-filter: blur(10px);">
                              <span style="font-size: 32px; font-weight: bold; color: white;">W</span>
                            </div>
                            <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: white; letter-spacing: -0.5px;">Welcome to WellPlate</h1>
                            <p style="margin: 12px 0 0 0; font-size: 16px; color: rgba(255, 255, 255, 0.9);">Your personalized meal planning journey starts here</p>
                          </td>
                        </tr>

                        <!-- Content -->
                        <tr>
                          <td style="padding: 48px 40px;">
                            <h2 style="margin: 0 0 16px 0; font-size: 22px; font-weight: 600; color: #1f2937;">Sign in to your account</h2>
                            <p style="margin: 0 0 32px 0; font-size: 16px; line-height: 1.6; color: #6b7280;">
                              Click the button below to securely sign in to WellPlate. This link will expire in 24 hours for your security.
                            </p>

                            <!-- CTA Button -->
                            <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                              <tr>
                                <td style="border-radius: 12px; background: linear-gradient(135deg, #10b981 0%, #3b82f6 100%); box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);">
                                  <a href="${url}" target="_blank" style="display: inline-block; padding: 16px 48px; font-size: 16px; font-weight: 600; color: #ffffff; text-decoration: none; border-radius: 12px;">
                                    Sign In to WellPlate
                                  </a>
                                </td>
                              </tr>
                            </table>

                            <p style="margin: 32px 0 0 0; font-size: 14px; line-height: 1.6; color: #9ca3af;">
                              Or copy and paste this link into your browser:
                            </p>
                            <div style="margin: 12px 0 0 0; padding: 16px; background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; word-break: break-all;">
                              <a href="${url}" style="font-size: 13px; color: #3b82f6; text-decoration: none;">${url}</a>
                            </div>
                          </td>
                        </tr>

                        <!-- Features Section -->
                        <tr>
                          <td style="padding: 0 40px 48px 40px;">
                            <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dbeafe 100%); border-radius: 12px; padding: 24px;">
                              <h3 style="margin: 0 0 16px 0; font-size: 16px; font-weight: 600; color: #1f2937;">What you can do with WellPlate:</h3>
                              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                  <td style="padding: 8px 0;">
                                    <span style="color: #10b981; font-size: 18px; margin-right: 12px;">✓</span>
                                    <span style="font-size: 14px; color: #4b5563;">Generate personalized meal plans in 30 seconds</span>
                                  </td>
                                </tr>
                                <tr>
                                  <td style="padding: 8px 0;">
                                    <span style="color: #10b981; font-size: 18px; margin-right: 12px;">✓</span>
                                    <span style="font-size: 14px; color: #4b5563;">Get complete recipes with nutritional information</span>
                                  </td>
                                </tr>
                                <tr>
                                  <td style="padding: 8px 0;">
                                    <span style="color: #10b981; font-size: 18px; margin-right: 12px;">✓</span>
                                    <span style="font-size: 14px; color: #4b5563;">Receive organized shopping lists for easy meal prep</span>
                                  </td>
                                </tr>
                                <tr>
                                  <td style="padding: 8px 0;">
                                    <span style="color: #10b981; font-size: 18px; margin-right: 12px;">✓</span>
                                    <span style="font-size: 14px; color: #4b5563;">Track calories and macros effortlessly</span>
                                  </td>
                                </tr>
                              </table>
                            </div>
                          </td>
                        </tr>

                        <!-- Footer -->
                        <tr>
                          <td style="padding: 32px 40px; border-top: 1px solid #e5e7eb; background-color: #f9fafb;">
                            <p style="margin: 0 0 8px 0; font-size: 13px; color: #9ca3af; text-align: center;">
                              This link will expire in 24 hours for security reasons.
                            </p>
                            <p style="margin: 0 0 16px 0; font-size: 13px; color: #9ca3af; text-align: center;">
                              If you didn't request this email, you can safely ignore it.
                            </p>
                            <p style="margin: 0; font-size: 12px; color: #9ca3af; text-align: center;">
                              © ${new Date().getFullYear()} WellPlate. All rights reserved.
                            </p>
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