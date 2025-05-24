import type { NextApiRequest, NextApiResponse } from "next";
import { getAccessToken } from "./transaction";

const { AUTHACTION_TENANT_DOMAIN: TENANT_DOMAIN = "", AUTHACTION_APP_ID: APP_ID = "" } = process.env;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).end("Method Not Allowed");
  }

  const { transactionId, nonce } = req.body;
  if (!transactionId || !nonce) {
    return res.status(400).json({ error: "Missing transactionId or nonce" });
  }

  try {
    const token = await getAccessToken();
    const apiRes = await fetch(
      `https://${TENANT_DOMAIN}/api/v1/passkey-plus/${APP_ID}/authenticate/verify`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nonce }),
      }
    );

    if (!apiRes.ok) {
      const err = await apiRes.text();
      return res.status(apiRes.status).json({ error: err });
    }

    const user = await apiRes.json();
    return res.status(200).json(user);
  } catch (e: any) {
    console.error("Passkey verify error:", e);
    return res.status(500).json({ error: e.message });
  }
}
