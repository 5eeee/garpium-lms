import type { Role } from "@prisma/client";

export type PlatformRole = Role;

declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      firstName?: string | null;
      lastName?: string | null;
      avatarUrl?: string | null;
      role?: PlatformRole;
      approvalStatus?: "PENDING" | "APPROVED" | "REJECTED";
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: PlatformRole;
    approvalStatus?: "PENDING" | "APPROVED" | "REJECTED";
    firstName?: string | null;
    lastName?: string | null;
    avatarUrl?: string | null;
  }
}
