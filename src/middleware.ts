import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("authToken");

  // Redirect logged-in users away from the login page
  if (req.nextUrl.pathname === "/login" && token) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Allow all other requests
  return NextResponse.next();
}

export const config = {
  matcher: ["/login"], // Apply middleware to the login page only
};
