import GoogleProvider from "next-auth/providers/google";

/**
 * NextAuth configuration (App Router).
 *
 * Required env (see deployment / .env.local):
 * - NEXTAUTH_SECRET — required; without it JWT handling fails and /api/auth/session returns 500 HTML.
 * - GOOGLE_ID / GOOGLE_SECRET — Google OAuth client
 * - NEXTAUTH_URL — optional in dev; in production set to the public site URL (https://…)
 */
if (!process.env.NEXTAUTH_SECRET && process.env.NODE_ENV === "production") {
  console.error(
    "[auth] NEXTAUTH_SECRET is missing — set it in the environment before running in production."
  );
}

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
      authorization: { params: { hd: "anti.as", prompt: "select_account" } },
    }),
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/login", error: "/login" },
  callbacks: {
    async signIn({ account, profile }) {
      return (
        account.provider === "google" &&
        profile.email_verified &&
        profile.email.toLowerCase().endsWith("@anti.as")
      );
    },
    async jwt({ token, user }) {
      if (user) {
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        if (token.email) session.user.email = token.email;
        if (token.name) session.user.name = token.name;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
