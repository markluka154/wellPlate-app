'use client'

import { cn } from '@/lib/utils'

interface ChatMessageProps {
  message: {
    id: string
    role: 'user' | 'assistant'
    content: string
    timestamp?: string
  }
  index: number
}

export function ChatMessage({ message, index }: ChatMessageProps) {
  const isUser = message.role === 'user'
  
  return (
    <div className={cn(
      "flex gap-3 animate-fadeIn",
      isUser && "justify-end"
    )}>
      {/* AI Avatar (left side) */}
      {!isUser && (
        <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center shadow-sm flex-shrink-0 ring-2 ring-white">
          <span className="text-white font-semibold text-sm">L</span>
        </div>
      )}
      
      {/* Message Bubble */}
      <div className={cn(
        "max-w-[85%] sm:max-w-[75%] md:max-w-[65%] group",
        !isUser && "px-5 py-3.5 rounded-[20px] rounded-tl-md bg-white border border-gray-100 text-gray-900 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.01]"
      )}>
        {/* User Message */}
        {isUser && (
          <div className="
            bg-gradient-to-br from-emerald-500 to-emerald-600
            text-white
            px-5 py-3.5
            rounded-[20px] rounded-tr-md
            shadow-sm shadow-emerald-500/30
            font-normal text-[15px] leading-relaxed
            transition-all duration-200
            hover:shadow-md hover:shadow-emerald-500/40
            hover:scale-[1.01]
          ">
            {message.content}
          </div>
        )}
        
        {/* AI Message */}
        {!isUser && (
          <p className="text-[15px] leading-relaxed font-normal">
            {message.content}
          </p>
        )}
        
        {/* Timestamp (appears on hover) */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 mt-1">
          <span className="text-xs text-gray-400">
            {message.timestamp || 'Just now'}
          </span>
        </div>
      </div>
    </div>
  )
}