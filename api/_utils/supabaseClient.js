// api/_utils/supabaseClient.js
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://ocdhqqwkxvvarrmxrzgg.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9jZGhxcXdreHZ2YXJybXhyemdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwODAzMTksImV4cCI6MjA2NTY1NjMxOX0.FzizaXL860qFp0RLDnwwng8KBm0VJ_H7tTNvgOVCfPY";

if (!supabaseUrl || !supabaseKey) {
    console.error("CRITICAL: Supabase URL or Service Key is missing. Check Vercel environment variables.");
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = { supabase };