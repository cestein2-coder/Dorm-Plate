# Supabase Authentication Configuration

## ✅ Current Working Setup

**Supabase Project ID:** `evnefvbljtjdewwzcixw`

### Environment Variables (Local & Vercel)
```
VITE_SUPABASE_URL=https://evnefvbljtjdewwzcixw.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV2bmVmdmJsanRqZGV3d3pjaXh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4Mzk5NTYsImV4cCI6MjA3NDQxNTk1Nn0.hn1lQS6hGOEbylzlz87ITeRpjJ-R5pAPMCdjfGQJYlw
VITE_GEMINI_API_KEY=AIzaSyBUWtpkl-dBUuZkAPrDkyeS3QTqdoyjGh8
```

## Supabase Dashboard Settings

### 1. Authentication → URL Configuration
- **Site URL:** `http://localhost:5173` (for local development)
- **Redirect URLs:** Add these:
  - `http://localhost:5173/**`
  - `https://your-vercel-domain.vercel.app/**`

### 2. Authentication → Providers → Email
- ✅ **Enable email provider:** ON
- ✅ **Confirm email:** DISABLED (for easier testing)
  - *Note: Enable this in production for security*

### 3. Database Tables Required
Your migrations should have created these tables:
- `student_profiles`
- `waitlist_entries`
- `fridge_items`
- `reminders`
- And others from `/supabase/migrations/`

### 4. RLS (Row Level Security)
- Policies are set via migrations
- Public can INSERT into `waitlist_entries`
- Authenticated users can manage their own data

## Vercel Deployment Checklist

When deploying to Vercel, ensure:
1. ✅ All 3 environment variables are set in Vercel
2. ✅ Added to Production, Preview, and Development environments
3. ✅ Vercel domain is added to Supabase Redirect URLs
4. ✅ Redeploy after adding/updating environment variables

## Testing Sign In/Out

### Local Testing
1. Start dev server: `npm run dev`
2. Go to http://localhost:5173
3. Click "Sign In" or "Sign Up"
4. Use any email (doesn't need to be real if confirmation is disabled)
5. Check that you can sign in and see dashboard
6. Test sign out

### Production Testing
1. Go to your Vercel URL
2. Test same flow as local
3. Check browser console for any errors

## Troubleshooting

### "Failed to fetch" error
- Check Supabase Auth URL Configuration
- Verify environment variables are set correctly
- Make sure Email provider is enabled
- Check browser console for specific error

### "Invalid API key"
- Verify `VITE_SUPABASE_ANON_KEY` is correct
- Check that it's set in both `.env` (local) and Vercel
- Redeploy Vercel after updating env vars

### Can't sign in after deployment
- Add Vercel domain to Supabase Redirect URLs
- Wait 1-2 minutes for DNS propagation
- Clear browser cache and try again

## Important Notes

⚠️ **Never commit `.env` file to Git** - it contains sensitive keys
✅ The `.env` file is already in `.gitignore`
🔄 When changing Supabase credentials, update both local `.env` AND Vercel environment variables

---

**Last Updated:** December 2, 2025
**Status:** ✅ Working - Sign in/out functional
