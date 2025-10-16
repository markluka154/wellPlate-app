import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  // Only protect dashboard routes
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    // Check for NextAuth session token in cookies
    const token = request.cookies.get('next-auth.session-token') || 
                  request.cookies.get('__Secure-next-auth.session-token')
    
    // If no NextAuth token, allow through - the dashboard layout will handle localStorage auth
    if (!token) {
      return NextResponse.next()
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
  ]
}
