import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { NextAuthOptions } from 'next-auth'
import EmailProvider from 'next-auth/providers/email'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaClient } from '@prisma/client'

// Create a dedicated Prisma client for NextAuth to avoid prepared statement conflicts
const globalForPrisma = globalThis as unknown as {
  prismaAuth: PrismaClient | undefined
}

// Create a function to get a fresh Prisma client for NextAuth
function getPrismaAuthClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  })
}

const prismaAuth = globalForPrisma.prismaAuth ?? getPrismaAuthClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prismaAuth = prismaAuth
}

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
  adapter: PrismaAdapter(prismaAuth),
  providers: [
    EmailProvider({
      from: 'WellPlate <getwellplate@gmail.com>',
      maxAge: 24 * 60 * 60, // 24 hours
      sendVerificationRequest: async ({ identifier: email, url, provider }) => {
        try {
          console.log('🔐 Sending magic link to:', email)
          console.log('🔗 Magic link URL:', url)
          
          // Force magic link to use wellplate.eu instead of Vercel URL
          let magicLinkUrl = url
          if (magicLinkUrl.includes('vercel.app')) {
            magicLinkUrl = magicLinkUrl.replace(/https:\/\/[^/]+\.vercel\.app/, 'https://wellplate.eu')
          }
          
          console.log('🔗 Corrected magic link URL:', magicLinkUrl)
          
          const resend = await getResend()
          
          if (!resend) {
            console.warn('⚠️ Resend API key not configured. Email sending disabled.')
            console.log('📧 Magic link URL for manual use:', magicLinkUrl)
            // Don't throw error, just log for development
            return
          }
          
          const { data, error } = await resend.emails.send({
            from: 'WellPlate <getwellplate@gmail.com>',
            to: email, // Remove array brackets - Resend expects string, not array
            subject: 'Your sign-in link for WellPlate',
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
                              <h1 style="margin:12px 0 0;font-size:28px;font-weight:600;">Your sign-in link is ready</h1>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding:40px;">
                              <p style="margin:0 0 16px;font-size:16px;color:#334155;">Hi there,</p>
                              <p style="margin:0 0 24px;font-size:16px;line-height:1.6;color:#475569;">
                                We received a request to sign in to WellPlate. Use the button below to access your account within the next 24 hours.
                              </p>
                              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 32px;">
                                <tr>
                                  <td style="border-radius:999px;background-color:#0f172a;">
                                    <a href="${magicLinkUrl}" style="display:inline-block;padding:14px 36px;font-size:16px;font-weight:600;color:#ffffff;text-decoration:none;">
                                      Open WellPlate
                                    </a>
                                  </td>
                                </tr>
                              </table>
                              <p style="margin:0 0 12px;font-size:14px;font-weight:600;color:#0f172a;">Prefer to copy the link?</p>
                              <p style="margin:0;padding:16px;border:1px solid #e2e8f0;border-radius:12px;font-size:13px;line-height:1.6;color:#475569;background-color:#f8fafc;word-break:break-all;">
                                <a href="${magicLinkUrl}" style="color:#0f172a;text-decoration:none;">${magicLinkUrl}</a>
                              </p>
                              <p style="margin:24px 0 0;font-size:13px;color:#94a3b8;line-height:1.6;">
                                If this was not you, please disregard this email. Only someone with access to your inbox can use the link.
                              </p>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding:28px 40px;background-color:#0f172a;color:#e2e8f0;">
                              <p style="margin:0 0 8px;font-size:14px;font-weight:600;">WellPlate Premium Experience</p>
                              <p style="margin:0;font-size:13px;line-height:1.6;opacity:0.75;">Meal intelligence, curated recipes, and balanced nutrition planned for you.</p>
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
            console.log('📧 Magic link URL for manual use:', magicLinkUrl)
            // Don't throw error, just log for development
            return
          }

          console.log('✅ Magic link email sent successfully to:', email, 'ID:', data?.id)
        } catch (error) {
          console.error('❌ Email sending error:', error)
          console.log('📧 Magic link URL for manual use:', url)
          // Don't throw error, just log for development
        }
      },
    }),
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            allowDangerousEmailAccountLinking: true,
          }),
        ]
      : []),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      console.log('🔍 NextAuth JWT callback:', {
        hasToken: !!token,
        hasUser: !!user,
        hasAccount: !!account,
        userId: user?.id,
        tokenId: token?.id
      })
      
      if (user) {
        token.id = user.id
        console.log('✅ JWT token updated with user ID:', user.id)
      }
      return token
    },
    async session({ session, token }) {
      console.log('🔍 NextAuth session callback:', {
        hasSession: !!session,
        hasUser: !!session?.user,
        hasToken: !!token,
        tokenId: token?.id,
        userEmail: session?.user?.email
      })
      
      if (session.user && token?.id) {
        (session.user as any).id = token.id as string
        console.log('✅ Session updated with user ID:', token.id)
      } else {
        console.log('❌ Session callback missing user ID:', { session, token })
      }
      return session
    },
    async signIn({ user, account, profile }) {
      console.log('🔍 NextAuth signIn callback:', {
        hasUser: !!user,
        userId: user?.id,
        userEmail: user?.email,
        hasAccount: !!account,
        hasProfile: !!profile
      })
      
      // Ensure user has a subscription record
      if (user.id) {
        try {
          const freshClient = getPrismaAuthClient()
          await freshClient.subscription.upsert({
            where: { userId: user.id },
            update: {},
            create: {
              userId: user.id,
              plan: 'FREE',
              status: 'active',
            },
          })
          await freshClient.$disconnect()
          console.log('✅ Subscription record created for user:', user.id)
        } catch (error) {
          console.error('❌ Error creating subscription record:', error)
          // Don't fail sign-in if subscription creation fails
        }
      }
      return true
    },
    async redirect({ url, baseUrl }) {
      // Ensure redirects always go to the dashboard for authenticated users
      if (url.startsWith('/')) return `${baseUrl}${url}`
      if (new URL(url).origin === baseUrl) return url
      return `${baseUrl}/dashboard`
    },
  },
  pages: {
    signIn: '/signin',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // Update session every 24 hours
  },
}
