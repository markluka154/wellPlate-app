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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-emerald-500" />
          <p className="text-gray-600">Loading your AI coach...</p>
        </Card>
      </div>
    )
  }

  if (!session?.user?.id) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Welcome to Lina</h1>
          <p className="text-gray-600 mb-6">
            Your AI nutrition coach is ready to help you reach your health goals.
            Please sign in to start your personalized journey.
          </p>
          <Button 
            onClick={() => router.push('/signin')}
            className="bg-emerald-500 hover:bg-emerald-600 text-white"
          >
            Sign In to Continue
          </Button>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong</h1>
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
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
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
          <h1 className="text-lg font-semibold text-gray-900">AI Coach</h1>
          <div className="w-8" /> {/* Spacer for centering */}
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block fixed left-0 top-0 w-64 h-full bg-white border-r border-gray-200">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-white flex items-center justify-center">
              <span className="text-lg font-bold">L</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Lina</h1>
              <p className="text-sm text-gray-600">AI Nutrition Coach</p>
            </div>
          </div>

          {userProfile && (
            <Card className="p-4 mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">Your Profile</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Goal:</span>
                  <span className="capitalize font-medium">{userProfile.goal}</span>
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
                    <span className="capitalize font-medium">{userProfile.dietType}</span>
                  </div>
                )}
              </div>
            </Card>
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
