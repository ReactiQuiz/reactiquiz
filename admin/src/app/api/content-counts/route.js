// admin/src/app/api/content-counts/route.js
import { NextResponse } from 'next/server';
import { createClient } from '@libsql/client';

// IMPORTANT: We create a new Turso client here using environment variables.
// This code runs on the server, so it has access to process.env.
const turso = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
});

export async function GET() {
  try {
    const [usersResult, topicsResult, questionsResult] = await Promise.all([
        turso.execute("SELECT count(*) as total FROM users"),
        turso.execute("SELECT count(*) as total FROM quiz_topics"),
        turso.execute("SELECT count(*) as total FROM questions"),
    ]);

    const data = {
        userCount: usersResult.rows[0].total,
        topicCount: topicsResult.rows[0].total,
        questionCount: questionsResult.rows[0].total,
    };

    return NextResponse.json(data);

  } catch (e) {
    console.error('Failed to fetch content counts:', e);
    return NextResponse.json({ message: 'Could not fetch content counts.' }, { status: 500 });
  }
}