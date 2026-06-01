import type { OAuthConfig, OAuthUserConfig } from "next-auth/providers/oauth";
import fs from "fs";
import https from "https";

type OidcProfile = Record<string, string | undefined>;

type TBankProfile = {
  sub?: string;
  name?: string;
  given_name?: string;
  family_name?: string;
  middle_name?: string;
  email?: string;
  phone_number?: string;
};

type SberProfile = {
  sub?: string;
  email?: string;
  phone_number?: string;
  given_name?: string;
  family_name?: string;
  middle_name?: string;
  name?: string;
};

function generateRquid() {
  return crypto.randomUUID().replace(/-/g, "");
}

function oauthEmailFromProfile(profile: { sub?: string; email?: string; phone_number?: string }, domain: string) {
  if (profile.email) return profile.email.toLowerCase().trim();
  const phone = profile.phone_number?.replace(/\D/g, "");
  if (phone) return `+${phone}@${domain}`;
  return `${profile.sub || "user"}@${domain}`;
}

export function readClientCertMaterial() {
  const certPath = process.env.SBERBANK_CLIENT_CERT_PATH;
  const keyPath = process.env.SBERBANK_CLIENT_KEY_PATH;
  if (certPath && keyPath && fs.existsSync(certPath) && fs.existsSync(keyPath)) {
    return {
      cert: fs.readFileSync(certPath),
      key: fs.readFileSync(keyPath)
    };
  }

  const cert = process.env.SBERBANK_CLIENT_CERT;
  const key = process.env.SBERBANK_CLIENT_KEY;
  if (cert && key) {
    return {
      cert: Buffer.from(cert.replace(/\\n/g, "\n")),
      key: Buffer.from(key.replace(/\\n/g, "\n"))
    };
  }

  return null;
}

async function fetchWithClientCert(url: string, init: RequestInit, material: { cert: Buffer; key: Buffer }) {
  return new Promise<Response>((resolve, reject) => {
    const parsed = new URL(url);
    const body = init.body ? String(init.body) : undefined;

    const request = https.request(
      {
        hostname: parsed.hostname,
        port: parsed.port || 443,
        path: `${parsed.pathname}${parsed.search}`,
        method: init.method || "GET",
        cert: material.cert,
        key: material.key,
        headers: init.headers as Record<string, string>
      },
      (response) => {
        const chunks: Buffer[] = [];
        response.on("data", (chunk) => chunks.push(chunk));
        response.on("end", () => {
          const text = Buffer.concat(chunks).toString("utf8");
          resolve(
            new Response(text, {
              status: response.statusCode || 500,
              headers: response.headers as HeadersInit
            })
          );
        });
      }
    );

    request.on("error", reject);
    if (body) request.write(body);
    request.end();
  });
}

export function TBankProvider(options: OAuthUserConfig<TBankProfile>): OAuthConfig<TBankProfile> {
  return {
    id: "tbank",
    name: "T-Bank",
    type: "oauth",
    authorization: {
      url: "https://id.tbank.ru/auth/authorize",
      params: { scope: "openid email phone profile", response_type: "code" }
    },
    token: "https://id.tbank.ru/auth/token",
    userinfo: {
      url: "https://id.tbank.ru/api/v1/userinfo",
      async request({ tokens }) {
        const response = await fetch("https://id.tbank.ru/api/v1/userinfo", {
          headers: {
            Authorization: `Bearer ${tokens.access_token}`,
            Accept: "application/json"
          }
        });
        return response.json();
      }
    },
    profile(profile) {
      const fullName = profile.name || [profile.family_name, profile.given_name, profile.middle_name].filter(Boolean).join(" ");
      return {
        id: profile.sub || "tbank-user",
        name: fullName || "Пользователь T-Bank",
        email: oauthEmailFromProfile(profile, "tbank.oauth")
      };
    },
    options
  };
}

export function SberbankProvider(
  options: OAuthUserConfig<SberProfile> & {
    certMaterial: { cert: Buffer; key: Buffer };
    authUrl?: string;
    tokenUrl?: string;
    userinfoUrl?: string;
  }
): OAuthConfig<SberProfile> {
  const authUrl = options.authUrl || "https://id.sber.ru/CSAFront/oidc/authorize.do";
  const tokenUrl = options.tokenUrl || "https://oauth.sber.ru/ru/prod/tokens/v2/oidc";
  const userinfoUrl = options.userinfoUrl || "https://oauth.sber.ru/ru/prod/sberbankid/v2.1/userinfo";

  return {
    id: "sberbank",
    name: "Сбер ID",
    type: "oauth",
    authorization: {
      url: authUrl,
      params: {
        scope: "openid email name",
        client_type: "PRIVATE",
        response_type: "code"
      }
    },
    checks: ["pkce", "state"],
    token: {
      url: tokenUrl,
      async request({ params, provider }) {
        const rquid = generateRquid();
        const body = new URLSearchParams({
          grant_type: "authorization_code",
          code: String(params.code || ""),
          client_id: provider.clientId || "",
          client_secret: provider.clientSecret || "",
          redirect_uri: provider.callbackUrl || ""
        });

        if (params.code_verifier) {
          body.set("code_verifier", String(params.code_verifier));
        }

        const response = await fetchWithClientCert(
          tokenUrl,
          {
            method: "POST",
            headers: {
              accept: "application/json",
              "content-type": "application/x-www-form-urlencoded",
              rquid
            },
            body
          },
          options.certMaterial
        );

        const tokens = (await response.json()) as Record<string, unknown>;
        if (!response.ok) {
          throw new Error(`Sber token error: ${JSON.stringify(tokens)}`);
        }

        return {
          tokens: {
            ...tokens,
            sber_rquid: rquid
          }
        };
      }
    },
    userinfo: {
      url: userinfoUrl,
      async request({ tokens }) {
        const rquid = String((tokens as { sber_rquid?: string }).sber_rquid || generateRquid());
        const response = await fetch(userinfoUrl, {
          headers: {
            authorization: `Bearer ${tokens.access_token}`,
            "x-introspect-rquid": rquid,
            accept: "application/json"
          }
        });

        if (!response.ok) {
          throw new Error(`Sber userinfo error: ${response.status}`);
        }

        return response.json();
      }
    },
    profile(profile) {
      const fullName =
        profile.name || [profile.family_name, profile.given_name, profile.middle_name].filter(Boolean).join(" ");
      return {
        id: profile.sub || "sber-user",
        name: fullName || "Пользователь Сбер ID",
        email: oauthEmailFromProfile(profile, "sber.oauth")
      };
    },
    options
  };
}

export function YandexProvider(
  options: OAuthUserConfig<{ id: string; real_name?: string; display_name?: string; default_email?: string; default_avatar_id?: string }>
): OAuthConfig<{ id: string; real_name?: string; display_name?: string; default_email?: string; default_avatar_id?: string }> {
  return {
    id: "yandex",
    name: "Yandex",
    type: "oauth",
    authorization: {
      url: "https://oauth.yandex.ru/authorize",
      params: { scope: "login:email login:info" }
    },
    token: "https://oauth.yandex.ru/token",
    userinfo: "https://login.yandex.ru/info?format=json",
    profile(profile) {
      return {
        id: profile.id,
        name: profile.real_name || profile.display_name || "Пользователь",
        email: profile.default_email,
        image: profile.default_avatar_id
          ? `https://avatars.yandex.net/get-yapic/${profile.default_avatar_id}/islands-200`
          : null
      };
    },
    options
  };
}

type VkProfile = {
  response?: Array<{
    id: number;
    first_name?: string;
    last_name?: string;
    photo_200?: string;
  }>;
};

type VkIdUserResponse = {
  user?: {
    user_id?: string;
    first_name?: string;
    last_name?: string;
    email?: string;
    avatar?: string;
    phone?: string;
  };
};

function isVkIdClient(clientId?: string) {
  return Boolean(clientId && !/^\d+$/.test(clientId));
}

function legacyVkProvider(options: OAuthUserConfig<VkProfile>): OAuthConfig<VkProfile> {
  return {
    id: "vk",
    name: "VK",
    type: "oauth",
    authorization: {
      url: "https://oauth.vk.com/authorize",
      params: { scope: "email", v: "5.131", display: "page" }
    },
    token: "https://oauth.vk.com/access_token?v=5.131",
    userinfo: {
      url: "https://api.vk.com/method/users.get",
      async request({ tokens }) {
        const response = await fetch(
          `https://api.vk.com/method/users.get?access_token=${tokens.access_token}&fields=photo_200&v=5.131`
        );
        return response.json();
      }
    },
    profile(profile, tokens) {
      const user = profile.response?.[0];
      const email = (tokens as { email?: string }).email || `vk_${user?.id || "user"}@oauth.local`;
      return {
        id: String(user?.id || tokens.sub),
        name: [user?.first_name, user?.last_name].filter(Boolean).join(" ") || "Пользователь VK",
        email,
        image: user?.photo_200 || null
      };
    },
    options
  };
}

function vkIdProvider(options: OAuthUserConfig<VkIdUserResponse>): OAuthConfig<VkIdUserResponse> {
  return {
    id: "vk",
    name: "VK",
    type: "oauth",
    client: {
      token_endpoint_auth_method: "none"
    },
    authorization: {
      url: "https://id.vk.ru/authorize",
      params: {
        scope: "email",
        response_type: "code"
      }
    },
    checks: ["pkce", "state"],
    token: {
      url: "https://id.vk.ru/oauth2/auth",
      async request({ params, provider, checks }) {
        const body = new URLSearchParams({
          grant_type: "authorization_code",
          code: String(params.code || ""),
          client_id: provider.clientId || "",
          redirect_uri: provider.callbackUrl || "",
          code_verifier: String(checks.code_verifier || ""),
          device_id: String(params.device_id || ""),
          state: String(params.state || "")
        });

        const response = await fetch("https://id.vk.ru/oauth2/auth", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body
        });

        const tokens = (await response.json()) as Record<string, unknown>;
        if (!response.ok) {
          throw new Error(`VK ID token error: ${JSON.stringify(tokens)}`);
        }

        return { tokens };
      }
    },
    userinfo: {
      url: "https://id.vk.ru/oauth2/user_info",
      async request({ tokens, provider }) {
        const body = new URLSearchParams({
          client_id: provider.clientId || "",
          access_token: String(tokens.access_token || "")
        });

        const response = await fetch("https://id.vk.ru/oauth2/user_info", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body
        });

        if (!response.ok) {
          throw new Error(`VK ID userinfo error: ${response.status}`);
        }

        return response.json();
      }
    },
    profile(profile) {
      const user = profile.user;
      const email =
        user?.email ||
        oauthEmailFromProfile({ sub: user?.user_id, phone_number: user?.phone }, "vk.oauth");
      return {
        id: user?.user_id || "vk-user",
        name: [user?.first_name, user?.last_name].filter(Boolean).join(" ") || "Пользователь VK",
        email,
        image: user?.avatar || null
      };
    },
    options
  };
}

export function VkProvider(options: OAuthUserConfig<VkProfile | VkIdUserResponse>): OAuthConfig<VkProfile | VkIdUserResponse> {
  if (isVkIdClient(options.clientId)) {
    return vkIdProvider(options as OAuthUserConfig<VkIdUserResponse>) as OAuthConfig<VkProfile | VkIdUserResponse>;
  }

  return legacyVkProvider(options as OAuthUserConfig<VkProfile>) as OAuthConfig<VkProfile | VkIdUserResponse>;
}

export function CorporateOidcProvider(
  options: OAuthUserConfig<OidcProfile> & { id?: string; name?: string; issuer?: string }
): OAuthConfig<OidcProfile> {
  const issuer = options.issuer?.replace(/\/$/, "") || "";
  return {
    id: options.id || "corporate-oidc",
    name: options.name || "Корпоративный SSO",
    type: "oauth",
    wellKnown: `${issuer}/.well-known/openid-configuration`,
    authorization: { params: { scope: "openid email profile" } },
    idToken: true,
    checks: ["pkce", "state"],
    profile(profile) {
      return {
        id: profile.sub || profile.id || profile.email || "oidc-user",
        name: profile.name || profile.preferred_username || "Сотрудник",
        email: profile.email
      };
    },
    options
  };
}

export function companySsoProvider(company: {
  slug: string;
  name: string;
  ssoLabel: string | null;
  ssoIssuer: string;
  ssoClientId: string;
  ssoClientSecret: string;
}): OAuthConfig<OidcProfile> {
  return CorporateOidcProvider({
    id: `sso-${company.slug}`,
    name: company.ssoLabel || `${company.name} SSO`,
    issuer: company.ssoIssuer,
    clientId: company.ssoClientId,
    clientSecret: company.ssoClientSecret
  });
}
