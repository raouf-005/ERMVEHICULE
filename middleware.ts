import { auth } from "@/src/auth";
import { NextResponse } from "next/server";

// Force Node.js runtime instead of Edge
export const runtime = "nodejs";

// Routes that require ADMIN role
const adminRoutes = ["/admin"];

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isLoginPage = req.nextUrl.pathname === "/login";
  const isApiAuthRoute = req.nextUrl.pathname.startsWith("/api/auth");
  const isApiRoute = req.nextUrl.pathname.startsWith("/api");
  const isUnauthorizedPage = req.nextUrl.pathname === "/unauthorized";
  const pathname = req.nextUrl.pathname;

  // Autoriser les routes d'API auth
  if (isApiAuthRoute) {
    return NextResponse.next();
  }

  // Pour les routes API, retourner 401/403 approprié
  if (isApiRoute && !isLoggedIn) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Autoriser la page unauthorized sans authentification
  if (isUnauthorizedPage) {
    return NextResponse.next();
  }

  // Si l'utilisateur n'est pas connecté et n'est pas sur la page login
  if (!isLoggedIn && !isLoginPage) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Si l'utilisateur est connecté et essaie d'accéder à la page login
  if (isLoggedIn && isLoginPage) {
    return NextResponse.redirect(new URL("/", req.nextUrl.origin));
  }

  // Vérifier les routes admin - rediriger vers /unauthorized si non admin
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));
  if (isAdminRoute && isLoggedIn) {
    const userRole = req.auth?.user?.role;
    if (userRole !== "ADMIN") {
      return NextResponse.redirect(
        new URL("/unauthorized", req.nextUrl.origin)
      );
    }
  }

  // Vérifier les routes API admin
  if (isApiRoute && pathname.startsWith("/api/admin") && isLoggedIn) {
    const userRole = req.auth?.user?.role;
    if (userRole !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
