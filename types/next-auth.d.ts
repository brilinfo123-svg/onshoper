import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email?: string;
      contact?: string; // ✅ Add this line
      name?: string;
      image?: string;
    };
  }

  interface User {
    id: string;
    email?: string;
    contact?: string; // ✅ Add this line
  }
}
