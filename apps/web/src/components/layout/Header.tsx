'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'
import { useSession, signOut } from 'next-auth/react'

type HeaderUser = {
  email: string
  plan?: string
  token?: string
}

export function Header() {
  const { data: session, status } = useSession()
  const [user, setUser] = useState<HeaderUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('wellplate:user')
      if (storedUser) {
        setUser(JSON.parse(storedUser))
      }
    } catch (error) {
      console.warn('Unable to parse stored user data:', error)
    }
  }, [])

  useEffect(() => {
    if (status === 'loading') return

    if (status === 'authenticated' && session?.user?.email) {
      const storedPlan =
        (() => {
          try {
            const existing = localStorage.getItem('wellplate:user')
            if (!existing) return undefined
            return JSON.parse(existing)?.plan
          } catch (error) {
            console.warn('Failed to read stored user plan:', error)
            return undefined
          }
        })() ?? (session.user as any)?.plan

      const nextUser: HeaderUser = {
        email: session.user.email,
        plan: storedPlan,
        token: 'nextauth-session',
      }

      setUser(nextUser)

      try {
        localStorage.setItem('wellplate:user', JSON.stringify(nextUser))
      } catch (error) {
        console.warn('Unable to persist user data to localStorage:', error)
      }
    } else if (status === 'unauthenticated') {
      setUser(null)
      try {
        localStorage.removeItem('wellplate:user')
      } catch (error) {
        console.warn('Failed to clear stored user data:', error)
      }
    }

    setIsLoading(false)
  }, [status, session])

  const handleSignOut = async () => {
    try {
      localStorage.removeItem('wellplate:user')
    } catch (error) {
      console.warn('Failed to clear stored user on sign out:', error)
    }

    setUser(null)
    await signOut({ callbackUrl: '/' })
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 flex-shrink-0">
            <div className="h-8 w-8 rounded-full bg-brand flex items-center justify-center">
              <span className="text-white font-bold text-sm">W</span>
            </div>
            <span className="text-xl font-bold text-gray-900">WellPlate</span>
          </Link>

          {/* Navigation - Centered */}
          <nav className="hidden md:flex items-center justify-center flex-1 space-x-8">
            <Link href="/pricing" className="text-gray-600 hover:text-gray-900 transition-colors">
              Pricing
            </Link>
            {user ? (
              <Link 
                href="/dashboard" 
                className="text-gray-600 hover:text-gray-900 transition-colors font-medium"
              >
                Dashboard
              </Link>
            ) : null}
            <Link href="/faq" className="text-gray-600 hover:text-gray-900 transition-colors">
              FAQ
            </Link>
          </nav>

          {/* Desktop Auth buttons */}
          <div className="hidden md:flex items-center space-x-4 flex-shrink-0">
            {isLoading ? (
              <div className="h-9 w-20 bg-gray-200 rounded animate-pulse"></div>
            ) : user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600 truncate max-w-[150px]">
                  {user.email}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSignOut}
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                >
                  <Link href="/signin">Sign In</Link>
                </Button>
                <Button
                  size="sm"
                  className="bg-brand hover:bg-brand/90"
                  asChild
                >
                  <Link href="/signin">Get Started</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex-shrink-0">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 touch-manipulation"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
              <Link
                href="/pricing"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 touch-manipulation active:bg-gray-100"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Pricing
              </Link>
              {user ? (
                <Link
                  href="/dashboard"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 touch-manipulation active:bg-gray-100"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
              ) : null}
              <Link
                href="/faq"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 touch-manipulation active:bg-gray-100"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                FAQ
              </Link>
              {user ? (
                <>
                  <div className="px-3 py-2 text-sm text-gray-600 truncate">
                    {user.email}
                  </div>
                  <button
                    onClick={async () => {
                      await handleSignOut()
                      setIsMobileMenuOpen(false)
                    }}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 touch-manipulation active:bg-gray-100"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/signin"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 touch-manipulation active:bg-gray-100"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signin"
                    className="block px-3 py-2 rounded-md text-base font-medium text-white bg-brand hover:bg-brand/90 touch-manipulation active:bg-brand"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
