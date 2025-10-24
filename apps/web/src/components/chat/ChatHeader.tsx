'use client'

import { MoreVertical } from 'lucide-react'

export default function ChatHeader() {
  return (
    <div className="h-[60px] bg-gradient-to-r from-emerald-50 via-blue-50 to-orange-50 border-b border-gray-200 flex items-center justify-between px-6">
      {/* Left: Lina Avatar + Name */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center shadow-sm">
          <span className="text-white font-semibold text-lg">L</span>
        </div>
        <div>
          <h1 className="font-display font-semibold text-gray-900 text-lg">Lina</h1>
          <p className="text-sm text-gray-500">Your AI nutrition coach</p>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center">
        <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <MoreVertical className="w-5 h-5 text-gray-500" />
        </button>
      </div>
    </div>
  )
}
