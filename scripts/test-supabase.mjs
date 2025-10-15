import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const url = process.env.VITE_SUPABASE_URL;
const anonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Copy .env.example to .env.local and fill values.');
  process.exit(1);
}

const supabase = createClient(url, anonKey);

(async () => {
  try {
    // Try a simple health check: call GET /rest/v1 on a common table (if exists) or list some metadata
    const { data: health } = await supabase.rpc('pg_sleep', { seconds: 0 }).catch(() => ({ data: null }));
    console.log('Connected to Supabase (RPC health check returned):', health);

    // Try fetching current user (will be null without auth)
    const { data: sessionData } = await supabase.auth.getSession();
    console.log('Session data:', sessionData ?? 'none');

    // Try a simple public table read if exists (waitlist_entries)
    const { data, error } = await supabase.from('waitlist_entries').select('*').limit(3);
    if (error) {
      console.warn('Readable query failed (table may not exist or anon key lacks access):', error.message);
    } else {
      console.log('Sample rows from waitlist_entries:', data);
    }
  } catch (err) {
    console.error('Error connecting to Supabase:', err.message || err);
    process.exit(1);
  }
})();
