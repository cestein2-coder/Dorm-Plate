import React, { useState } from 'react';
import { Camera, Sparkles, Loader2, Clock, ChefHat, Lock } from 'lucide-react';
import { mealPlannerAI, MealSuggestion } from '../../lib/gemini-service';
import { useAuth } from '../auth/AuthProvider';

const SmartMealPlanner: React.FC = () => {
  const { user } = useAuth();
  const [ingredients, setIngredients] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [meals, setMeals] = useState<MealSuggestion[]>([]);
  const [selectedMeal, setSelectedMeal] = useState<MealSuggestion | null>(null);
  const [error, setError] = useState<string>('');

  const handleGenerateMeals = async () => {
    if (!user) {
      setError('⚠️ Please sign in to generate AI meal ideas');
      return;
    }
    
    if (!ingredients.trim()) {
      setError('Please enter at least one ingredient');
      return;
    }

    setLoading(true);
    setError('');
    setMeals([]); // Clear previous results
    
    try {
      console.log('Starting meal generation...');
      const ingredientList = ingredients
        .split(',')
        .map(i => i.trim())
        .filter(i => i.length > 0);
      
      console.log('Ingredient list:', ingredientList);
      const suggestions = await mealPlannerAI.generateMealIdeas(ingredientList);
      console.log('Received suggestions:', suggestions);
      
      if (suggestions && suggestions.length > 0) {
        setMeals(suggestions);
        setError('');
      } else {
        setError('No meal ideas generated. Please try different ingredients.');
      }
    } catch (err: any) {
      console.error('Error generating meals:', err);
      setError(`Unable to generate meal ideas: ${err?.message || 'Please check your API key and try again.'}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!user) {
      setError('⚠️ Please sign in to use the photo analysis feature');
      event.target.value = ''; // Reset file input
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Convert image to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        const base64Data = base64.split(',')[1]; // Remove data:image/jpeg;base64, prefix
        
        try {
          const detectedIngredients = await mealPlannerAI.analyzeFridgePhoto(base64Data);
          setIngredients(detectedIngredients.join(', '));
          
          // Auto-generate meal ideas
          const suggestions = await mealPlannerAI.generateMealIdeas(detectedIngredients);
          setMeals(suggestions);
        } catch (err) {
          console.error('Error analyzing photo:', err);
          setError('Failed to analyze photo. Please enter ingredients manually.');
        } finally {
          setLoading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Error reading file:', err);
      setError('Failed to read image file.');
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-50';
      case 'medium': return 'text-orange-600 bg-orange-50';
      case 'hard': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-food-brown">Smart Meal Planner</h2>
        <p className="text-gray-600 mt-1">AI-powered meal suggestions from your ingredients</p>
      </div>

      {/* Photo Upload Section */}
      <div className="bg-white rounded-xl shadow-md p-8 text-center">
        <Camera className="h-16 w-16 text-food-orange mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-food-brown mb-2">Snap Your Fridge</h3>
        <p className="text-gray-600 mb-6">
          Take a quick photo of your ingredients and let AI generate instant meal suggestions
        </p>
        <label htmlFor="photo-upload" className="inline-block">
          <input
            id="photo-upload"
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handlePhotoUpload}
            className="hidden"
            disabled={loading || !user}
          />
          <span className={`bg-food-orange text-white px-8 py-3 rounded-lg font-semibold hover:bg-food-orange-dark transition-colors cursor-pointer inline-flex items-center space-x-2 ${(!user || loading) ? 'opacity-50 cursor-not-allowed' : ''}`}>
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Analyzing...</span>
              </>
            ) : !user ? (
              <>
                <Lock className="h-5 w-5" />
                <span>Sign In to Use Photo</span>
              </>
            ) : (
              <>
                <Camera className="h-5 w-5" />
                <span>Take Photo</span>
              </>
            )}
          </span>
        </label>
        {!user && (
          <p className="text-sm text-gray-600 mt-4">
            🔒 Sign in required to use AI photo analysis
          </p>
        )}
      </div>

      {/* Manual Entry Section */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-food-brown mb-4 flex items-center">
          <Sparkles className="h-5 w-5 mr-2 text-food-orange" />
          Or Enter Ingredients Manually
        </h3>
        <div className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="e.g., chicken, rice, broccoli, soy sauce..."
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-food-orange focus:border-transparent"
              disabled={loading}
            />
            <p className="text-sm text-gray-500 mt-2">Separate ingredients with commas</p>
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <button
            onClick={handleGenerateMeals}
            disabled={loading || !ingredients.trim() || !user}
            className="w-full bg-food-green text-white py-3 rounded-lg font-semibold hover:bg-food-green-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Generating Ideas...</span>
              </>
            ) : !user ? (
              <>
                <Lock className="h-5 w-5" />
                <span>Sign In to Generate Meals</span>
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                <span>Generate Meal Ideas</span>
              </>
            )}
          </button>
          {!user && (
            <p className="text-xs text-center text-gray-600">
              🔒 You need to sign in to use AI meal generation
            </p>
          )}
        </div>
      </div>

      {/* Meal Suggestions */}
      {meals.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-food-brown">AI-Generated Meal Ideas</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {meals.map((meal, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-food-orange"
                onClick={() => setSelectedMeal(meal)}
              >
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-bold text-food-brown text-lg">{meal.name}</h4>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${getDifficultyColor(meal.difficulty)}`}>
                    {meal.difficulty}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-4">{meal.description}</p>
                <div className="flex items-center text-sm text-gray-500 space-x-4">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{meal.prepTime}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <ChefHat className="h-4 w-4" />
                    <span>{meal.ingredients.length} items</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Selected Meal Detail Modal */}
      {selectedMeal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedMeal(null)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold text-food-brown mb-2">{selectedMeal.name}</h2>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span className={`px-3 py-1 rounded-full font-medium ${getDifficultyColor(selectedMeal.difficulty)}`}>
                    {selectedMeal.difficulty}
                  </span>
                  <span className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{selectedMeal.prepTime}</span>
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedMeal(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                ×
              </button>
            </div>

            <p className="text-gray-700 mb-6">{selectedMeal.description}</p>

            <div className="space-y-6">
              {/* Ingredients */}
              <div>
                <h3 className="text-xl font-bold text-food-brown mb-3">Ingredients</h3>
                <ul className="space-y-2">
                  {selectedMeal.ingredients.map((ingredient, idx) => (
                    <li key={idx} className="flex items-center space-x-3">
                      <span className="w-2 h-2 bg-food-orange rounded-full"></span>
                      <span className="text-gray-700">{ingredient}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Instructions */}
              <div>
                <h3 className="text-xl font-bold text-food-brown mb-3">Instructions</h3>
                <ol className="space-y-3">
                  {selectedMeal.instructions.map((step, idx) => (
                    <li key={idx} className="flex space-x-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-food-orange text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {idx + 1}
                      </span>
                      <span className="text-gray-700 pt-0.5">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Nutrition Info (if available) */}
              {selectedMeal.nutritionInfo && (
                <div className="bg-green-50 rounded-lg p-4">
                  <h3 className="text-lg font-bold text-food-brown mb-2">Nutrition Highlights</h3>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    {selectedMeal.nutritionInfo.calories && (
                      <div>
                        <p className="text-2xl font-bold text-food-green">{selectedMeal.nutritionInfo.calories}</p>
                        <p className="text-sm text-gray-600">Calories</p>
                      </div>
                    )}
                    {selectedMeal.nutritionInfo.protein && (
                      <div>
                        <p className="text-2xl font-bold text-food-orange">{selectedMeal.nutritionInfo.protein}</p>
                        <p className="text-sm text-gray-600">Protein</p>
                      </div>
                    )}
                    {selectedMeal.nutritionInfo.carbs && (
                      <div>
                        <p className="text-2xl font-bold text-blue-600">{selectedMeal.nutritionInfo.carbs}</p>
                        <p className="text-sm text-gray-600">Carbs</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedMeal(null)}
              className="w-full mt-6 bg-food-orange text-white py-3 rounded-lg font-semibold hover:bg-food-orange-dark transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartMealPlanner;
