"use client";

import React, { useEffect, useState } from "react";

type User = {
  username: string;
  ExternalId: string;
};

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("authUser");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        console.error("Failed to parse user info");
      }
    }
  }, []);

  if (!user) {
    return <div className="p-6 text-center">Loading user info…</div>;
  }

  return (
    <div className="w-screen h-screen mx-auto py-12 px-4 flex justify-center items-center flex-col">
      <h1 className="text-3xl font-bold mb-4">Welcome, {user.username}!</h1>
      <p className="text-lg">Your Id: <span className="font-medium">{user.ExternalId}</span></p>
    </div>
  );
}
