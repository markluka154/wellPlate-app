'use client'

import React, { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useChatStore } from '@/store/coachStore'
import { ChatUI } from '@/components/chat/ChatUI'
import { Card } from '@/components/ui/card'
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
            className="bg-gray-900 hover:bg-gray-800 text-white"
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
              className="bg-gray-900 hover:bg-gray-800 text-white"
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
    <div className="min-h-screen bg-white">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/dashboard')}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-lg font-medium text-gray-900">AI Coach</h1>
          <div className="w-8" /> {/* Spacer for centering */}
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block fixed left-0 top-0 w-64 h-full bg-white border-r border-gray-200">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
              <span className="text-sm font-medium text-gray-600">AI</span>
            </div>
            <div>
              <h1 className="text-lg font-medium text-gray-900">AI Coach</h1>
              <p className="text-sm text-gray-500">Nutrition Assistant</p>
            </div>
          </div>

          {userProfile && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-medium text-gray-900 mb-2">Your Profile</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Goal:</span>
                  <span className="font-medium capitalize">{userProfile.goal}</span>
                </div>
                {userProfile.weightKg && (
                  <div className="flex justify-between">
                    <span>Weight:</span>
                    <span className="font-medium">{userProfile.weightKg} kg</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Activity:</span>
                  <span className="font-medium">{userProfile.activityLevel}/5</span>
                </div>
                {userProfile.dietType && (
                  <div className="flex justify-between">
                    <span>Diet:</span>
                    <span className="font-medium capitalize">{userProfile.dietType}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Button
              variant="ghost"
              onClick={() => router.push('/dashboard')}
              className="w-full justify-start text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="lg:ml-64">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="h-screen lg:h-screen"
        >
          <ChatUI />
        </motion.div>
      </div>
    </div>
  )
}
