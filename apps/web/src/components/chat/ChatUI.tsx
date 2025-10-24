'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Smile, MoreHorizontal, Bot, User } from 'lucide-react'
import { useChatStore } from '@/store/coachStore'
import { ChatMessage } from '@/types/coach'
import { ProgressChart } from './ProgressChart'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface ChatUIProps {
  className?: string
}

export function ChatUI({ className = '' }: ChatUIProps) {
  const {
    messages,
    isLoading,
    error,
    addMessage,
    sendMessage,
    clearChat,
    retryLastMessage,
  } = useChatStore()

  const [inputValue, setInputValue] = useState('')
  const [showMoodPicker, setShowMoodPicker] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const moods = [
    { emoji: '😊', label: 'Happy', value: 'happy' },
    { emoji: '😴', label: 'Tired', value: 'tired' },
    { emoji: '😰', label: 'Stressed', value: 'stressed' },
    { emoji: '⚡', label: 'Energetic', value: 'energetic' },
    { emoji: '😢', label: 'Sad', value: 'sad' },
    { emoji: '😟', label: 'Anxious', value: 'anxious' },
  ]

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return

    const message = inputValue.trim()
    setInputValue('')
    await sendMessage(message)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleMoodSelect = async (mood: string) => {
    setShowMoodPicker(false)
    await sendMessage(`I'm feeling ${mood} today. What should I eat?`)
  }

  const renderMessage = (message: ChatMessage) => {
    const isUser = message.role === 'user'
    
    return (
      <motion.div
        key={message.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
      >
        <div className={`flex items-start space-x-3 max-w-[80%] ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
          {/* Avatar */}
          <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
            isUser 
              ? 'bg-gray-900 text-white' 
              : 'bg-gray-100 text-gray-600'
          }`}>
            {isUser ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
          </div>

          {/* Message Content */}
          <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
            <div className={`px-4 py-3 rounded-lg max-w-[80%] ${
              isUser 
                ? 'bg-gray-900 text-white' 
                : 'bg-gray-100 text-gray-900'
            }`}>
              <div className="prose prose-sm max-w-none">
                {message.type === 'progress_chart' && message.data ? (
                  <ProgressChart data={message.data} type="combined" height={250} className="border-0 p-0" />
                ) : (
                  <p className="whitespace-pre-wrap m-0">{message.content}</p>
                )}
              </div>
            </div>
            
            {/* Timestamp */}
            <span className="text-xs text-gray-500 mt-1">
              {new Date(message.timestamp).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
        </div>
      </motion.div>
    )
  }

  const renderTypingIndicator = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex justify-start mb-4"
    >
      <div className="flex items-start space-x-3 max-w-[80%]">
        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center">
          <Bot className="w-3 h-3" />
        </div>
        <div className="px-4 py-3 bg-gray-100 rounded-lg">
          <div className="flex space-x-1">
            <motion.div
              className="w-2 h-2 bg-gray-400 rounded-full"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
            />
            <motion.div
              className="w-2 h-2 bg-gray-400 rounded-full"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
            />
            <motion.div
              className="w-2 h-2 bg-gray-400 rounded-full"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  )

  return (
    <div className={`flex flex-col h-full bg-white ${className}`}>
      {/* Header */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
              <Bot className="w-4 h-4 text-gray-600" />
            </div>
            <div>
              <h1 className="text-base font-medium text-gray-900">AI Coach</h1>
              <p className="text-sm text-gray-500">Nutrition Assistant</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowMoodPicker(!showMoodPicker)}
              className="text-gray-500 hover:text-gray-700"
            >
              <Smile className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearChat}
              className="text-gray-500 hover:text-gray-700"
            >
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        <AnimatePresence>
          {messages.map(renderMessage)}
          {isLoading && renderTypingIndicator()}
        </AnimatePresence>
        
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center"
          >
            <Card className="px-4 py-3 bg-red-50 border border-red-200 text-red-800">
              <div className="flex items-center space-x-2">
                <span className="text-sm">{error}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={retryLastMessage}
                  className="text-red-800 hover:text-red-900"
                >
                  Retry
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Mood Picker */}
      <AnimatePresence>
        {showMoodPicker && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="px-6 py-3 bg-white border-t border-gray-200"
          >
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-sm font-medium text-gray-700">How are you feeling?</span>
            </div>
            <div className="flex space-x-2">
              {moods.map((mood) => (
                <Button
                  key={mood.value}
                  variant="ghost"
                  size="sm"
                  onClick={() => handleMoodSelect(mood.value)}
                  className="flex flex-col items-center space-y-1 p-2 h-auto hover:bg-gray-100"
                >
                  <span className="text-lg">{mood.emoji}</span>
                  <span className="text-xs text-gray-600">{mood.label}</span>
                </Button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input */}
      <div className="flex-shrink-0 bg-white border-t border-gray-200 px-6 py-4">
        <div className="flex items-end space-x-3">
          <div className="flex-1">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about nutrition, meal plans, or your health goals..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent resize-none"
              disabled={isLoading}
            />
          </div>
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            className="bg-gray-900 hover:bg-gray-800 text-white rounded-lg px-4 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
