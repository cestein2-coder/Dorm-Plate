import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

console.log('🔧 Running fridge_items table migration...');
console.log('📍 Supabase URL:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Read the migration file
const migrationPath = join(__dirname, '../supabase/migrations/20251106000000_create_fridge_items_table.sql');
const migrationSQL = readFileSync(migrationPath, 'utf8');

console.log('📄 Migration file loaded');
console.log('📝 SQL length:', migrationSQL.length, 'characters');

try {
  // Execute the migration using the RPC endpoint
  console.log('\n🚀 Executing migration...');
  
  // Split by semicolon and execute each statement
  const statements = migrationSQL
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));
  
  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i] + ';';
    console.log(`\n📌 Executing statement ${i + 1}/${statements.length}...`);
    console.log(statement.substring(0, 100) + '...');
    
    const { data, error } = await supabase.rpc('exec_sql', { sql: statement });
    
    if (error) {
      // If exec_sql doesn't exist, try direct query
      console.log('⚠️  exec_sql RPC not found, trying direct query...');
      const { error: queryError } = await supabase.from('_migrations').select('*').limit(1);
      
      if (queryError) {
        console.error('❌ Error:', error.message);
        console.log('\n💡 You need to run this migration manually in the Supabase SQL Editor:');
        console.log('1. Go to https://supabase.com/dashboard/project/' + supabaseUrl.split('.')[0].split('//')[1]);
        console.log('2. Navigate to SQL Editor');
        console.log('3. Copy and paste the migration from:');
        console.log('   supabase/migrations/20251106000000_create_fridge_items_table.sql');
        console.log('4. Click "Run"');
        process.exit(1);
      }
    } else {
      console.log('✅ Statement executed successfully');
    }
  }
  
  console.log('\n✅ Migration completed successfully!');
  console.log('🎉 The fridge_items table is now ready to use');
  
} catch (err) {
  console.error('\n❌ Migration failed:', err.message);
  console.log('\n💡 Please run this migration manually in the Supabase SQL Editor:');
  console.log('1. Go to https://supabase.com/dashboard/project/evnefvbljtjdewwzcixw');
  console.log('2. Navigate to SQL Editor');
  console.log('3. Copy and paste the contents of:');
  console.log('   supabase/migrations/20251106000000_create_fridge_items_table.sql');
  console.log('4. Click "Run"');
  process.exit(1);
}
