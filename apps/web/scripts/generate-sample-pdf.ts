import { generateMealPlanPDF } from '../src/lib/pdf'
import fs from 'fs'
import path from 'path'

// Sample meal plan data that matches your MealPlanResponse type
const sampleMealPlan = {
  plan: [
    {
      day: 1,
      meals: [
        {
          name: "Protein-Packed Oatmeal Bowl",
          kcal: 420,
          protein_g: 28,
          carbs_g: 45,
          fat_g: 12,
          ingredients: [
            { item: "Rolled oats", qty: "1/2 cup" },
            { item: "Greek yogurt (plain)", qty: "1/2 cup" },
            { item: "Mixed berries", qty: "1/2 cup" },
            { item: "Almond butter", qty: "1 tbsp" },
            { item: "Chia seeds", qty: "1 tsp" }
          ],
          steps: [
            "Cook oats with water or milk until creamy",
            "Let cool slightly, then stir in Greek yogurt",
            "Top with berries, almond butter, and chia seeds",
            "Serve immediately"
          ],
          substitution: "Swap almond butter for peanut butter or sunflower seed butter",
          tip: "Make overnight oats by mixing ingredients the night before"
        },
        {
          name: "Mediterranean Quinoa Bowl",
          kcal: 485,
          protein_g: 22,
          carbs_g: 58,
          fat_g: 18,
          ingredients: [
            { item: "Quinoa", qty: "3/4 cup cooked" },
            { item: "Cherry tomatoes", qty: "1/2 cup" },
            { item: "Cucumber", qty: "1/2 medium" },
            { item: "Feta cheese", qty: "2 tbsp" },
            { item: "Kalamata olives", qty: "6 pieces" },
            { item: "Extra virgin olive oil", qty: "1 tbsp" }
          ],
          steps: [
            "Cook quinoa according to package directions",
            "Chop tomatoes and cucumber into bite-sized pieces",
            "Mix quinoa with vegetables in a large bowl",
            "Crumble feta cheese and add olives",
            "Drizzle with olive oil and season with salt and pepper"
          ],
          substitution: "Replace quinoa with brown rice or farro",
          tip: "Add fresh herbs like parsley or mint for extra flavor"
        },
        {
          name: "Herb-Crusted Salmon",
          kcal: 520,
          protein_g: 38,
          carbs_g: 25,
          fat_g: 28,
          ingredients: [
            { item: "Salmon fillet", qty: "6 oz" },
            { item: "Sweet potato", qty: "1 medium" },
            { item: "Broccoli", qty: "1 cup" },
            { item: "Fresh dill", qty: "2 tbsp" },
            { item: "Lemon", qty: "1/2" },
            { item: "Olive oil", qty: "1 tbsp" }
          ],
          steps: [
            "Preheat oven to 400°F (200°C)",
            "Season salmon with herbs, lemon juice, and olive oil",
            "Roast sweet potato for 20 minutes, then add broccoli",
            "Bake salmon for 12-15 minutes until flaky",
            "Serve salmon over roasted vegetables"
          ],
          substitution: "Replace salmon with cod or halibut",
          tip: "Marinate salmon for 30 minutes for deeper flavor"
        },
        {
          name: "Greek Yogurt Parfait",
          kcal: 180,
          protein_g: 15,
          carbs_g: 20,
          fat_g: 4,
          ingredients: [
            { item: "Greek yogurt (plain)", qty: "1 cup" },
            { item: "Mixed berries", qty: "1/2 cup" },
            { item: "Granola", qty: "2 tbsp" },
            { item: "Honey", qty: "1 tsp" }
          ],
          steps: [
            "Layer half the yogurt in a glass",
            "Add half the berries",
            "Repeat layers",
            "Top with granola and drizzle with honey"
          ],
          substitution: "Use coconut yogurt for dairy-free option",
          tip: "Freeze berries for a refreshing summer treat"
        }
      ],
      daily_nutrition_summary: {
        kcal: 1605,
        protein_g: 103,
        carbs_g: 148,
        fat_g: 62
      }
    },
    {
      day: 2,
      meals: [
        {
          name: "Avocado Toast Deluxe",
          kcal: 380,
          protein_g: 18,
          carbs_g: 35,
          fat_g: 22,
          ingredients: [
            { item: "Whole grain bread", qty: "2 slices" },
            { item: "Avocado", qty: "1 medium" },
            { item: "Eggs", qty: "2 large" },
            { item: "Cherry tomatoes", qty: "1/2 cup" },
            { item: "Everything bagel seasoning", qty: "1 tsp" }
          ],
          steps: [
            "Toast bread until golden",
            "Mash avocado with lemon juice and salt",
            "Poach or fry eggs to your preference",
            "Spread avocado on toast, top with eggs and tomatoes",
            "Sprinkle with seasoning"
          ],
          substitution: "Use sourdough or gluten-free bread",
          tip: "Add hot sauce or sriracha for extra kick"
        },
        {
          name: "Chicken Buddha Bowl",
          kcal: 450,
          protein_g: 35,
          carbs_g: 42,
          fat_g: 16,
          ingredients: [
            { item: "Chicken breast", qty: "4 oz" },
            { item: "Brown rice", qty: "1/2 cup cooked" },
            { item: "Kale", qty: "2 cups" },
            { item: "Carrots", qty: "1 medium" },
            { item: "Tahini dressing", qty: "2 tbsp" }
          ],
          steps: [
            "Season and grill chicken breast",
            "Massage kale with lemon juice",
            "Shred carrots into thin strips",
            "Arrange all ingredients in a bowl",
            "Drizzle with tahini dressing"
          ],
          substitution: "Replace chicken with tofu or tempeh",
          tip: "Massage kale for 2 minutes to make it tender"
        },
        {
          name: "Turkey Meatballs with Zoodles",
          kcal: 480,
          protein_g: 32,
          carbs_g: 28,
          fat_g: 26,
          ingredients: [
            { item: "Ground turkey", qty: "5 oz" },
            { item: "Zucchini", qty: "2 medium" },
            { item: "Marinara sauce", qty: "1/2 cup" },
            { item: "Parmesan cheese", qty: "2 tbsp" },
            { item: "Fresh basil", qty: "2 tbsp" }
          ],
          steps: [
            "Form turkey into meatballs and bake at 375°F",
            "Spiralize zucchini into noodles",
            "Sauté zoodles for 2-3 minutes",
            "Heat marinara sauce",
            "Serve meatballs over zoodles with sauce and cheese"
          ],
          substitution: "Use ground chicken or beef instead of turkey",
          tip: "Don't overcook zoodles - they should be al dente"
        },
        {
          name: "Dark Chocolate Bark",
          kcal: 150,
          protein_g: 3,
          carbs_g: 12,
          fat_g: 10,
          ingredients: [
            { item: "Dark chocolate (70%)", qty: "1 oz" },
            { item: "Almonds", qty: "1 tbsp" },
            { item: "Sea salt", qty: "pinch" }
          ],
          steps: [
            "Melt dark chocolate gently",
            "Pour onto parchment paper",
            "Sprinkle with almonds and sea salt",
            "Refrigerate until firm",
            "Break into pieces"
          ],
          substitution: "Add dried fruit or coconut flakes",
          tip: "Store in refrigerator for best texture"
        }
      ],
      daily_nutrition_summary: {
        kcal: 1460,
        protein_g: 88,
        carbs_g: 117,
        fat_g: 74
      }
    }
  ],
  totals: {
    kcal: 3065,
    protein_g: 191,
    carbs_g: 265,
    fat_g: 136
  },
  groceries: [
    {
      category: "Proteins",
      items: [
        "Salmon fillet (6 oz)",
        "Chicken breast (8 oz)",
        "Ground turkey (5 oz)",
        "Greek yogurt (plain, 32 oz)",
        "Eggs (1 dozen)"
      ]
    },
    {
      category: "Grains & Starches",
      items: [
        "Rolled oats (1 container)",
        "Quinoa (1 bag)",
        "Brown rice (1 bag)",
        "Whole grain bread (1 loaf)"
      ]
    },
    {
      category: "Vegetables",
      items: [
        "Mixed berries (2 containers)",
        "Cherry tomatoes (1 pint)",
        "Cucumber (2 medium)",
        "Sweet potato (2 medium)",
        "Broccoli (1 head)",
        "Kale (1 bunch)",
        "Carrots (1 bag)",
        "Zucchini (3 medium)"
      ]
    },
    {
      category: "Pantry & Condiments",
      items: [
        "Extra virgin olive oil",
        "Almond butter",
        "Chia seeds",
        "Feta cheese",
        "Kalamata olives",
        "Fresh herbs (dill, basil)",
        "Lemons (3 pieces)",
        "Dark chocolate (70%, 1 bar)"
      ]
    }
  ]
}

async function generateSamplePDF() {
  try {
    console.log('Generating sample PDF...')
    
    const pdfBuffer = await generateMealPlanPDF(sampleMealPlan, 'sample@wellplate.com')
    
    const publicDir = path.join(process.cwd(), 'public')
    const outputPath = path.join(publicDir, 'sample-meal-plan.pdf')
    
    fs.writeFileSync(outputPath, pdfBuffer)
    
    console.log(`✅ Sample PDF generated successfully at: ${outputPath}`)
    console.log(`📄 File size: ${(pdfBuffer.length / 1024).toFixed(2)} KB`)
    
  } catch (error) {
    console.error('❌ Error generating sample PDF:', error)
    process.exit(1)
  }
}

generateSamplePDF()
