"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const suggestions = [
  "Todo app",
  "SaaS dashboard",
  "E-commerce",
  "Chat app",
];

const frameworks = [
  { name: "React", color: "text-cyan-400" },
  { name: "Vue", color: "text-emerald-400" },
  { name: "Svelte", color: "text-orange-400" },
  { name: "Next.js", color: "text-white" },
  { name: "FastAPI", color: "text-emerald-400" },
];

const steps = [
  {
    num: "01",
    title: "Describe",
    desc: "Tell us what you want to build in plain English. Be as detailed or as brief as you like.",
  },
  {
    num: "02",
    title: "Generate",
    desc: "Claude AI analyzes your requirements and generates production-ready code with best practices.",
  },
  {
    num: "03",
    title: "Deploy",
    desc: "Review, customize, and deploy your app with one click. It's that simple.",
  },
];

const pricing = [
  {
    name: "Free",
    price: "$0",
    desc: "For side projects",
    features: ["5 generations/month", "React & Vue", "Community support"],
    cta: "Get started",
    featured: false,
  },
  {
    name: "Pro",
    price: "$29",
    desc: "For professionals",
    features: ["Unlimited generations", "All frameworks", "Priority support", "Private projects", "API access"],
    cta: "Start free trial",
    featured: true,
  },
  {
    name: "Team",
    price: "$99",
    desc: "For teams",
    features: ["Everything in Pro", "Team collaboration", "SSO & SAML", "Dedicated support", "Custom integrations"],
    cta: "Contact sales",
    featured: false,
  },
];

export default function LandingPage() {
  const [prompt, setPrompt] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [typingIndex, setTypingIndex] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const terminalLines = [
    { type: "input", text: "Build a task manager with drag-and-drop" },
    { type: "output", text: "Analyzing requirements..." },
    { type: "output", text: "Generating React components..." },
    { type: "output", text: "Creating API endpoints..." },
    { type: "success", text: "✓ Generated 12 files in 4.2s" },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setTypingIndex((prev) => (prev + 1) % (terminalLines.length + 2));
    }, 1500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#09090b]">
      {/* NAV */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
          scrolled ? "bg-[#09090b]/80 backdrop-blur-xl border-b border-[#27272a]" : ""
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-gradient text-xl font-bold">⬡</span>
            <span className="text-[#fafafa] font-semibold">corefront</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <Link href="#" className="text-[#a1a1aa] hover:text-[#fafafa] text-sm transition-colors">Product</Link>
            <Link href="#" className="text-[#a1a1aa] hover:text-[#fafafa] text-sm transition-colors">Docs</Link>
            <Link href="#pricing" className="text-[#a1a1aa] hover:text-[#fafafa] text-sm transition-colors">Pricing</Link>
            <Link href="#" className="text-[#a1a1aa] hover:text-[#fafafa] text-sm transition-colors">Blog</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="btn btn-ghost text-sm">Sign in</Link>
            <Link href="/register" className="btn btn-primary text-sm py-2 px-4">
              Start building
              <span>→</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-16 bg-[#09090b]">
        <div className="dot-grid dot-grid-animated" />
        <div className="absolute inset-0 bg-glow-accent pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-[80px] text-[#fafafa] leading-[1.1] mb-6">
            Ship full-stack apps
            <br />
            at the speed of thought.
          </h1>

          <p className="text-[#a1a1aa] text-lg md:text-xl max-w-[560px] mx-auto mb-10">
            Describe what you want to build. Corefront generates the architecture,
            components, and APIs — powered by Claude AI.
          </p>

          <div className="max-w-[680px] mx-auto mb-6">
            <div className="relative group">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-gradient-to-r from-[#f97316] to-[#ec4899] animate-pulse-dot" />
              </div>
              <input
                type="text"
                placeholder="Describe your app... (e.g. a SaaS dashboard with auth)"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full pl-12 pr-32 py-5 bg-[#18181b] border border-[#27272a] rounded-full text-[#fafafa] placeholder-[#52525b] text-base focus:outline-none focus:border-[#f97316] focus:shadow-[0_0_30px_rgba(249,115,22,0.15)] transition-all"
              />
              <Link
                href={prompt ? `/builder/new?prompt=${encodeURIComponent(prompt)}` : "/register"}
                className="absolute right-2 top-1/2 -translate-y-1/2 btn btn-primary py-3 px-6"
              >
                Build →
              </Link>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => setPrompt(`Build a ${s.toLowerCase()}`)}
                className="px-3 py-1.5 text-sm text-[#f97316] border border-[#f97316]/30 rounded-full hover:bg-[#f97316]/10 hover:border-[#f97316]/50 transition-all"
              >
                → {s}
              </button>
            ))}
          </div>

          <p className="text-[#52525b] text-sm">
            Join 1,200+ developers building with AI
          </p>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <div className="w-6 h-10 rounded-full border border-[#27272a] flex items-start justify-center p-2">
            <div className="w-1 h-2 bg-[#52525b] rounded-full animate-bounce" />
          </div>
        </div>
      </section>

      {/* TERMINAL PREVIEW */}
      <section className="py-24 px-6 bg-[#111113]">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="card p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-3 h-3 rounded-full bg-[#ef4444]" />
                <span className="w-3 h-3 rounded-full bg-[#f59e0b]" />
                <span className="w-3 h-3 rounded-full bg-[#22c55e]" />
                <span className="text-[#52525b] text-xs ml-2 font-mono">chat</span>
              </div>
              <div className="space-y-4 font-mono text-sm">
                {terminalLines.slice(0, Math.min(typingIndex + 1, terminalLines.length)).map((line, i) => (
                  <div key={i} className={`flex items-start gap-3 ${i === typingIndex ? "animate-fade-in" : ""}`}>
                    {line.type === "input" && (
                      <>
                        <span className="text-[#f97316]">→</span>
                        <span className="text-[#fafafa]">{line.text}</span>
                      </>
                    )}
                    {line.type === "output" && (
                      <>
                        <span className="text-[#52525b]">│</span>
                        <span className="text-[#a1a1aa]">{line.text}</span>
                      </>
                    )}
                    {line.type === "success" && (
                      <>
                        <span className="text-[#ec4899]">│</span>
                        <span className="text-[#ec4899]">{line.text}</span>
                      </>
                    )}
                  </div>
                ))}
                {typingIndex < terminalLines.length && (
                  <span className="inline-block w-2 h-4 bg-gradient-to-b from-[#f97316] to-[#ec4899] animate-blink" />
                )}
              </div>
            </div>

            <div className="card p-6 bg-[#09090b] border-[#27272a]">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-3 h-3 rounded-full bg-[#ef4444]" />
                <span className="w-3 h-3 rounded-full bg-[#f59e0b]" />
                <span className="w-3 h-3 rounded-full bg-[#22c55e]" />
                <span className="text-[#52525b] text-xs ml-2 font-mono">TaskList.tsx</span>
              </div>
              <pre className="font-mono text-sm overflow-x-auto">
                <code>
                  <span className="text-[#52525b]">1  </span><span className="syntax-keyword">export function</span> <span className="syntax-function">TaskList</span>() {"{\n"}
                  <span className="text-[#52525b]">2  </span>  <span className="syntax-keyword">const</span> [tasks, setTasks] = <span className="syntax-function">useState</span>([]){";\n"}
                  <span className="text-[#52525b]">3  </span>{"  \n"}
                  <span className="text-[#52525b]">4  </span>  <span className="syntax-keyword">return</span> ({"{\n"}
                  <span className="text-[#52525b]">5  </span>    {"<"}<span className="syntax-keyword">div</span> className=<span className="syntax-string">"task-list"</span>{">"}{"{\n"}
                  <span className="text-[#52525b]">6  </span>      {"{"}tasks.<span className="syntax-function">map</span>((task) ={">"} ({"{\n"}
                  <span className="text-[#52525b]">7  </span>        {"<"}<span className="syntax-function">TaskItem</span> key={"{"}task.id{"}"} {"/>"}{"\n"}
                  <span className="text-[#52525b]">8  </span>      )){"}\n"}
                  <span className="text-[#52525b]">9  </span>    {"</"}<span className="syntax-keyword">div</span>{">"}{")\n"}
                  <span className="text-[#52525b]">10 </span>  {"}"}{")\n"}
                  <span className="text-[#52525b]">11 </span>{"}"}
                </code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-24 px-6 bg-[#09090b]">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display text-3xl md:text-4xl text-[#fafafa] text-center mb-16">
            How it works
          </h2>
          <div className="relative">
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-px bg-[#27272a]" />
            <div className="grid md:grid-cols-3 gap-6 relative">
              {steps.map((step) => (
                <div key={step.num} className="card p-6 border-l-gradient">
                  <span className="text-gradient font-mono text-sm mb-3 block">{step.num}</span>
                  <h3 className="text-[#fafafa] font-semibold text-lg mb-2">{step.title}</h3>
                  <p className="text-[#a1a1aa] text-sm">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FRAMEWORKS */}
      <section className="py-24 px-6 border-y border-[#27272a] bg-[#111113]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-[#52525b] text-sm uppercase tracking-wider mb-8">
            Supports your favorite frameworks
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            {frameworks.map((fw) => (
              <div
                key={fw.name}
                className="px-5 py-2.5 bg-[#18181b] border border-[#27272a] rounded-lg hover:border-[#3f3f46] transition-colors cursor-default"
              >
                <span className={`text-sm font-medium ${fw.color}`}>{fw.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="py-24 px-6 bg-[#09090b]">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display text-3xl md:text-4xl text-[#fafafa] text-center mb-4">
            Simple pricing
          </h2>
          <p className="text-[#a1a1aa] text-center mb-16 max-w-md mx-auto">
            Start free, upgrade when you need more power.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {pricing.map((plan) => (
              <div
                key={plan.name}
                className={plan.featured ? "card-featured p-6 rounded-xl" : "card p-6"}
              >
                <h3 className="text-[#fafafa] font-semibold mb-1">{plan.name}</h3>
                <p className="text-[#52525b] text-sm mb-4">{plan.desc}</p>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-[#fafafa] text-4xl font-semibold">{plan.price}</span>
                  <span className="text-[#52525b] text-sm">/month</span>
                </div>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-[#a1a1aa]">
                      <span className="text-[#f97316]">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/register"
                  className={`btn w-full ${plan.featured ? "btn-primary" : "btn-outline-accent"}`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-[#111113]">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-display text-3xl md:text-4xl text-[#fafafa] mb-4">
            Ready to build?
          </h2>
          <p className="text-[#a1a1aa] mb-8">
            Join thousands of developers shipping faster with AI.
          </p>
          <Link href="/register" className="btn btn-primary text-base py-3 px-8">
            Start building for free →
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[#27272a] py-12 px-6 bg-[#09090b]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <span className="text-gradient text-xl font-bold">⬡</span>
            <span className="text-[#a1a1aa] text-sm">
              corefront — Build apps at the speed of thought.
            </span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="#" className="text-[#52525b] hover:text-[#a1a1aa] text-sm transition-colors">Twitter</Link>
            <Link href="#" className="text-[#52525b] hover:text-[#a1a1aa] text-sm transition-colors">GitHub</Link>
            <Link href="#" className="text-[#52525b] hover:text-[#a1a1aa] text-sm transition-colors">Discord</Link>
            <span className="text-[#27272a]">|</span>
            <span className="text-[#52525b] text-sm flex items-center gap-1">
              Built with <span className="text-gradient">Claude AI</span>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
