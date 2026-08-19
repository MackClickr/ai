import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, parseSession } from "@/lib/session";

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const raw = request.cookies.get(SESSION_COOKIE)?.value;
  const session = await parseSession(raw);
  if (session) {
    return NextResponse.next();
  }
  const response = NextResponse.redirect(new URL("/", request.url));
  if (raw) {
    response.cookies.delete(SESSION_COOKIE);
  }
  return response;
}

export const config = {
  matcher: ["/chat/:path*"],
};
