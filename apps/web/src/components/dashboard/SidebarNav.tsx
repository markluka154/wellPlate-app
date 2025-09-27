'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, BookOpen, Star, ShoppingCart, FileText, Users } from 'lucide-react'

const items = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/dashboard/plans', label: 'Meal Plans', icon: BookOpen },
  { href: '/dashboard/family', label: 'Family', icon: Users },
  { href: '/dashboard/shopping', label: 'Shopping', icon: ShoppingCart },
  { href: '/dashboard/templates', label: 'Templates', icon: FileText },
  { href: '/dashboard/favorites', label: 'Favorites', icon: Star },
]

export function SidebarNav() {
  const pathname = usePathname()
  return (
    <nav className="flex items-center justify-center space-x-2">
      {items.map(({ href, label, icon: Icon }) => {
        const active = pathname === href
        return (
          <Link
            key={href}
            href={href}
            className={[
              'flex items-center gap-2 rounded-xl px-4 py-2 text-sm transition',
              active
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'hover:bg-neutral-50 text-neutral-700'
            ].join(' ')}
          >
            <Icon className="h-4 w-4" />
            <span>{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
