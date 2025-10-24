'use client'

import React, { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useChatStore } from '@/store/coachStore'
import ChatHeader from '@/components/chat/ChatHeader'
import ChatContainer from '@/components/chat/ChatContainer'
import ChatInput from '@/components/chat/ChatInput'
import ChatMessage from '@/components/chat/ChatMessage'
import TypingIndicator from '@/components/chat/TypingIndicator'
import { Button } from '@/components/ui/button'
import { Loader2, ArrowLeft } from 'lucide-react'
import type { Session } from 'next-auth'

export default function ChatPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const {
    isInitialized,
    isLoading,
    error,
    initializeChat,
    userProfile,
    messages,
    sendMessage,
    isTyping,
  } = useChatStore()

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session?.user?.id) {
      router.push('/signin')
      return
    }

    if (!isInitialized && !isLoading) {
      initializeChat(session.user.id)
    }
  }, [session, status, isInitialized, isLoading, initializeChat, router])

  const handleSendMessage = async (message: string) => {
    try {
      await sendMessage(message)
    } catch (err) {
      console.error('Failed to send message:', err)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-3 text-gray-600" />
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session?.user?.id) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <h1 className="text-xl font-semibold text-gray-900 mb-2">AI Nutrition Coach</h1>
          <p className="text-gray-600 mb-6">
            Get personalized nutrition advice and meal suggestions from our AI coach.
          </p>
          <Button 
            onClick={() => router.push('/signin')}
            className="bg-emerald-500 hover:bg-emerald-600 text-white"
          >
            Sign In to Continue
          </Button>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-x-3">
            <Button 
              onClick={() => initializeChat(session.user.id)}
              className="bg-emerald-500 hover:bg-emerald-600 text-white"
            >
              Try Again
            </Button>
            <Button 
              variant="outline"
              onClick={() => router.push('/dashboard')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Top Gradient Header */}
      <ChatHeader />
      
      {/* Chat Messages Container */}
      <ChatContainer>
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        
        {/* Typing Indicator */}
        {isTyping && <TypingIndicator />}
      </ChatContainer>
      
      {/* Floating Input Area */}
      <ChatInput 
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
      />
    </div>
  )
}