# Budget Optimization Algorithm

## Intelligent Cost Optimization

```python
# apps/worker/ml/budget_optimizer.py

from typing import List, Dict, Optional
import numpy as np
from scipy.optimize import linprog
from worker.schemas import FamilyMealPlan, Meal, MealSwap, BulkOpportunity

class BudgetOptimizer:
    """
    Optimize meal plans for cost while maintaining nutrition
    
    Uses linear programming to find optimal meal combinations
    that minimize cost while meeting all nutritional requirements
    """
    
    def __init__(self):
        self.ingredient_prices = self.load_ingredient_prices()
        self.store_data = self.load_store_data()
        self.bulk_savings = self.load_bulk_savings()
    
    # ============================================
    # MEAL PLAN OPTIMIZATION
    # ============================================
    async def optimize_meal_plan(
        self,
        meal_plan: FamilyMealPlan,
        budget_constraint: float,
        nutrition_requirements: Dict,
        family_size: int
    ) -> Dict:
        """
        Use linear programming to optimize meal plan within budget
        
        Args:
            meal_plan: Current meal plan
            budget_constraint: Maximum weekly budget ($)
            nutrition_requirements: Minimum nutrition targets
            family_size: Number of family members
        
        Returns:
            Optimized meal plan with cost analysis
        """
        
        print(f"💰 Optimizing meal plan for ${budget_constraint:.2f} budget")
        print(f"👨‍👩‍👧‍👦 Family size: {family_size}")
        
        # Calculate current costs
        current_cost = self.calculate_total_cost(meal_plan, family_size)
        print(f"📊 Current cost: ${current_cost:.2f}")
        
        # If within budget, return as-is
        if current_cost <= budget_constraint:
            print("✅ Already within budget")
            return {
                'optimized': False,
                'meal_plan': meal_plan,
                'cost': current_cost,
                'savings': 0
            }
        
        # Define optimization problem
        problem = self.create_optimization_problem(
            meals=meal_plan.meals,
            budget=budget_constraint,
            nutrition=nutrition_requirements,
            family_size=family_size
        )
        
        # Solve
        solution = self.solve(problem)
        
        if solution is None:
            print("⚠️ No solution found - suggesting reductions")
            return self.suggest_cost_reductions(meal_plan, budget_constraint)
        
        # Generate optimized plan
        optimized_plan = self.create_plan_from_solution(solution, meal_plan)
        
        # Calculate savings
        optimized_cost = solution.get('total_cost', 0)
        savings = current_cost - optimized_cost
        
        print(f"✅ Optimized cost: ${optimized_cost:.2f}")
        print(f"💰 Savings: ${savings:.2f} ({savings/current_cost*100:.1f}%)")
        
        return {
            'optimized': True,
            'meal_plan': optimized_plan,
            'cost': optimized_cost,
            'savings': savings,
            'swaps': solution.get('swaps', []),
            'bulk_opportunities': solution.get('bulk_opportunities', [])
        }
    
    def create_optimization_problem(
        self,
        meals: List[Meal],
        budget: float,
        nutrition: Dict,
        family_size: int
    ) -> Dict:
        """Create linear programming problem"""
        
        # Define variables: x_i = whether to include meal i (0 or 1)
        n_meals = len(meals)
        
        # Objective: Minimize total cost
        c = np.array([self.get_meal_cost(meal, family_size) for meal in meals])
        
        # Constraints matrix
        A = []
        b = []
        
        # 1. Budget constraint: sum(c_i * x_i) <= budget
        A.append(c)
        b.append(budget)
        
        # 2. Nutrition constraints: sum(nutrient_i * x_i) >= minimum
        for nutrient, min_value in nutrition.items():
            nutrients = np.array([
                self.get_meal_nutrient(meal, nutrient) * family_size
                for meal in meals
            ])
            A.append(-nutrients)  # Negative because it's >=
            b.append(-min_value * n_meals)  # Minimum for entire week
        
        # 3. Binary constraints: x_i ∈ {0, 1}
        bounds = [(0, 1) for _ in range(n_meals)]
        
        return {
            'c': c,
            'A_ub': A,
            'b_ub': b,
            'bounds': bounds,
            'method': 'highs'
        }
    
    def solve(self, problem: Dict) -> Optional[Dict]:
        """Solve linear programming problem"""
        
        try:
            result = linprog(
                problem['c'],
                A_ub=problem['A_ub'],
                b_ub=problem['b_ub'],
                bounds=problem['bounds'],
                method=problem['method']
            )
            
            if result.success:
                # Convert solution to integer (meal selection)
                selected = result.x > 0.5
                return {
                    'selected_meals': selected,
                    'total_cost': result.fun,
                    'x': result.x
                }
            else:
                return None
                
        except Exception as e:
            print(f"❌ Optimization failed: {e}")
            return None
    
    # ============================================
    # MEAL SWAPPING
    # ============================================
    async def suggest_cost_effective_swaps(
        self,
        meal: Meal,
        max_price: float,
        nutrition_targets: Dict,
        family_size: int
    ) -> List[MealSwap]:
        """
        Find cheaper alternatives with similar nutrition
        
        Args:
            meal: Current meal to replace
            max_price: Maximum acceptable price for swap
            nutrition_targets: Required nutrition profile
            family_size: Family size for scaling
        
        Returns:
            List of swap suggestions sorted by cost-effectiveness
        """
        
        print(f"🔄 Finding swaps for: {meal.name}")
        
        # Get meal cost
        current_cost = self.get_meal_cost(meal, family_size)
        
        # Find similar meals
        alternatives = await self.find_similar_meals(meal, nutrition_targets)
        
        # Filter by cost and nutrition
        cost_effective = []
        for alt in alternatives:
            alt_cost = self.get_meal_cost(alt, family_size)
            
            # Check cost
            if alt_cost > max_price:
                continue
            
            # Check nutrition similarity
            similarity = self.nutrition_similarity(meal, alt)
            
            if similarity >= 0.8:  # 80% similar nutrition
                savings = current_cost - alt_cost
                cost_effective.append({
                    'meal': alt,
                    'current_meal': meal,
                    'cost': alt_cost,
                    'savings': savings,
                    'savings_percent': (savings / current_cost) * 100,
                    'nutrition_similarity': similarity,
                    'nutrition_difference': self.compare_nutrition(meal, alt)
                })
        
        # Sort by savings
        cost_effective.sort(key=lambda x: x['savings'], reverse=True)
        
        print(f"✅ Found {len(cost_effective)} cost-effective swaps")
        
        return cost_effective[:5]  # Top 5
    
    def nutrition_similarity(self, meal1: Meal, meal2: Meal) -> float:
        """Calculate nutrition similarity (0-1)"""
        
        # Compare each macronutrient
        calorie_sim = 1 - abs(meal1.nutrition.calories - meal2.nutrition.calories) / max(
            meal1.nutrition.calories, meal2.nutrition.calories, 1
        )
        
        protein_sim = 1 - abs(meal1.nutrition.protein - meal2.nutrition.protein) / max(
            meal1.nutrition.protein, meal2.nutrition.protein, 1
        )
        
        carb_sim = 1 - abs(meal1.nutrition.carbs - meal2.nutrition.carbs) / max(
            meal1.nutrition.carbs, meal2.nutrition.carbs, 1
        )
        
        fat_sim = 1 - abs(meal1.nutrition.fat - meal2.nutrition.fat) / max(
            meal1.nutrition.fat, meal2.nutrition.fat, 1
        )
        
        # Weighted average (calories most important)
        similarity = (
            calorie_sim * 0.4 +
            protein_sim * 0.25 +
            carb_sim * 0.2 +
            fat_sim * 0.15
        )
        
        return similarity
    
    # ============================================
    # BULK BUYING OPPORTUNITIES
    # ============================================
    async def identify_bulk_opportunities(
        self,
        meal_plan: FamilyMealPlan
    ) -> List[BulkOpportunity]:
        """
        Identify ingredients that appear multiple times and suggest bulk buying
        
        Scans meal plan for ingredients that appear 3+ times,
        calculates potential savings from bulk buying
        """
        
        print("🔍 Analyzing bulk buying opportunities...")
        
        # Count ingredient frequency
        ingredient_frequency = self.analyze_ingredient_frequency(meal_plan)
        
        opportunities = []
        
        for ingredient, count in ingredient_frequency.items():
            if count < 3:  # Only suggest for 3+ uses
                continue
            
            # Get bulk option
            bulk_option = await self.get_bulk_option(ingredient)
            
            if bulk_option and bulk_option.unit_price_savings > 0:
                # Calculate savings
                total_savings = bulk_option.unit_price_savings * count
                
                opportunities.append({
                    'ingredient': ingredient,
                    'current_price': bulk_option.regular_price,
                    'bulk_price': bulk_option.bulk_price,
                    'frequency': count,
                    'bulk_quantity': bulk_option.bulk_quantity,
                    'total_savings': total_savings,
                    'savings_per_unit': bulk_option.unit_price_savings,
                    'recommendation': f"Buy {bulk_option.bulk_quantity}{bulk_option.unit} of {ingredient} and save ${total_savings:.2f} ({bulk_option.unit_price_savings:.2f} per unit × {count} uses)",
                    'store_suggestion': bulk_option.preferred_store,
                    'storage_note': bulk_option.storage_requirements
                })
        
        # Sort by total savings
        opportunities.sort(key=lambda x: x['total_savings'], reverse=True)
        
        print(f"✅ Found {len(opportunities)} bulk opportunities")
        
        return opportunities[:10]  # Top 10
    
    def analyze_ingredient_frequency(
        self,
        meal_plan: FamilyMealPlan
    ) -> Dict[str, int]:
        """Count how many times each ingredient appears"""
        
        frequency = {}
        
        for day_plan in meal_plan.days:
            for meal in day_plan.meals:
                for ingredient in meal.ingredients:
                    frequency[ingredient.item] = frequency.get(
                        ingredient.item, 0
                    ) + 1
        
        return frequency
    
    async def get_bulk_option(self, ingredient: str) -> Optional[BulkOption]:
        """Get bulk buying option for ingredient"""
        
        # Query price database
        regular_data = await self.ingredient_prices.get(ingredient)
        bulk_data = await self.bulk_savings.get(ingredient)
        
        if not regular_data or not bulk_data:
            return None
        
        # Calculate potential savings
        regular_price = regular_data['unit_price']
        bulk_price = bulk_data['bulk_price'] / bulk_data['bulk_quantity']
        
        if bulk_price >= regular_price:
            return None  # No savings
        
        return {
            'ingredient': ingredient,
            'regular_price': regular_price,
            'bulk_price': bulk_data['bulk_price'],
            'bulk_quantity': bulk_data['bulk_quantity'],
            'unit': regular_data['unit'],
            'unit_price_savings': regular_price - bulk_price,
            'preferred_store': bulk_data['store'],
            'storage_requirements': bulk_data.get('storage', 'normal')
        }
    
    # ============================================
    # COST CALCULATION
    # ============================================
    def calculate_total_cost(
        self,
        meal_plan: FamilyMealPlan,
        family_size: int
    ) -> float:
        """Calculate total cost of meal plan"""
        
        total = 0
        
        for day_plan in meal_plan.days:
            for meal in day_plan.meals:
                meal_cost = self.get_meal_cost(meal, family_size)
                total += meal_cost
        
        return total
    
    def get_meal_cost(self, meal: Meal, family_size: int) -> float:
        """Get estimated cost of meal"""
        
        total = 0
        
        for ingredient in meal.ingredients:
            # Get ingredient price
            price = self.ingredient_prices.get(ingredient.item)
            
            if price:
                # Calculate quantity needed for family
                qty_for_family = self.scale_quantity(
                    ingredient.qty,
                    family_size
                )
                
                total += price * qty_for_family
        
        return total
    
    def get_meal_nutrient(self, meal: Meal, nutrient: str) -> float:
        """Get specific nutrient value from meal"""
        
        nutrient_map = {
            'calories': meal.nutrition.calories,
            'protein': meal.nutrition.protein,
            'carbs': meal.nutrition.carbs,
            'fat': meal.nutrition.fat,
            'fiber': meal.nutrition.fiber,
            'vitamin_c': meal.nutrition.vitamin_c,
            'iron': meal.nutrition.iron
        }
        
        return nutrient_map.get(nutrient, 0)
    
    # ============================================
    # HELPERS
    # ============================================
    def scale_quantity(self, qty: str, family_size: int) -> float:
        """Scale ingredient quantity for family size"""
        
        # Parse quantity (e.g., "200g", "2 cups", "1 can")
        import re
        
        match = re.match(r'^(\d+\.?\d*)\s*(\w+)$', qty)
        
        if match:
            value = float(match.group(1))
            unit = match.group(2)
            
            # Scale for family
            scaled_value = value * family_size
            
            return f"{scaled_value}{unit}"
        
        return qty
    
    def load_ingredient_prices(self) -> Dict:
        """Load ingredient price database"""
        # In production, fetch from database or API
        return {}
    
    def load_store_data(self) -> Dict:
        """Load store data for price comparison"""
        # In production, fetch from store APIs
        return {}
    
    def load_bulk_savings(self) -> Dict:
        """Load bulk buying savings data"""
        # In production, fetch from database
        return {}
```

## Data Models

```python
from dataclasses import dataclass
from typing import List, Optional

@dataclass
class MealSwap:
    meal: Meal
    alternative_meal: Meal
    cost_difference: float
    savings_percent: float
    nutrition_similarity: float
    reason: str

@dataclass
class BulkOpportunity:
    ingredient: str
    frequency: int
    bulk_quantity: str
    total_savings: float
    unit_savings: float
    recommendation: str
    store: Optional[str]
    storage_note: Optional[str]

@dataclass
class OptimizedMealPlan:
    meal_plan: FamilyMealPlan
    original_cost: float
    optimized_cost: float
    savings: float
    swaps: List[MealSwap]
    bulk_opportunities: List[BulkOpportunity]
    nutrition_met: bool
```

