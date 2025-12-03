import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://evnefvbljtjdewwzcixw.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV2bmVmdmJsanRqZGV3d3pjaXh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4Mzk5NTYsImV4cCI6MjA3NDQxNTk1Nn0.hn1lQS6hGOEbylzlz87ITeRpjJ-R5pAPMCdjfGQJYlw';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('🔍 Testing Community Posts Tables...\n');

async function testCommunityTables() {
  try {
    // Test 1: Check if community_posts table exists
    console.log('1️⃣ Testing community_posts table...');
    const { data: posts, error: postsError } = await supabase
      .from('community_posts')
      .select('*')
      .limit(1);

    if (postsError) {
      console.error('❌ Error accessing community_posts:');
      console.error('   Message:', postsError.message);
      console.error('   Code:', postsError.code);
      console.error('   Details:', postsError.details);
      console.log('\n💡 This means the migration has NOT been run yet!');
      console.log('   You need to run the SQL migration in Supabase dashboard.');
      return false;
    } else {
      console.log('✅ community_posts table exists!');
      console.log('   Found', posts?.length || 0, 'posts');
    }

    // Test 2: Check if community_post_likes table exists
    console.log('\n2️⃣ Testing community_post_likes table...');
    const { data: likes, error: likesError } = await supabase
      .from('community_post_likes')
      .select('*')
      .limit(1);

    if (likesError) {
      console.error('❌ Error accessing community_post_likes:', likesError.message);
      return false;
    } else {
      console.log('✅ community_post_likes table exists!');
    }

    // Test 3: Check if community_post_saves table exists
    console.log('\n3️⃣ Testing community_post_saves table...');
    const { data: saves, error: savesError } = await supabase
      .from('community_post_saves')
      .select('*')
      .limit(1);

    if (savesError) {
      console.error('❌ Error accessing community_post_saves:', savesError.message);
      return false;
    } else {
      console.log('✅ community_post_saves table exists!');
    }

    console.log('\n✨ All community tables are set up correctly!');
    console.log('🎉 The community feature should work now.');
    return true;

  } catch (err) {
    console.error('❌ Unexpected error:', err);
    return false;
  }
}

testCommunityTables().then((success) => {
  if (!success) {
    console.log('\n📋 TO FIX:');
    console.log('1. Go to: https://supabase.com/dashboard/project/evnefvbljtjdewwzcixw/sql/new');
    console.log('2. Copy contents of: supabase/migrations/20251202000000_create_community_posts.sql');
    console.log('3. Paste and click "Run"');
    console.log('4. Run this test again to verify');
  }
  process.exit(success ? 0 : 1);
});
