import { NextRequest, NextResponse } from 'next/server'

// Mark as dynamic to prevent static generation
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')
    const email = searchParams.get('email')
    const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'

    console.log('🔗 Processing magic link callback:', { token, email, callbackUrl })

    if (!token || !email) {
      console.log('❌ Missing token or email')
      const errorUrl = new URL('/signin?error=InvalidLink', process.env.NEXTAUTH_URL || 'https://wellplate.eu')
      return NextResponse.redirect(errorUrl)
    }

    // Force redirect to use wellplate.eu domain
    const redirectUrl = new URL(callbackUrl, process.env.NEXTAUTH_URL || 'https://wellplate.eu')
    redirectUrl.searchParams.set('auth', 'success')
    redirectUrl.searchParams.set('email', decodeURIComponent(email))
    redirectUrl.searchParams.set('token', token)

    console.log('✅ Magic link processed successfully, redirecting to:', redirectUrl.toString())

    return NextResponse.redirect(redirectUrl)

  } catch (error) {
    console.error('❌ Magic link callback error:', error)
    const errorUrl = new URL('/signin?error=CallbackError', process.env.NEXTAUTH_URL || 'https://wellplate.eu')
    return NextResponse.redirect(errorUrl)
  }
}
