"use client";

import React, { useState } from "react";
import { PasskeyPlus } from "@authaction/passkey-plus-sdk";

interface PasskeyAuthProps {
  externalId: string;
  displayName: string;
  onSuccess?: () => void;
  onError?: (message: string) => void;
}

const passkeyPlus = new PasskeyPlus({
  tenantDomain: process.env.NEXT_PUBLIC_AUTHACTION_TENANT_DOMAIN!,
  appId: process.env.NEXT_PUBLIC_AUTHACTION_APP_ID!,
});

const PasskeyAuth: React.FC<PasskeyAuthProps> = ({
  externalId,
  displayName,
  onSuccess,
  onError,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError]   = useState<string | null>(null);

  const handleTransaction = async (type: "register" | "authenticate") => {
    setError(null);
    setLoading(true);

    try {
      const txRes = await fetch(`/api/auth/passkey/transaction?type=${type}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ externalId, displayName }),
      });
      const tx = await txRes.json();
      if (!tx.transactionId) {
        throw new Error(tx.error || "No transactionId returned");
      }

      const nonce =
        type === "register"
          ? await passkeyPlus.register(tx.transactionId, { authenticatorAttachment: "platform" })
          : await passkeyPlus.authenticate(tx.transactionId, { isConditionalMediation: true });

      const verifyRes = await fetch("/api/auth/passkey/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactionId: tx.transactionId, nonce }),
      });
      const verify = await verifyRes.json();
      if (verify.error) {
        throw new Error(verify.error);
      }

      onSuccess?.();
    } catch (e: any) {
      const msg = e?.message ?? "Unknown error";
      setError(msg);
      onError?.(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <button
        onClick={() => handleTransaction("register")}
        disabled={loading}
        className="w-full px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
      >
        {loading ? "Processing…" : "Register with Passkey"}
      </button>

      <button
        onClick={() => handleTransaction("authenticate")}
        disabled={loading}
        className="w-full px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
      >
        {loading ? "Processing…" : "Login with Passkey"}
      </button>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
          {error}
        </div>
      )}
    </div>
  );
};

export default PasskeyAuth;
