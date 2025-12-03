import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// Read .env file
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

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('Testing exact query from browser...\n');

const queryPromise = supabase
  .from('community_posts')
  .select('*')
  .order('created_at', { ascending: false });

const timeoutPromise = new Promise((_, reject) => 
  setTimeout(() => reject(new Error('Query timeout')), 5000)
);

try {
  const { data, error } = await Promise.race([queryPromise, timeoutPromise]);
  console.log('✅ Query succeeded!');
  console.log('Data:', data);
  console.log('Error:', error);
} catch (err) {
  console.error('❌ Query failed:', err.message);
}
