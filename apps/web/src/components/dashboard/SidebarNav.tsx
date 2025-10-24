'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, BookOpen, Star, ShoppingCart, FileText, Users, MessageCircle } from 'lucide-react'

const items = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/dashboard/plans', label: 'Meal Plans', icon: BookOpen },
  { href: '/dashboard/family', label: 'Family', icon: Users },
  { href: '/dashboard/shopping', label: 'Shopping', icon: ShoppingCart },
  { href: '/dashboard/templates', label: 'Templates', icon: FileText },
  { href: '/dashboard/favorites', label: 'Favorites', icon: Star },
  { href: '/chat', label: 'AI Coach', icon: MessageCircle },
]

export function SidebarNav() {
  const pathname = usePathname()
  return (
    <nav className="flex items-center justify-center space-x-1 sm:space-x-2 overflow-x-auto pb-2">
      {items.map(({ href, label, icon: Icon }) => {
        const active = pathname === href
        return (
          <Link
            key={href}
            href={href}
            className={[
              'flex items-center gap-1 sm:gap-2 rounded-xl px-2 sm:px-4 py-2 text-xs sm:text-sm transition whitespace-nowrap',
              active
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'hover:bg-neutral-50 text-neutral-700'
            ].join(' ')}
          >
            <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="hidden xs:inline">{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
