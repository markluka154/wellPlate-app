'use client'

import { useEffect, useRef } from 'react'

interface ChatContainerProps {
  children: React.ReactNode
}

export default function ChatContainer({ children }: ChatContainerProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [children])

  return (
    <div 
      ref={scrollRef}
      className="flex-1 overflow-y-auto bg-gray-50 px-4 py-6 space-y-4"
      style={{ scrollBehavior: 'smooth' }}
    >
      {children}
    </div>
  )
}
