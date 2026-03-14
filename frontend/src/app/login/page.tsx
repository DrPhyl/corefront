"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#09090b] p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="text-gradient text-3xl font-bold glow-accent-text">⬡</span>
            <span className="text-[#fafafa] font-semibold text-lg">corefront</span>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-[#111113] border border-[#27272a] rounded-xl p-8">
          <div className="text-center mb-6">
            <h1 className="text-[#fafafa] text-xl font-semibold mb-1">Welcome back</h1>
            <p className="text-[#52525b] text-sm">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-[#ef4444]/10 border border-[#ef4444]/20 rounded-lg text-[#ef4444] text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-[#a1a1aa] text-sm mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-[#a1a1aa] text-sm mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="input"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full py-3 disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </div>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-[#52525b] text-sm">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-[#f97316] hover:text-[#ec4899] transition-colors">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
