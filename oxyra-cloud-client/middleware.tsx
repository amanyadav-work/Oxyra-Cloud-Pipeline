import { NextResponse, NextRequest } from 'next/server';
import { verifyToken } from './utils/verifyToken';

const PUBLIC_ONLY_ROUTES: string[] = ['/login', '/signup'];
const PUBLIC_ROUTES: string[] = ['/'];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const payload: any = await verifyToken(req);
  const isAuthenticated: boolean = Boolean(payload);

  const isPublic: boolean = PUBLIC_ROUTES.includes(pathname);
  const isPublicOnly: boolean = PUBLIC_ONLY_ROUTES.includes(pathname);

  // Prevent logged-in users from accessing login/signup pages
  if (isAuthenticated && isPublicOnly) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  // Allow everyone to access truly public routes (like '/')
  if (isPublic) {
    return NextResponse.next();
  }

  // Redirect unauthenticated users away from protected routes
  if (!isAuthenticated && !isPublicOnly && !isPublic) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return NextResponse.next();
}

export const config: { matcher: string[] } = {
  matcher: [
    '/((?!_next(?:/data)?/.*|favicon\.ico|manifest\.json|robots\.txt|service-worker\.js|api/.*|.*\.(?:png|svg|jpg|jpeg|gif|webp|ico|bmp|tiff|avif|webmanifest|json|mp4|mp3|avi|mov|mkv|flv|webm|wmv|mpg|mpeg|flac|aac|wav|ogv|mp4v|3gp)).*)',
  ],
};