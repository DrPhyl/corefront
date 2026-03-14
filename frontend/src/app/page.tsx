"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [prompt, setPrompt] = useState("");

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      router.push(`/register?prompt=${encodeURIComponent(prompt)}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#7c3aed] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Animated gradient mesh background */}
      <div className="gradient-mesh" />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7c3aed] to-[#8b5cf6] flex items-center justify-center">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <span className="text-white font-semibold text-lg">Corefront</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link href="#features" className="text-[#94a3b8] hover:text-white transition-colors text-sm">
              Features
            </Link>
            <Link href="#pricing" className="text-[#94a3b8] hover:text-white transition-colors text-sm">
              Pricing
            </Link>
            <Link href="/login" className="text-[#94a3b8] hover:text-white transition-colors text-sm">
              Sign in
            </Link>
            <Link
              href="/register"
              className="bg-[#7c3aed] hover:bg-[#8b5cf6] text-white px-4 py-2 rounded-lg text-sm font-medium transition-all hover:shadow-lg hover:shadow-[#7c3aed]/25"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#7c3aed]/10 border border-[#7c3aed]/20 mb-8">
              <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
              <span className="text-[#94a3b8] text-sm">Now powered by Claude AI</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Build full-stack apps
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7c3aed] to-[#8b5cf6]">
                with AI
              </span>
            </h1>
            <p className="text-xl text-[#94a3b8] mb-12 max-w-2xl mx-auto">
              Describe what you want to build, and watch as AI generates production-ready
              React, Vue, or Svelte code in seconds.
            </p>
          </div>

          {/* Prompt Input Bar */}
          <form onSubmit={handleSubmit} className="animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            <div className="relative max-w-2xl mx-auto">
              <div className="absolute inset-0 bg-gradient-to-r from-[#7c3aed]/20 to-[#8b5cf6]/20 rounded-2xl blur-xl" />
              <div className="relative glass-card p-2">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe the app you want to build..."
                    className="flex-1 bg-transparent border-none outline-none px-4 py-4 text-white placeholder:text-[#64748b] text-lg"
                  />
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-[#7c3aed] to-[#8b5cf6] text-white px-6 py-4 rounded-xl font-medium transition-all hover:shadow-lg hover:shadow-[#7c3aed]/25 flex items-center gap-2"
                  >
                    <span>Start Building</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </form>

          {/* Example prompts */}
          <div className="flex flex-wrap justify-center gap-3 mt-8 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
            {["Todo app with animations", "Dashboard with charts", "E-commerce product page"].map((example) => (
              <button
                key={example}
                onClick={() => setPrompt(example)}
                className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[#94a3b8] text-sm hover:bg-white/10 hover:text-white transition-all"
              >
                {example}
              </button>
            ))}
          </div>
        </div>

        {/* Floating Preview Cards */}
        <div className="max-w-6xl mx-auto mt-20 relative">
          <div className="grid grid-cols-3 gap-6">
            <div className="glass-card p-4 animate-float">
              <div className="aspect-video rounded-lg bg-gradient-to-br from-[#1a1a24] to-[#0a0a0f] mb-3 flex items-center justify-center">
                <div className="text-[#7c3aed] text-4xl">⚡</div>
              </div>
              <div className="h-2 w-3/4 bg-white/10 rounded mb-2" />
              <div className="h-2 w-1/2 bg-white/5 rounded" />
            </div>
            <div className="glass-card p-4 animate-float" style={{ animationDelay: "1s" }}>
              <div className="aspect-video rounded-lg bg-gradient-to-br from-[#7c3aed]/20 to-[#1a1a24] mb-3 overflow-hidden">
                <div className="p-3 font-mono text-xs text-[#94a3b8]">
                  <div className="text-[#7c3aed]">const</div>
                  <div className="ml-2">App = () {"=>"}</div>
                </div>
              </div>
              <div className="h-2 w-2/3 bg-white/10 rounded mb-2" />
              <div className="h-2 w-1/3 bg-white/5 rounded" />
            </div>
            <div className="glass-card p-4 animate-float-delayed">
              <div className="aspect-video rounded-lg bg-gradient-to-br from-[#10b981]/20 to-[#1a1a24] mb-3 flex items-center justify-center">
                <div className="text-[#10b981] text-4xl">✓</div>
              </div>
              <div className="h-2 w-4/5 bg-white/10 rounded mb-2" />
              <div className="h-2 w-2/5 bg-white/5 rounded" />
            </div>
          </div>
        </div>
      </section>

      {/* Logos Section */}
      <section className="py-16 px-6 border-y border-white/5">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-[#64748b] text-sm mb-8">TRUSTED BY DEVELOPERS FROM</p>
          <div className="flex items-center justify-center gap-12 opacity-50">
            {["Google", "Meta", "Stripe", "Vercel", "GitHub"].map((company) => (
              <span key={company} className="text-[#94a3b8] text-lg font-semibold">{company}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Everything you need to ship fast</h2>
            <p className="text-[#94a3b8] text-lg max-w-2xl mx-auto">
              From idea to production in minutes, not months. Corefront handles the complexity so you can focus on building.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: "⚡",
                title: "Instant Generation",
                description: "Get production-ready code in seconds. No more boilerplate, no more setup.",
                color: "#7c3aed"
              },
              {
                icon: "🎨",
                title: "Beautiful by Default",
                description: "Every component is styled with Tailwind CSS and follows modern design principles.",
                color: "#8b5cf6"
              },
              {
                icon: "🔧",
                title: "Fully Customizable",
                description: "Export your code and customize every detail. You own what you build.",
                color: "#a78bfa"
              },
              {
                icon: "🚀",
                title: "One-Click Deploy",
                description: "Deploy to Vercel, Netlify, or Railway with a single click.",
                color: "#10b981"
              },
              {
                icon: "🔄",
                title: "Real-time Preview",
                description: "See your changes instantly with hot reload and live preview.",
                color: "#3b82f6"
              },
              {
                icon: "🤖",
                title: "Claude AI Powered",
                description: "Built on Anthropic's Claude for superior code quality and understanding.",
                color: "#f59e0b"
              }
            ].map((feature) => (
              <div
                key={feature.title}
                className="glass-card p-6 hover:border-[#7c3aed]/30 transition-all group cursor-pointer"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4"
                  style={{ background: `${feature.color}20` }}
                >
                  {feature.icon}
                </div>
                <h3 className="text-white font-semibold text-lg mb-2 group-hover:text-[#7c3aed] transition-colors">
                  {feature.title}
                </h3>
                <p className="text-[#94a3b8] text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Simple, transparent pricing</h2>
            <p className="text-[#94a3b8] text-lg">Start free. Upgrade when you need more.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Free */}
            <div className="glass-card p-8">
              <h3 className="text-white font-semibold text-lg mb-2">Free</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-white">$0</span>
                <span className="text-[#94a3b8]">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                {["5 projects", "Basic components", "Community support", "Export code"].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-[#94a3b8] text-sm">
                    <svg className="w-5 h-5 text-[#10b981]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className="block w-full text-center py-3 rounded-lg border border-white/20 text-white hover:bg-white/5 transition-all"
              >
                Get Started
              </Link>
            </div>

            {/* Pro */}
            <div className="glass-card p-8 border-[#7c3aed]/50 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-[#7c3aed] to-[#8b5cf6] rounded-full text-white text-xs font-medium">
                Most Popular
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">Pro</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-white">$20</span>
                <span className="text-[#94a3b8]">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                {["Unlimited projects", "All components", "Priority support", "Custom domains", "Team collaboration"].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-[#94a3b8] text-sm">
                    <svg className="w-5 h-5 text-[#10b981]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className="block w-full text-center py-3 rounded-lg bg-gradient-to-r from-[#7c3aed] to-[#8b5cf6] text-white font-medium hover:shadow-lg hover:shadow-[#7c3aed]/25 transition-all"
              >
                Start Free Trial
              </Link>
            </div>

            {/* Enterprise */}
            <div className="glass-card p-8">
              <h3 className="text-white font-semibold text-lg mb-2">Enterprise</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-white">Custom</span>
              </div>
              <ul className="space-y-3 mb-8">
                {["Everything in Pro", "SSO & SAML", "Dedicated support", "SLA guarantee", "Custom integrations"].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-[#94a3b8] text-sm">
                    <svg className="w-5 h-5 text-[#10b981]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className="block w-full text-center py-3 rounded-lg border border-white/20 text-white hover:bg-white/5 transition-all"
              >
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Ready to build something amazing?</h2>
          <p className="text-[#94a3b8] text-lg mb-8">
            Join thousands of developers shipping faster with AI.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#7c3aed] to-[#8b5cf6] text-white px-8 py-4 rounded-xl font-medium text-lg transition-all hover:shadow-lg hover:shadow-[#7c3aed]/25"
          >
            Start Building Free
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7c3aed] to-[#8b5cf6] flex items-center justify-center">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <span className="text-white font-semibold">Corefront</span>
          </div>
          <div className="flex items-center gap-6 text-[#94a3b8] text-sm">
            <Link href="#" className="hover:text-white transition-colors">Twitter</Link>
            <Link href="#" className="hover:text-white transition-colors">GitHub</Link>
            <Link href="#" className="hover:text-white transition-colors">Discord</Link>
          </div>
          <p className="text-[#64748b] text-sm">© 2024 Corefront. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
