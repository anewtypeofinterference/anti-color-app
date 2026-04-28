import NextAuth from "next-auth";

import { authOptions } from "@/lib/authOptions";

/** Session / CSRF handlers must stay dynamic — never statically cached. */
export const dynamic = "force-dynamic";

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
