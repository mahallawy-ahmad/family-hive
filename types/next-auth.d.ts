import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session extends DefaultSession {
    userId: string;
    memberId?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId: string;
    memberId?: string;
  }
}
