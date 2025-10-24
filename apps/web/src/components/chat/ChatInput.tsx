'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Paperclip, Mic } from 'lucide-react'

interface ChatInputProps {
  onSend: (message: string) => void
  disabled?: boolean
}

export function ChatInput({ onSend, disabled = false }: ChatInputProps) {
  const [message, setMessage] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const maxLength = 2000
  
  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`
    }
  }, [message])
  
  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSend(message)
      setMessage('')
    }
  }
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }
  
  return (
    <div className="p-4 bg-white border-t border-gray-200">
      {/* Main Input Container */}
      <div className="relative bg-gray-50 border border-gray-200 rounded-[24px] shadow-lg focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500 transition-all duration-200">
        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask Lina anything about nutrition..."
          disabled={disabled}
          maxLength={maxLength}
          rows={1}
          className="
            w-full
            min-h-[56px]
            max-h-[200px]
            px-5 py-4
            pr-14
            bg-transparent
            border-0
            resize-none
            text-[15px]
            text-gray-800
            placeholder:text-gray-400
            focus:outline-none
            focus:ring-0
            disabled:opacity-50
            disabled:cursor-not-allowed
          "
        />
        
        {/* Bottom Action Bar */}
        <div className="absolute bottom-2 left-4 right-4 flex items-center justify-between">
          {/* Left Actions */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="p-1.5 hover:bg-gray-200 rounded-full transition-colors hover:scale-105"
              disabled={disabled}
            >
              <Paperclip className="w-4 h-4 text-gray-500" />
            </button>
            <button
              type="button"
              className="p-1.5 hover:bg-gray-200 rounded-full transition-colors hover:scale-105"
              disabled={disabled}
            >
              <Mic className="w-4 h-4 text-gray-500" />
            </button>
          </div>
          
          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Character Counter */}
            <span className="text-xs text-gray-400">
              {message.length}/{maxLength}
            </span>
            
            {/* Send Button */}
            <button
              type="button"
              onClick={handleSend}
              disabled={!message.trim() || disabled}
              className="w-8 h-8 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-300 rounded-full flex items-center justify-center transition-colors hover:scale-105"
            >
              <Send className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Footer Disclaimer */}
      <p className="text-xs text-gray-400 text-center mt-2">
        Lina can make mistakes. Check important info.
      </p>
    </div>
  )
}