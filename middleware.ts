import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  const session = req.cookies.get("nbk_admin_session")?.value;
  if (session === "1") return NextResponse.next();

  const loginUrl = new URL("/admin/login", req.url);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*"],
};

