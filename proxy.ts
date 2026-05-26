import createMiddleware from "next-intl/middleware";

import { routing } from "./lib/i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Match all pathnames except those starting with /api, /_next, /_vercel, or containing a file extension.
  matcher: "/((?!api|_next|_vercel|.*\\..*).*)",
};
