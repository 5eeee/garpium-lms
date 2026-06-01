import type { NextAuthOptions } from "next-auth";
import type { Role } from "@prisma/client";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import AzureADProvider from "next-auth/providers/azure-ad";
import { hash, compare } from "bcryptjs";
import { db } from "@/lib/db";
import {
  CorporateOidcProvider,
  SberbankProvider,
  TBankProvider,
  VkProvider,
  YandexProvider,
  companySsoProvider,
  readClientCertMaterial
} from "@/lib/oauth-providers";

type AuthUser = {
  role?: Role;
  approvalStatus?: "PENDING" | "APPROVED" | "REJECTED";
};

export type AuthProviderInfo = {
  id: string;
  label: string;
  kind: "social" | "bank" | "corporate";
  className: string;
  icon: string;
  logo?: string;
};

const providerMeta: Record<string, Omit<AuthProviderInfo, "id">> = {
  google: {
    label: "Google",
    kind: "social",
    className: "auth-oauth__btn--google",
    icon: "G",
    logo: "/oauth/google.svg"
  },
  yandex: {
    label: "Яндекс",
    kind: "social",
    className: "auth-oauth__btn--yandex",
    icon: "Я",
    logo: "/oauth/yandex.svg"
  },
  vk: { label: "VK", kind: "social", className: "auth-oauth__btn--vk", icon: "VK", logo: "/oauth/vk.svg" },
  tbank: { label: "T-Bank", kind: "bank", className: "auth-oauth__btn--tbank", icon: "T" },
  sberbank: { label: "Сбер ID", kind: "bank", className: "auth-oauth__btn--sberbank", icon: "S" },
  "corporate-oidc": {
    label: process.env.OIDC_NAME || "Корпоративный SSO",
    kind: "corporate",
    className: "auth-oauth__btn--corporate",
    icon: "SSO"
  },
  "azure-ad": {
    label: "Microsoft / Azure AD",
    kind: "corporate",
    className: "auth-oauth__btn--azure",
    icon: "MS"
  }
};

async function ensureOAuthUser(
  email: string,
  name?: string | null,
  opts?: { companyId?: string | null; autoApprove?: boolean }
) {
  const normalized = email.toLowerCase().trim();
  let user = await db.user.findUnique({ where: { email: normalized } });

  if (!user) {
    const fallbackCompany = await db.company.findUnique({ where: { slug: "garpium" } });
    const parts = (name || "Новый пользователь").trim().split(/\s+/);
    const firstName = parts[0] || "Новый";
    const lastName = parts.slice(1).join(" ") || "Пользователь";

    user = await db.user.create({
      data: {
        email: normalized,
        firstName,
        lastName,
        passwordHash: await hash(crypto.randomUUID(), 12),
        role: "PUBLIC_USER",
        approvalStatus: opts?.autoApprove ? "APPROVED" : "PENDING",
        companyId: opts?.companyId || fallbackCompany?.id
      }
    });
  }

  return user;
}

async function resolveCompanyFromProvider(providerId: string) {
  if (!providerId.startsWith("sso-")) return null;
  const slug = providerId.slice(4);
  return db.company.findUnique({ where: { slug } });
}

async function buildProviders(): Promise<NextAuthOptions["providers"]> {
  const list: NextAuthOptions["providers"] = [
    CredentialsProvider({
      name: "Email and password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          const email = credentials?.email?.toLowerCase().trim();
          const password = credentials?.password || "";
          if (!email || !password) return null;

          const user = await db.user.findUnique({ where: { email } });
          if (!user?.passwordHash) return null;

          const ok = await compare(password, user.passwordHash);
          if (!ok) return null;

          return {
            id: user.id,
            email: user.email,
            name: `${user.firstName} ${user.lastName}`,
            role: user.role,
            approvalStatus: user.approvalStatus
          };
        } catch (error) {
          console.error("[auth] credentials error:", error);
          return null;
        }
      }
    })
  ];

  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    list.push(
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET
      })
    );
  }

  if (process.env.YANDEX_CLIENT_ID && process.env.YANDEX_CLIENT_SECRET) {
    list.push(
      YandexProvider({
        clientId: process.env.YANDEX_CLIENT_ID,
        clientSecret: process.env.YANDEX_CLIENT_SECRET
      })
    );
  }

  if (process.env.VK_CLIENT_ID && process.env.VK_CLIENT_SECRET) {
    list.push(
      VkProvider({
        clientId: process.env.VK_CLIENT_ID,
        clientSecret: process.env.VK_CLIENT_SECRET
      })
    );
  }

  if (process.env.TBANK_CLIENT_ID && process.env.TBANK_CLIENT_SECRET) {
    list.push(
      TBankProvider({
        clientId: process.env.TBANK_CLIENT_ID,
        clientSecret: process.env.TBANK_CLIENT_SECRET
      })
    );
  }

  const sberCert = readClientCertMaterial();
  if (
    process.env.SBERBANK_CLIENT_ID &&
    process.env.SBERBANK_CLIENT_SECRET &&
    sberCert
  ) {
    list.push(
      SberbankProvider({
        clientId: process.env.SBERBANK_CLIENT_ID,
        clientSecret: process.env.SBERBANK_CLIENT_SECRET,
        certMaterial: sberCert,
        authUrl: process.env.SBERBANK_AUTH_URL,
        tokenUrl: process.env.SBERBANK_TOKEN_URL,
        userinfoUrl: process.env.SBERBANK_USERINFO_URL
      })
    );
  }

  if (process.env.OIDC_ISSUER && process.env.OIDC_CLIENT_ID && process.env.OIDC_CLIENT_SECRET) {
    list.push(
      CorporateOidcProvider({
        id: "corporate-oidc",
        name: process.env.OIDC_NAME || "Корпоративный SSO",
        issuer: process.env.OIDC_ISSUER,
        clientId: process.env.OIDC_CLIENT_ID,
        clientSecret: process.env.OIDC_CLIENT_SECRET
      })
    );
  }

  if (
    process.env.AZURE_AD_CLIENT_ID &&
    process.env.AZURE_AD_CLIENT_SECRET &&
    process.env.AZURE_AD_TENANT_ID
  ) {
    list.push(
      AzureADProvider({
        clientId: process.env.AZURE_AD_CLIENT_ID,
        clientSecret: process.env.AZURE_AD_CLIENT_SECRET,
        tenantId: process.env.AZURE_AD_TENANT_ID
      })
    );
  }

  try {
    const companies = await db.company.findMany({
      where: {
        ssoEnabled: true,
        ssoIssuer: { not: null },
        ssoClientId: { not: null },
        ssoClientSecret: { not: null }
      },
      select: {
        slug: true,
        name: true,
        ssoLabel: true,
        ssoIssuer: true,
        ssoClientId: true,
        ssoClientSecret: true
      }
    });

    for (const company of companies) {
      if (!company.ssoIssuer || !company.ssoClientId || !company.ssoClientSecret) continue;
      list.push(
        companySsoProvider({
          slug: company.slug,
          name: company.name,
          ssoLabel: company.ssoLabel,
          ssoIssuer: company.ssoIssuer,
          ssoClientId: company.ssoClientId,
          ssoClientSecret: company.ssoClientSecret
        })
      );
    }
  } catch (error) {
    console.error("[auth] company SSO providers error:", error);
  }

  return list;
}

export async function listAvailableAuthProviders(): Promise<AuthProviderInfo[]> {
  const providers = await buildProviders();
  const result: AuthProviderInfo[] = [];

  for (const provider of providers) {
    if (provider.id === "credentials") continue;
    const meta = providerMeta[provider.id];
    if (meta) {
      result.push({ id: provider.id, ...meta });
      continue;
    }
    if (provider.id.startsWith("sso-")) {
      result.push({
        id: provider.id,
        label: provider.name || provider.id,
        kind: "corporate",
        className: "auth-oauth__btn--corporate",
        icon: "SSO"
      });
    }
  }

  return result;
}

let cachedOptions: NextAuthOptions | null = null;
let cacheAt = 0;

export async function getAuthOptions(): Promise<NextAuthOptions> {
  if (cachedOptions && Date.now() - cacheAt < 60_000) {
    return cachedOptions;
  }

  if (!process.env.NEXTAUTH_SECRET) {
    throw new Error("NEXTAUTH_SECRET is not set in .env");
  }

  cachedOptions = {
    secret: process.env.NEXTAUTH_SECRET,
    session: { strategy: "jwt" },
    pages: {
      signIn: "/login",
      error: "/auth/error"
    },
    providers: await buildProviders(),
    callbacks: {
      async signIn({ user, account }) {
        try {
          if (!account || account.provider === "credentials") return true;
          if (!user.email) return false;

          const company = account.provider ? await resolveCompanyFromProvider(account.provider) : null;
          await ensureOAuthUser(user.email, user.name, {
            companyId: company?.id,
            autoApprove: company?.ssoAutoApprove ?? false
          });
          return true;
        } catch (error) {
          console.error("[auth] signIn callback error:", error);
          return false;
        }
      },
      async jwt({ token, user, account }) {
        try {
          if (user?.email && account && account.provider !== "credentials") {
            const company = await resolveCompanyFromProvider(account.provider);
            const dbUser = await ensureOAuthUser(user.email, user.name, {
              companyId: company?.id,
              autoApprove: company?.ssoAutoApprove ?? false
            });
            token.sub = dbUser.id;
            token.role = dbUser.role;
            token.approvalStatus = dbUser.approvalStatus;
            return token;
          }

          if (user) {
            const authUser = user as AuthUser;
            token.role = authUser.role;
            token.approvalStatus = authUser.approvalStatus;
          } else if (token.sub) {
            const dbUser = await db.user.findUnique({ where: { id: token.sub } });
            if (dbUser) {
              token.role = dbUser.role;
              token.approvalStatus = dbUser.approvalStatus;
            }
          }
          return token;
        } catch (error) {
          console.error("[auth] jwt callback error:", error);
          return token;
        }
      },
      async session({ session, token }) {
        if (session.user) {
          session.user.id = token.sub;
          session.user.role = token.role;
          session.user.approvalStatus = token.approvalStatus;
        }
        return session;
      }
    }
  };

  cacheAt = Date.now();
  return cachedOptions;
}
