'use client'

import React from 'react'
import { Crown } from 'lucide-react'

interface ProBadgeProps {
  children: React.ReactNode
  onClick?: () => void
  className?: string
  showBadge?: boolean
}

export function ProBadge({ children, onClick, className = '', showBadge = true }: ProBadgeProps) {
  return (
    <div className={`relative ${className}`}>
      {showBadge && (
        <div className="absolute -top-2 -right-2 z-10">
          <div className="flex items-center gap-1 bg-gradient-to-r from-emerald-500 to-blue-500 text-white text-xs px-2 py-1 rounded-full shadow-lg">
            <Crown className="h-3 w-3" />
            <span className="font-bold">PRO</span>
          </div>
        </div>
      )}
      <div 
        className={onClick ? 'cursor-pointer' : ''}
        onClick={onClick}
      >
        {children}
      </div>
    </div>
  )
}
