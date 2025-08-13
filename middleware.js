// middleware.js (at the project root)
import { NextRequest, NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

// This file intercepts requests to the MAIN application, not the admin panel.

const redis = new Redis({
  url: process.env.REDIS_URL,
  token: process.env.REDIS_TOKEN,
});

const MAINTENANCE_KEY = 'reactiquiz:maintenance_mode';

export const config = {
  // Run this middleware on all paths EXCEPT api routes, admin routes, and static assets
  matcher: [
    '/',
    '/((?!api|admin|_next/static|favicon.ico|logo.png|manifest.json).*)'
  ],
};

export async function middleware(req) {
  try {
    const isMaintenanceMode = await redis.get(MAINTENANCE_KEY);

    // If maintenance mode is on, rewrite the URL to the maintenance page
    if (isMaintenanceMode === 'true') {
      req.nextUrl.pathname = `/maintenance.html`;
      return NextResponse.rewrite(req.nextUrl);
    }
  } catch (error) {
    console.error('Redis error in middleware:', error);
    // If Redis fails, it's safer to let the site continue to function
  }

  // If not in maintenance mode, continue to the requested page
  return NextResponse.next();
}