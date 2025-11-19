import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const userToken = req.cookies.get("userToken");   // normal user session
  const adminToken = req.cookies.get("authToken");  // admin session
  const url = req.nextUrl.clone();

  // 🚫 Protect /dashboard routes (normal users)
  if (url.pathname.startsWith("/dashboard") && !userToken) {
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // ✅ If normal user already logged in, prevent going back to /login
  if (url.pathname === "/login" && userToken) {
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  // 🚫 Protect /admin routes (admins), except /admin/login
  if (url.pathname.startsWith("/admin") && url.pathname !== "/admin/login" && !adminToken) {
    url.pathname = "/admin/login";
    return NextResponse.redirect(url);
  }

  // ✅ If admin already logged in, prevent going back to /admin/login
  if (url.pathname === "/admin/login" && adminToken) {
    url.pathname = "/admin";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/dashboard/:path*", "/admin/:path*"], 
};




// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";

// export function middleware(req: NextRequest) {
//   const token = req.cookies.get("authToken");

//   // Redirect logged-in users away from the login page
//   if (req.nextUrl.pathname === "/login" && token) {
//     return NextResponse.redirect(new URL("/dashboard", req.url));
//   }

//   // Allow all other requests
//   return NextResponse.next();
// }

// export const config = {
//   matcher: ["/login"], // Apply middleware to the login page only
// };
