"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

function LogoMark({ className = "" }: { className?: string }) {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className={`logo-mark ${className}`}>
      <path d="M8 16 L16 8 L24 16 L16 24 Z" fill="white" opacity="0.9"/>
      <path d="M4 16 L16 4 L28 16 L16 28" stroke="white" strokeWidth="1.5" fill="none" opacity="0.4"/>
      <circle cx="16" cy="16" r="2.5" fill="#2563eb"/>
    </svg>
  );
}

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await register(email, password, fullName || undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#070b14] p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3">
            <LogoMark className="w-10 h-10" />
            <span style={{fontFamily: "'Instrument Serif', Georgia, serif", fontStyle: 'italic', fontSize: '26px', color: '#ffffff', letterSpacing: '0.02em'}}>corefront</span>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-[#0d1427] border border-[#1e2d4a] rounded-xl p-8">
          <div className="text-center mb-6">
            <h1 className="text-white text-xl font-semibold mb-1">Create an account</h1>
            <p className="text-[#c8d4f0] text-sm">Start building with AI</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-[#ef4444]/10 border border-[#ef4444]/20 rounded-lg text-[#ef4444] text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="fullName" className="block text-[#7c8db5] text-sm mb-2">
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="input"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-[#7c8db5] text-sm mb-2">
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
              <label htmlFor="password" className="block text-[#7c8db5] text-sm mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="input"
              />
              <p className="mt-1.5 text-[#7c8db5] text-xs">Must be at least 8 characters</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full py-3 disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating account...
                </div>
              ) : (
                "Create account"
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-[#7c8db5] text-sm">
              Already have an account?{" "}
              <Link href="/login" className="text-[#2563eb] hover:text-[#60a5fa] transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
