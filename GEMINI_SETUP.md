# Gemini AI Integration Setup Guide

This guide will help you set up Google's Gemini AI to power the smart features in DormPlate.

## Features Powered by Gemini AI

1. **Smart Meal Planner** - Generate recipe ideas from ingredients (text or photo)
2. **Fridge Overflow Alerts** - AI suggestions for expiring food items  
3. **Waste Reduction Insights** - Personalized sustainability tips
4. **Community Recommendations** - Trending recipe generation
5. **Dining Sync Intelligence** - Smart cook vs. dine recommendations

## Setup Instructions

### Step 1: Get Your Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click **"Get API Key"** or **"Create API Key"**
4. Copy your API key

### Step 2: Add API Key to Your Project

1. Open the `.env` file in your project root (or create it if it doesn't exist)
2. Add this line with your actual API key:

```env
VITE_GEMINI_API_KEY=your_api_key_here
```

3. Save the file

**Important:** Never commit your `.env` file to git! It's already in `.gitignore`.

### Step 3: Restart Your Dev Server

If your dev server is running, restart it to load the new environment variable:

```bash
npm run dev
```

## Testing the Features

### 1. Smart Meal Planner
- Navigate to **Dashboard > Meal Planner**
- Enter ingredients manually: `chicken, rice, broccoli, soy sauce`
- Click **"Generate Meal Ideas"**
- You should see 3 AI-generated recipes with:
  - Meal name and description
  - Ingredient list
  - Step-by-step instructions
  - Prep time and difficulty level

### 2. Photo Analysis (Meal Planner)
- Click **"Take Photo"** or upload an image
- Gemini will analyze the photo and detect ingredients
- Recipes will be auto-generated based on detected items

### 3. Fridge Overflow AI Suggestions
- Navigate to **Dashboard > Fridge Alerts**
- Add items with expiration dates within 3 days
- AI will automatically generate recipe suggestions to use expiring items
- Each suggestion includes:
  - Urgency level (high/medium/low)
  - Items to use
  - Quick preparation tip

## API Usage & Costs

### Free Tier
- **60 requests per minute**
- **1,500 requests per day**
- Perfect for development and testing

### Models Used
- `gemini-pro`: Text generation (meal ideas, suggestions, insights)
- `gemini-pro-vision`: Image analysis (fridge photo scanning)

### Rate Limits
The integration includes automatic fallbacks if:
- API key is missing → Shows mock data
- Rate limit exceeded → Returns cached suggestions
- Network error → Displays friendly error message

## Troubleshooting

### "Missing VITE_GEMINI_API_KEY" Warning
- Check that `.env` file exists in project root
- Verify the key starts with `VITE_`
- Restart dev server after adding the key

### API Key Not Working
- Verify you copied the full key (no spaces)
- Check that the API key is enabled in Google AI Studio
- Confirm you're using a valid Google account

### Rate Limit Errors
- Free tier: 60 requests/minute
- Wait a minute and try again
- Consider upgrading to paid tier for production

### "Failed to generate meal ideas"
- Check browser console for detailed error
- Verify internet connection
- Ensure Gemini API is not experiencing outages

## Security Best Practices

1. **Never commit `.env` file** - It's in `.gitignore` by default
2. **Use environment variables only** - Don't hardcode API keys
3. **Rotate keys regularly** - Generate new keys periodically
4. **Monitor usage** - Check [Google AI Studio](https://makersuite.google.com) dashboard
5. **Set up billing alerts** - If you upgrade to paid tier

## Development vs Production

### Development
```env
VITE_GEMINI_API_KEY=your_dev_key
```

### Production (Vercel/Netlify)
Add the environment variable in your hosting platform's dashboard:
- **Vercel**: Settings > Environment Variables
- **Netlify**: Site Settings > Environment Variables

## Advanced Configuration

### Customize AI Behavior

Edit `src/lib/gemini-service.ts` to adjust:

- **Temperature**: Creativity level (0-1)
- **Max tokens**: Response length
- **Prompts**: Modify system instructions
- **Model version**: Switch between gemini-pro, gemini-pro-vision

Example:
```typescript
const model = genAI.getGenerativeModel({ 
  model: 'gemini-pro',
  generationConfig: {
    temperature: 0.7,  // More creative
    maxOutputTokens: 1000
  }
});
```

## Resources

- [Gemini API Documentation](https://ai.google.dev/docs)
- [Google AI Studio](https://makersuite.google.com)
- [Pricing Information](https://ai.google.dev/pricing)
- [Safety Settings](https://ai.google.dev/docs/safety_setting_gemini)

## Support

If you encounter issues:
1. Check browser console for errors
2. Verify API key is correct
3. Test API key at [Google AI Studio](https://makersuite.google.com)
4. Check [Status Page](https://status.cloud.google.com/)

---

## Quick Start Commands

```bash
# Install dependencies
npm install

# Add your API key to .env
echo "VITE_GEMINI_API_KEY=your_key_here" >> .env

# Start development server
npm run dev

# Build for production
npm run build
```

Now your DormPlate app has AI superpowers! 🚀🤖
