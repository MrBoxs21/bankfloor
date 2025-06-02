import { withAuth } from "next-auth/middleware"

export default withAuth(
  function middleware(req) {
    // Add any additional middleware logic here
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Protect these routes
        const protectedPaths = ["/create-blog", "/profile", "/settings", "/my-blogs"]
        const isProtectedPath = protectedPaths.some((path) => req.nextUrl.pathname.startsWith(path))

        if (isProtectedPath) {
          return !!token
        }

        return true
      },
    },
  },
)

export const config = {
  matcher: ["/create-blog/:path*", "/profile/:path*", "/settings/:path*", "/my-blogs/:path*"],
}
