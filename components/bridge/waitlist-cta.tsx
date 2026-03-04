"use client";

import { useState } from "react";

export function WaitlistCta() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setStatus("success");
        setEmail("");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="rounded-2xl border border-slate-700/50 bg-gradient-to-b from-slate-800/50 to-slate-900/50 p-6 md:p-8 text-center">
      <h3 className="text-xl md:text-2xl font-bold text-white mb-2">
        Want Yieldy to bridge for you?
      </h3>
      <p className="text-slate-400 mb-6 max-w-md mx-auto">
        One click, zero wallets, zero bridge risk. Join the waitlist for early
        access.
      </p>
      {status === "success" ? (
        <p className="text-emerald-400 font-medium">
          You&apos;re on the list! We&apos;ll be in touch.
        </p>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
        >
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="flex-1 px-4 py-3 rounded-xl bg-slate-800 border border-slate-600 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {status === "loading" ? "Joining..." : "Join Waitlist"}
          </button>
        </form>
      )}
      {status === "error" && (
        <p className="text-red-400 text-sm mt-2">
          Something went wrong. Please try again.
        </p>
      )}
    </div>
  );
}
