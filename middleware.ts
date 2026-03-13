import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isProtectedRoute = createRouteMatcher(['/dashboard(.*)', '/boards(.*)']);

// If Clerk keys aren't configured (e.g. during local dev without .env),
// skip auth middleware entirely to prevent MIDDLEWARE_INVOCATION_FAILED.
const clerkConfigured =
    !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
    !!process.env.CLERK_SECRET_KEY;

export default clerkConfigured
    ? clerkMiddleware(async (auth, req) => {
          if (isProtectedRoute(req)) {
              await auth.protect();
          }
      })
    : () => NextResponse.next();

export const config = {
    matcher: [
        // Skip Next.js internals and all static files, unless found in search params
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        // Always run for API routes
        '/(api|trpc)(.*)',
    ],
};