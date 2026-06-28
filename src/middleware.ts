import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Always allow the login page through
  if (pathname === '/admin/login') {
    return NextResponse.next()
  }

  // Only protect /admin/* routes — public routes are open to everyone
  if (pathname.startsWith('/admin')) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })

    // Not logged in at all → send to admin login
    if (!token) {
      const loginUrl = new URL('/admin/login', req.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Logged in but not an admin/editor/author role → send to homepage
    const role = (token as any).role as string | undefined
    if (!role || !['admin', 'editor', 'author'].includes(role)) {
      return NextResponse.redirect(new URL('/', req.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  // Only run middleware on /admin routes — never block public pages
  matcher: ['/admin/:path*'],
}
