import { withAuth } from 'next-auth/middleware'

export default withAuth(
  function middleware(req) {
    // Add any additional middleware logic here if needed
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Allow access to dashboard routes only if user is authenticated
        if (req.nextUrl.pathname.startsWith('/dashboard')) {
          return !!token
        }
        // Allow access to all other routes
        return true
      },
    },
    pages: {
      signIn: '/signin',
    },
  }
)

export const config = {
  matcher: [
    '/dashboard/:path*',
  ]
}
