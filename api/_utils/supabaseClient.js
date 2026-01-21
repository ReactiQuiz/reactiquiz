// api/_utils/supabaseClient.js
/**
 * Supabase Client Configuration
 * 
 * Creates and exports Supabase client instances for both public and admin operations.
 * Provides a database helper object with CRUD operations that automatically selects
 * the appropriate client based on admin privileges.
 */

const { createClient } = require('@supabase/supabase-js');

/**
 * Supabase Configuration
 * 
 * Reads Supabase connection settings from environment variables.
 */
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

/**
 * Validate Environment Variables
 * 
 * Warns if required environment variables are missing but does not exit.
 */
if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('[WARN] Missing Supabase environment variables (SUPABASE_URL/SUPABASE_ANON_KEY). Server will log errors if accessed without proper config.');
}

/**
 * Supabase Client for Public Operations
 * 
 * Uses the anonymous key for public API operations with Row Level Security.
 */
const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Supabase Client for Admin Operations
 * 
 * Uses the service role key for admin operations that bypass Row Level Security.
 * Only created if SUPABASE_SERVICE_ROLE_KEY is available.
 */
const supabaseAdmin = supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey) : null;

/**
 * Database Helper Functions
 * 
 * Provides a consistent interface for database operations with automatic
 * client selection based on admin privileges.
 */
const db = {
    /**
     * Get Client
     * 
     * Returns the appropriate Supabase client based on admin privileges.
     * 
     * @param {boolean} isAdmin - Whether to use admin client (default: false)
     * @returns {Object} Supabase client instance
     */
    getClient: (isAdmin = false) => {
        if (isAdmin && supabaseAdmin) {
            return supabaseAdmin;
        }
        return supabase;
    },

    /**
     * Query Helper
     * 
     * Performs a SELECT query on the specified table with optional filters,
     * ordering, and pagination.
     * 
     * @param {string} table - Table name
     * @param {Object} options - Query options:
     *   - {Object} filters - Key-value pairs for filtering
     *   - {Object} orderBy - Object with column and ascending properties
     *   - {number} limit - Maximum number of results
     *   - {number} offset - Number of results to skip
     *   - {string} select - Columns to select (default: '*')
     *   - {boolean} isAdmin - Whether to use admin client
     * @returns {Promise<Array>} Array of results
     * @throws {Error} If query fails
     */
    query: async (table, options = {}) => {
        try {
            const client = db.getClient(options.isAdmin);
            let query = client.from(table);

            // Apply filters
            if (options.filters) {
                Object.entries(options.filters).forEach(([key, value]) => {
                    query = query.eq(key, value);
                });
            }

            // Apply ordering
            if (options.orderBy) {
                query = query.order(options.orderBy.column, { ascending: options.orderBy.ascending !== false });
            }

            // Apply limit and offset using range
            if (options.limit || options.offset) {
                const from = options.offset || 0;
                const to = from + (options.limit || 10) - 1;
                query = query.range(from, to);
            }

            // Execute query
            const { data, error } = await query.select(options.select || '*');

            if (error) {
                console.error(`Database query error for table ${table}:`, error);
                throw error;
            }

            return data;
        } catch (error) {
            console.error(`Database query failed for table ${table}:`, error);
            throw error;
        }
    },

    /**
     * Insert Helper
     * 
     * Inserts data into the specified table.
     * 
     * @param {string} table - Table name
     * @param {Object|Array} data - Data to insert (single object or array)
     * @param {Object} options - Insert options:
     *   - {string} select - Columns to return (default: '*')
     *   - {boolean} isAdmin - Whether to use admin client
     * @returns {Promise<Array>} Array of inserted records
     * @throws {Error} If insert fails
     */
    insert: async (table, data, options = {}) => {
        try {
            const client = db.getClient(options.isAdmin);
            const { data: result, error } = await client
                .from(table)
                .insert(data)
                .select(options.select || '*');

            if (error) {
                console.error(`Database insert error for table ${table}:`, error);
                throw error;
            }

            return result;
        } catch (error) {
            console.error(`Database insert failed for table ${table}:`, error);
            throw error;
        }
    },

    /**
     * Update Helper
     * 
     * Updates records in the specified table matching the filters.
     * 
     * @param {string} table - Table name
     * @param {Object} data - Data to update
     * @param {Object} filters - Key-value pairs for filtering records
     * @param {Object} options - Update options:
     *   - {string} select - Columns to return (default: '*')
     *   - {boolean} isAdmin - Whether to use admin client
     * @returns {Promise<Array>} Array of updated records
     * @throws {Error} If update fails
     */
    update: async (table, data, filters, options = {}) => {
        try {
            const client = db.getClient(options.isAdmin);
            let query = client.from(table).update(data);

            // Apply filters
            if (filters) {
                Object.entries(filters).forEach(([key, value]) => {
                    query = query.eq(key, value);
                });
            }

            const { data: result, error } = await query.select(options.select || '*');

            if (error) {
                console.error(`Database update error for table ${table}:`, error);
                throw error;
            }

            return result;
        } catch (error) {
            console.error(`Database update failed for table ${table}:`, error);
            throw error;
        }
    },

    /**
     * Delete Helper
     * 
     * Deletes records from the specified table matching the filters.
     * 
     * @param {string} table - Table name
     * @param {Object} filters - Key-value pairs for filtering records
     * @param {Object} options - Delete options:
     *   - {string} select - Columns to return (default: '*')
     *   - {boolean} isAdmin - Whether to use admin client
     * @returns {Promise<Array>} Array of deleted records
     * @throws {Error} If delete fails
     */
    delete: async (table, filters, options = {}) => {
        try {
            const client = db.getClient(options.isAdmin);
            let query = client.from(table).delete();

            // Apply filters
            if (filters) {
                Object.entries(filters).forEach(([key, value]) => {
                    query = query.eq(key, value);
                });
            }

            const { data: result, error } = await query.select(options.select || '*');

            if (error) {
                console.error(`Database delete error for table ${table}:`, error);
                throw error;
            }

            return result;
        } catch (error) {
            console.error(`Database delete failed for table ${table}:`, error);
            throw error;
        }
    },

    /**
     * Upsert Helper
     * 
     * Inserts data or updates existing records based on conflict resolution.
     * 
     * @param {string} table - Table name
     * @param {Object|Array} data - Data to upsert (single object or array)
     * @param {Object} options - Upsert options:
     *   - {string} onConflict - Column to check for conflicts (default: 'id')
     *   - {boolean} ignoreDuplicates - Whether to ignore duplicates (default: false)
     *   - {string} select - Columns to return (default: '*')
     *   - {boolean} isAdmin - Whether to use admin client
     * @returns {Promise<Array>} Array of upserted records
     * @throws {Error} If upsert fails
     */
    upsert: async (table, data, options = {}) => {
        try {
            const client = db.getClient(options.isAdmin);
            const { data: result, error } = await client
                .from(table)
                .upsert(data, { 
                    onConflict: options.onConflict || 'id',
                    ignoreDuplicates: options.ignoreDuplicates || false 
                })
                .select(options.select || '*');

            if (error) {
                console.error(`Database upsert error for table ${table}:`, error);
                throw error;
            }

            return result;
        } catch (error) {
            console.error(`Database upsert failed for table ${table}:`, error);
            throw error;
        }
    },

    /**
     * RPC Helper
     * 
     * Calls a stored procedure or function in the database.
     * 
     * @param {string} functionName - Name of the stored procedure/function
     * @param {Object} params - Parameters to pass to the function
     * @param {Object} options - RPC options:
     *   - {boolean} isAdmin - Whether to use admin client
     * @returns {Promise<Array>} Array of results from the function
     * @throws {Error} If RPC call fails
     */
    rpc: async (functionName, params = {}, options = {}) => {
        try {
            const client = db.getClient(options.isAdmin);
            const { data, error } = await client.rpc(functionName, params);

            if (error) {
                console.error(`Database RPC error for function ${functionName}:`, error);
                throw error;
            }

            return data;
        } catch (error) {
            console.error(`Database RPC failed for function ${functionName}:`, error);
            throw error;
        }
    }
};

module.exports = {
    supabase,
    supabaseAdmin,
    db
};