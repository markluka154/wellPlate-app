'use client'

import { cn } from '@/lib/utils'
import ReactMarkdown from 'react-markdown'

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
          <div className="text-[15px] leading-relaxed font-normal prose prose-sm max-w-none">
            <ReactMarkdown
              components={{
                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
                em: ({ children }) => <em className="italic text-gray-700">{children}</em>,
                ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                li: ({ children }) => <li className="text-gray-800">{children}</li>,
                code: ({ children }) => <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">{children}</code>,
                blockquote: ({ children }) => <blockquote className="border-l-4 border-emerald-200 pl-4 italic text-gray-600">{children}</blockquote>,
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
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