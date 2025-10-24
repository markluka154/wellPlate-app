'use client'

import { ChatMessage as ChatMessageType } from '@/types/coach'

interface ChatMessageProps {
  message: ChatMessageType
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user'
  const isSystem = message.role === 'system'

  // Don't render system messages in the UI
  if (isSystem) {
    return null
  }

  if (isUser) {
    return (
      <div className="flex justify-end animate-fadeIn">
        <div className="max-w-[80%] bg-emerald-500 text-white px-4 py-3 rounded-[20px] rounded-br-[6px] shadow-sm hover:shadow-md transition-shadow">
          <p className="text-sm leading-relaxed">{message.content}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-3 animate-fadeIn">
      {/* Avatar */}
      <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center shadow-sm flex-shrink-0">
        <span className="text-white font-semibold text-sm">L</span>
      </div>

      {/* Message */}
      <div className="max-w-[80%] bg-white px-4 py-3 rounded-[20px] rounded-bl-[6px] shadow-sm hover:shadow-md transition-shadow">
        <p className="text-sm leading-relaxed text-gray-900">{message.content}</p>
      </div>
    </div>
  )
}
