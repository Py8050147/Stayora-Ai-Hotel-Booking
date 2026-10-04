import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Pages that require sign-in (change to your real routes)
const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/admin(.*)",
  "/bookings(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  console.log("PROXY RUNNING:", req.nextUrl.pathname);
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/__clerk/:path*",
    "/(api|trpc)(.*)",
  ],
};
