# Apply Reminders Table Migration

To add the reminders feature to your Supabase database, you need to run the migration SQL.

## Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard: https://supabase.com/dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy and paste the contents of `supabase/migrations/20251104000000_create_reminders_table.sql`
5. Click **Run** to execute the migration

## Option 2: Using Supabase CLI

If you have the Supabase CLI installed:

```bash
# Link your project (if not already linked)
supabase link --project-ref sqghycvxpehrnvbqnamo

# Apply the migration
supabase db push
```

## Verify the Migration

After running the migration, verify it was successful:

1. Go to **Table Editor** in Supabase dashboard
2. You should see a new `reminders` table with columns:
   - id (uuid)
   - user_id (uuid)
   - title (text)
   - description (text)
   - reminder_type (text)
   - scheduled_for (timestamptz)
   - is_completed (boolean)
   - created_at (timestamptz)
   - updated_at (timestamptz)

## What This Enables

After running this migration, signed-in users will be able to:
- Create meal reminders to schedule when to eat
- Create share reminders to plan food sharing with friends
- Create recipe reminders to get suggestions for cooking
- View, complete, and delete their reminders
- All reminders are private and secured with Row Level Security (RLS)
