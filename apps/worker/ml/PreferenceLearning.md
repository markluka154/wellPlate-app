# Preference Learning Algorithm

## ML Model for Family Food Preferences

```python
# apps/worker/ml/preference_learning.py

from typing import List, Dict, Optional
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler
from worker.schemas import Meal, FamilyMember, MealReaction, GatewayFoodSuggestion

class PreferenceLearningModel:
    """
    Machine learning model that learns family food preferences over time
    
    Uses ensemble methods to predict meal success probability based on:
    - Historical reactions
    - Ingredient preferences
    - Preparation styles
    - Contextual factors (time of day, season, member phase)
    - Eating patterns
    """
    
    def __init__(self):
        self.model = self.load_or_create_model()
        self.scaler = StandardScaler()
        self.feature_importance = {}
        
        # Model parameters
        self.n_estimators = 100
        self.max_depth = 20
        self.min_samples_split = 5
        self.min_samples_leaf = 2
    
    # ============================================
    # MODEL INITIALIZATION
    # ============================================
    def load_or_create_model(self):
        """Load existing model or create new one"""
        try:
            import pickle
            with open('models/preference_model.pkl', 'rb') as f:
                return pickle.load(f)
        except FileNotFoundError:
            return self.create_new_model()
    
    def create_new_model(self):
        """Create new Random Forest model"""
        return RandomForestRegressor(
            n_estimators=self.n_estimators,
            max_depth=self.max_depth,
            min_samples_split=self.min_samples_split,
            min_samples_leaf=self.min_samples_leaf,
            random_state=42,
            n_jobs=-1
        )
    
    # ============================================
    # PREDICTION
    # ============================================
    async def predict_meal_success(
        self,
        meal: Meal,
        member: FamilyMember,
        context: Dict
    ) -> float:
        """
        Predict likelihood (0-1) that a family member will enjoy this meal
        
        Args:
            meal: Meal to predict
            member: Family member to predict for
            context: Additional context (time of day, weather, etc.)
        
        Returns:
            Probability score (0.0 to 1.0)
            
        Considers:
        - Past reactions to similar meals
        - Food ingredients and preparation style
        - Time of day / day of week
        - Member's current phase (growth spurt, sports season)
        - Weather / season
        - Recent meal history (variety fatigue)
        """
        
        # Extract features
        features = self.extract_features(meal, member, context)
        
        # Scale features
        features_scaled = self.scaler.transform([features])
        
        # Predict
        prediction = self.model.predict(features_scaled)[0]
        
        # Ensure 0-1 range
        prediction = max(0.0, min(1.0, prediction))
        
        print(f"🎯 Predicted success probability for {member.name}: {prediction:.2%}")
        print(f"   Meal: {meal.name}")
        print(f"   Key factors: {self.explain_prediction(features)}")
        
        return prediction
    
    # ============================================
    # FEATURE EXTRACTION
    # ============================================
    def extract_features(
        self,
        meal: Meal,
        member: FamilyMember,
        context: Dict
    ) -> np.ndarray:
        """
        Extract relevant features for ML model
        
        Feature categories:
        1. Meal characteristics (ingredients, cuisine type, cooking method)
        2. Member preferences (past reactions to similar foods)
        3. Contextual (time of day, day of week, season)
        4. Member state (age, phase, health goals)
        5. Recent history (variety, repetition)
        """
        
        features = []
        
        # 1. MEAL CHARACTERISTICS
        features.extend(self.extract_meal_features(meal))
        
        # 2. MEMBER PREFERENCES
        features.extend(self.extract_preference_features(member, meal))
        
        # 3. CONTEXTUAL
        features.extend(self.extract_contextual_features(context))
        
        # 4. MEMBER STATE
        features.extend(self.extract_member_state_features(member))
        
        # 5. RECENT HISTORY
        features.extend(self.extract_recent_history_features(member, meal))
        
        return np.array(features)
    
    def extract_meal_features(self, meal: Meal) -> List[float]:
        """Extract meal-specific features"""
        features = []
        
        # Cuisine types (one-hot encoded)
        cuisine_types = ['italian', 'mexican', 'asian', 'american', 'mediterranean', 'indian']
        for cuisine in cuisine_types:
            features.append(1.0 if cuisine in meal.cuisine else 0.0)
        
        # Cooking methods (one-hot encoded)
        cooking_methods = ['grilled', 'baked', 'fried', 'steamed', 'roasted', 'raw']
        for method in cooking_methods:
            features.append(1.0 if method in meal.cooking_methods else 0.0)
        
        # Nutritional profile (normalized)
        features.append(meal.nutrition.calories / 1000)  # 0-2 range
        features.append(meal.nutrition.protein_g / 100)  # 0-2 range
        features.append(meal.nutrition.carbs_g / 100)
        features.append(meal.nutrition.fat_g / 100)
        
        # Complexity (preparation time, difficulty)
        features.append(meal.prep_time / 120)  # 0-2 hour range
        features.append(meal.difficulty / 10)  # 0-1 range
        
        return features
    
    def extract_preference_features(
        self,
        member: FamilyMember,
        meal: Meal
    ) -> List[float]:
        """Extract member preference features"""
        features = []
        
        # Average acceptance rate for similar ingredients
        ingredient_scores = []
        for ingredient in meal.ingredients:
            # Find preference for this ingredient
            preference = self.find_preference(member, ingredient)
            if preference:
                ingredient_scores.append(preference.acceptance_rate)
        
        features.append(np.mean(ingredient_scores) if ingredient_scores else 0.5)
        
        # Average acceptance for similar meals
        similar_meals_score = self.calculate_similar_meals_score(member, meal)
        features.append(similar_meals_score)
        
        # Recent trend (last 10 meals)
        recent_trend = self.calculate_recent_trend(member, meal)
        features.append(recent_trend)
        
        # Refused foods (negative score)
        refused_score = self.calculate_refused_score(member, meal)
        features.append(-refused_score)  # Negative because it's bad
        
        return features
    
    def extract_contextual_features(self, context: Dict) -> List[float]:
        """Extract contextual features"""
        features = []
        
        # Time of day
        hour = context.get('hour', 12)
        features.append(hour / 24)  # 0-1
        
        # Day of week (cyclical encoding)
        day_of_week = context.get('day_of_week', 0)
        features.append(np.sin(2 * np.pi * day_of_week / 7))
        features.append(np.cos(2 * np.pi * day_of_week / 7))
        
        # Season (cyclical encoding)
        season = context.get('season', 'spring')
        season_val = {'spring': 0, 'summer': 1, 'fall': 2, 'winter': 3}[season]
        features.append(np.sin(2 * np.pi * season_val / 4))
        features.append(np.cos(2 * np.pi * season_val / 4))
        
        # Weather (if available)
        weather_score = context.get('weather_score', 0.5)  # 0-1
        features.append(weather_score)
        
        # Special occasion
        features.append(1.0 if context.get('special_occasion', False) else 0.0)
        
        return features
    
    def extract_member_state_features(self, member: FamilyMember) -> List[float]:
        """Extract member state features"""
        features = []
        
        # Age (normalized)
        features.append(member.age / 100)  # 0-1
        
        # Phase impact
        phase_impact = {
            'NORMAL': 1.0,
            'GROWTH_SPURT': 1.2,  # More hungry
            'SPORTS_SEASON': 1.15,  # Need more calories
            'EXAM_SEASON': 0.9  # Stressed, less appetite
        }
        features.append(phase_impact.get(member.currentPhase, 1.0))
        
        # Activity level (0-1)
        activity_levels = {
            'SEDENTARY': 0.2,
            'LIGHT': 0.4,
            'MODERATE': 0.6,
            'ACTIVE': 0.8,
            'VERY_ACTIVE': 1.0
        }
        features.append(activity_levels.get(member.activityLevel, 0.5))
        
        # Cooking skill level (0-1)
        features.append(member.cookingSkillLevel / 10)
        
        return features
    
    def extract_recent_history_features(
        self,
        member: FamilyMember,
        meal: Meal
    ) -> List[float]:
        """Extract recent history features"""
        features = []
        
        # Days since similar meal
        similar_meals_days = self.get_days_since_similar_meal(member, meal)
        features.append(min(similar_meals_days / 7, 1.0))  # Max 1 week
        
        # Variety score (0-1)
        variety_score = self.calculate_variety_score(member)
        features.append(variety_score)
        
        # Repetition fatigue
        repetition_fatigue = self.calculate_repetition_fatigue(member, meal)
        features.append(-repetition_fatigue)  # Negative because it's bad
        
        return features
    
    # ============================================
    # LEARNING
    # ============================================
    async def learn_from_reaction(
        self,
        meal: Meal,
        member: FamilyMember,
        reaction: MealReaction
    ):
        """
        Update model based on actual meal reaction
        
        Called after a meal is consumed and rated
        """
        # Extract features
        features = self.extract_features(meal, member, {})
        
        # Extract target value (converted to 0-1)
        target = self.reaction_to_score(reaction)
        
        print(f"📚 Learning from {member.name}'s reaction to {meal.name}")
        print(f"   Reaction: {reaction.reaction} ({target:.2%})")
        
        # Retrain model (online learning)
        X = np.array([features])
        y = np.array([target])
        
        self.model.fit(X, y)
        
        # Save model
        self.save_model()
        
        # Update food preferences in database
        await self.update_food_preferences(member, meal, reaction)
        
        # Identify patterns
        await self.identify_preference_patterns(member)
    
    def reaction_to_score(self, reaction: MealReaction) -> float:
        """Convert reaction to 0-1 score"""
        score_map = {
            'LOVED': 1.0,
            'LIKED': 0.8,
            'NEUTRAL': 0.5,
            'DISLIKED': 0.2,
            'REFUSED': 0.0
        }
        
        base_score = score_map.get(reaction.reaction, 0.5)
        
        # Adjust based on portion eaten
        portion_multiplier = reaction.portionEaten
        adjusted_score = base_score * portion_multiplier
        
        return adjusted_score
    
    # ============================================
    # GATEWAY FOODS
    # ============================================
    def suggest_gateway_foods(
        self,
        member: FamilyMember
    ) -> List[GatewayFoodSuggestion]:
        """
        Identify foods that could lead to accepting new foods
        
        Gateway foods work by finding foods with high acceptance rate
        and suggesting similar foods that haven't been tried yet.
        
        Example: If child likes chicken nuggets, suggest:
        - Chicken tenders (similar shape)
        - Grilled chicken strips (similar protein)
        - Turkey nuggets (similar concept)
        """
        
        print(f"🔍 Finding gateway foods for {member.name}...")
        
        # Get foods with high acceptance
        accepted_foods = self.get_accepted_foods(member, min_acceptance=0.7)
        
        suggestions = []
        
        for food in accepted_foods:
            # Find similar foods
            similar_foods = self.find_similar_foods(food, member)
            
            for similar in similar_foods:
                # Skip if already tried
                if similar in member.tried_foods:
                    continue
                
                # Predict success
                success_prob = self.predict_food_success(member, similar, food)
                
                if success_prob > 0.5:  # At least 50% chance
                    suggestions.append({
                        'gateway_food': food,
                        'suggested_food': similar,
                        'similarity_score': self.calculate_similarity(food, similar),
                        'success_probability': success_prob,
                        'acceptance_rate': accepted_foods[food],
                        'why': self.explain_gateway_connection(food, similar)
                    })
        
        # Sort by success probability
        suggestions.sort(key=lambda x: x['success_probability'], reverse=True)
        
        print(f"✅ Found {len(suggestions)} gateway food suggestions")
        
        return suggestions[:10]  # Top 10
    
    def find_similar_foods(
        self,
        food: str,
        member: FamilyMember
    ) -> List[str]:
        """Find foods similar to the gateway food"""
        similar = []
        
        # Check ingredient similarity
        # (In production, use a food database with embeddings)
        
        # Simple heuristic: foods with similar keywords
        keywords = food.lower().split()
        
        for other_food in self.food_database:
            if other_food == food:
                continue
            
            # Calculate keyword overlap
            other_keywords = other_food.lower().split()
            overlap = len(set(keywords) & set(other_keywords))
            
            if overlap >= 1:  # At least 1 keyword match
                similar.append(other_food)
        
        return similar[:5]  # Top 5
    
    # ============================================
    # HELPER METHODS
    # ============================================
    def explain_prediction(self, features: np.ndarray) -> List[str]:
        """Explain why model made this prediction"""
        explanations = []
        
        # Get feature importance
        importances = self.model.feature_importances_
        
        # Get top 3 most important features
        top_indices = np.argsort(importances)[-3:][::-1]
        
        feature_names = [
            'cuisine', 'cooking_method', 'calories', 'protein', 'carbs', 'fat',
            'prep_time', 'difficulty', 'ingredient_acceptance', 'similar_meals',
            'recent_trend', 'time_of_day', 'day_of_week', 'season', 'weather',
            'age', 'phase_impact', 'activity', 'skill', 'variety'
        ]
        
        for idx in top_indices:
            importance = importances[idx]
            feature_value = features[idx]
            explanations.append(f"{feature_names[idx]}: {feature_value:.2f} (importance: {importance:.2f})")
        
        return explanations
    
    def save_model(self):
        """Save trained model"""
        import pickle
        import os
        os.makedirs('models', exist_ok=True)
        with open('models/preference_model.pkl', 'wb') as f:
            pickle.dump(self.model, f)
    
    # Additional helper methods would be implemented here...
```

## Database Updates

```python
async def update_food_preferences(
    self,
    member: FamilyMember,
    meal: Meal,
    reaction: MealReaction
):
    """Update food preferences in database after meal reaction"""
    
    for ingredient in meal.ingredients:
        # Find or create preference record
        preference = await db.food_preference.find_unique(
            where={
                'memberId_foodItem': {
                    'memberId': member.id,
                    'foodItem': ingredient
                }
            }
        )
        
        if preference:
            # Update existing
            new_acceptance = (
                (preference.acceptance_rate * preference.timesServed) + reaction.reaction_score
            ) / (preference.timesServed + 1)
            
            await db.food_preference.update(
                where={'id': preference.id},
                data={
                    'acceptanceRate': new_acceptance,
                    'timesServed': {'increment': 1},
                    'timesAccepted': {'increment': 1 if reaction.reaction_score > 0.5 else 0},
                    'lastServed': datetime.now()
                }
            )
        else:
            # Create new
            await db.food_preference.create({
                'memberId': member.id,
                'foodItem': ingredient,
                'acceptanceRate': reaction.reaction_score,
                'timesServed': 1,
                'timesAccepted': 1 if reaction.reaction_score > 0.5 else 0,
                'lastServed': datetime.now()
            })
```


