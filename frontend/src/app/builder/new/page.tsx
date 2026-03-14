"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
      // Auto-generate name from prompt
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
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-400">Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col">
      {/* Animated background */}
      <div className="gradient-mesh" />

      {/* Top bar */}
      <header className="h-14 border-b border-white/10 bg-[#0a0a0f]/80 backdrop-blur-xl flex items-center px-4">
        <button
          onClick={() => router.push("/dashboard")}
          className="p-2 text-gray-400 hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <div className="flex items-center gap-3 ml-4">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="text-white font-medium">New Project</span>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-2xl">
          <div className="glass-card p-8 glow-purple">
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Create New Project</h1>
              <p className="text-gray-400">Describe what you want to build and let AI generate the code.</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-6">
              {/* Project name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Project Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="My Awesome App"
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all"
                />
              </div>

              {/* Framework selection */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Framework</label>
                <div className="grid grid-cols-3 gap-3">
                  {(["react", "vue", "svelte"] as const).map((fw) => (
                    <button
                      key={fw}
                      onClick={() => setFramework(fw)}
                      className={`p-4 rounded-xl border transition-all ${
                        framework === fw
                          ? "bg-purple-500/20 border-purple-500/50 text-white"
                          : "bg-white/5 border-white/10 text-gray-400 hover:border-white/20 hover:text-white"
                      }`}
                    >
                      <div className="text-center">
                        <div className={`w-10 h-10 mx-auto mb-2 rounded-lg flex items-center justify-center ${
                          fw === "react"
                            ? "bg-cyan-500/20"
                            : fw === "vue"
                              ? "bg-emerald-500/20"
                              : "bg-orange-500/20"
                        }`}>
                          {fw === "react" && (
                            <svg className="w-6 h-6 text-cyan-400" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 10.11c1.03 0 1.87.84 1.87 1.89 0 1-.84 1.85-1.87 1.85S10.13 13 10.13 12c0-1.05.84-1.89 1.87-1.89M7.37 20c.63.38 2.01-.2 3.6-1.7-.52-.59-1.03-1.23-1.51-1.9a22.7 22.7 0 01-2.4-.36c-.51 2.14-.32 3.61.31 3.96m.71-5.74l-.29-.51c-.11.29-.22.58-.29.86.27.06.57.11.88.16l-.3-.51m6.54-.76l.81-1.5-.81-1.5c-.3-.53-.62-1-.91-1.47C13.17 9 12.6 9 12 9c-.6 0-1.17 0-1.71.03-.29.47-.61.94-.91 1.47L8.57 12l.81 1.5c.3.53.62 1 .91 1.47.54.03 1.11.03 1.71.03.6 0 1.17 0 1.71-.03.29-.47.61-.94.91-1.47M12 6.78c-.19.22-.39.45-.59.72h1.18c-.2-.27-.4-.5-.59-.72m0 10.44c.19-.22.39-.45.59-.72h-1.18c.2.27.4.5.59.72M16.62 4c-.62-.38-2 .2-3.59 1.7.52.59 1.03 1.23 1.51 1.9.82.08 1.63.2 2.4.36.51-2.14.32-3.61-.32-3.96m-.7 5.74l.29.51c.11-.29.22-.58.29-.86-.27-.06-.57-.11-.88-.16l.3.51m1.45-7.05c1.47.84 1.63 3.05 1.01 5.63 2.54.75 4.37 1.99 4.37 3.68 0 1.69-1.83 2.93-4.37 3.68.62 2.58.46 4.79-1.01 5.63-1.46.84-3.45-.12-5.37-1.95-1.92 1.83-3.91 2.79-5.38 1.95-1.46-.84-1.62-3.05-1-5.63-2.54-.75-4.37-1.99-4.37-3.68 0-1.69 1.83-2.93 4.37-3.68-.62-2.58-.46-4.79 1-5.63 1.47-.84 3.46.12 5.38 1.95 1.92-1.83 3.91-2.79 5.37-1.95M17.08 12c.34.75.64 1.5.89 2.26 2.1-.63 3.28-1.53 3.28-2.26 0-.73-1.18-1.63-3.28-2.26-.25.76-.55 1.51-.89 2.26M6.92 12c-.34-.75-.64-1.5-.89-2.26-2.1.63-3.28 1.53-3.28 2.26 0 .73 1.18 1.63 3.28 2.26.25-.76.55-1.51.89-2.26m9 2.26l-.3.51c.31-.05.61-.1.88-.16-.07-.28-.18-.57-.29-.86l-.29.51m-2.89 4.04c1.59 1.5 2.97 2.08 3.59 1.7.64-.35.83-1.82.32-3.96-.77.16-1.58.28-2.4.36-.48.67-.99 1.31-1.51 1.9M8.08 9.74l.3-.51c-.31.05-.61.1-.88.16.07.28.18.57.29.86l.29-.51m2.89-4.04C9.38 4.2 8 3.62 7.37 4c-.63.35-.82 1.82-.31 3.96a22.7 22.7 0 012.4-.36c.48-.67.99-1.31 1.51-1.9z" />
                            </svg>
                          )}
                          {fw === "vue" && (
                            <svg className="w-6 h-6 text-emerald-400" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M2 3h3.5L12 15l6.5-12H22L12 21 2 3m4.5 0h3L12 7.58 14.5 3h3L12 13.08 6.5 3z" />
                            </svg>
                          )}
                          {fw === "svelte" && (
                            <svg className="w-6 h-6 text-orange-400" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M10.354 21.125a4.44 4.44 0 01-4.765-1.767 4.109 4.109 0 01-.703-3.107 3.898 3.898 0 01.134-.522l.105-.321.287.21a7.21 7.21 0 002.186 1.092l.208.063-.019.208a1.253 1.253 0 00.234.765c.267.39.686.602 1.16.603a1.27 1.27 0 00.453-.082l.115-.042.106-.05 4.888-2.778a1.174 1.174 0 00.56-.751 1.212 1.212 0 00-.205-.927 1.355 1.355 0 00-1.16-.603 1.27 1.27 0 00-.453.082l-.115.042-.106.05-1.867 1.061c-.3.171-.635.294-.986.358a4.44 4.44 0 01-4.765-1.767 4.109 4.109 0 01-.703-3.107 3.855 3.855 0 011.833-2.466l4.888-2.778c.3-.171.635-.294.986-.358a4.44 4.44 0 014.765 1.767c.53.79.735 1.74.58 2.646a3.898 3.898 0 01-.134.522l-.105.321-.287-.21a7.21 7.21 0 00-2.186-1.092l-.208-.063.019-.208a1.253 1.253 0 00-.234-.765 1.355 1.355 0 00-1.16-.603 1.27 1.27 0 00-.453.082l-.115.042-.106.05-4.888 2.778a1.174 1.174 0 00-.56.751c-.059.344.037.684.205.927.267.39.686.602 1.16.603a1.27 1.27 0 00.453-.082l.115-.042.106-.05 1.867-1.061c.3-.171.635-.294.986-.358a4.44 4.44 0 014.765 1.767c.53.79.735 1.74.58 2.646a3.855 3.855 0 01-1.833 2.466l-4.888 2.778c-.3.171-.635.294-.986.358z" />
                            </svg>
                          )}
                        </div>
                        <span className="text-sm font-medium capitalize">{fw}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Prompt */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Describe Your App</label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="A modern todo list app with the ability to add tasks, mark them as complete, and delete them. Include a clean UI with smooth animations..."
                  rows={5}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all resize-none"
                />
              </div>

              {/* Generate button */}
              <button
                onClick={handleGenerate}
                disabled={!name.trim() || !prompt.trim() || generating}
                className="w-full btn-primary py-4 text-lg flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Generating your app...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Generate Code
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function NewProjectPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-400">Loading...</span>
        </div>
      </div>
    }>
      <NewProjectContent />
    </Suspense>
  );
}
