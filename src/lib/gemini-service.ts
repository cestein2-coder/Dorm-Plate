import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

console.log('🔑 Gemini API Key status:', apiKey ? `Loaded (${apiKey.substring(0, 10)}...)` : 'NOT FOUND');

if (!apiKey) {
  console.error('❌ VITE_GEMINI_API_KEY not found. AI features will be limited.');
} else {
  console.log('✅ Gemini API initialized successfully');
}

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

// ==============================================
// SMART MEAL PLANNER AI
// ==============================================

export interface MealSuggestion {
  name: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  prepTime: string;
  difficulty: 'easy' | 'medium' | 'hard';
  nutritionInfo?: {
    calories?: number;
    protein?: string;
    carbs?: string;
  };
}

export const mealPlannerAI = {
  async generateMealIdeas(ingredients: string[]): Promise<MealSuggestion[]> {
    console.log('🍳 generateMealIdeas called with:', ingredients);
    console.log('🔍 genAI initialized?', genAI ? 'YES' : 'NO');
    
    if (!genAI) {
      console.error('❌ Gemini API not initialized. Returning mock data.');
      // Return mock data if API key not available
      return [
        {
          name: 'Quick Stir-Fry',
          description: 'A simple and delicious stir-fry using your available ingredients',
          ingredients: ingredients.slice(0, 4),
          instructions: [
            'Heat oil in a pan',
            'Add ingredients and stir-fry for 5-7 minutes',
            'Season to taste',
            'Serve hot'
          ],
          prepTime: '15 mins',
          difficulty: 'easy'
        }
      ];
    }

    try {
      console.log('🚀 Generating meal ideas with Gemini for ingredients:', ingredients);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
      console.log('📦 Model created:', model);
      
      const prompt = `You are a creative chef and college meal planning assistant. I have these ingredients available: ${ingredients.join(', ')}.

Create 3 DIFFERENT and CREATIVE meal recipes using combinations of these ingredients. Each recipe should:
- Have a creative, appealing dish name (not just "Ingredient Mix")
- Use 2-5 of the provided ingredients in interesting combinations
- Be practical for college students (quick, simple, budget-friendly)
- Include specific cooking instructions (not generic steps)
- Be a real, recognizable dish

Examples of good recipes:
- "Honey Garlic Chicken Stir-Fry" (not just "Chicken Mix")
- "Creamy Tomato Pasta" (not just "Pasta Dish")
- "Veggie Fried Rice" (not just "Rice Bowl")

Return ONLY a JSON array in this exact format (no markdown, no extra text):
[
  {
    "name": "Creative Dish Name Here",
    "description": "One sentence describing what makes this dish delicious",
    "ingredients": ["ingredient1 with amount", "ingredient2 with amount"],
    "instructions": ["Specific step 1", "Specific step 2", "etc"],
    "prepTime": "15 mins",
    "difficulty": "easy"
  }
]

Be creative! Think like a real chef, not just someone listing ingredients.`;

      console.log('📝 Sending prompt to Gemini...');
      const result = await model.generateContent(prompt);
      console.log('📥 Received result from Gemini:', result);
      
      const response = await result.response;
      console.log('📄 Response object:', response);
      
      const text = response.text();
      console.log('📃 Full Gemini response text:', text);
      
      // Try to parse JSON from response - look for JSON code blocks too
      let jsonText = text;
      
      // Remove markdown code blocks if present
      if (text.includes('```json')) {
        const match = text.match(/```json\s*([\s\S]*?)\s*```/);
        if (match) {
          jsonText = match[1];
        }
      } else if (text.includes('```')) {
        const match = text.match(/```\s*([\s\S]*?)\s*```/);
        if (match) {
          jsonText = match[1];
        }
      }
      
      // Try to find JSON array
      const jsonMatch = jsonText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        try {
          const meals = JSON.parse(jsonMatch[0]);
          console.log('Successfully parsed meals:', meals.length);
          return meals;
        } catch (parseError) {
          console.error('JSON parse error:', parseError);
        }
      }
      
      console.warn('Could not parse JSON from response, using fallback');
      // Fallback if parsing fails
      return [{
        name: 'Custom Recipe',
        description: 'A delicious meal with your ingredients',
        ingredients,
        instructions: ['Follow your intuition and combine these ingredients!'],
        prepTime: '20 mins',
        difficulty: 'medium'
      }];
    } catch (error: any) {
      console.error('Error generating meal ideas:', error);
      console.error('Error details:', error?.message, error?.status);
      
      // Return helpful fallback instead of throwing
      return [{
        name: 'Simple Mixed Dish',
        description: `A quick meal using ${ingredients.slice(0, 3).join(', ')}`,
        ingredients: ingredients.slice(0, 5),
        instructions: [
          'Prepare all ingredients',
          'Cook according to your preference',
          'Combine and season',
          'Enjoy your meal!'
        ],
        prepTime: '15-20 mins',
        difficulty: 'easy'
      }];
    }
  },

  async analyzeFridgePhoto(imageBase64: string): Promise<string[]> {
    if (!genAI) {
      console.warn('Gemini API not initialized for photo analysis');
      return ['milk', 'eggs', 'cheese', 'vegetables'];
    }

    try {
      console.log('Analyzing fridge photo with Gemini Vision');
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
      
      const prompt = `Analyze this photo of a refrigerator or food items. List all the visible food ingredients you can identify. 
Return ONLY a comma-separated list of ingredients, nothing else. Example: "milk, eggs, cheese, tomatoes, chicken"`;

      const imageParts = [
        {
          inlineData: {
            data: imageBase64,
            mimeType: 'image/jpeg'
          }
        }
      ];

      const result = await model.generateContent([prompt, ...imageParts]);
      const response = await result.response;
      const text = response.text();
      
      console.log('Photo analysis response:', text);
      
      // Parse the comma-separated list
      const ingredients = text
        .split(',')
        .map(item => item.trim().toLowerCase())
        .filter(item => item.length > 0);
      
      return ingredients.length > 0 ? ingredients : ['milk', 'eggs', 'bread'];
    } catch (error: any) {
      console.error('Error analyzing fridge photo:', error);
      console.error('Error details:', error?.message);
      // Return default ingredients on error
      return ['milk', 'eggs', 'cheese', 'vegetables'];
    }
  }
};

// ==============================================
// FRIDGE OVERFLOW ALERTS AI
// ==============================================

export interface RecipeSuggestion {
  title: string;
  description: string;
  urgency: 'high' | 'medium' | 'low';
  itemsToUse: string[];
  quickTip: string;
}

export const fridgeAlertAI = {
  async suggestRecipesForExpiring(expiringItems: { name: string; daysUntilExpiry: number }[]): Promise<RecipeSuggestion[]> {
    if (!genAI) {
      return [{
        title: 'Quick Use Recipe',
        description: 'Use your expiring ingredients quickly',
        urgency: 'high',
        itemsToUse: expiringItems.map(i => i.name),
        quickTip: 'Cook these items within 24 hours'
      }];
    }

    try {
      console.log('Generating recipe suggestions for expiring items:', expiringItems);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
      
      const itemsList = expiringItems
        .map(item => `${item.name} (expires in ${item.daysUntilExpiry} days)`)
        .join(', ');

      const prompt = `You are a food waste prevention assistant. These items are expiring soon: ${itemsList}.

Suggest 3 quick recipes that use these expiring ingredients. For each recipe, provide:
1. Title (catchy, student-friendly name)
2. Description (1 sentence)
3. Urgency level (high if expires in 1 day, medium if 2-3 days, low if 3+ days)
4. Items to use from the expiring list
5. Quick tip for preparation

Format as JSON array:
[
  {
    "title": "Recipe Name",
    "description": "Quick description",
    "urgency": "high",
    "itemsToUse": ["item1", "item2"],
    "quickTip": "Helpful tip"
  }
]

Only respond with the JSON array.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      console.log('Gemini API response for fridge alerts:', text);
      
      // Try to extract JSON from response (handle markdown code blocks)
      let jsonText = text;
      if (text.includes('```json')) {
        const match = text.match(/```json\s*([\s\S]*?)\s*```/);
        if (match) {
          jsonText = match[1];
        }
      } else if (text.includes('```')) {
        const match = text.match(/```\s*([\s\S]*?)\s*```/);
        if (match) {
          jsonText = match[1];
        }
      }
      
      const jsonMatch = jsonText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const suggestions = JSON.parse(jsonMatch[0]);
        console.log('Parsed suggestions:', suggestions);
        return suggestions;
      }
      
      console.warn('Could not parse JSON from response, returning fallback');
      return [{
        title: 'Use Soon',
        description: 'Quick meal with expiring items',
        urgency: 'high',
        itemsToUse: expiringItems.map(i => i.name),
        quickTip: 'Cook within 24 hours'
      }];
    } catch (error) {
      console.error('Error suggesting recipes for expiring items:', error);
      // Return fallback instead of throwing
      return [{
        title: 'Use Expiring Items',
        description: 'Create a quick meal with your expiring ingredients',
        urgency: 'high',
        itemsToUse: expiringItems.map(i => i.name),
        quickTip: 'Cook these items soon to prevent waste'
      }];
    }
  },

  async generateSmartReminder(itemName: string, daysUntilExpiry: number): Promise<string> {
    if (!genAI) {
      return `Your ${itemName} expires in ${daysUntilExpiry} days. Consider using it soon!`;
    }

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
      
      const prompt = `Create a friendly, helpful reminder message for a college student about their ${itemName} that expires in ${daysUntilExpiry} days. 
Keep it under 30 words, casual tone, and include a quick suggestion or tip. Just return the message text, nothing else.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      console.error('Error generating reminder:', error);
      return `Your ${itemName} expires in ${daysUntilExpiry} days. Use it soon to avoid waste!`;
    }
  }
};

// ==============================================
// WASTE REDUCTION INSIGHTS AI
// ==============================================

export interface WasteInsight {
  title: string;
  description: string;
  impact: string;
  actionableTip: string;
}

export const wasteReductionAI = {
  async generatePersonalizedInsights(wasteData: {
    itemsWasted: number;
    moneySaved: number;
    co2Saved: number;
    commonWasteItems: string[];
  }): Promise<WasteInsight[]> {
    if (!genAI) {
      return [{
        title: 'Great Progress!',
        description: `You've saved ${wasteData.itemsWasted} items from waste`,
        impact: `$${wasteData.moneySaved} saved`,
        actionableTip: 'Keep up the good work!'
      }];
    }

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
      
      const prompt = `You are a sustainability coach for college students. Based on this data:
- Items saved from waste: ${wasteData.itemsWasted}
- Money saved: $${wasteData.moneySaved}
- CO2 saved: ${wasteData.co2Saved} kg
- Common items: ${wasteData.commonWasteItems.join(', ')}

Generate 3 personalized insights/tips to help them reduce waste further. For each insight:
1. Catchy title
2. Brief description (1-2 sentences)
3. Impact statement (what they've achieved or could achieve)
4. One actionable tip

Format as JSON array:
[
  {
    "title": "Insight Title",
    "description": "Description here",
    "impact": "Impact statement",
    "actionableTip": "Specific action"
  }
]

Only respond with the JSON array.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      return [{
        title: 'Keep Going!',
        description: 'You\'re making great progress',
        impact: 'Positive environmental impact',
        actionableTip: 'Continue tracking your items'
      }];
    } catch (error) {
      console.error('Error generating waste insights:', error);
      throw error;
    }
  }
};

// ==============================================
// COMMUNITY RECOMMENDATIONS AI
// ==============================================

export interface CommunityRecipe {
  title: string;
  description: string;
  ingredients: string[];
  cookTime: string;
  difficulty: string;
  nutritionHighlight?: string;
}

export const communityAI = {
  async generateTrendingRecipes(userPreferences?: string[]): Promise<CommunityRecipe[]> {
    if (!genAI) {
      return [{
        title: 'Student Favorite Pasta',
        description: 'Quick and budget-friendly pasta dish',
        ingredients: ['pasta', 'tomato sauce', 'cheese'],
        cookTime: '15 mins',
        difficulty: 'easy'
      }];
    }

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
      
      const prefText = userPreferences?.length 
        ? `User preferences: ${userPreferences.join(', ')}` 
        : 'General college student preferences';

      const prompt = `Generate 4 trending meal ideas for college students. ${prefText}.

Each recipe should be:
- Quick (under 20 minutes)
- Budget-friendly
- Easy to make in a dorm
- Nutritious

For each recipe provide:
1. Catchy title
2. Brief description
3. List of ingredients (5-7 items)
4. Cook time
5. Difficulty level
6. One nutrition highlight

Format as JSON array:
[
  {
    "title": "Recipe Name",
    "description": "Description",
    "ingredients": ["item1", "item2"],
    "cookTime": "15 mins",
    "difficulty": "easy",
    "nutritionHighlight": "High in protein"
  }
]

Only respond with the JSON array.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      return [{
        title: 'Trending Recipe',
        description: 'Popular among students',
        ingredients: ['various'],
        cookTime: '20 mins',
        difficulty: 'medium'
      }];
    } catch (error) {
      console.error('Error generating community recipes:', error);
      throw error;
    }
  }
};

// ==============================================
// DINING SYNC AI
// ==============================================

export interface DiningRecommendation {
  recommendation: 'cook' | 'dine';
  reason: string;
  suggestedAction: string;
  estimatedSavings?: number;
}

export const diningSyncAI = {
  async recommendCookOrDine(data: {
    diningDollars: number;
    mealSwipes: number;
    fridgeItems: number;
    daysLeftInMonth: number;
  }): Promise<DiningRecommendation> {
    if (!genAI) {
      const shouldCook = data.fridgeItems > 5 && data.diningDollars < 200;
      return {
        recommendation: shouldCook ? 'cook' : 'dine',
        reason: shouldCook 
          ? 'You have plenty of ingredients at home' 
          : 'Your meal plan balance is healthy',
        suggestedAction: shouldCook 
          ? 'Cook at home to save your dining dollars' 
          : 'Use a meal swipe today',
        estimatedSavings: shouldCook ? 12 : 0
      };
    }

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
      
      const prompt = `You are a college meal plan advisor. Analyze this data:
- Dining dollars remaining: $${data.diningDollars}
- Meal swipes left: ${data.mealSwipes}
- Items in fridge: ${data.fridgeItems}
- Days left in month: ${data.daysLeftInMonth}

Recommend whether the student should "cook" at home or "dine" using their meal plan today. Provide:
1. Recommendation: "cook" or "dine"
2. Brief reason (1 sentence)
3. Suggested action (1 sentence, specific)
4. Estimated savings if cooking (dollar amount as a number, 0 if dining)

Format as JSON object:
{
  "recommendation": "cook",
  "reason": "Your reason here",
  "suggestedAction": "Specific action",
  "estimatedSavings": 12
}

Only respond with the JSON object.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      return {
        recommendation: 'cook',
        reason: 'Balance your meal plan budget',
        suggestedAction: 'Cook at home today',
        estimatedSavings: 10
      };
    } catch (error) {
      console.error('Error generating dining recommendation:', error);
      throw error;
    }
  }
};
