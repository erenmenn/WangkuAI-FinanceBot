import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const { nextUrl } = req;

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
  });

  const isLoggedIn = !!token;
  const isAuthPage = nextUrl.pathname.startsWith('/auth');
  const isApiAuthPage = nextUrl.pathname.startsWith('/api/auth');

  // Biarkan request API auth lewat
  if (isApiAuthPage) return NextResponse.next();

  // Kalau sudah login dan buka halaman auth, redirect ke home
  if (isAuthPage) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL('/', nextUrl));
    }
    return NextResponse.next();
  }

  // Kalau belum login dan bukan di halaman auth, redirect ke login
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL('/auth/login', nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|img).*)'],
};
