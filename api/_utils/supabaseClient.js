// api/_utils/supabaseClient.js
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("CRITICAL: Supabase URL or Service Key is missing. Check Vercel environment variables.");
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = { supabase };