import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("pdv_token")?.value;
  const isAppRoute = request.nextUrl.pathname.startsWith("/app");
  if (isAppRoute && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (request.nextUrl.pathname === "/login" && token) {
    return NextResponse.redirect(new URL("/app/dashboard", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*", "/login"]
};
