import type { NextApiRequest, NextApiResponse } from "next";

const {
  AUTHACTION_TENANT_DOMAIN: TENANT_DOMAIN = "",
  AUTHACTION_PASSKEY_CLIENT_ID: CLIENT_ID = "",
  AUTHACTION_PASSKEY_CLIENT_SECRET: CLIENT_SECRET = "",
  AUTHACTION_APP_ID: APP_ID = "",
} = process.env;

let cached: { token: string; expiresAt: number } | null = null;

export async function getAccessToken(): Promise<string> {
  const now = Date.now();
  if (cached && cached.expiresAt > now) {
    return cached.token;
  }

  const res = await fetch(`https://${TENANT_DOMAIN}/oauth2/m2m/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      audience: `https://${TENANT_DOMAIN}`,
      grant_type: "client_credentials",
    }),
  });

  if (!res.ok) {
    throw new Error(`M2M token fetch failed: ${res.status}`);
  }

  const { access_token, expires_in } = await res.json();
  cached = {
    token: access_token,
    expiresAt: now + expires_in * 1000 - 5000,
  };
  return access_token;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).end("Method Not Allowed");
  }

  const rawType = req.query.type;
  const type = Array.isArray(rawType) ? rawType[0] : rawType;
  if (typeof type !== "string" || !["register", "authenticate"].includes(type)) {
    return res.status(400).json({ error: "Invalid or missing transaction type" });
  }

  const { externalId, displayName } = req.body;
  if (!externalId || !displayName) {
    return res.status(400).json({ error: "Missing fields" });
  }

  try {
    const token = await getAccessToken();
    let apiRes;
    if (type === "register") {
      apiRes = await fetch(
        `https://${TENANT_DOMAIN}/api/v1/passkey-plus/${APP_ID}/transaction/register`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ externalId, displayName }),
        }
      );
    }
    else {
      apiRes = await fetch(
        `https://${TENANT_DOMAIN}/api/v1/passkey-plus/${APP_ID}/transaction/authenticate`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ externalId, displayName }),
        }
      );
    }

    if (!apiRes.ok) {
      const err = await apiRes.text();
      return res.status(apiRes.status).json({ error: err });
    }

    const payload = await apiRes.json();
    const inner = payload.data;
    if (!inner?.transactionId) {
      console.error("Unexpected transaction response:", payload);
      return res
        .status(500)
        .json({ error: "AuthAction returned no transaction ID" });
    }

    return res.status(200).json({
      transactionId: inner.transactionId,
      id: inner.id,
      verified: inner.verified,
    });
  } catch (e: any) {
    console.error("Passkey transaction error:", e);
    return res.status(500).json({ error: e.message });
  }
}
