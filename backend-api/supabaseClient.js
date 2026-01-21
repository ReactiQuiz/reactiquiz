// api/supabaseClient.js
/**
 * Supabase Client Configuration
 * 
 * Creates and exports a single, reusable Supabase client instance for the API.
 * This file uses ES modules (import/export) for Vercel serverless functions.
 * The environment variables are automatically provided by Vercel when you
 * connect the Supabase integration.
 */

import { createClient } from '@supabase/supabase-js';

/**
 * Supabase Configuration
 * 
 * These environment variables are automatically provided by Vercel
 * when you connect the Supabase integration.
 */
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

/**
 * Supabase Client Instance
 * 
 * Create and export a single, reusable Supabase client instance
 * for use in serverless functions.
 */
export const supabase = createClient(supabaseUrl, supabaseKey);