'use client'

import React, { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useChatStore } from '@/store/coachStore'
import { ChatHeader } from '@/components/chat/ChatHeader'
import { ChatContainer } from '@/components/chat/ChatContainer'
import { ChatInput } from '@/components/chat/ChatInput'
import { QuickActions } from '@/components/chat/QuickActions'
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
    console.log('🔍 Chat page session debug:', {
      status,
      hasSession: !!session,
      hasUser: !!session?.user,
      hasUserId: !!session?.user?.id,
      userId: session?.user?.id,
      userEmail: session?.user?.email,
      isInitialized,
      isLoading,
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
      isMobile: typeof window !== 'undefined' ? /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(window.navigator.userAgent) : false
    })

    if (status === 'loading') return
    
    // Add a small delay for mobile to ensure session is properly loaded
    if (typeof window !== 'undefined' && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(window.navigator.userAgent)) {
      setTimeout(() => {
        if (!session?.user?.id) {
          console.log('❌ No session or user ID on mobile, redirecting to signin')
          router.push('/signin')
          return
        }
      }, 100)
    } else {
      if (!session?.user?.id) {
        console.log('❌ No session or user ID, redirecting to signin')
        router.push('/signin')
        return
      }
    }

    if (!isInitialized && !isLoading && session?.user?.id) {
      console.log('✅ Initializing chat for user:', session.user.id)
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

  const handleQuickAction = async (action: string) => {
    try {
      await sendMessage(action)
    } catch (err) {
      console.error('Failed to send quick action:', err)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-3 text-gray-600" />
          <p className="text-sm text-gray-500">Loading...</p>
          {/* Debug info */}
          <div className="mt-4 p-4 bg-gray-100 rounded text-xs text-left max-w-md">
            <p><strong>Debug Info:</strong></p>
            <p>Status: {status}</p>
            <p>Has Session: {session ? 'Yes' : 'No'}</p>
            <p>User ID: {(session as any)?.user?.id || 'None'}</p>
            <p>User Email: {(session as any)?.user?.email || 'None'}</p>
          </div>
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
          
          {/* Debug info */}
          <div className="mt-6 p-4 bg-gray-100 rounded text-xs text-left">
            <p><strong>Debug Info:</strong></p>
            <p>Status: {status}</p>
            <p>Has Session: {session ? 'Yes' : 'No'}</p>
            <p>User ID: {(session as any)?.user?.id || 'None'}</p>
            <p>User Email: {(session as any)?.user?.email || 'None'}</p>
            <p>Session Object: {JSON.stringify(session, null, 2)}</p>
          </div>
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
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-100 via-emerald-50/80 to-blue-100/60 flex flex-col">
      {/* Top Gradient Header */}
      <ChatHeader />
      
      {/* Quick Actions - Show when there are few messages */}
      {messages.length <= 2 && (
        <QuickActions 
          onActionClick={handleQuickAction}
          disabled={isLoading}
        />
      )}
      
      {/* Chat Messages Container */}
      <ChatContainer 
        messages={messages
          .filter(msg => msg.role !== 'system') // Filter out system messages
          .map(msg => ({
            id: msg.id,
            role: msg.role as 'user' | 'assistant', // Type assertion
            content: msg.content,
            timestamp: msg.timestamp instanceof Date 
              ? msg.timestamp.toLocaleTimeString()
              : msg.timestamp 
              ? new Date(msg.timestamp).toLocaleTimeString()
              : 'Just now'
          }))}
        isTyping={isTyping}
      />
      
            {/* Floating Input Area */}
            <ChatInput 
              onSend={handleSendMessage}
              disabled={isLoading}
              userId={session?.user?.id}
            />
    </div>
  )
}