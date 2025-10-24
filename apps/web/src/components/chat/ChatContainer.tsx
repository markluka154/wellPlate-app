'use client'

import { useEffect, useRef } from 'react'
import { ChatMessage } from './ChatMessage'
import { TypingIndicator } from './TypingIndicator'

interface ChatContainerProps {
  messages: Array<{
    id: string
    role: 'user' | 'assistant'
    content: string
    timestamp?: string
  }>
  isTyping: boolean
}

export function ChatContainer({ messages, isTyping }: ChatContainerProps) {
  const bottomRef = useRef<HTMLDivElement>(null)
  
  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])
  
  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 px-4 py-6 space-y-4 scrollbar-thin">
      {messages.map((message, index) => (
        <ChatMessage key={message.id} message={message} index={index} />
      ))}
      
      {isTyping && <TypingIndicator />}
      
      {/* Scroll anchor */}
      <div ref={bottomRef} />
    </div>
  )
}