"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";

function NewProjectContent() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [name, setName] = useState("");
  const [prompt, setPrompt] = useState("");
  const [framework, setFramework] = useState<"react" | "vue" | "svelte">("react");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const promptParam = searchParams.get("prompt");
    if (promptParam) {
      setPrompt(promptParam);
      const words = promptParam.split(" ").slice(0, 3).join(" ");
      setName(words.charAt(0).toUpperCase() + words.slice(1));
    }
  }, [searchParams]);

  const handleGenerate = async () => {
    if (!name.trim() || !prompt.trim()) return;

    setError("");
    setGenerating(true);

    try {
      const project = await api.generateCode({ name, prompt, framework });
      router.push(`/builder/${project.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
      setGenerating(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#000]">
        <div className="w-6 h-6 border-2 border-[#00dc82] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  const frameworks = [
    { id: "react", name: "React", icon: "⚛️" },
    { id: "vue", name: "Vue", icon: "💚" },
    { id: "svelte", name: "Svelte", icon: "🔥" },
  ] as const;

  return (
    <div className="min-h-screen bg-[#000] flex flex-col">
      {/* Top bar */}
      <header className="h-12 border-b border-[#222] flex items-center px-4">
        <Link href="/dashboard" className="flex items-center gap-4">
          <span className="text-[#00dc82] text-lg">⬡</span>
          <span className="text-[#333]">/</span>
          <span className="text-[#ededed] text-sm">New Project</span>
        </Link>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-lg">
          <div className="text-center mb-8">
            <h1 className="text-[#ededed] text-2xl font-semibold mb-2">Create new project</h1>
            <p className="text-[#444] text-sm">Describe what you want to build</p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-[#ef4444]/10 border border-[#ef4444]/20 rounded-lg text-[#ef4444] text-sm">
              {error}
            </div>
          )}

          <div className="space-y-6">
            {/* Project name */}
            <div>
              <label className="block text-[#888] text-sm mb-2">Project name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My App"
                className="input"
              />
            </div>

            {/* Framework */}
            <div>
              <label className="block text-[#888] text-sm mb-2">Framework</label>
              <div className="grid grid-cols-3 gap-3">
                {frameworks.map((fw) => (
                  <button
                    key={fw.id}
                    onClick={() => setFramework(fw.id)}
                    className={`p-4 rounded-lg border transition-all text-center ${
                      framework === fw.id
                        ? "bg-[#00dc82]/10 border-[#00dc82] text-[#ededed]"
                        : "bg-[#111] border-[#222] text-[#888] hover:border-[#333]"
                    }`}
                  >
                    <div className="text-2xl mb-1">{fw.icon}</div>
                    <div className="text-sm">{fw.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Prompt */}
            <div>
              <label className="block text-[#888] text-sm mb-2">Description</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="A modern task manager with drag-and-drop, categories, and due dates..."
                rows={4}
                className="input resize-none"
              />
            </div>

            {/* Generate button */}
            <button
              onClick={handleGenerate}
              disabled={!name.trim() || !prompt.trim() || generating}
              className="btn btn-primary w-full py-3 disabled:opacity-50"
            >
              {generating ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-[#000] border-t-transparent rounded-full animate-spin" />
                  Generating...
                </div>
              ) : (
                <>Generate →</>
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function NewProjectPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#000]">
        <div className="w-6 h-6 border-2 border-[#00dc82] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <NewProjectContent />
    </Suspense>
  );
}
