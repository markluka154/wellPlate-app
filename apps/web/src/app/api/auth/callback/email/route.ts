import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')
    const email = searchParams.get('email')
    const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'

    console.log('🔗 Processing magic link callback:', { token, email, callbackUrl })

    if (!token || !email) {
      console.log('❌ Missing token or email')
      return NextResponse.redirect(new URL('/signin?error=InvalidLink', request.url))
    }

    // For now, just redirect to dashboard with success parameters
    // TODO: Implement proper user creation and session management
    const redirectUrl = new URL(callbackUrl, request.url)
    redirectUrl.searchParams.set('auth', 'success')
    redirectUrl.searchParams.set('email', decodeURIComponent(email))
    redirectUrl.searchParams.set('token', token)

    console.log('✅ Magic link processed successfully, redirecting to:', redirectUrl.toString())

    return NextResponse.redirect(redirectUrl)

  } catch (error) {
    console.error('❌ Magic link callback error:', error)
    return NextResponse.redirect(new URL('/signin?error=CallbackError', request.url))
  }
}
