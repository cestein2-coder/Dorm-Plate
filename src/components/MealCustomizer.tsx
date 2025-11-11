import React, { useState } from 'react';
import { Sparkles, AlertCircle } from 'lucide-react';

const ingredients = [
  'Chicken', 'Beef', 'Tofu', 'Rice', 'Noodles', 'Broccoli', 'Carrots', 'Cheese', 'Egg', 'Avocado', 'Hot Sauce', 'Soy Sauce'
];

interface MealSuggestion {
  name: string;
  description: string;
  instructions: string;
}

const MealCustomizer: React.FC = () => {
  const [selected, setSelected] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mealSuggestion, setMealSuggestion] = useState<MealSuggestion | null>(null);

  const toggleIngredient = (item: string) => {
    setSelected(sel => sel.includes(item) ? sel.filter(i => i !== item) : [...sel, item]);
  };

  const generateMeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selected.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const response = await fetch(`${supabaseUrl}/functions/v1/gemini-meal-suggestions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${anonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ingredients: selected,
          dietary_preferences: 'quick and delicious',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate meal');
      }

      const data = await response.json();
      if (data.recipes && data.recipes.length > 0) {
        const meal = data.recipes[0];
        setMealSuggestion({
          name: meal.title,
          description: meal.description || 'A delicious meal with your selected ingredients',
          instructions: 'Chef\'s special recipe - combine ingredients as suggested and enjoy!',
        });
      }
      setSubmitted(true);
    } catch (err) {
      setError('Could not generate meal suggestion. Try again!');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="w-full max-w-xl bg-food-yellow-light rounded-xl shadow-lg p-6 mb-8 flex flex-col items-center">
      <div className="flex items-center justify-center gap-2 mb-2">
        <h3 className="text-xl font-bold text-food-brown">Build Your Own Meal</h3>
        <Sparkles className="w-5 h-5 text-food-brown" />
      </div>

      {error && (
        <div className="w-full mb-4 p-3 bg-red-50 border border-red-200 rounded flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {submitted && mealSuggestion ? (
        <div className="text-food-brown text-center w-full">
          <div className="mb-4 p-4 bg-white rounded-lg border border-food-brown">
            <h4 className="text-lg font-bold text-food-brown mb-2">{mealSuggestion.name}</h4>
            <p className="text-sm text-food-brown/70 mb-3">{mealSuggestion.description}</p>
            <div className="mb-3">
              <p className="text-xs font-semibold text-food-brown/60 mb-2">Your ingredients:</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {selected.map(item => (
                  <span key={item} className="bg-food-yellow px-3 py-1 rounded-full text-food-brown font-medium border border-food-brown text-sm">{item}</span>
                ))}
              </div>
            </div>
            <p className="text-xs text-food-brown/60">{mealSuggestion.instructions}</p>
          </div>
          <button
            onClick={() => {
              setSubmitted(false);
              setSelected([]);
              setMealSuggestion(null);
            }}
            className="bg-food-brown text-white px-4 py-2 rounded-lg font-medium"
          >
            Create Another Meal
          </button>
        </div>
      ) : (
        <form onSubmit={generateMeal} className="w-full flex flex-col items-center space-y-4">
          <div className="flex flex-wrap gap-2 justify-center">
            {ingredients.map(item => (
              <button
                type="button"
                key={item}
                className={`px-3 py-1 rounded-full border font-medium transition-colors ${selected.includes(item) ? 'bg-food-brown text-white border-food-brown' : 'bg-food-yellow text-food-brown border-food-brown hover:bg-food-brown/10'}`}
                onClick={() => toggleIngredient(item)}
              >
                {item}
              </button>
            ))}
          </div>
          <button
            type="submit"
            disabled={selected.length === 0 || loading}
            className="bg-gradient-to-r from-food-yellow to-food-brown text-white px-4 py-2 rounded-lg font-medium mt-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span>Creating...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Meal with AI</span>
              </>
            )}
          </button>
        </form>
      )}
    </section>
  );
};

export default MealCustomizer;
