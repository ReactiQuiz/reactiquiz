// --- NEW FILE: api/supabaseClient.js ---

import { createClient } from '@supabase/supabase-js';

// These environment variables are automatically provided by Vercel
// when you connect the Supabase integration.
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

// Create and export a single, reusable Supabase client instance.
export const supabase = createClient(supabaseUrl, supabaseKey);