// admin/src/middleware.js
import { NextResponse } from 'next/server';

export function middleware(req) {
  // Get the username and password from Vercel's Environment Variables
  const BASIC_AUTH_USER = process.env.BASIC_AUTH_USER;
  const BASIC_AUTH_PASS = process.env.BASIC_AUTH_PASS;

  // If the credentials are not set in the environment, deny access
  if (!BASIC_AUTH_USER || !BASIC_AUTH_PASS) {
    return new Response('Authentication credentials are not configured on the server.', {
      status: 500,
    });
  }

  // Check if the request has the 'Authorization' header
  const authHeader = req.headers.get('authorization');
  
  if (authHeader) {
    // The header is in the format "Basic base64encodedcredentials"
    const auth = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
    const user = auth[0];
    const pass = auth[1];

    // Check if the provided credentials match the environment variables
    if (user === BASIC_AUTH_USER && pass === BASIC_AUTH_PASS) {
      // If they match, allow the request to proceed
      return NextResponse.next();
    }
  }

  // If no/wrong credentials are provided, send a 401 Unauthorized response
  // This triggers the browser's built-in login prompt.
  return new Response('Authentication required.', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Secure Area"',
    },
  });
}

// This config ensures the middleware runs on ALL routes within the admin panel
export const config = {
  matcher: '/admin/:path*',
};