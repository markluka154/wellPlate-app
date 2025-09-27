import { describe, it, expect, vi, beforeEach } from 'vitest'
import { generateMealPlanPDF } from '@/lib/pdf'
import { type MealPlanResponse } from '@wellplate/shared'

// Mock PDFDocument
vi.mock('pdfkit', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      fontSize: vi.fn().mockReturnThis(),
      fillColor: vi.fn().mockReturnThis(),
      text: vi.fn().mockReturnThis(),
      moveTo: vi.fn().mockReturnThis(),
      lineTo: vi.fn().mockReturnThis(),
      stroke: vi.fn().mockReturnThis(),
      addPage: vi.fn().mockReturnThis(),
      end: vi.fn().mockReturnThis(),
      on: vi.fn().mockImplementation((event, callback) => {
        if (event === 'data') {
          callback(Buffer.from('mock pdf data'))
        } else if (event === 'end') {
          callback()
        }
      }),
    })),
  }
})

describe('PDF Generation', () => {
  const mockMealPlan: MealPlanResponse = {
    plan: [
      {
        day: 1,
        meals: [
          {
            name: 'Greek Yogurt Parfait',
            kcal: 420,
            protein_g: 28,
            carbs_g: 45,
            fat_g: 14,
            ingredients: [
              { item: 'Greek yogurt', qty: '200g' },
              { item: 'Berries', qty: '100g' },
            ],
            steps: ['Mix ingredients', 'Serve'],
          },
        ],
      },
    ],
    totals: {
      kcal: 2000,
      protein_g: 130,
      carbs_g: 200,
      fat_g: 70,
    },
    groceries: [
      { category: 'Dairy', items: ['Greek yogurt (1kg)'] },
      { category: 'Produce', items: ['Berries (700g)'] },
    ],
  }

  it('should generate PDF buffer', async () => {
    const result = await generateMealPlanPDF(mockMealPlan, 'test@example.com')
    expect(result).toBeInstanceOf(Buffer)
    expect(result.length).toBeGreaterThan(0)
  })

  it('should handle empty meal plan', async () => {
    const emptyMealPlan: MealPlanResponse = {
      plan: [],
      totals: { kcal: 0, protein_g: 0, carbs_g: 0, fat_g: 0 },
      groceries: [],
    }
    
    const result = await generateMealPlanPDF(emptyMealPlan, 'test@example.com')
    expect(result).toBeInstanceOf(Buffer)
  })
})
