# 🍕 DormPlate - Smart Campus Food Management with AI

A modern food sustainability platform designed specifically for college students. Built with React, TypeScript, Tailwind CSS, Supabase, and powered by Google's Gemini AI.

## 🚀 Features

### Landing Page (Ready for Launch)
- ✅ **Waitlist Collection** - Collects student emails with .edu validation
- ✅ **Big Ten Universities** - Pre-populated university selector
- ✅ **Error Handling** - Duplicate detection and validation
- ✅ **Success States** - Clear confirmation messaging

### Core MVP Features (AI-Powered)

1. **🧑‍� Smart Meal Planner** ⭐ *AI-Powered*
   - Upload fridge photos for instant ingredient detection
   - Manual ingredient entry support
   - AI-generated recipe suggestions with:
     - Step-by-step instructions
     - Prep time and difficulty level
     - Ingredient lists
     - Nutrition highlights
   - Powered by Gemini Pro Vision & Gemini Pro

2. **� Fridge Overflow Alerts** ⭐ *AI-Powered*
   - Track food items with expiration dates
   - Category organization (dairy, meat, produce, etc.)
   - Color-coded expiration status (red/orange/green)
   - AI-generated recipe suggestions for expiring items
   - Smart reminders to prevent food waste
   - Powered by Gemini Pro

3. **� Campus Dining Sync**
   - Track dining dollars and meal swipes
   - View dining hall hours and locations
   - Balance monitoring with visual progress
   - AI recommendations: cook at home vs. use meal plan
   - Guest pass tracking

4. **� Waste Reduction Dashboard** ⭐ *AI-Powered*
   - Track money saved from reducing waste
   - Monitor pounds of food waste prevented
   - CO₂ impact calculations
   - Monthly progress tracking
   - Achievement badges and milestones
   - Personalized sustainability tips powered by Gemini Pro

5. **👥 Community Picks** ⭐ *AI-Powered*
   - Trending meals from students
   - AI-generated recipe recommendations
   - Like and save favorite recipes
   - Share your own creations
   - Campus-specific trending content

### Additional Features
- **🔐 Student Authentication** - Big Ten universities with .edu email requirement
- **📱 Responsive Design** - Mobile-first design optimized for students
- **🎯 Campus-Focused** - Built specifically for college environments
- **🤖 AI Integration** - Google Gemini powering intelligent features

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **AI**: Google Gemini (Pro & Pro Vision models)
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Deployment**: Ready for Vercel/Netlify

## 📊 Database Schema

The MVP includes these core tables:
- `waitlist_entries` - Landing page signups
- `student_profiles` - User profiles with university info
- `fridge_items` - Food expiration tracking
- `reminders` - Meal and recipe reminders
- `restaurants` & `menu_items` - Restaurant and menu data
- `orders` & `order_items` - Order management
- `reviews` - Rating system

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Supabase account
- Google Gemini API key (free tier available)
- .env file with credentials

### Installation

1. **Clone and install dependencies**
   ```bash
   cd Dorm-Plate
   npm install
   ```

2. **Set up environment variables**
   Create a `.env` file:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_GEMINI_API_KEY=your_gemini_api_key
   ```

3. **Get Your Gemini API Key**
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Sign in and create a new API key
   - Copy to your `.env` file
   - See [GEMINI_SETUP.md](./GEMINI_SETUP.md) for detailed instructions

4. **Set up Supabase database**
   - Create a new Supabase project
   - Run migrations from `supabase/migrations/` folder
   - Apply RLS policies from migration files

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:5173`

## Supabase Quick Test

If you want to verify your Supabase connection locally, copy `.env.example` to `.env.local` and fill in the values. Then run the lightweight test script which attempts to connect and read a public table.

```bash
cp .env.example .env.local
# edit .env.local and fill in values
node --experimental-modules scripts/test-supabase.mjs
```

This script uses your anon key and will print basic session and sample rows (if `waitlist_entries` exists).

## 📱 Usage

### For Landing Page (Public Launch)
1. Visit the homepage
2. Enter .edu email in the waitlist form
3. Select your Big Ten university
4. Get confirmation of signup

### For App Users (Authenticated)
1. **Sign up** with .edu email from a Big Ten university
2. **Complete profile** with name and graduation year
3. **Smart Meal Planner**:
   - Take a photo of your fridge ingredients
   - Or enter ingredients manually
   - Get AI-generated recipe suggestions
   - View detailed cooking instructions
4. **Fridge Tracker**:
   - Add items with expiration dates
   - Get alerts for expiring items
   - Receive AI recipe suggestions to use items before they spoil
5. **Campus Dining Sync**:
   - Monitor dining dollars and meal swipes
   - View dining hall hours
   - Get smart recommendations on cooking vs dining
6. **Waste Dashboard**:
   - Track money saved
   - Monitor food waste prevented
   - View CO₂ impact
   - Unlock achievements
7. **Community**:
   - Browse trending student recipes
   - Save and like meals
   - Share your own creations

## 🗂️ Project Structure

```
src/
├── components/
│   ├── auth/              # Authentication components
│   ├── meal-planner/      # AI meal planning
│   ├── fridge/           # Expiration tracking
│   ├── restaurants/      # Restaurant browsing (legacy)
│   ├── orders/          # Order management (legacy)
│   └── ...              # Landing page components
├── lib/
│   ├── mvp-types.ts     # TypeScript types
│   ├── mvp-supabase.ts  # Database helpers
│   └── gemini-service.ts # AI integration
└── supabase/
    └── migrations/      # Database schema
```

## 🎯 AI Features in Detail

### Smart Meal Planner
- **Photo Analysis**: Upload fridge photos, Gemini Vision detects ingredients
- **Recipe Generation**: Gemini Pro creates custom recipes with instructions
- **Nutrition Info**: AI-calculated nutrition highlights
- **Difficulty Levels**: Easy/medium/hard classification
- **Prep Times**: Accurate time estimates

### Fridge Alerts
- **Expiration Tracking**: Monitor all food items with dates
- **Smart Alerts**: 3-day warning for expiring items
- **AI Recipes**: Gemini suggests recipes using expiring ingredients
- **Urgency Levels**: High/medium/low priority recommendations
- **Quick Tips**: Preparation advice for each suggestion

### Waste Reduction
- **Impact Tracking**: Money saved, waste prevented, CO₂ reduced
- **AI Insights**: Personalized sustainability tips from Gemini
- **Progress Goals**: Track monthly targets
- **Achievements**: Unlock badges for milestones

### Community Features
- **Trending Meals**: AI-generated popular student recipes
- **Preference Learning**: Personalized recommendations
- **Social Sharing**: Upload and share your creations

## 🎯 Next Steps

### Phase 1: Launch Preparation
- [ ] Get Gemini API key and add to production environment
- [ ] Apply database migrations to production Supabase
- [ ] Test all AI features end-to-end
- [ ] Deploy to production (Vercel/Netlify)
- [ ] Launch waitlist collection

### Phase 2: Enhanced AI Features
- [ ] Multi-image fridge scanning
- [ ] Voice input for ingredients
- [ ] Meal plan calendar with AI scheduling
- [ ] Nutritionist-approved recipe variations
- [ ] Social features with user-generated content

### Phase 3: Scale & Growth
- [ ] Multi-campus expansion (beyond Big Ten)
- [ ] Mobile app (React Native)
- [ ] Integration with campus meal plan systems
- [ ] Partnership with local grocery stores
- [ ] Advanced sustainability gamification

## 📚 Documentation

- **[GEMINI_SETUP.md](./GEMINI_SETUP.md)** - Complete Gemini AI setup guide
- **[.github/copilot-instructions.md](./.github/copilot-instructions.md)** - Development guidelines

## 🤝 Contributing

This is an MVP built for educational purposes. The codebase is well-structured for future enhancements and scaling.

## � Security Notes

- Never commit `.env` file (already in `.gitignore`)
- Rotate API keys regularly
- Use environment variables for all secrets
- Monitor Gemini API usage in Google AI Studio

## �📄 License

MIT License - Built for BADM 372 coursework.

---

**Ready to launch!** 🚀 The landing page is production-ready for waitlist collection, and the app includes all 5 core MVP features powered by AI for a complete campus food sustainability experience.