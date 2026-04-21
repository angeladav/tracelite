// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const token = request.cookies.get('tl_access_token')

  if (!token && request.nextUrl.pathname.startsWith('/orgs')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
}

export const config = {
  matcher: ['/orgs/:path*', '/admin/:path*'],
}
