import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const pathname = req.nextUrl.pathname;

    // All /admin/* routes except /admin/login require authentication
    if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
      const token = req.nextauth.token;
      if (!token) {
        return NextResponse.redirect(new URL("/admin/login", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized({ token, req }) {
        const pathname = req.nextUrl.pathname;
        // Allow /admin/login without token
        if (pathname === "/admin/login") return true;
        // All other /admin/* routes require token
        if (pathname.startsWith("/admin")) return !!token;
        return true;
      },
    },
  }
);

export const config = {
  matcher: ["/admin/:path*"],
};
