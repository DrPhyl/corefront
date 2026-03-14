"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import type { Project } from "@/types";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function BuilderPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [prompt, setPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<"preview" | "code" | "files">("code");
  const [splitPosition, setSplitPosition] = useState(40);
  const [isDragging, setIsDragging] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && projectId !== "new") {
      loadProject();
    }
  }, [user, projectId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadProject = async () => {
    try {
      const data = await api.getProject(Number(projectId));
      setProject(data);
      if (data.prompt) {
        setMessages([
          {
            id: "1",
            role: "user",
            content: data.prompt,
            timestamp: new Date(data.created_at),
          },
          {
            id: "2",
            role: "assistant",
            content: `Generated your ${data.framework} application. Check the Code tab to see the output.`,
            timestamp: new Date(data.updated_at),
          },
        ]);
      }
    } catch (err) {
      console.error("Failed to load project:", err);
    }
  };

  const handleSend = async () => {
    if (!prompt.trim() || generating) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: prompt,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setPrompt("");
    setGenerating(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Updated the code based on your feedback. Check the Code tab.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } finally {
      setGenerating(false);
    }
  };

  const handleMouseDown = () => setIsDragging(true);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const newPosition = ((e.clientX - rect.left) / rect.width) * 100;
    setSplitPosition(Math.max(25, Math.min(75, newPosition)));
  };

  const handleMouseUp = () => setIsDragging(false);

  const copyCode = () => {
    if (project?.generated_code) {
      navigator.clipboard.writeText(project.generated_code);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#09090b]">
        <div className="w-6 h-6 border-2 border-[#f97316] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div
      ref={containerRef}
      className="h-screen bg-[#09090b] flex flex-col overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Top bar - 48px */}
      <header className="h-12 border-b border-[#27272a] flex items-center justify-between px-4 shrink-0 bg-[#09090b]">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-gradient text-lg font-bold">⬡</Link>
          <span className="text-[#3f3f46]">/</span>
          <span className="text-[#fafafa] text-sm font-medium">{project?.name || "New Project"}</span>
          {project && (
            <span className="text-[#52525b] text-xs uppercase tracking-wider">{project.framework}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button className="btn btn-ghost text-sm py-1.5 px-3">Share</button>
          <button className="btn btn-primary text-sm py-1.5 px-3">Deploy</button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left panel - Chat */}
        <div
          className="flex flex-col bg-[#111113] border-r border-[#27272a]"
          style={{ width: `${splitPosition}%` }}
        >
          {/* Model selector */}
          <div className="h-10 border-b border-[#27272a] flex items-center px-4 bg-[#09090b]">
            <select className="bg-transparent text-[#a1a1aa] text-sm focus:outline-none cursor-pointer">
              <option>Claude 3.5 Sonnet</option>
              <option>Claude 3 Opus</option>
            </select>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="text-[#52525b] text-sm">Start a conversation</div>
                </div>
              </div>
            ) : (
              messages.map((message) => (
                <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] rounded-lg px-4 py-2.5 ${
                    message.role === "user"
                      ? "bg-gradient-to-r from-[#f97316] to-[#ec4899] text-white"
                      : "bg-[#18181b] text-[#fafafa] border border-[#27272a]"
                  }`}>
                    <p className="text-sm">{message.content}</p>
                  </div>
                </div>
              ))
            )}
            {generating && (
              <div className="flex justify-start">
                <div className="bg-[#18181b] border border-[#27272a] rounded-lg px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-gradient-to-r from-[#f97316] to-[#ec4899] rounded-full animate-pulse" />
                    <span className="text-[#a1a1aa] text-sm">Generating...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-[#27272a] bg-[#09090b]">
            <div className="relative">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Ask to modify the code..."
                rows={2}
                className="w-full px-4 py-3 bg-[#18181b] border border-[#27272a] rounded-lg text-[#fafafa] placeholder-[#52525b] text-sm focus:outline-none focus:border-[#f97316] resize-none pr-12"
              />
              <button
                onClick={handleSend}
                disabled={!prompt.trim() || generating}
                className="absolute bottom-3 right-3 w-8 h-8 flex items-center justify-center rounded-md bg-gradient-to-r from-[#f97316] to-[#ec4899] text-white disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Resizer */}
        <div
          className="w-px bg-gradient-to-b from-[#f97316] to-[#ec4899] cursor-col-resize hover:w-0.5 transition-all"
          onMouseDown={handleMouseDown}
        />

        {/* Right panel - Code */}
        <div className="flex-1 flex flex-col bg-[#09090b]">
          {/* Tab bar */}
          <div className="h-10 border-b border-[#27272a] flex items-center px-4 gap-1">
            {(["preview", "code", "files"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative px-3 py-1.5 text-sm rounded transition-colors ${
                  activeTab === tab
                    ? "text-[#fafafa]"
                    : "text-[#52525b] hover:text-[#a1a1aa]"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                {activeTab === tab && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#f97316] to-[#ec4899]" />
                )}
              </button>
            ))}
            <div className="flex-1" />
            {activeTab === "code" && (
              <button onClick={copyCode} className="text-[#52525b] hover:text-[#a1a1aa] text-sm transition-colors">
                Copy
              </button>
            )}
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-auto">
            {activeTab === "preview" && (
              <div className="h-full flex items-center justify-center text-[#52525b] text-sm">
                Preview coming soon
              </div>
            )}

            {activeTab === "code" && (
              <div className="h-full font-mono text-sm">
                {project?.generated_code ? (
                  <pre className="p-4 overflow-auto h-full">
                    <code>
                      {project.generated_code.split("\n").map((line, i) => (
                        <div key={i} className="flex">
                          <span className="w-12 text-right pr-4 text-[#3f3f46] select-none">{i + 1}</span>
                          <span className="text-[#fafafa]">{line || " "}</span>
                        </div>
                      ))}
                    </code>
                  </pre>
                ) : (
                  <div className="h-full flex items-center justify-center text-[#52525b]">
                    No code generated yet
                  </div>
                )}
              </div>
            )}

            {activeTab === "files" && (
              <div className="p-4">
                <div className="text-[#52525b] text-sm">
                  {project ? (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-[#a1a1aa]">
                        <span>📄</span>
                        <span>App.tsx</span>
                      </div>
                      <div className="flex items-center gap-2 text-[#a1a1aa]">
                        <span>📄</span>
                        <span>index.css</span>
                      </div>
                    </div>
                  ) : (
                    "No files yet"
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
