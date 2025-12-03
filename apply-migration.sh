#!/bin/bash

# Community Posts Migration Helper
# This script helps you apply the database migration

echo "🗄️  Community Posts Migration Helper"
echo "====================================="
echo ""
echo "The community feature requires new database tables."
echo "You need to run the migration in your Supabase dashboard."
echo ""
echo "📋 Steps to apply migration:"
echo ""
echo "1. Go to: https://supabase.com/dashboard/project/evnefvbljtjdewwzcixw/sql/new"
echo ""
echo "2. Copy the SQL from: supabase/migrations/20251202000000_create_community_posts.sql"
echo ""
echo "3. Paste it into the SQL Editor and click 'Run'"
echo ""
echo "4. Verify tables were created by running:"
echo "   SELECT * FROM community_posts LIMIT 1;"
echo ""
echo "5. Refresh your app and the Community tab should work!"
echo ""
echo "📄 For detailed instructions, see: COMMUNITY_FEATURE_GUIDE.md"
echo ""

# Offer to open the files
read -p "Would you like to view the migration file? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]
then
    cat supabase/migrations/20251202000000_create_community_posts.sql
fi
