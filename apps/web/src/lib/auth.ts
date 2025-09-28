import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { NextAuthOptions } from 'next-auth'
import EmailProvider from 'next-auth/providers/email'
import GoogleProvider from 'next-auth/providers/google'
import { prisma } from './supabase'
import { Resend } from 'resend'

// Only initialize Resend if we have a valid API key (not placeholder)
const resend = process.env.RESEND_API_KEY && 
  process.env.RESEND_API_KEY.startsWith('re_') && 
  process.env.RESEND_API_KEY !== 're_your-resend-api-key'
  ? new Resend(process.env.RESEND_API_KEY) 
  : null

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET || 'fallback-secret-for-development',
  adapter: PrismaAdapter(prisma),
  providers: [
    EmailProvider({
      from: 'onboarding@resend.dev',
      maxAge: 24 * 60 * 60, // 24 hours
      sendVerificationRequest: async ({ identifier: email, url, provider }) => {
        try {
          console.log('🔐 Sending magic link to:', email)
          console.log('🔗 Magic link URL:', url)
          
          if (!resend) {
            console.warn('⚠️ Resend API key not configured. Email sending disabled.')
            console.log('📧 Magic link URL for manual use:', url)
            return
          }
          
          const { data, error } = await resend.emails.send({
            from: 'WellPlate <onboarding@resend.dev>',
            to: [email],
            subject: 'Sign in to WellPlate',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #2563eb;">Welcome to WellPlate!</h1>
                <p>Click the button below to sign in to your account:</p>
                <a href="${url}" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
                  Sign In
                </a>
                <p>If the button doesn't work, copy and paste this link into your browser:</p>
                <p style="word-break: break-all; color: #666;">${url}</p>
                <p style="color: #666; font-size: 14px;">This link will expire in 24 hours.</p>
              </div>
            `,
          })

          if (error) {
            console.error('❌ Resend error:', error)
            console.log('📧 Magic link URL for manual use:', url)
            // Don't throw error - just log it and continue
            return
          }

          console.log('✅ Magic link email sent successfully to:', email, 'ID:', data?.id)
        } catch (error) {
          console.error('❌ Email sending error:', error)
          console.log('📧 Magic link URL for manual use:', url)
          // Don't throw error - just log it and continue
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
  },
}
