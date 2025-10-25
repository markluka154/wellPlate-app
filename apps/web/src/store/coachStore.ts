import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { ChatState, ChatMessage, ChatSession, UserProfile, CoachMemory, ProgressLog } from '@/types/coach'

interface ChatStore extends ChatState {
  // Additional state
  isInitialized: boolean
  error?: string
  isTyping: boolean
  currentUserId?: string
  
  // Additional actions
  initializeChat: (userId: string) => Promise<void>
  setError: (error: string | undefined) => void
  retryLastMessage: () => Promise<void>
  setIsTyping: (typing: boolean) => void
  clearForNewUser: (userId: string) => void
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      // Initial state
      messages: [],
      isLoading: false,
      currentSession: undefined,
      userProfile: undefined,
      recentMemories: [],
      recentProgress: [],
      isInitialized: false,
      error: undefined,
      isTyping: false,
      currentUserId: undefined,

      // Actions
      addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
        const newMessage: ChatMessage = {
          ...message,
          id: crypto.randomUUID(),
          timestamp: new Date(),
        }
        
        set((state) => ({
          messages: [...state.messages, newMessage],
          currentSession: state.currentSession ? {
            ...state.currentSession,
            messages: [...state.currentSession.messages, newMessage],
            updatedAt: new Date(),
          } : undefined,
        }))
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading })
      },

      setSession: (session: ChatSession) => {
        set({ 
          currentSession: session,
          messages: session.messages,
        })
      },

      setUserProfile: (profile: UserProfile) => {
        set({ userProfile: profile })
      },

      setMemories: (memories: CoachMemory[]) => {
        set({ recentMemories: memories })
      },

      setProgress: (progress: ProgressLog[]) => {
        set({ recentProgress: progress })
      },

      clearChat: () => {
        set({ 
          messages: [],
          currentSession: undefined,
          error: undefined,
        })
      },

      setError: (error: string | undefined) => {
        set({ error })
      },

      setIsTyping: (typing: boolean) => {
        set({ isTyping: typing })
      },

      clearForNewUser: (userId: string) => {
        const currentUserId = get().currentUserId
        if (currentUserId && currentUserId !== userId) {
          console.log('🔄 Clearing chat store for new user:', userId)
          set({
            messages: [],
            currentSession: undefined,
            userProfile: undefined,
            recentMemories: [],
            recentProgress: [],
            isInitialized: false,
            error: undefined,
            isLoading: false,
            isTyping: false,
            currentUserId: userId,
          })
        } else if (!currentUserId) {
          set({ currentUserId: userId })
        }
      },

      initializeChat: async (userId: string) => {
        try {
          // Clear store if different user
          get().clearForNewUser(userId)
          
          set({ isLoading: true, error: undefined })
          
          // Load user profile, memories, and progress
          const response = await fetch('/api/chat', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId }),
          })
          
          if (!response.ok) {
            throw new Error('Failed to initialize chat')
          }
          
          const data = await response.json()
          
          set({
            userProfile: data.userProfile,
            recentMemories: data.memories || [],
            recentProgress: data.progress || [],
            isInitialized: true,
            isLoading: false,
          })
          
          // Add welcome message if no existing session
          if (data.userProfile && get().messages.length === 0) {
            const welcomeMessage: ChatMessage = {
              id: crypto.randomUUID(),
              role: 'assistant',
              content: `Hey ${data.userProfile.name || 'there'}! 🌱 I'm Lina, your AI nutrition coach. I'm genuinely excited to be part of your health journey! 

I noticed you're working toward ${data.userProfile.goal} goals - that's fantastic! 💪 I'm here to help you reach those goals through personalized nutrition, smart meal planning, and lifestyle guidance that actually works.

How are you feeling today? What's on your mind when it comes to your nutrition and health goals? I'd love to hear about your current challenges or what you're most excited about! ✨`,
              timestamp: new Date(),
              type: 'text',
            }
            
            set((state) => ({
              messages: [welcomeMessage],
            }))
          }
          
        } catch (error) {
          console.error('Failed to initialize chat:', error)
          set({ 
            error: error instanceof Error ? error.message : 'Failed to initialize chat',
            isLoading: false,
          })
        }
      },

      sendMessage: async (content: string) => {
        const { addMessage, setLoading, setError, setIsTyping, userProfile } = get()
        
        if (!userProfile) {
          setError('Please initialize chat first')
          return
        }
        
        try {
          // Add user message
          addMessage({
            role: 'user',
            content,
            type: 'text',
          })
          
          setLoading(true)
          setIsTyping(true)
          setError(undefined)
          
          // Send to API
          const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              message: content,
              userId: userProfile.userId,
            }),
          })
          
          if (!response.ok) {
            throw new Error('Failed to send message')
          }
          
          const data = await response.json()
          
          // Add assistant response
          addMessage({
            role: 'assistant',
            content: data.message,
            type: data.type || 'text',
            data: data.data,
          })
          
          // Update memories and progress if provided
          if (data.memories) {
            set({ recentMemories: data.memories })
          }
          
          if (data.progress) {
            set({ recentProgress: data.progress })
          }
          
        } catch (error) {
          console.error('Failed to send message:', error)
          setError(error instanceof Error ? error.message : 'Failed to send message')
          
          // Add error message
          addMessage({
            role: 'assistant',
            content: 'I apologize, but I encountered an error. Please try again.',
            type: 'text',
          })
        } finally {
          setLoading(false)
          setIsTyping(false)
        }
      },

      retryLastMessage: async () => {
        const { messages, sendMessage } = get()
        const lastUserMessage = messages
          .filter(m => m.role === 'user')
          .pop()
        
        if (lastUserMessage) {
          // Remove the last assistant message (error message)
          set((state) => ({
            messages: state.messages.slice(0, -1),
          }))
          
          await sendMessage(lastUserMessage.content)
        }
      },
    }),
    {
      name: 'wellplate-chat-store',
      partialize: (state) => ({
        messages: state.messages,
        currentSession: state.currentSession,
        userProfile: state.userProfile,
        recentMemories: state.recentMemories,
        recentProgress: state.recentProgress,
        currentUserId: state.currentUserId,
      }),
    }
  )
)
