// middleware.js (at the project root)
import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

const MAINTENANCE_KEY = 'reactiquiz:maintenance_mode';

export const config = {
  matcher: [
    '/',
    '/((?!api|admin|_next/static|favicon.ico|logo.png|manifest.json).*)'
  ],
};

export async function middleware(req) {
  try {
    const isMaintenanceMode = await redis.get(MAINTENANCE_KEY);

    if (isMaintenanceMode === 'true') {
      req.nextUrl.pathname = `/maintenance.html`;
      return NextResponse.rewrite(req.nextUrl);
    }
  } catch (error) {
    console.error('Redis error in middleware:', error);
  }

  return NextResponse.next();
}