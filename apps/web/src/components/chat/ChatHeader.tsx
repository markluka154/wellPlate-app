'use client'

import { MoreVertical, LayoutDashboard } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function ChatHeader() {
  const router = useRouter()

  return (
    <div className="h-[60px] bg-gradient-to-r from-emerald-50 via-blue-50 to-orange-50 border-b border-gray-200 flex items-center justify-between px-6 backdrop-blur-xl">
      {/* Left: Lina Avatar + Info */}
      <div className="flex items-center gap-3">
        {/* Avatar with gradient and ring */}
        <div className="relative">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center shadow-sm ring-2 ring-white">
            <span className="text-white font-semibold text-lg">L</span>
          </div>
          {/* Online indicator */}
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full ring-2 ring-white animate-pulse"></div>
        </div>
        
        {/* Name & Status */}
        <div>
          <h1 className="font-display font-semibold text-gray-900 text-[16px]">Lina</h1>
          <p className="text-[12px] text-gray-500">Your AI nutrition coach</p>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        <button 
          onClick={() => router.push('/dashboard')}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors hover:scale-105"
          title="Go to Dashboard"
        >
          <LayoutDashboard className="w-5 h-5 text-gray-500" />
        </button>
        <button className="p-2 hover:bg-gray-100 rounded-full transition-colors hover:scale-105">
          <MoreVertical className="w-5 h-5 text-gray-500" />
        </button>
      </div>
    </div>
  )
}