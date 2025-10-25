'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Salad } from 'lucide-react'
import { SavedMealsModal } from './SavedMealsModal'
import { SavedMeal } from '@/types/coach'

interface ChatInputProps {
  onSend: (message: string, displayMessage?: string) => void
  disabled?: boolean
  userId?: string
}

export function ChatInput({ onSend, disabled = false, userId }: ChatInputProps) {
  const [message, setMessage] = useState('')
  const [showSavedMeals, setShowSavedMeals] = useState(false)
  const [attachedMeal, setAttachedMeal] = useState<SavedMeal | null>(null)
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
            onClick={handleAttachMeal}
            disabled={disabled || !userId}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-8 h-8 flex items-center justify-center text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors disabled:opacity-50"
          >
            <Salad className="w-4 h-4" />
          </button>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={attachedMeal ? `Ask Lina about ${attachedMeal.name}...` : "Ask Lina anything about nutrition..."}
            disabled={disabled}
            maxLength={maxLength}
            rows={1}
            className="
              w-full
              min-h-[56px]
              max-h-[200px]
              pl-12 pr-14 py-4
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