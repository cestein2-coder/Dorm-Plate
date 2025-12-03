# Community Posts Feature - Deployment Guide

## Overview
Added a complete community feature where users can create, view, like, and save meal recommendation posts.

## What Was Added

### Database (Migration File)
- **File**: `supabase/migrations/20251202000000_create_community_posts.sql`
- **Tables**:
  - `community_posts` - Main posts table with title, description, ingredients, etc.
  - `community_post_likes` - Tracks which users liked which posts
  - `community_post_saves` - Tracks which users saved which posts
- **Features**:
  - Row Level Security (RLS) policies for proper access control
  - Automatic like/save counters with triggers
  - Indexes for performance

### Frontend Components
1. **CommunityFeed** (`src/components/community/CommunityFeed.tsx`)
   - Displays all community posts in a grid
   - Like/save functionality
   - Shows post author, ingredients, prep time
   - Loading and error states

2. **CreatePostModal** (`src/components/community/CreatePostModal.tsx`)
   - Modal form to create new posts
   - Add/remove ingredients dynamically
   - Optional image URL, prep time, difficulty
   - Form validation

3. **Dashboard Integration**
   - Community tab now uses real database posts
   - "Share Your Meal" button opens create modal
   - Real-time like/save updates

### Backend (Supabase Helpers)
- Added `communityHelpers` in `src/lib/mvp-supabase.ts` with:
  - `getAllPosts()` - Fetch all posts with user info
  - `createPost()` - Create new post
  - `likePost()` / `unlikePost()` - Toggle likes
  - `savePost()` / `unsavePost()` - Toggle saves
  - `getSavedPosts()` - Get user's saved posts
  - `deletePost()` - Delete own posts

### TypeScript Types
- Added to `src/lib/mvp-types.ts`:
  - `CommunityPost`
  - `CreateCommunityPostRequest`
  - `CommunityPostLike`
  - `CommunityPostSave`

## How to Deploy

### 1. Apply Database Migration

Go to your Supabase dashboard:
1. Navigate to **SQL Editor**
2. Copy the entire contents of `supabase/migrations/20251202000000_create_community_posts.sql`
3. Paste and click **Run**
4. Verify tables were created:
   ```sql
   SELECT * FROM community_posts LIMIT 1;
   SELECT * FROM community_post_likes LIMIT 1;
   SELECT * FROM community_post_saves LIMIT 1;
   ```

### 2. Deploy to Vercel

The code has already been pushed to GitHub. Vercel will automatically deploy if you have auto-deploy enabled.

If not:
```bash
vercel --prod
```

### 3. Verify Environment Variables

Make sure these are set in Vercel:
- ✅ `VITE_SUPABASE_URL`
- ✅ `VITE_SUPABASE_ANON_KEY`
- ✅ `VITE_GEMINI_API_KEY`

## Testing the Feature

1. **Sign in** to your account
2. Click **Community Picks** in the dashboard sidebar
3. Click **Share Your Meal** button
4. Fill out the form:
   - Title: "Midnight Ramen"
   - Description: "Perfect late-night study snack"
   - Ingredients: "Ramen, eggs, green onions"
   - Prep time: "10 mins"
   - Difficulty: Easy
5. Click **Share Meal**
6. Your post should appear in the feed
7. Try liking and saving posts

## Features Users Can Now Do

✅ Create meal recommendation posts
✅ Add title, description, ingredients list
✅ Specify prep time and difficulty
✅ Add optional image URL
✅ Like posts (with real-time counter)
✅ Save posts to their collection
✅ View posts from other students
✅ See author name and university
✅ Automatic engagement metrics

## Database Schema Notes

- Posts are linked to `auth.users` via `user_id`
- Student name is fetched via join with `student_profiles`
- Likes/saves use unique constraints to prevent duplicates
- Counters update automatically via database triggers
- All tables have proper RLS policies for security

## Future Enhancements (Optional)

Consider adding:
- Comments on posts
- Search/filter by ingredients
- Sort by popularity, date, etc.
- Image upload (not just URL)
- Recipe steps/instructions
- Nutrition information
- Share to social media

## Rollback (If Needed)

If you need to remove this feature:

```sql
DROP TRIGGER IF EXISTS on_post_save_change ON community_post_saves;
DROP TRIGGER IF EXISTS on_post_like_change ON community_post_likes;
DROP FUNCTION IF EXISTS update_post_saves_count();
DROP FUNCTION IF EXISTS update_post_likes_count();
DROP TABLE IF EXISTS community_post_saves CASCADE;
DROP TABLE IF EXISTS community_post_likes CASCADE;
DROP TABLE IF EXISTS community_posts CASCADE;
```

---

**Created**: December 2, 2025
**Commit**: 303ed13
