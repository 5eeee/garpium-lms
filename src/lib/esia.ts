const ESIA_AUTH_URL = "https://esia.gosuslugi.ru/aas/oauth2/v2/ac";

export function getEsiaAuthorizeUrl(state: string, redirectUri: string) {
  const clientId = process.env.ESIA_CLIENT_ID;
  if (!clientId) return null;

  const scope = process.env.ESIA_SCOPE || "openid fullname email mobile";
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope,
    state,
    access_type: "online",
    timestamp: new Date().toISOString()
  });

  return `${ESIA_AUTH_URL}?${params.toString()}`;
}

export function getEsiaRedirectUri(origin: string) {
  return process.env.ESIA_REDIRECT_URI || `${origin}/api/auth/esia/callback`;
}
