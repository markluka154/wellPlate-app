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
    },
    {
      day: 3,
      meals: [
        {
          name: "Green Smoothie Bowl",
          kcal: 350,
          protein_g: 20,
          carbs_g: 45,
          fat_g: 12,
          ingredients: [
            { item: "Spinach", qty: "2 cups" },
            { item: "Banana", qty: "1 medium" },
            { item: "Mango", qty: "1/2 cup" },
            { item: "Protein powder", qty: "1 scoop" },
            { item: "Coconut milk", qty: "1/2 cup" }
          ],
          steps: [
            "Blend spinach, banana, and mango until smooth",
            "Add protein powder and coconut milk",
            "Pour into bowl and top with granola",
            "Add fresh fruit and nuts"
          ],
          substitution: "Use almond milk instead of coconut milk",
          tip: "Freeze banana for thicker consistency"
        },
        {
          name: "Quinoa Stuffed Bell Peppers",
          kcal: 420,
          protein_g: 18,
          carbs_g: 55,
          fat_g: 14,
          ingredients: [
            { item: "Bell peppers", qty: "2 large" },
            { item: "Quinoa", qty: "1 cup cooked" },
            { item: "Black beans", qty: "1/2 cup" },
            { item: "Corn", qty: "1/2 cup" },
            { item: "Cheese", qty: "2 tbsp" }
          ],
          steps: [
            "Preheat oven to 375°F",
            "Cut peppers in half and remove seeds",
            "Mix quinoa with beans, corn, and seasonings",
            "Stuff peppers and top with cheese",
            "Bake for 25-30 minutes"
          ],
          substitution: "Use brown rice instead of quinoa",
          tip: "Add salsa for extra flavor"
        },
        {
          name: "Baked Cod with Roasted Vegetables",
          kcal: 380,
          protein_g: 35,
          carbs_g: 30,
          fat_g: 15,
          ingredients: [
            { item: "Cod fillet", qty: "6 oz" },
            { item: "Asparagus", qty: "1 bunch" },
            { item: "Cherry tomatoes", qty: "1 cup" },
            { item: "Garlic", qty: "2 cloves" },
            { item: "Olive oil", qty: "1 tbsp" }
          ],
          steps: [
            "Preheat oven to 400°F",
            "Season cod with herbs and lemon",
            "Toss vegetables with olive oil and garlic",
            "Bake fish and vegetables for 15-20 minutes",
            "Serve with lemon wedges"
          ],
          substitution: "Use tilapia or halibut",
          tip: "Don't overcook fish - it should flake easily"
        },
        {
          name: "Apple Cinnamon Yogurt",
          kcal: 120,
          protein_g: 8,
          carbs_g: 18,
          fat_g: 2,
          ingredients: [
            { item: "Greek yogurt", qty: "1 cup" },
            { item: "Apple", qty: "1 small" },
            { item: "Cinnamon", qty: "1/2 tsp" },
            { item: "Honey", qty: "1 tsp" }
          ],
          steps: [
            "Dice apple into small pieces",
            "Mix yogurt with cinnamon and honey",
            "Top with diced apple",
            "Serve immediately"
          ],
          substitution: "Use pear instead of apple",
          tip: "Add walnuts for extra crunch"
        }
      ],
      daily_nutrition_summary: {
        kcal: 1270,
        protein_g: 81,
        carbs_g: 148,
        fat_g: 43
      }
    },
    {
      day: 4,
      meals: [
        {
          name: "Protein Pancakes",
          kcal: 400,
          protein_g: 25,
          carbs_g: 35,
          fat_g: 15,
          ingredients: [
            { item: "Oat flour", qty: "1/2 cup" },
            { item: "Protein powder", qty: "1 scoop" },
            { item: "Eggs", qty: "2 large" },
            { item: "Banana", qty: "1/2 medium" },
            { item: "Berries", qty: "1/2 cup" }
          ],
          steps: [
            "Blend all ingredients until smooth",
            "Heat pan over medium heat",
            "Pour batter to form pancakes",
            "Cook 2-3 minutes per side",
            "Top with berries and syrup"
          ],
          substitution: "Use almond flour for gluten-free",
          tip: "Let batter rest for 5 minutes before cooking"
        },
        {
          name: "Mediterranean Wrap",
          kcal: 450,
          protein_g: 20,
          carbs_g: 50,
          fat_g: 18,
          ingredients: [
            { item: "Whole wheat tortilla", qty: "1 large" },
            { item: "Hummus", qty: "3 tbsp" },
            { item: "Cucumber", qty: "1/2 medium" },
            { item: "Tomatoes", qty: "1/2 cup" },
            { item: "Feta cheese", qty: "2 tbsp" }
          ],
          steps: [
            "Spread hummus on tortilla",
            "Add sliced vegetables",
            "Sprinkle with feta cheese",
            "Roll tightly and slice in half",
            "Serve with side salad"
          ],
          substitution: "Use gluten-free tortilla",
          tip: "Warm tortilla slightly for easier rolling"
        },
        {
          name: "Lemon Herb Chicken",
          kcal: 420,
          protein_g: 40,
          carbs_g: 25,
          fat_g: 18,
          ingredients: [
            { item: "Chicken thighs", qty: "6 oz" },
            { item: "Lemon", qty: "1 medium" },
            { item: "Fresh herbs", qty: "2 tbsp" },
            { item: "Garlic", qty: "2 cloves" },
            { item: "Olive oil", qty: "1 tbsp" }
          ],
          steps: [
            "Marinate chicken with lemon, herbs, and garlic",
            "Heat pan over medium-high heat",
            "Cook chicken 6-7 minutes per side",
            "Rest for 5 minutes before slicing",
            "Serve with roasted vegetables"
          ],
          substitution: "Use chicken breast for leaner option",
          tip: "Marinate for at least 30 minutes"
        },
        {
          name: "Chocolate Protein Smoothie",
          kcal: 200,
          protein_g: 20,
          carbs_g: 15,
          fat_g: 8,
          ingredients: [
            { item: "Chocolate protein powder", qty: "1 scoop" },
            { item: "Banana", qty: "1/2 medium" },
            { item: "Almond milk", qty: "1 cup" },
            { item: "Cocoa powder", qty: "1 tbsp" },
            { item: "Peanut butter", qty: "1 tbsp" }
          ],
          steps: [
            "Add all ingredients to blender",
            "Blend until smooth and creamy",
            "Add ice if desired",
            "Pour into glass and enjoy"
          ],
          substitution: "Use coconut milk for creamier texture",
          tip: "Freeze banana for thicker smoothie"
        }
      ],
      daily_nutrition_summary: {
        kcal: 1470,
        protein_g: 105,
        carbs_g: 125,
        fat_g: 59
      }
    },
    {
      day: 5,
      meals: [
        {
          name: "Breakfast Burrito",
          kcal: 480,
          protein_g: 28,
          carbs_g: 45,
          fat_g: 22,
          ingredients: [
            { item: "Whole wheat tortilla", qty: "1 large" },
            { item: "Eggs", qty: "3 large" },
            { item: "Black beans", qty: "1/2 cup" },
            { item: "Avocado", qty: "1/2 medium" },
            { item: "Salsa", qty: "2 tbsp" }
          ],
          steps: [
            "Scramble eggs with seasonings",
            "Warm tortilla in pan",
            "Layer beans, eggs, and avocado",
            "Add salsa and roll tightly",
            "Serve with hot sauce"
          ],
          substitution: "Use egg whites for lower calories",
          tip: "Pre-cook beans for easier assembly"
        },
        {
          name: "Asian-Inspired Salad",
          kcal: 380,
          protein_g: 25,
          carbs_g: 35,
          fat_g: 18,
          ingredients: [
            { item: "Mixed greens", qty: "3 cups" },
            { item: "Edamame", qty: "1/2 cup" },
            { item: "Carrots", qty: "1 medium" },
            { item: "Cucumber", qty: "1/2 medium" },
            { item: "Sesame dressing", qty: "2 tbsp" }
          ],
          steps: [
            "Chop vegetables into bite-sized pieces",
            "Steam edamame until tender",
            "Toss greens with vegetables",
            "Add edamame and dressing",
            "Serve immediately"
          ],
          substitution: "Use snap peas instead of edamame",
          tip: "Make dressing ahead for better flavor"
        },
        {
          name: "Baked Salmon with Sweet Potato",
          kcal: 520,
          protein_g: 42,
          carbs_g: 40,
          fat_g: 22,
          ingredients: [
            { item: "Salmon fillet", qty: "6 oz" },
            { item: "Sweet potato", qty: "1 large" },
            { item: "Broccoli", qty: "1 cup" },
            { item: "Dill", qty: "2 tbsp" },
            { item: "Olive oil", qty: "1 tbsp" }
          ],
          steps: [
            "Preheat oven to 400°F",
            "Season salmon with dill and lemon",
            "Roast sweet potato for 30 minutes",
            "Add broccoli and salmon, bake 15 minutes",
            "Serve with lemon wedges"
          ],
          substitution: "Use regular potato instead of sweet",
          tip: "Score sweet potato for faster cooking"
        },
        {
          name: "Trail Mix",
          kcal: 160,
          protein_g: 6,
          carbs_g: 18,
          fat_g: 8,
          ingredients: [
            { item: "Mixed nuts", qty: "2 tbsp" },
            { item: "Dried cranberries", qty: "1 tbsp" },
            { item: "Dark chocolate chips", qty: "1 tsp" }
          ],
          steps: [
            "Mix all ingredients in a bowl",
            "Portion into small containers",
            "Store in cool, dry place",
            "Enjoy as needed"
          ],
          substitution: "Use raisins instead of cranberries",
          tip: "Make large batch for the week"
        }
      ],
      daily_nutrition_summary: {
        kcal: 1540,
        protein_g: 101,
        carbs_g: 138,
        fat_g: 70
      }
    },
    {
      day: 6,
      meals: [
        {
          name: "Overnight Chia Pudding",
          kcal: 350,
          protein_g: 15,
          carbs_g: 45,
          fat_g: 12,
          ingredients: [
            { item: "Chia seeds", qty: "3 tbsp" },
            { item: "Almond milk", qty: "1 cup" },
            { item: "Vanilla extract", qty: "1 tsp" },
            { item: "Honey", qty: "1 tbsp" },
            { item: "Berries", qty: "1/2 cup" }
          ],
          steps: [
            "Mix chia seeds with almond milk",
            "Add vanilla and honey",
            "Refrigerate overnight",
            "Top with fresh berries",
            "Serve chilled"
          ],
          substitution: "Use coconut milk for creamier texture",
          tip: "Stir after 30 minutes to prevent clumping"
        },
        {
          name: "Turkey and Veggie Stir-Fry",
          kcal: 420,
          protein_g: 35,
          carbs_g: 30,
          fat_g: 18,
          ingredients: [
            { item: "Ground turkey", qty: "5 oz" },
            { item: "Bell peppers", qty: "1 medium" },
            { item: "Broccoli", qty: "1 cup" },
            { item: "Soy sauce", qty: "2 tbsp" },
            { item: "Ginger", qty: "1 tsp" }
          ],
          steps: [
            "Heat pan over high heat",
            "Cook turkey until browned",
            "Add vegetables and stir-fry",
            "Add soy sauce and ginger",
            "Serve over brown rice"
          ],
          substitution: "Use chicken breast instead of turkey",
          tip: "Cut vegetables uniformly for even cooking"
        },
        {
          name: "Grilled Shrimp Skewers",
          kcal: 380,
          protein_g: 38,
          carbs_g: 25,
          fat_g: 15,
          ingredients: [
            { item: "Shrimp", qty: "6 oz" },
            { item: "Zucchini", qty: "1 medium" },
            { item: "Cherry tomatoes", qty: "1 cup" },
            { item: "Lemon", qty: "1/2" },
            { item: "Olive oil", qty: "1 tbsp" }
          ],
          steps: [
            "Thread shrimp and vegetables on skewers",
            "Brush with olive oil and lemon",
            "Grill 3-4 minutes per side",
            "Serve with quinoa or rice",
            "Garnish with fresh herbs"
          ],
          substitution: "Use scallops instead of shrimp",
          tip: "Soak wooden skewers in water first"
        },
        {
          name: "Frozen Yogurt Bark",
          kcal: 120,
          protein_g: 8,
          carbs_g: 15,
          fat_g: 4,
          ingredients: [
            { item: "Greek yogurt", qty: "1 cup" },
            { item: "Mixed berries", qty: "1/2 cup" },
            { item: "Honey", qty: "1 tsp" },
            { item: "Granola", qty: "2 tbsp" }
          ],
          steps: [
            "Mix yogurt with honey",
            "Spread on parchment paper",
            "Top with berries and granola",
            "Freeze for 2 hours",
            "Break into pieces"
          ],
          substitution: "Use coconut yogurt for dairy-free",
          tip: "Let soften slightly before eating"
        }
      ],
      daily_nutrition_summary: {
        kcal: 1270,
        protein_g: 96,
        carbs_g: 115,
        fat_g: 49
      }
    },
    {
      day: 7,
      meals: [
        {
          name: "French Toast with Berries",
          kcal: 420,
          protein_g: 20,
          carbs_g: 55,
          fat_g: 12,
          ingredients: [
            { item: "Whole grain bread", qty: "2 slices" },
            { item: "Eggs", qty: "2 large" },
            { item: "Cinnamon", qty: "1 tsp" },
            { item: "Mixed berries", qty: "1 cup" },
            { item: "Maple syrup", qty: "1 tbsp" }
          ],
          steps: [
            "Whisk eggs with cinnamon",
            "Dip bread in egg mixture",
            "Cook in pan until golden",
            "Top with berries and syrup",
            "Serve immediately"
          ],
          substitution: "Use gluten-free bread",
          tip: "Let bread soak for 30 seconds per side"
        },
        {
          name: "Caprese Salad",
          kcal: 320,
          protein_g: 18,
          carbs_g: 20,
          fat_g: 20,
          ingredients: [
            { item: "Fresh mozzarella", qty: "4 oz" },
            { item: "Tomatoes", qty: "2 medium" },
            { item: "Fresh basil", qty: "1/4 cup" },
            { item: "Balsamic vinegar", qty: "2 tbsp" },
            { item: "Olive oil", qty: "1 tbsp" }
          ],
          steps: [
            "Slice mozzarella and tomatoes",
            "Arrange on plate alternating slices",
            "Tear basil leaves over top",
            "Drizzle with vinegar and oil",
            "Season with salt and pepper"
          ],
          substitution: "Use burrata instead of mozzarella",
          tip: "Use ripe, in-season tomatoes"
        },
        {
          name: "Herb-Crusted Pork Tenderloin",
          kcal: 450,
          protein_g: 42,
          carbs_g: 25,
          fat_g: 20,
          ingredients: [
            { item: "Pork tenderloin", qty: "6 oz" },
            { item: "Fresh herbs", qty: "3 tbsp" },
            { item: "Garlic", qty: "2 cloves" },
            { item: "Dijon mustard", qty: "1 tbsp" },
            { item: "Olive oil", qty: "1 tbsp" }
          ],
          steps: [
            "Preheat oven to 425°F",
            "Mix herbs with garlic and mustard",
            "Rub mixture over pork",
            "Roast for 20-25 minutes",
            "Rest 10 minutes before slicing"
          ],
          substitution: "Use chicken breast instead",
          tip: "Use meat thermometer for perfect doneness"
        },
        {
          name: "Chocolate Covered Strawberries",
          kcal: 140,
          protein_g: 3,
          carbs_g: 18,
          fat_g: 7,
          ingredients: [
            { item: "Strawberries", qty: "6 large" },
            { item: "Dark chocolate", qty: "1 oz" },
            { item: "Coconut oil", qty: "1 tsp" }
          ],
          steps: [
            "Melt chocolate with coconut oil",
            "Dip strawberries halfway",
            "Place on parchment paper",
            "Refrigerate until set",
            "Serve chilled"
          ],
          substitution: "Use white chocolate instead",
          tip: "Use room temperature strawberries"
        }
      ],
      daily_nutrition_summary: {
        kcal: 1330,
        protein_g: 83,
        carbs_g: 118,
        fat_g: 59
      }
    }
  ],
  totals: {
    kcal: 9945,
    protein_g: 653,
    carbs_g: 915,
    fat_g: 416
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
