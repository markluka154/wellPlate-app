'use client'

import React, { useState } from 'react'
import { X, Star, ThumbsUp, Clock, ThumbsDown, XCircle, Smile } from 'lucide-react'

interface FamilyMember {
  id: string
  name: string
  avatar?: string
}

interface MealReactionModalProps {
  isOpen: boolean
  onClose: () => void
  mealName: string
  mealIngredients: string[]
  familyMembers: FamilyMember[]
  onReactionRecorded: () => void
}

type ReactionType = 'LOVED' | 'LIKED' | 'NEUTRAL' | 'DISLIKED' | 'REFUSED'

interface MemberReaction {
  memberId: string
  reaction: ReactionType
  portionEaten: number
  notes: string
}

export default function MealReactionModal({
  isOpen,
  onClose,
  mealName,
  mealIngredients,
  familyMembers,
  onReactionRecorded
}: MealReactionModalProps) {
  const [memberReactions, setMemberReactions] = useState<Record<string, MemberReaction>>({})
  const [submitting, setSubmitting] = useState(false)

  const reactionOptions = [
    { type: 'LOVED', label: 'Loved it!', icon: Star, color: 'text-yellow-500', bgColor: 'bg-yellow-50' },
    { type: 'LIKED', label: 'Liked', icon: ThumbsUp, color: 'text-green-500', bgColor: 'bg-green-50' },
    { type: 'NEUTRAL', label: 'Neutral', icon: Clock, color: 'text-gray-500', bgColor: 'bg-gray-50' },
    { type: 'DISLIKED', label: 'Disliked', icon: ThumbsDown, color: 'text-orange-500', bgColor: 'bg-orange-50' },
    { type: 'REFUSED', label: 'Refused', icon: XCircle, color: 'text-red-500', bgColor: 'bg-red-50' }
  ] as const

  const updateReaction = (memberId: string, reaction: ReactionType) => {
    setMemberReactions(prev => ({
      ...prev,
      [memberId]: {
        ...prev[memberId],
        memberId,
        reaction,
        portionEaten: prev[memberId]?.portionEaten || 1.0,
        notes: prev[memberId]?.notes || ''
      }
    }))
  }

  const updatePortionEaten = (memberId: string, portion: number) => {
    setMemberReactions(prev => ({
      ...prev,
      [memberId]: {
        ...prev[memberId],
        memberId,
        reaction: prev[memberId]?.reaction || 'NEUTRAL',
        portionEaten: portion,
        notes: prev[memberId]?.notes || ''
      }
    }))
  }

  const updateNotes = (memberId: string, notes: string) => {
    setMemberReactions(prev => ({
      ...prev,
      [memberId]: {
        ...prev[memberId],
        memberId,
        reaction: prev[memberId]?.reaction || 'NEUTRAL',
        portionEaten: prev[memberId]?.portionEaten || 1.0,
        notes
      }
    }))
  }

  const submitReactions = async () => {
    try {
      setSubmitting(true)

      // Submit each member's reaction
      for (const [memberId, reactionData] of Object.entries(memberReactions)) {
        if (reactionData.reaction && reactionData.reaction !== 'NEUTRAL') {
          await fetch('/api/family/preferences/learn', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              memberId,
              mealName,
              mealIngredients,
              reaction: reactionData.reaction,
              portionEaten: reactionData.portionEaten,
              notes: reactionData.notes
            })
          })
        }
      }

      onReactionRecorded()
      onClose()
    } catch (error) {
      console.error('Error submitting reactions:', error)
      alert('Failed to save reactions. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!isOpen) return null

  const hasRecordedReactions = Object.values(memberReactions).some(r => r.reaction && r.reaction !== 'NEUTRAL')

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">How was {mealName}?</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <p className="text-green-100">Help us learn what your family loves</p>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          <div className="space-y-6">
            {familyMembers.map((member) => {
              const memberReaction = memberReactions[member.id] || {
                memberId: member.id,
                reaction: 'NEUTRAL',
                portionEaten: 1.0,
                notes: ''
              }

              return (
                <div key={member.id} className="border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="text-3xl">{member.avatar || '👤'}</div>
                    <h3 className="text-lg font-bold text-gray-900">{member.name}</h3>
                  </div>

                  {/* Reaction Buttons */}
                  <div className="mb-4">
                    <div className="text-sm text-gray-600 mb-2">How did they like it?</div>
                    <div className="grid grid-cols-5 gap-2">
                      {reactionOptions.map((option) => {
                        const Icon = option.icon
                        const isSelected = memberReaction.reaction === option.type
                        return (
                          <button
                            key={option.type}
                            onClick={() => updateReaction(member.id, option.type)}
                            className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                              isSelected
                                ? `${option.bgColor} border-${option.color.replace('text-', '')}`
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <Icon className={`h-6 w-6 ${isSelected ? option.color : 'text-gray-400'}`} />
                            <span className={`text-xs font-medium ${isSelected ? 'text-gray-900' : 'text-gray-600'}`}>
                              {option.label}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Portion Eaten */}
                  <div className="mb-4">
                    <div className="text-sm text-gray-600 mb-2">How much did they eat?</div>
                    <div className="flex gap-2">
                      {[1.0, 0.75, 0.5, 0.25].map((portion) => (
                        <button
                          key={portion}
                          onClick={() => updatePortionEaten(member.id, portion)}
                          className={`flex-1 py-2 px-3 rounded-lg border-2 transition-all ${
                            memberReaction.portionEaten === portion
                              ? 'bg-blue-50 border-blue-500 text-blue-700 font-bold'
                              : 'border-gray-200 text-gray-600 hover:border-gray-300'
                          }`}
                        >
                          {portion * 100}%
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Notes (Optional) */}
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">Notes (optional)</label>
                    <textarea
                      value={memberReaction.notes}
                      onChange={(e) => updateNotes(member.id, e.target.value)}
                      placeholder="Any feedback..."
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={2}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-3 text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-100 transition-colors font-medium"
            disabled={submitting}
          >
            Skip
          </button>
          <button
            onClick={submitReactions}
            disabled={!hasRecordedReactions || submitting}
            className="px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl hover:from-green-700 hover:to-blue-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Saving...' : 'Save Reactions'}
          </button>
        </div>
      </div>
    </div>
  )
}

