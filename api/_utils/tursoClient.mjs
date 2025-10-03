import { createClient } from '@libsql/client';

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  throw new Error('FATAL: Turso database URL or Auth Token is not configured.');
}

export const turso = createClient({ url, authToken });


