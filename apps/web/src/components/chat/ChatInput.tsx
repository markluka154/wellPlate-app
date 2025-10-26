'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Salad, Lock, ArrowUp } from 'lucide-react'
import { SavedMealsModal } from './SavedMealsModal'
import { SavedMeal } from '@/types/coach'
import { useChatStore } from '@/store/coachStore'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface ChatInputProps {
  onSend: (message: string, displayMessage?: string) => void
  disabled?: boolean
  userId?: string
}

export function ChatInput({ onSend, disabled = false, userId }: ChatInputProps) {
  const { messagesRemaining, isFreeUser } = useChatStore()
  const isLimitReached = isFreeUser && messagesRemaining !== null && messagesRemaining === 0
  const [message, setMessage] = useState('')
  const [showSavedMeals, setShowSavedMeals] = useState(false)
  const [attachedMeal, setAttachedMeal] = useState<SavedMeal | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const maxLength = 2000
  
  // Debug: Log state on mount and when it changes
  console.log('🔍 ChatInput mounted with:', { userId, disabled, hasTextarea: !!textareaRef.current })
  
  // Debug: Log when userId changes
  useEffect(() => {
    console.log('🔍 ChatInput userId changed:', userId)
  }, [userId])
  
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
      let messageToSend = message.trim()
      let displayMessage = message.trim()
      
      // If a meal is attached, create clean display for user but full context for AI
      if (attachedMeal) {
        // Create clean message for user display
        displayMessage = `${attachedMeal.name} pasted\n${message.trim()}`
        
        // Create full context for AI (hidden from user)
        const aiContext = `
[MEAL_CONTEXT: ${attachedMeal.name}]
Type: ${attachedMeal.type}
Calories: ${attachedMeal.totalCalories}
Protein: ${attachedMeal.totalProtein}g
Carbs: ${attachedMeal.totalCarbs}g
Fat: ${attachedMeal.totalFat}g
Prep: ${attachedMeal.prepTime}min
Cook: ${attachedMeal.cookTime}min
Difficulty: ${attachedMeal.difficulty}
Ingredients: ${attachedMeal.ingredients.map(ing => `${ing.item} (${ing.qty})`).join(', ')}
Steps: ${attachedMeal.steps.join(' | ')}
[END_MEAL_CONTEXT]

User message: ${message.trim()}
        `.trim()
        
        messageToSend = aiContext
        setAttachedMeal(null) // Clear attached meal after sending
      }
      
      onSend(messageToSend, displayMessage)
      setMessage('')
    }
  }
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleAttachMeal = () => {
    console.log('🔍 Attach meal clicked, userId:', userId)
    if (!userId) {
      console.log('❌ No user ID available for saved meals')
      return
    }
    setShowSavedMeals(true)
  }

  const handleSelectMeal = (meal: SavedMeal) => {
    setAttachedMeal(meal)
    setShowSavedMeals(false)
  }

  const handleRemoveAttachedMeal = () => {
    setAttachedMeal(null)
  }
  
  return (
    <>
      <div className="p-4 bg-white border-t border-gray-200">
        {/* Attached Meal Display */}
        {attachedMeal && (
          <div className="max-w-2xl mx-auto mb-3">
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Salad className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-medium text-emerald-800">
                  Attached: {attachedMeal.name}
                </span>
                <span className="text-xs text-emerald-600 bg-emerald-100 px-2 py-1 rounded">
                  {attachedMeal.type}
                </span>
              </div>
              <button
                onClick={handleRemoveAttachedMeal}
                className="text-emerald-600 hover:text-emerald-800 text-sm"
              >
                Remove
              </button>
            </div>
          </div>
        )}

        {/* Main Input Container */}
        <div className="max-w-2xl mx-auto">
          <div className="relative bg-gray-50 border border-gray-200 rounded-[24px] shadow-lg focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500 transition-all duration-200">
          
          {/* Salad Icon Button */}
          <button
            type="button"
            onClick={() => {
              console.log('🔍 Salad button clicked!', { disabled, userId, hasTextarea: !!textareaRef.current })
              if (!userId) {
                console.error('❌ Button clicked but no userId!')
              }
              if (disabled) {
                console.error('❌ Button clicked but disabled!')
              }
              handleAttachMeal()
            }}
            disabled={disabled || !userId}
            className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 w-10 h-10 sm:w-8 sm:h-8 flex items-center justify-center text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors disabled:opacity-50 touch-manipulation z-10"
            style={{ pointerEvents: 'auto' }}
          >
            <Salad className="w-5 h-5 sm:w-4 sm:h-4" />
          </button>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isLimitReached
                ? "Upgrade to Pro to continue chatting..."
                : attachedMeal 
                  ? `Ask Lina about ${attachedMeal.name}...` 
                  : "Ask Lina anything about nutrition..."
            }
            disabled={disabled || isLimitReached}
            maxLength={maxLength}
            rows={1}
            className="
              w-full
              min-h-[56px]
              max-h-[200px]
              pl-14 sm:pl-12 pr-14 py-4
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
          <div className="absolute bottom-2 right-4 flex items-center gap-2">
            {/* Character Counter - Only show when there's text */}
            {message.length > 0 && (
              <span className="text-xs text-gray-400 bg-white/80 px-2 py-1 rounded-md backdrop-blur-sm">
                {message.length}/{maxLength}
              </span>
            )}
            
            {/* Send Button */}
            <button
              type="button"
              onClick={handleSend}
              disabled={!message.trim() || disabled || isLimitReached}
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

      {/* Limit Reached Prompt */}
      {isLimitReached && (
        <div className="max-w-2xl mx-auto px-4 pb-4">
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-xl p-4 flex items-center gap-3 shadow-sm">
            <div className="flex-shrink-0 w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
              <Lock className="w-5 h-5 text-amber-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-amber-900 mb-1">Message Limit Reached</h3>
              <p className="text-sm text-amber-700 mb-3">
                You've used all 3 free messages. Upgrade to Pro for unlimited AI coaching!
              </p>
              <Link 
                href="/pricing"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white font-semibold px-4 py-2 rounded-lg text-sm shadow-md hover:shadow-lg transition-all"
              >
                <ArrowUp className="w-4 h-4" />
                Upgrade to Pro
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Saved Meals Modal */}
      {userId && (
        <SavedMealsModal
          isOpen={showSavedMeals}
          onClose={() => setShowSavedMeals(false)}
          onSelectMeal={handleSelectMeal}
          userId={userId}
        />
      )}
    </>
  )
}