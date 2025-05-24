"use client";
import React, { useState } from "react";
import PasskeyAuth from "./components/PasskeyAuth";

export default function LoginPage() {
  const [externalId, setExternalId] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e:any) => {
    e.preventDefault();
    if (externalId.trim() && displayName.trim()) {
      setSubmitted(true);
    } else {
      alert("Please enter both External ID and Display Name.");
    }
  };

  const handleSuccess = () => {
    const user = { username: displayName, ExternalId: externalId };
    localStorage.setItem("authUser", JSON.stringify(user));
    window.location.href = "/Dashboard";
  };

  return (
    <div className="h-screen w-screen py-12 flex justify-center items-center">

      {!submitted ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="mb-4 flex flex-col">
            <label htmlFor="externalId" className="block text-sm font-medium">
              External ID
            </label>
            <input
              id="externalId"
              type="text"
              value={externalId}
              onChange={(e) => setExternalId(e.target.value)}
              className="mt-1 block w-full text-black border border-gray-300 rounded-md p-2"
              placeholder="e.g. user-1234"
            />
          </div>

          <div>
            <label htmlFor="displayName" className="block text-sm font-medium">
              Display Name
            </label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="mt-1 block w-full text-black border border-gray-300 rounded-md p-2"
              placeholder="e.g. Jane Doe"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
          >
            Continue
          </button>
        </form>
      ) : (
        <PasskeyAuth
          externalId={externalId}
          displayName={displayName}
          onSuccess={handleSuccess} 
          onError={(msg) => console.error("Passkey error:", msg)}
        />
      )}
    </div>
  );
}
