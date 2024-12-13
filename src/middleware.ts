import { NextResponse, NextRequest } from "next/server";

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  try {
    const session = await fetch("http://localhost:3000/api/auth", {
      headers: request.headers,
    });
    const sessionData = await session.json();

    const referrer = request.url;
    const path = ["/login", referrer ? `redirectTo=${referrer}` : undefined]
      .filter(Boolean)
      .join("?");

    if (!sessionData || !sessionData.user) {
      return NextResponse.redirect(new URL(path, request.url));
    }

    if (
      !sessionData.permissions
        .map((p: any) => p.resource)
        .includes(request.nextUrl.pathname)
    ) {
      return NextResponse.redirect(new URL("/404", request.url));
    }
  } catch (error) {
    console.log("fetch session error", error);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|login|register|404|$).*)", // 除了 login/ register/ api/ _next/static/ _next/image/ favicon.ico 和根路径(/) 的路径都匹配
  ],
};
