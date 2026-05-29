import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import connectDB from "./mongodb";
import Admin from "@/models/Admin";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        await connectDB();

        const admin = await Admin.findOne({
          email: credentials.email.toLowerCase().trim(),
        });

        if (!admin) {
          return null;
        }

        const isValid = await bcrypt.compare(
          credentials.password,
          admin.passwordHash
        );

        if (!isValid) {
          return null;
        }

        return {
          id: admin._id.toString(),
          name: admin.name,
          email: admin.email,
          role: admin.role,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role: string }).role;
        token.name = user.name;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          id: token.id as string,
          name: token.name as string,
          email: token.email as string,
          role: token.role as "Organizer" | "Door staff",
        };
      }
      return session;
    },
  },
  pages: {
    signIn: "/admin/login",
    error: "/admin/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
