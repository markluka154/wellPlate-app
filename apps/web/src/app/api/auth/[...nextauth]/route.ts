// BACKUP YOUR ORIGINAL CODE FIRST!
// Save your current route.ts and @/lib/auth.ts files somewhere safe

import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'

// Minimal config to test if build passes
const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? 'dummy',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? 'dummy',
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET ?? 'dummy-secret-for-build',
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }