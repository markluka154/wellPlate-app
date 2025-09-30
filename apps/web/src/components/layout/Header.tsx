'use client'

import Link from 'next/link'
import { useSession, signIn, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'

export function Header() {
  const { data: session, status } = useSession()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full bg-brand flex items-center justify-center">
              <span className="text-white font-bold text-sm">W</span>
            </div>
            <span className="text-xl font-bold text-gray-900">WellPlate</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/pricing" className="text-gray-600 hover:text-gray-900">
              Pricing
            </Link>
            <Link href="/faq" className="text-gray-600 hover:text-gray-900">
              FAQ
            </Link>
            {session ? (
              <Link 
                href="/dashboard" 
                className="inline-flex items-center px-3 py-2 rounded-md text-sm font-medium text-white bg-brand hover:bg-brand/90 transition-colors"
              >
                Dashboard
              </Link>
            ) : null}
          </nav>

          {/* Desktop Auth buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {status === 'loading' ? (
              <div className="h-9 w-20 bg-gray-200 rounded animate-pulse"></div>
            ) : session ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  {session.user?.email}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => signOut()}
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => signIn()}
                >
                  Sign In
                </Button>
                <Button
                  size="sm"
                  className="bg-brand hover:bg-brand/90"
                  onClick={() => signIn()}
                >
                  Get Started
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
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
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Pricing
              </Link>
              <Link
                href="/faq"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                FAQ
              </Link>
              {session ? (
                <>
                  <Link
                    href="/dashboard"
                    className="block px-3 py-2 rounded-md text-base font-medium text-white bg-brand hover:bg-brand/90"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <div className="px-3 py-2 text-sm text-gray-600">
                    {session.user?.email}
                  </div>
                  <button
                    onClick={() => {
                      signOut()
                      setIsMobileMenuOpen(false)
                    }}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      signIn()
                      setIsMobileMenuOpen(false)
                    }}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => {
                      signIn()
                      setIsMobileMenuOpen(false)
                    }}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-white bg-brand hover:bg-brand/90"
                  >
                    Get Started
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

