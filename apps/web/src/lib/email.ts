import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY && 
  process.env.RESEND_API_KEY.startsWith('re_') && 
  process.env.RESEND_API_KEY !== 're_your-resend-api-key'
  ? new Resend(process.env.RESEND_API_KEY) 
  : null

export async function sendMagicLinkEmail(email: string, url: string) {
  try {
        if (!resend) {
          console.warn('⚠️ Resend API key not configured. Email sending disabled.')
          console.log('📧 Magic link URL for manual use:', url)
          return null
        }

        const { data, error } = await resend.emails.send({
          from: 'WellPlate <noreply@wellplate.eu>',
      to: [email],
      subject: 'Sign in to WellPlate',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">Welcome to WellPlate!</h1>
          <p>Click the button below to sign in to your account:</p>
          <a href="${url}" style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
            Sign In
          </a>
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #666;">${url}</p>
          <p style="color: #666; font-size: 14px;">This link will expire in 24 hours.</p>
        </div>
      `,
    })

    if (error) {
      console.error('Resend error:', error)
      throw new Error('Failed to send email')
    }

    return data
  } catch (error) {
    console.error('Email sending error:', error)
    throw error
  }
}

export async function sendMealPlanEmail(email: string, name: string, mealPlanData: any, pdfBuffer: Buffer) {
  try {
    if (!resend) {
      console.warn('⚠️ Resend API key not configured. Email sending disabled.')
      console.log('📧 Meal plan generated for:', email)
      return null
    }

    // Generate HTML content for the meal plan
    const generateMealPlanHTML = (data: any) => {
      if (!data?.plan) return '<p>Meal plan data not available</p>'
      
      let html = '<div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">'
      
      // Add each day
      data.plan.forEach((day: any, dayIndex: number) => {
        html += `<div style="margin-bottom: 30px; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px;">`
        html += `<h2 style="color: #2563eb; margin-bottom: 15px;">Day ${day.day}</h2>`
        
        // Add each meal
        day.meals.forEach((meal: any, mealIndex: number) => {
          html += `<div style="margin-bottom: 20px; padding: 15px; background-color: #f9fafb; border-radius: 6px;">`
          html += `<h3 style="color: #374151; margin-bottom: 10px;">${meal.name}</h3>`
          html += `<div style="display: flex; gap: 20px; margin-bottom: 10px; font-size: 14px; color: #6b7280;">`
          html += `<span>${meal.kcal} kcal</span>`
          html += `<span>${meal.protein_g}g protein</span>`
          html += `<span>${meal.carbs_g}g carbs</span>`
          html += `<span>${meal.fat_g}g fat</span>`
          html += `</div>`
          
          // Ingredients
          if (meal.ingredients && meal.ingredients.length > 0) {
            html += `<h4 style="color: #374151; margin-bottom: 8px;">Ingredients:</h4>`
            html += `<ul style="margin: 0; padding-left: 20px;">`
            meal.ingredients.forEach((ing: any) => {
              html += `<li style="margin-bottom: 4px;">${ing.item} — ${ing.qty}</li>`
            })
            html += `</ul>`
          }
          
          // Steps
          if (meal.steps && meal.steps.length > 0) {
            html += `<h4 style="color: #374151; margin-bottom: 8px; margin-top: 10px;">Instructions:</h4>`
            html += `<ol style="margin: 0; padding-left: 20px;">`
            meal.steps.forEach((step: any) => {
              html += `<li style="margin-bottom: 4px;">${step}</li>`
            })
            html += `</ol>`
          }
          
          html += `</div>`
        })
        
        html += `</div>`
      })
      
      // Add totals
      if (data.totals) {
        html += `<div style="margin-top: 30px; padding: 20px; background-color: #eff6ff; border-radius: 8px;">`
        html += `<h3 style="color: #2563eb; margin-bottom: 10px;">Daily Totals</h3>`
        html += `<div style="display: flex; gap: 20px; font-size: 16px; font-weight: bold;">`
        html += `<span>${data.totals.kcal} calories</span>`
        html += `<span>${data.totals.protein_g}g protein</span>`
        html += `<span>${data.totals.carbs_g}g carbs</span>`
        html += `<span>${data.totals.fat_g}g fat</span>`
        html += `</div>`
        html += `</div>`
      }
      
      // Add groceries
      if (data.groceries && data.groceries.length > 0) {
        html += `<div style="margin-top: 30px;">`
        html += `<h3 style="color: #2563eb; margin-bottom: 15px;">Shopping List</h3>`
        html += `<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">`
        
        data.groceries.forEach((category: any) => {
          html += `<div style="border: 1px solid #e5e7eb; border-radius: 6px; padding: 15px;">`
          html += `<h4 style="color: #374151; margin-bottom: 10px;">${category.category}</h4>`
          html += `<ul style="margin: 0; padding-left: 15px;">`
          category.items.forEach((item: any) => {
            html += `<li style="margin-bottom: 4px;">${item}</li>`
          })
          html += `</ul>`
          html += `</div>`
        })
        
        html += `</div>`
        html += `</div>`
      }
      
      html += `</div>`
      return html
    }

    const { data, error } = await resend.emails.send({
      from: 'WellPlate <noreply@wellplate.eu>',
      to: [email],
      subject: 'Your Personalized Meal Plan is Ready!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2563eb;">Your Meal Plan is Ready!</h1>
          <p>Hi ${name},</p>
          <p>Great news! Your personalized meal plan has been generated and is ready for download!</p>
          
          <div style="margin: 20px 0; padding: 15px; background-color: #f0f9ff; border-radius: 8px;">
            <p style="margin: 0; font-weight: bold; color: #0369a1;">📎 Your meal plan PDF is attached to this email!</p>
          </div>
          
          <h2 style="color: #2563eb; margin-top: 30px;">Your Meal Plan Preview</h2>
          ${generateMealPlanHTML(mealPlanData)}
          
          <p style="margin-top: 30px;">This meal plan includes recipes, nutritional information, and shopping lists tailored specifically for you.</p>
          <p>Enjoy your personalized nutrition journey!</p>
          <p>Best regards,<br>The WellPlate Team</p>
        </div>
      `,
      attachments: [
        {
          filename: 'meal-plan.pdf',
          content: pdfBuffer,
        },
      ],
    })

    if (error) {
      console.error('Resend error:', error)
      throw new Error('Failed to send email')
    }

    return data
  } catch (error) {
    console.error('Email sending error:', error)
    throw error
  }
}