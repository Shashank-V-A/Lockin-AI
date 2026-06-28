import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

const googleClientId = process.env.AUTH_GOOGLE_ID;
const googleClientSecret = process.env.AUTH_GOOGLE_SECRET;

if (!process.env.AUTH_SECRET) {
  throw new Error("AUTH_SECRET is missing from environment variables.");
}

if (!googleClientId || !googleClientSecret) {
  throw new Error("AUTH_GOOGLE_ID and AUTH_GOOGLE_SECRET are required.");
}

/** Auth.js configuration — Google OAuth only. */
export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  basePath: "/api/auth",
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: googleClientId,
      clientSecret: googleClientSecret,
    }),
  ],
  pages: {
    signIn: "/",
  },
  session: {
    strategy: "database",
  },
  callbacks: {
    session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
});

/** Expected Google OAuth redirect URI — must match Google Cloud Console exactly. */
export const GOOGLE_REDIRECT_URI = `${process.env.AUTH_URL ?? "http://localhost:3000"}/api/auth/callback/google`;
