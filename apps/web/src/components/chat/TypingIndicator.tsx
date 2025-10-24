'use client'

export function TypingIndicator() {
  return (
    <div className="flex gap-3 animate-fadeIn">
      {/* Avatar */}
      <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center shadow-sm flex-shrink-0 ring-2 ring-white">
        <span className="text-white font-semibold text-sm">L</span>
      </div>
      
      {/* Typing animation */}
      <div className="bg-white border border-gray-100 px-5 py-3.5 rounded-[20px] rounded-tl-md shadow-sm">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  )
}