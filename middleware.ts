import { type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

export async function middleware(request: NextRequest) {
  // Only update the session, don't enforce authentication
  return await updateSession(request)
}

export const config = {
  matcher: [
    // Only match specific routes that require authentication
    '/dashboard/:path*',
    '/settings/:path*',
    '/profile/:path*',
  ],
}