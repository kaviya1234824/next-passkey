"use client";

import PasskeyAuth from "./components/PasskeyAuth";


export default function LoginPage() {
 
  const externalId  = "user-1234";
  const displayName = "Jane Doe";

  return (
    <div className="max-w-md mx-auto py-12">
      <h1 className="text-2xl font-bold mb-6">Sign In with Passkey</h1>
      <PasskeyAuth
        externalId={externalId}
        displayName={displayName}
        onSuccess={() => (window.location.href = "/dashboard")}
        onError={(msg) => console.error("Passkey error:", msg)}
      />
    </div>
  );
}
