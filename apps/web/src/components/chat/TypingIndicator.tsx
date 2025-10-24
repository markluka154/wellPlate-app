'use client'

export default function TypingIndicator() {
  return (
    <div className="flex gap-3 animate-fadeIn">
      {/* Avatar */}
      <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center shadow-sm flex-shrink-0">
        <span className="text-white font-semibold text-sm">L</span>
      </div>

      {/* Typing Animation */}
      <div className="bg-white px-4 py-3 rounded-[20px] rounded-bl-[6px] shadow-sm">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  )
}
