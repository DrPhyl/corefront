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
      <div className="min-h-screen flex items-center justify-center bg-[#070b14]">
        <div className="w-6 h-6 border-2 border-[#2563eb] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  const frameworks = [
    { id: "react", name: "React", color: "text-cyan-400" },
    { id: "vue", name: "Vue", color: "text-emerald-400" },
    { id: "svelte", name: "Svelte", color: "text-orange-400" },
  ] as const;

  return (
    <div className="min-h-screen bg-[#070b14] flex flex-col">
      {/* Top bar */}
      <header className="h-12 border-b border-[#1e2d4a] flex items-center px-4">
        <Link href="/dashboard" className="flex items-center gap-4">
          <span className="text-[#2563eb] text-lg">⬡</span>
          <span className="text-[#1e2d4a]">/</span>
          <span className="text-[#f0f4ff] text-sm">New Project</span>
        </Link>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-lg">
          <div className="text-center mb-8">
            <h1 className="text-[#f0f4ff] text-2xl font-semibold mb-2">Create new project</h1>
            <p className="text-[#3a4a6b] text-sm">Describe what you want to build</p>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-[#ef4444]/10 border border-[#ef4444]/20 rounded-lg text-[#ef4444] text-sm">
              {error}
            </div>
          )}

          <div className="space-y-6">
            {/* Project name */}
            <div>
              <label className="block text-[#7c8db5] text-sm mb-2">Project name</label>
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
              <label className="block text-[#7c8db5] text-sm mb-2">Framework</label>
              <div className="grid grid-cols-3 gap-3">
                {frameworks.map((fw) => (
                  <button
                    key={fw.id}
                    onClick={() => setFramework(fw.id)}
                    className={`p-4 rounded-lg border transition-all text-center ${
                      framework === fw.id
                        ? "border-[#2563eb] bg-[#0d1427]"
                        : "border-[#1e2d4a] bg-[#0d1427] hover:border-[#2a4070]"
                    }`}
                  >
                    <div className={`text-sm font-medium ${fw.color}`}>{fw.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Prompt */}
            <div>
              <label className="block text-[#7c8db5] text-sm mb-2">Description</label>
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
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
      <div className="min-h-screen flex items-center justify-center bg-[#070b14]">
        <div className="w-6 h-6 border-2 border-[#2563eb] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <NewProjectContent />
    </Suspense>
  );
}
