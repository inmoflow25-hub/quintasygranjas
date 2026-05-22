import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl

  if (pathname === "/zona-norte" || pathname.startsWith("/zona-norte/")) {
    const url = req.nextUrl.clone()
    url.pathname = "/"
    url.search = search
    return NextResponse.redirect(url, 308)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/zona-norte/:path*"]
}
