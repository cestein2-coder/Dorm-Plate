# 🍕 DormPlate - Campus Food Delivery MVP

A modern food delivery platform designed specifically for college students. Built with React, TypeScript, Tailwind CSS, and Supabase.

## 🚀 Features

### Landing Page (Ready for Launch)
- ✅ **Waitlist Collection** - Collects student emails with .edu validation
- ✅ **University Tracking** - Optional university field for targeting
- ✅ **Error Handling** - Duplicate detection and validation
- ✅ **Success States** - Clear confirmation messaging

### Core App Features (5 MVP Features)

1. **🍕 Browse Restaurants & Menus**
   - View available restaurants with ratings and delivery info
   - Browse menu items by category with prices and descriptions
   - Search restaurants by name or cuisine type
   - Filter by cuisine, delivery time, and ratings

2. **📦 Place Individual Orders**
   - Add items to cart with quantities and special instructions
   - Automatic calculation of subtotal, delivery fee, tax, and total
   - Order confirmation with estimated delivery time
   - Delivery address and instructions

3. **👥 Group Ordering**
   - Create group orders with shareable join codes
   - Friends can join using the code and contribute
   - Track participants and payment status
   - Split costs automatically between participants

4. **🚚 Order Tracking**
   - Real-time order status updates (pending → confirmed → preparing → out for delivery → delivered)
   - Status history with timestamps and messages
   - Estimated delivery times and driver information
   - Support contact information

5. **⭐ Rate & Review**
   - Leave ratings (1-5 stars) and comments for restaurants
   - View reviews from other students with verification
   - Automatic restaurant rating calculation
   - Review aggregation and statistics

### Additional Features
- **🔐 Student Authentication** - .edu email requirement with profile management
- **📱 Responsive Design** - Mobile-first design optimized for students
- **🎯 Campus-Focused** - Built specifically for college environments

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Deployment**: Ready for Vercel/Netlify

## 📊 Database Schema

The MVP includes these core tables:
- `waitlist_entries` - Landing page signups
- `student_profiles` - User profiles with university info
- `restaurants` & `menu_items` - Restaurant and menu data
- `orders` & `order_items` - Order management
- `group_orders` & `group_order_participants` - Group ordering
- `order_status_updates` - Order tracking
- `reviews` - Rating system

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Supabase account
- .env file with Supabase credentials

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
   ```

3. **Set up Supabase database**
   - Create a new Supabase project
   - Run the migration: `supabase/migrations/20250102000000_mvp_schema.sql`
   - The migration includes sample data for testing

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
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
3. Optionally add university name
4. Get confirmation of signup

### For App Users (Authenticated)
1. Sign up with .edu email
2. Complete profile with university info
3. Browse restaurants and menus
4. Place individual or group orders
5. Track order status in real-time
6. Leave reviews after delivery

### Group Ordering Flow
1. Create a group order during checkout
2. Share the join code with friends
3. Friends join using the code
4. Everyone contributes to the order
5. Split delivery costs automatically

## 🗂️ Project Structure

```
src/
├── components/
│   ├── auth/              # Authentication components
│   ├── restaurants/       # Restaurant browsing & menus
│   ├── orders/           # Order placement & tracking
│   ├── groups/           # Group ordering functionality
│   ├── reviews/          # Rating & review system
│   └── ...               # Landing page components
├── lib/
│   ├── mvp-types.ts      # TypeScript types
│   └── mvp-supabase.ts   # Database helpers
└── supabase/
    └── migrations/       # Database schema
```

## 🎯 Next Steps

### Phase 1: Launch Preparation
- [ ] Apply database migration to production Supabase
- [ ] Test all features end-to-end
- [ ] Deploy to production (Vercel/Netlify)
- [ ] Launch waitlist collection

### Phase 2: Enhanced Features
- [ ] Payment integration (Stripe)
- [ ] Real-time delivery tracking with GPS
- [ ] Push notifications
- [ ] Advanced filtering and search
- [ ] Loyalty program and rewards

### Phase 3: Scale & Growth
- [ ] Multi-campus expansion
- [ ] Restaurant partner onboarding
- [ ] Analytics dashboard
- [ ] Mobile app (React Native)
- [ ] Advanced group ordering features

## 🤝 Contributing

This is an MVP built for educational purposes. The codebase is well-structured for future enhancements and scaling.

## 📄 License

MIT License - Built for BADM 372 coursework.

---

**Ready to launch!** 🚀 The landing page is production-ready for waitlist collection, and the app includes all 5 core MVP features for a complete campus food delivery experience.