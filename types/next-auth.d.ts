import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: "ADMIN" | "USER" | "STAFF" | "MEMBER" | "CUSTOMER"
    } & DefaultSession["user"]
  }

  interface User {
    id: string
    role: "ADMIN" | "USER" | "STAFF" | "MEMBER" | "CUSTOMER"
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: "ADMIN" | "USER" | "STAFF" | "MEMBER" | "CUSTOMER"
  }
}