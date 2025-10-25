'use client'

import { CoachMemory, ProgressLog, UserProfile } from '@/types/coach'

export interface PatternInsight {
  type: 'eating_pattern' | 'mood_cycle' | 'energy_pattern' | 'sleep_pattern' | 'correlation' | 'trend'
  title: string
  description: string
  confidence: 'low' | 'medium' | 'high'
  data: any
  actionable: boolean
  suggestion?: string
}

export interface CorrelationInsight {
  variables: string[]
  strength: number // 0-1
  direction: 'positive' | 'negative' | 'neutral'
  description: string
  examples: string[]
}

export interface PredictiveInsight {
  type: 'energy_dip' | 'mood_change' | 'meal_timing' | 'sleep_quality' | 'stress_trigger'
  probability: number // 0-1
  timeframe: string
  description: string
  prevention?: string
  preparation?: string
}

export class SmartContextAnalyzer {
  private memories: CoachMemory[]
  private progressLogs: ProgressLog[]
  private userProfile: UserProfile

  constructor(memories: CoachMemory[], progressLogs: ProgressLog[], userProfile: UserProfile) {
    this.memories = memories
    this.progressLogs = progressLogs
    this.userProfile = userProfile
  }

  /**
   * Analyze patterns across all user data
   */
  analyzePatterns(): PatternInsight[] {
    const insights: PatternInsight[] = []

    // Eating patterns
    insights.push(...this.analyzeEatingPatterns())
    
    // Mood cycles
    insights.push(...this.analyzeMoodCycles())
    
    // Energy patterns
    insights.push(...this.analyzeEnergyPatterns())
    
    // Sleep patterns
    insights.push(...this.analyzeSleepPatterns())
    
    // Correlations
    insights.push(...this.findCorrelations())

    return insights.filter(insight => insight.confidence !== 'low')
  }

  /**
   * Detect eating patterns from memories and progress logs
   */
  private analyzeEatingPatterns(): PatternInsight[] {
    const insights: PatternInsight[] = []
    
    // Analyze meal timing patterns
    const mealTimes = this.extractMealTimes()
    if (mealTimes.length >= 3) {
      const avgBreakfast = this.calculateAverageTime(mealTimes.filter(t => t.meal === 'breakfast'))
      const avgLunch = this.calculateAverageTime(mealTimes.filter(t => t.meal === 'lunch'))
      const avgDinner = this.calculateAverageTime(mealTimes.filter(t => t.meal === 'dinner'))
      
      if (avgBreakfast && avgLunch && avgDinner) {
        insights.push({
          type: 'eating_pattern',
          title: 'Consistent Meal Timing',
          description: `You typically eat breakfast at ${avgBreakfast}, lunch at ${avgLunch}, and dinner at ${avgDinner}`,
          confidence: 'high',
          data: { breakfast: avgBreakfast, lunch: avgLunch, dinner: avgDinner },
          actionable: true,
          suggestion: 'Maintaining consistent meal times supports your circadian rhythm and metabolism'
        })
      }
    }

    // Analyze food preferences
    const foodPreferences = this.extractFoodPreferences()
    if (foodPreferences.length >= 5) {
      const topPreferences = this.getTopPreferences(foodPreferences, 3)
      insights.push({
        type: 'eating_pattern',
        title: 'Food Preferences',
        description: `You consistently enjoy ${topPreferences.join(', ')}`,
        confidence: 'medium',
        data: { preferences: topPreferences },
        actionable: true,
        suggestion: 'I can incorporate more of these foods into your meal plans'
      })
    }

    return insights
  }

  /**
   * Detect mood cycles and patterns
   */
  private analyzeMoodCycles(): PatternInsight[] {
    const insights: PatternInsight[] = []
    
    const moodData = this.progressLogs
      .filter(log => log.mood)
      .map(log => ({
        mood: log.mood!,
        date: log.date,
        dayOfWeek: log.date.getDay(),
        timeOfDay: log.date.getHours()
      }))

    if (moodData.length >= 7) {
      // Day of week patterns
      const dayPatterns = this.analyzeDayOfWeekPatterns(moodData)
      if (dayPatterns.length > 0) {
        insights.push({
          type: 'mood_cycle',
          title: 'Weekly Mood Pattern',
          description: `Your mood tends to be ${dayPatterns[0].mood} on ${dayPatterns[0].day}`,
          confidence: 'medium',
          data: { patterns: dayPatterns },
          actionable: true,
          suggestion: `Let's plan some mood-boosting activities for ${dayPatterns[0].day}s`
        })
      }

      // Time of day patterns
      const timePatterns = this.analyzeTimeOfDayPatterns(moodData)
      if (timePatterns.length > 0) {
        insights.push({
          type: 'mood_cycle',
          title: 'Daily Mood Rhythm',
          description: `You typically feel ${timePatterns[0].mood} around ${timePatterns[0].time}`,
          confidence: 'medium',
          data: { patterns: timePatterns },
          actionable: true,
          suggestion: `Let's optimize your nutrition around ${timePatterns[0].time} to support your mood`
        })
      }
    }

    return insights
  }

  /**
   * Analyze energy patterns
   */
  private analyzeEnergyPatterns(): PatternInsight[] {
    const insights: PatternInsight[] = []
    
    const energyData = this.memories
      .filter(memory => memory.insightType === 'energy_level')
      .map(memory => ({
        energy: memory.content.toLowerCase(),
        date: new Date(memory.createdAt),
        dayOfWeek: new Date(memory.createdAt).getDay()
      }))

    if (energyData.length >= 5) {
      const lowEnergyDays = energyData.filter(d => d.energy.includes('tired') || d.energy.includes('low'))
      const highEnergyDays = energyData.filter(d => d.energy.includes('energetic') || d.energy.includes('high'))

      if (lowEnergyDays.length > 0) {
        const commonDay = this.findMostCommonDay(lowEnergyDays.map(d => d.dayOfWeek))
        insights.push({
          type: 'energy_pattern',
          title: 'Energy Dip Pattern',
          description: `You often feel low energy on ${this.getDayName(commonDay)}s`,
          confidence: 'medium',
          data: { day: commonDay, count: lowEnergyDays.length },
          actionable: true,
          suggestion: `Let's plan energizing meals and snacks for ${this.getDayName(commonDay)}s`
        })
      }
    }

    return insights
  }

  /**
   * Analyze sleep patterns
   */
  private analyzeSleepPatterns(): PatternInsight[] {
    const insights: PatternInsight[] = []
    
    const sleepData = this.progressLogs
      .filter(log => log.sleepHours)
      .map(log => ({
        hours: log.sleepHours!,
        date: log.date,
        dayOfWeek: log.date.getDay()
      }))

    if (sleepData.length >= 7) {
      const avgSleep = sleepData.reduce((sum, d) => sum + d.hours, 0) / sleepData.length
      const sleepQuality = avgSleep >= 7 ? 'good' : avgSleep >= 6 ? 'moderate' : 'poor'
      
      insights.push({
        type: 'sleep_pattern',
        title: 'Sleep Quality Pattern',
        description: `You average ${avgSleep.toFixed(1)} hours of sleep, which is ${sleepQuality}`,
        confidence: 'high',
        data: { average: avgSleep, quality: sleepQuality },
        actionable: true,
        suggestion: sleepQuality === 'poor' ? 'Let\'s optimize your evening nutrition for better sleep' : 'Great sleep habits! Let\'s maintain this pattern'
      })
    }

    return insights
  }

  /**
   * Find correlations between different variables
   */
  private findCorrelations(): PatternInsight[] {
    const insights: PatternInsight[] = []
    
    // Correlate mood with sleep
    const moodSleepData = this.progressLogs
      .filter(log => log.mood && log.sleepHours)
      .map(log => ({
        mood: log.mood!,
        sleep: log.sleepHours!,
        date: log.date
      }))

    if (moodSleepData.length >= 5) {
      const correlation = this.calculateCorrelation(
        moodSleepData.map(d => this.moodToNumber(d.mood)),
        moodSleepData.map(d => d.sleep)
      )

      if (Math.abs(correlation) > 0.5) {
        insights.push({
          type: 'correlation',
          title: 'Sleep-Mood Connection',
          description: `Your mood strongly correlates with sleep quality (${(correlation * 100).toFixed(0)}% correlation)`,
          confidence: 'high',
          data: { correlation, variables: ['mood', 'sleep'] },
          actionable: true,
          suggestion: 'Prioritizing sleep will significantly improve your mood and energy'
        })
      }
    }

    return insights
  }

  /**
   * Generate predictive insights based on patterns
   */
  generatePredictiveInsights(): PredictiveInsight[] {
    const insights: PredictiveInsight[] = []
    const patterns = this.analyzePatterns()

    // Predict energy dips
    const energyPattern = patterns.find(p => p.type === 'energy_pattern')
    if (energyPattern) {
      insights.push({
        type: 'energy_dip',
        probability: 0.7,
        timeframe: 'next few days',
        description: `Based on your pattern, you might experience low energy on ${energyPattern.data.day}`,
        prevention: 'Plan energizing snacks and meals',
        preparation: 'Consider meal prepping for that day'
      })
    }

    // Predict mood changes
    const moodPattern = patterns.find(p => p.type === 'mood_cycle')
    if (moodPattern) {
      insights.push({
        type: 'mood_change',
        probability: 0.6,
        timeframe: 'this week',
        description: `Your mood pattern suggests you might feel ${moodPattern.data.patterns[0].mood} around ${moodPattern.data.patterns[0].time}`,
        prevention: 'Plan mood-supporting foods',
        preparation: 'Have healthy snacks ready'
      })
    }

    return insights
  }

  /**
   * Generate contextual conversation starters
   */
  generateContextualPrompts(): string[] {
    const prompts: string[] = []
    const patterns = this.analyzePatterns()
    const predictions = this.generatePredictiveInsights()

    // Reference recent patterns
    patterns.forEach(pattern => {
      if (pattern.confidence === 'high') {
        prompts.push(`I noticed ${pattern.description.toLowerCase()}. ${pattern.suggestion}`)
      }
    })

    // Reference predictions
    predictions.forEach(prediction => {
      if (prediction.probability > 0.6) {
        prompts.push(`Based on your patterns, ${prediction.description}. ${prediction.prevention}`)
      }
    })

    return prompts
  }

  // Helper methods
  private extractMealTimes(): Array<{ meal: string; time: string; date: Date }> {
    const mealTimes: Array<{ meal: string; time: string; date: Date }> = []
    
    this.memories.forEach(memory => {
      const content = memory.content.toLowerCase()
      if (content.includes('breakfast') || content.includes('lunch') || content.includes('dinner')) {
        const meal = content.includes('breakfast') ? 'breakfast' : 
                    content.includes('lunch') ? 'lunch' : 'dinner'
        const timeMatch = content.match(/(\d{1,2}):?(\d{2})?\s*(am|pm)?/i)
        if (timeMatch) {
          mealTimes.push({
            meal,
            time: timeMatch[0],
            date: new Date(memory.createdAt)
          })
        }
      }
    })

    return mealTimes
  }

  private calculateAverageTime(times: Array<{ time: string }>): string | null {
    if (times.length === 0) return null
    
    // Simple implementation - return most common time
    const timeCounts: { [key: string]: number } = {}
    times.forEach(t => {
      timeCounts[t.time] = (timeCounts[t.time] || 0) + 1
    })
    
    return Object.keys(timeCounts).reduce((a, b) => 
      timeCounts[a] > timeCounts[b] ? a : b
    )
  }

  private extractFoodPreferences(): string[] {
    const preferences: string[] = []
    
    this.memories.forEach(memory => {
      if (memory.insightType === 'food_preference') {
        // Extract food items from content
        const foods = memory.content.match(/\b(?:chicken|fish|vegetables|salad|pasta|rice|quinoa|avocado|berries|nuts)\b/gi)
        if (foods) {
          preferences.push(...foods.map(f => f.toLowerCase()))
        }
      }
    })

    return preferences
  }

  private getTopPreferences(preferences: string[], count: number): string[] {
    const counts: { [key: string]: number } = {}
    preferences.forEach(p => {
      counts[p] = (counts[p] || 0) + 1
    })

    return Object.entries(counts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, count)
      .map(([food]) => food)
  }

  private analyzeDayOfWeekPatterns(moodData: Array<{ mood: string; dayOfWeek: number }>): Array<{ day: string; mood: string; count: number }> {
    const dayCounts: { [key: number]: { [key: string]: number } } = {}
    
    moodData.forEach(d => {
      if (!dayCounts[d.dayOfWeek]) dayCounts[d.dayOfWeek] = {}
      dayCounts[d.dayOfWeek][d.mood] = (dayCounts[d.dayOfWeek][d.mood] || 0) + 1
    })

    const patterns: Array<{ day: string; mood: string; count: number }> = []
    
    Object.entries(dayCounts).forEach(([day, moods]) => {
      const mostCommonMood = Object.entries(moods).reduce((a, b) => 
        moods[a[0]] > moods[b[0]] ? a : b
      )
      
      if (mostCommonMood[1] >= 2) { // At least 2 occurrences
        patterns.push({
          day: this.getDayName(parseInt(day)),
          mood: mostCommonMood[0],
          count: mostCommonMood[1]
        })
      }
    })

    return patterns
  }

  private analyzeTimeOfDayPatterns(moodData: Array<{ mood: string; timeOfDay: number }>): Array<{ time: string; mood: string; count: number }> {
    const timeCounts: { [key: number]: { [key: string]: number } } = {}
    
    moodData.forEach(d => {
      const hour = Math.floor(d.timeOfDay / 4) * 4 // Group by 4-hour blocks
      if (!timeCounts[hour]) timeCounts[hour] = {}
      timeCounts[hour][d.mood] = (timeCounts[hour][d.mood] || 0) + 1
    })

    const patterns: Array<{ time: string; mood: string; count: number }> = []
    
    Object.entries(timeCounts).forEach(([hour, moods]) => {
      const mostCommonMood = Object.entries(moods).reduce((a, b) => 
        moods[a[0]] > moods[b[0]] ? a : b
      )
      
      if (mostCommonMood[1] >= 2) {
        patterns.push({
          time: `${hour}:00`,
          mood: mostCommonMood[0],
          count: mostCommonMood[1]
        })
      }
    })

    return patterns
  }

  private findMostCommonDay(days: number[]): number {
    const counts: { [key: number]: number } = {}
    days.forEach(day => {
      counts[day] = (counts[day] || 0) + 1
    })
    
    return parseInt(Object.keys(counts).reduce((a, b) => 
      counts[parseInt(a)] > counts[parseInt(b)] ? a : b
    ))
  }

  private getDayName(dayNumber: number): string {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    return days[dayNumber]
  }

  private moodToNumber(mood: string): number {
    const moodMap: { [key: string]: number } = {
      'sad': 1,
      'tired': 2,
      'stressed': 2,
      'neutral': 3,
      'happy': 4,
      'energetic': 5,
      'motivated': 5
    }
    return moodMap[mood.toLowerCase()] || 3
  }

  private calculateCorrelation(x: number[], y: number[]): number {
    if (x.length !== y.length || x.length === 0) return 0
    
    const n = x.length
    const sumX = x.reduce((a, b) => a + b, 0)
    const sumY = y.reduce((a, b) => a + b, 0)
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0)
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0)
    const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0)
    
    const numerator = n * sumXY - sumX * sumY
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY))
    
    return denominator === 0 ? 0 : numerator / denominator
  }
}
