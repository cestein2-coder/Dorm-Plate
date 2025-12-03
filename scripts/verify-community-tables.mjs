import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// Read .env file manually
const envContent = readFileSync('.env', 'utf-8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length) {
    envVars[key.trim()] = valueParts.join('=').trim();
  }
});

const supabaseUrl = envVars.VITE_SUPABASE_URL;
const supabaseKey = envVars.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔍 Checking community tables in production database...\n');

// Test community_posts table
const { data: posts, error: postsError } = await supabase
  .from('community_posts')
  .select('count')
  .limit(1);

if (postsError) {
  console.error('❌ community_posts table NOT FOUND');
  console.error('Error:', postsError.message);
  console.log('\n📝 You need to run the migration in Supabase SQL Editor:');
  console.log('   File: supabase/migrations/20251202000000_create_community_posts.sql');
  process.exit(1);
} else {
  console.log('✅ community_posts table exists');
}

// Test community_post_likes table
const { data: likes, error: likesError } = await supabase
  .from('community_post_likes')
  .select('count')
  .limit(1);

if (likesError) {
  console.error('❌ community_post_likes table NOT FOUND');
  process.exit(1);
} else {
  console.log('✅ community_post_likes table exists');
}

// Test community_post_saves table
const { data: saves, error: savesError } = await supabase
  .from('community_post_saves')
  .select('count')
  .limit(1);

if (savesError) {
  console.error('❌ community_post_saves table NOT FOUND');
  process.exit(1);
} else {
  console.log('✅ community_post_saves table exists');
}

console.log('\n✅ All community tables exist! Vercel should work now.');
console.log('   If still not loading, check Vercel deployment logs and browser console.');
