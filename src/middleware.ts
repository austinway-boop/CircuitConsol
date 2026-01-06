import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check authentication - just verify token exists
  // Actual validation happens in API routes and page components
  const token = request.cookies.get('circuit_session')?.value
  
  if (!token) {
    return NextResponse.redirect(new URL('/sign-in', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/app/:path*', '/admin/:path*'],
}
