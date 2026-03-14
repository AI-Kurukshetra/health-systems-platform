import { NextResponse, type NextRequest } from "next/server";

import { getDashboardPathByRole, parseAppRole } from "@/lib/roles";
import { createSupabaseMiddlewareClient } from "@/lib/supabase/middleware";

const roleRouteMap: Record<string, Array<"admin" | "provider" | "patient">> = {
  "/admin": ["admin"],
  "/doctor": ["provider"],
  "/patient": ["patient"],
};

const authOnlyPrefixes = ["/admin", "/doctor", "/patient", "/chat"];
const guestOnlyPrefixes = ["/login", "/signup"];

function getAllowedRoles(pathname: string) {
  for (const prefix of Object.keys(roleRouteMap)) {
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) {
      return roleRouteMap[prefix];
    }
  }

  return null;
}

function matchesPrefix(pathname: string, prefixes: string[]) {
  return prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/health") ||
    pathname.startsWith("/api/graphql") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  const { supabase, response, configError } = createSupabaseMiddlewareClient(request);

  if (!supabase) {
    console.error(`[middleware] ${configError}`);

    if (matchesPrefix(pathname, authOnlyPrefixes)) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("error", "config");
      return NextResponse.redirect(url);
    }

    return response;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const role = parseAppRole(user?.user_metadata.role ?? user?.app_metadata.role);
  const dashboardPath = role ? getDashboardPathByRole(role) : null;

  if (pathname === "/") {
    if (dashboardPath) {
      const url = request.nextUrl.clone();
      url.pathname = dashboardPath;
      return NextResponse.redirect(url);
    }

    return response;
  }

  if (matchesPrefix(pathname, guestOnlyPrefixes) && dashboardPath) {
    const url = request.nextUrl.clone();
    url.pathname = dashboardPath;
    return NextResponse.redirect(url);
  }

  if (matchesPrefix(pathname, authOnlyPrefixes) && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  const requiredRoles = getAllowedRoles(pathname);

  if (user && requiredRoles && (!role || !requiredRoles.includes(role))) {
    const url = request.nextUrl.clone();
    url.pathname = dashboardPath ?? "/login";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
