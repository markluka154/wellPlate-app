# Enhanced Python Worker Service

## Enhanced Family Meal Generation

### Main Service Class

```python
# apps/worker/main.py (enhanced)

from typing import List, Dict, Optional
from datetime import datetime, timedelta
import asyncio
from worker.schemas import FamilyProfile, FamilyMember, MealPlan, GenerationOptions

class FamilyMealGenerationService:
    """
    Intelligent meal generation considering:
    - Individual member nutrition needs
    - Adaptive preferences based on history
    - Calendar conflicts and time constraints
    - Budget optimization
    - Leftover incorporation
    - Age-appropriate recipes
    - Seasonal availability
    """
    
    def __init__(self, openai_client):
        self.openai_client = openai_client
        self.preference_engine = PreferenceLearningEngine()
        self.optimization_engine = BudgetOptimizationEngine()
        self.calendar_engine = CalendarConflictEngine()
    
    async def generate_family_meal_plan(
        self,
        family_profile: FamilyProfile,
        start_date: datetime,
        end_date: datetime,
        options: GenerationOptions
    ) -> FamilyMealPlan:
        """
        Generate comprehensive family meal plan with intelligence
        """
        
        # ============================================
        # STEP 1: LOAD FAMILY CONTEXT
        # ============================================
        members = await self.load_family_members(family_profile.id)
        calendar_events = await self.load_calendar_events(
            family_profile.id, start_date, end_date
        )
        current_leftovers = await self.load_leftovers(family_profile.id)
        pantry_inventory = await self.load_pantry(family_profile.id)
        budget_info = await self.load_budget(family_profile.id)
        preference_history = await self.load_preference_history(family_profile.id)
        recent_meals = await self.load_recent_meals(family_profile.id, days=30)
        
        print(f"🎯 Family: {family_profile.name}")
        print(f"👨‍👩‍👧‍👦 Members: {len(members)}")
        print(f"📅 Calendar events: {len(calendar_events)}")
        print(f"🍽️  Leftovers: {len(current_leftovers)}")
        print(f"📦 Pantry items: {len(pantry_inventory)}")
        
        # ============================================
        # STEP 2: ANALYZE CONSTRAINTS
        # ============================================
        time_constraints = self.analyze_calendar_conflicts(
            calendar_events, 
            members,
            start_date,
            end_date
        )
        budget_constraints = self.calculate_budget_limits(
            budget_info, 
            len(members),
            (end_date - start_date).days
        )
        nutrition_requirements = self.calculate_family_nutrition(members)
        phase_adjustments = self.detect_phase_adjustments(members)
        
        print(f"⏰ Time constraints: {len(time_constraints['conflicts'])} conflicts")
        print(f"💰 Budget: ${budget_constraints['weekly_budget']}")
        print(f"🥗 Nutrition targets: {nutrition_requirements}")
        
        # ============================================
        # STEP 3: GENERATE INTELLIGENT MEAL PLAN
        # ============================================
        meal_plan = await self.generate_optimized_plan(
            members=members,
            time_constraints=time_constraints,
            budget_constraints=budget_constraints,
            nutrition_requirements=nutrition_requirements,
            leftovers=current_leftovers,
            pantry=pantry_inventory,
            preference_history=preference_history,
            recent_meals=recent_meals,
            phase_adjustments=phase_adjustments,
            options=options
        )
        
        # ============================================
        # STEP 4: APPLY OPTIMIZATIONS
        # ============================================
        if options.considerPreferences:
            meal_plan = self.apply_preference_learning(meal_plan, preference_history)
        
        if options.considerLeftovers:
            meal_plan = self.incorporate_leftovers(meal_plan, current_leftovers)
        
        if options.considerBudget:
            meal_plan = self.optimize_for_budget(meal_plan, budget_constraints)
        
        if options.considerCalendar:
            meal_plan = self.adjust_for_calendar(meal_plan, time_constraints)
        
        if options.adaptToPhases:
            meal_plan = self.apply_phase_adjustments(meal_plan, phase_adjustments)
        
        # ============================================
        # STEP 5: ADD FAMILY-SPECIFIC FEATURES
        # ============================================
        meal_plan.cooking_assignments = self.assign_cooking_tasks(
            meal_plan, 
            members
        )
        meal_plan.shopping_list = self.generate_smart_shopping_list(
            meal_plan, 
            pantry_inventory
        )
        meal_plan.meal_prep_plan = self.create_meal_prep_schedule(meal_plan)
        meal_plan.leftover_predictions = self.predict_leftovers(meal_plan)
        
        return meal_plan
    
    # ============================================
    # CALENDAR CONFLICT ANALYSIS
    # ============================================
    def analyze_calendar_conflicts(
        self, 
        events: List[CalendarEvent],
        members: List[FamilyMember],
        start_date: datetime,
        end_date: datetime
    ) -> Dict:
        """
        Detect meal time conflicts and suggest adjustments
        """
        conflicts = []
        daily_adjustments = {}
        
        # Default meal times
        meal_times = {
            'breakfast': '07:00',
            'lunch': '12:00',
            'dinner': '18:00'
        }
        
        for event in events:
            # Check each meal type
            for meal_type, default_time in meal_times.items():
                if self.conflicts_with_meal_time(event, meal_type, default_time):
                    conflict = {
                        'date': event.start_time.date(),
                        'event': event.title,
                        'start': event.start_time,
                        'end': event.end_time,
                        'meal_type': meal_type,
                        'impact': self.determine_impact(event, meal_type),
                        'suggestion': self.suggest_meal_adjustment(event, meal_type),
                        'affected_members': event.involved_members
                    }
                    conflicts.append(conflict)
                    
                    # Store daily adjustment
                    day = event.start_time.date()
                    if day not in daily_adjustments:
                        daily_adjustments[day] = {}
                    daily_adjustments[day][meal_type] = conflict['suggestion']
        
        return {
            'conflicts': conflicts,
            'daily_adjustments': daily_adjustments,
            'recommendation': 'Consider meal prep or quick alternatives on conflict days'
        }
    
    def conflicts_with_meal_time(
        self, 
        event: CalendarEvent, 
        meal_type: str, 
        default_time: str
    ) -> bool:
        """Check if event conflicts with meal time"""
        # Parse default time
        hour, minute = map(int, default_time.split(':'))
        
        # Meal prep window: 30 min before meal time
        meal_start = event.start_time.replace(
            hour=hour, 
            minute=minute
        ) - timedelta(minutes=30)
        meal_end = meal_start + timedelta(hours=1.5)  # 1.5h total window
        
        # Check overlap
        return (event.start_time < meal_end and event.end_time > meal_start)
    
    def determine_impact(self, event: CalendarEvent, meal_type: str) -> str:
        """Determine impact severity"""
        duration = (event.end_time - event.start_time).total_seconds() / 60
        
        if duration > 120:
            return 'CRITICAL'  # Event takes most/all of cooking time
        elif duration > 60:
            return 'HIGH'      # Significant impact
        elif duration > 30:
            return 'MEDIUM'    # Noticeable impact
        else:
            return 'LOW'       # Minimal impact
    
    def suggest_meal_adjustment(
        self, 
        event: CalendarEvent, 
        meal_type: str
    ) -> Dict:
        """Suggest meal adjustment based on conflict"""
        available_time = (
            event.start_time - datetime.now()
        ).total_seconds() / 60
        
        if available_time < 15:
            # No time at all
            return {
                'type': 'emergency-mode',
                'suggestions': ['pantry-only', 'quick-delivery', 'last-resort'],
                'priority': 'IMMEDIATE'
            }
        elif available_time < 30:
            # Very limited time
            return {
                'type': 'quick-meal',
                'suggestions': ['simple-pasta', 'sandwiches', 'scrambled-eggs'],
                'max_time': 30,
                'priority': 'HIGH'
            }
        elif available_time < 60:
            # Limited time
            return {
                'type': 'crockpot',
                'suggestions': ['prep-ahead', 'set-it-and-forget-it'],
                'prep_before_event': True,
                'priority': 'MEDIUM'
            }
        else:
            # Enough time, just need to plan
            return {
                'type': 'normal-meal',
                'suggestions': ['slightly-simplified', 'prep-in-advance'],
                'priority': 'LOW'
            }
    
    # ============================================
    # PREFERENCE LEARNING
    # ============================================
    def apply_preference_learning(
        self, 
        meal_plan: FamilyMealPlan,
        history: List[MealReaction]
    ) -> FamilyMealPlan:
        """
        Use ML to adjust meals based on past reactions
        """
        for day_plan in meal_plan.days:
            for meal in day_plan.meals:
                # Check if similar meals have been served before
                similar_meals = self.find_similar_meals(meal, history)
                
                if similar_meals:
                    avg_reaction = self.calculate_average_reaction(similar_meals)
                    
                    if avg_reaction < 0.6:  # Low acceptance rate
                        # Find alternatives
                        alternatives = self.find_better_alternatives(
                            meal, 
                            history,
                            meal_plan.family_profile
                        )
                        
                        if alternatives:
                            meal.alternative_suggestion = {
                                'current_acceptance': avg_reaction,
                                'alternatives': alternatives,
                                'reason': f'Low acceptance rate ({avg_reaction:.1%})'
                            }
        
        return meal_plan
    
    def find_similar_meals(self, meal: Meal, history: List[MealReaction]) -> List[MealReaction]:
        """Find meals with similar characteristics"""
        similar = []
        
        for reaction in history:
            similarity_score = self.calculate_similarity(meal, reaction)
            
            if similarity_score > 0.7:  # 70% similar
                similar.append(reaction)
        
        return similar
    
    def calculate_similarity(self, meal: Meal, reaction: MealReaction) -> float:
        """Calculate similarity score between two meals"""
        score = 0.0
        
        # Recipe name similarity
        if meal.name.lower() == reaction.meal_name.lower():
            score += 0.5
        
        # Ingredient similarity
        meal_ingredients = set(meal.ingredients)
        reaction_ingredients = set(reaction.meal_ingredients)
        
        if reaction_ingredients:
            overlap = len(meal_ingredients & reaction_ingredients)
            ingredient_score = overlap / len(reaction_ingredients)
            score += ingredient_score * 0.5
        
        return score
    
    def calculate_average_reaction(self, reactions: List[MealReaction]) -> float:
        """Calculate average acceptance rate"""
        if not reactions:
            return 0.5  # Neutral if no data
        
        reaction_scores = []
        for reaction in reactions:
            if reaction.reaction == 'LOVED':
                reaction_scores.append(1.0)
            elif reaction.reaction == 'LIKED':
                reaction_scores.append(0.8)
            elif reaction.reaction == 'NEUTRAL':
                reaction_scores.append(0.5)
            elif reaction.reaction == 'DISLIKED':
                reaction_scores.append(0.2)
            else:  # REFUSED
                reaction_scores.append(0.0)
        
        return sum(reaction_scores) / len(reaction_scores)
    
    # ============================================
    # COOKING TASK ASSIGNMENT
    # ============================================
    def assign_cooking_tasks(
        self,
        meal_plan: FamilyMealPlan,
        members: List[FamilyMember]
    ) -> List[CookingAssignment]:
        """
        Intelligently assign cooking tasks based on:
        - Member skill level
        - Age appropriateness
        - Task difficulty
        - Time availability
        """
        assignments = []
        
        for day_plan in meal_plan.days:
            for meal in day_plan.meals:
                tasks = self.break_down_meal_into_tasks(meal)
                
                for task in tasks:
                    # Find best member for this task
                    best_member = self.find_best_cook_for_task(
                        task,
                        members,
                        consider_skill=True,
                        consider_safety=True,
                        consider_availability=True
                    )
                    
                    assignments.append({
                        'meal': meal.name,
                        'date': day_plan.date,
                        'task': task,
                        'assigned_to': best_member.id,
                        'assigned_to_name': best_member.name,
                        'difficulty': task.difficulty,
                        'estimated_time': task.time_required,
                        'safety_level': task.safety_level,
                        'can_be_parallelized': task.parallelizable
                    })
        
        return assignments
    
    def break_down_meal_into_tasks(self, meal: Meal) -> List[CookingTask]:
        """Break down meal into individual tasks"""
        tasks = []
        
        # Prep tasks
        for ingredient in meal.ingredients:
            tasks.append({
                'type': 'prep',
                'description': f'Prepare {ingredient}',
                'difficulty': self.determine_prep_difficulty(ingredient),
                'time_required': 10,
                'safety_level': 'safe',
                'parallelizable': True
            })
        
        # Cooking tasks
        for step in meal.steps:
            tasks.append({
                'type': 'cook',
                'description': step,
                'difficulty': self.determine_step_difficulty(step),
                'time_required': 15,
                'safety_level': 'supervised',
                'parallelizable': False
            })
        
        return tasks
    
    def find_best_cook_for_task(
        self,
        task: CookingTask,
        members: List[FamilyMember],
        consider_skill: bool = True,
        consider_safety: bool = True,
        consider_availability: bool = True
    ) -> FamilyMember:
        """Find best family member for cooking task"""
        
        # Filter by age/safety if needed
        if task.safety_level == 'adult-only':
            candidates = [m for m in members if m.role == 'ADULT']
        elif task.safety_level == 'supervised':
            candidates = [m for m in members if m.canCookAlone or m.role == 'ADULT']
        else:
            candidates = members
        
        if not candidates:
            candidates = members  # Fallback
        
        # Score candidates
        scored = []
        for member in candidates:
            score = 0
            
            if consider_skill:
                # Higher skill = higher score
                skill_match = min(member.cookingSkillLevel, task.difficulty) / max(
                    member.cookingSkillLevel, task.difficulty
                )
                score += skill_match * 0.4
            
            if consider_safety:
                # Prioritize adults for unsafe tasks
                if task.safety_level != 'safe' and member.role == 'ADULT':
                    score += 0.3
            
            if task.safety_level == 'safe' and member.cookingSkillLevel >= task.difficulty:
                # Kids can do safe tasks at their skill level
                score += 0.2
            
            # Prefer members who like this type of task
            if task.tags and any(tag in member.favoriteTasks for tag in task.tags):
                score += 0.1
            
            scored.append((member, score))
        
        # Return best candidate
        scored.sort(key=lambda x: x[1], reverse=True)
        return scored[0][0]
    
    # ============================================
    # BUDGET OPTIMIZATION
    # ============================================
    def optimize_for_budget(
        self,
        meal_plan: FamilyMealPlan,
        budget_constraints: Dict
    ) -> FamilyMealPlan:
        """Optimize meal plan to stay within budget"""
        
        total_cost = sum(day.total_cost for day in meal_plan.days)
        budget_limit = budget_constraints['weekly_budget']
        
        if total_cost <= budget_limit:
            return meal_plan  # Already within budget
        
        # Find expensive meals
        expensive_meals = self.find_expensive_meals(meal_plan)
        
        # Find budget-friendly alternatives
        for meal_ref in expensive_meals:
            alternatives = self.find_budget_alternatives(
                meal_ref, 
                budget_limit,
                total_cost
            )
            
            if alternatives:
                meal_ref.alternatives = alternatives
        
        return meal_plan
    
    def incorporate_leftovers(
        self,
        meal_plan: FamilyMealPlan,
        leftovers: List[Leftover]
    ) -> FamilyMealPlan:
        """Incorporate existing leftovers into meal plan"""
        
        for leftover in leftovers:
            # Find meals that could use this leftover
            suitable_meals = self.find_meals_for_leftover(leftover)
            
            if suitable_meals:
                # Replace or supplement meal with leftover
                for meal_ref in suitable_meals:
                    meal_ref.leftover_incorporation = {
                        'leftover_id': leftover.id,
                        'leftover_name': leftover.original_meal_name,
                        'how_to_use': self.suggest_leftover_use(leftover),
                        'reduces_cost': leftover.estimated_cost,
                        'saves_time': True
                    }
        
        return meal_plan
    
    # ============================================
    # PHASE-BASED ADJUSTMENTS
    # ============================================
    def apply_phase_adjustments(
        self,
        meal_plan: FamilyMealPlan,
        phase_adjustments: Dict
    ) -> FamilyMealPlan:
        """Adjust nutrition based on member phases"""
        
        for day_plan in meal_plan.days:
            for meal in day_plan.meals:
                for member_id, member_adjustment in phase_adjustments.items():
                    if member_id in meal.portions:
                        # Adjust portion size
                        adjusted_nutrition = self.adjust_nutrition(
                            meal.nutrition,
                            member_adjustment
                        )
                        meal.portions[member_id].nutrition = adjusted_nutrition
        
        return meal_plan
    
    def adjust_nutrition(
        self, 
        base_nutrition: NutritionData,
        adjustment: PhaseAdjustment
    ) -> NutritionData:
        """Adjust nutrition based on phase"""
        
        return {
            'calories': int(base_nutrition['calories'] * adjustment.calorie_multiplier),
            'protein': int(base_nutrition['protein'] * adjustment.protein_adjustment),
            'carbs': int(base_nutrition['carbs'] * adjustment.carb_adjustment),
            'fats': int(base_nutrition['fats'] * adjustment.fat_adjustment)
        }
```

## Supporting Classes

```python
class PreferenceLearningEngine:
    """Machine learning for food preferences"""
    
    def update_acceptance_rate(self, food_item: str, reaction: Reaction) -> float:
        """Update acceptance rate based on reaction"""
        # Implementation
    
    def detect_patterns(self, history: List[MealReaction]) -> List[Pattern]:
        """Detect eating patterns"""
        # Implementation
    
    def suggest_gateway_foods(self, member_id: str) -> List[str]:
        """Suggest foods that can introduce new items"""
        # Implementation

class BudgetOptimizationEngine:
    """Optimize costs while maintaining nutrition"""
    
    def find_cheaper_alternatives(self, meal: Meal, budget: float) -> List[Meal]:
        """Find cost-effective alternatives"""
        # Implementation
    
    def identify_bulk_opportunities(self, meal_plan: FamilyMealPlan) -> List[BulkOpportunity]:
        """Identify bulk buying opportunities"""
        # Implementation

class CalendarConflictEngine:
    """Detect and resolve calendar conflicts"""
    
    def detect_conflicts(self, events: List[CalendarEvent], meals: List[Meal]) -> List[Conflict]:
        """Detect scheduling conflicts"""
        # Implementation
    
    def suggest_resolutions(self, conflict: Conflict) -> List[Solution]:
        """Suggest conflict resolutions"""
        # Implementation
```


