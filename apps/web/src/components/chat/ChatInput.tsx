'use client'

import { Paperclip, Mic, Send } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

interface ChatInputProps {
  onSendMessage: (message: string) => void
  isLoading?: boolean
}

export default function ChatInput({ onSendMessage, isLoading = false }: ChatInputProps) {
  const [message, setMessage] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const charCount = message.length

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [message])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (message.trim() && !isLoading) {
      onSendMessage(message.trim())
      setMessage('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <div className="p-4 bg-white border-t border-gray-200">
      {/* Main Input Container */}
      <div className="relative">
        {/* Textarea */}
        <form onSubmit={handleSubmit} className="relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Lina anything about nutrition..."
            className="w-full min-h-[52px] max-h-32 px-4 py-3 pr-24 bg-gray-50 border border-gray-200 rounded-[24px] resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900 placeholder-gray-500"
            disabled={isLoading}
          />

          {/* Bottom Action Bar */}
          <div className="absolute bottom-2 left-4 right-4 flex items-center justify-between">
            {/* Left Actions */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="p-1.5 hover:bg-gray-200 rounded-full transition-colors"
                disabled={isLoading}
              >
                <Paperclip className="w-4 h-4 text-gray-500" />
              </button>
              <button
                type="button"
                className="p-1.5 hover:bg-gray-200 rounded-full transition-colors"
                disabled={isLoading}
              >
                <Mic className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">
                {charCount}/2000
              </span>
              <button
                type="submit"
                disabled={!message.trim() || isLoading}
                className="w-8 h-8 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-300 rounded-full flex items-center justify-center transition-colors"
              >
                <Send className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Footer Text */}
      <p className="text-xs text-gray-400 text-center mt-2">
        Lina can make mistakes. Check important info.
      </p>
    </div>
  )
}
