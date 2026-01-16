import { NextResponse, type NextRequest } from "next/server"
import { auth } from "./lib/auth"

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const session = await auth.api.getSession({
    headers: request.headers,
  })

  if (pathname === "/" && session) {
    return NextResponse.redirect(new URL("/home", request.url))
  }

  if (
    pathname === "/" ||
    pathname.startsWith("/signin") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon")
  ) {
    return NextResponse.next()
  }

  if (!session) {
    const signInUrl = new URL("/signin", request.url)
    signInUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(signInUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
}





