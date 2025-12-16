import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/utils/jwt";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("auth_token")?.value;

  const publicPaths = ["/"];

  if (token && pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (publicPaths.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  if (!token) {
    console.warn("No token found");
    return NextResponse.redirect(new URL("/", req.url));
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    console.warn("Invalid or expired token");
    const res = NextResponse.redirect(new URL("/", req.url));
    res.cookies.delete("auth_token");
    return res;
  }

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-user-id", decoded.id);
  requestHeaders.set("x-user-role", decoded.role);

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/:path*", "/"],
};
