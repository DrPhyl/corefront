"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import type { Project } from "@/types";

export default function DashboardPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();

  const [prompt, setPrompt] = useState("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      loadProjects();
    }
  }, [user]);

  const loadProjects = async () => {
    try {
      const data = await api.getProjects();
      setProjects(data);
    } catch (err) {
      console.error("Failed to load projects:", err);
    }
  };

  const handleCreateProject = () => {
    if (prompt.trim()) {
      router.push(`/builder/new?prompt=${encodeURIComponent(prompt)}`);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getFrameworkStyle = (framework: string) => {
    const styles: Record<string, { text: string; color: string }> = {
      react: { text: "React", color: "text-cyan-400" },
      vue: { text: "Vue", color: "text-emerald-400" },
      svelte: { text: "Svelte", color: "text-orange-400" },
      nextjs: { text: "Next.js", color: "text-white" },
    };
    return styles[framework] || { text: framework, color: "text-gray-400" };
  };

  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0d0d0d]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-6 h-6 border-2 border-[#00dc82] border-t-transparent rounded-full animate-spin" />
          <span className="text-[#444] text-sm">Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0d0d0d] flex">
      {/* Sidebar - 64px, icons only */}
      <aside className="w-16 bg-[#0a0a0a] border-r border-[#1a1a1a] flex flex-col items-center py-4">
        {/* Logo */}
        <Link href="/" className="text-[#00dc82] text-xl mb-8">⬡</Link>

        {/* Nav icons */}
        <nav className="flex-1 flex flex-col items-center gap-2">
          <button className="w-10 h-10 rounded-lg bg-[#161616] flex items-center justify-center relative group">
            <svg className="w-5 h-5 text-[#ededed]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="absolute left-1 top-1 w-1.5 h-1.5 rounded-full bg-[#00dc82]" />
          </button>
          <button className="w-10 h-10 rounded-lg hover:bg-[#161616] flex items-center justify-center transition-colors group">
            <svg className="w-5 h-5 text-[#444] group-hover:text-[#888]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          </button>
          <button className="w-10 h-10 rounded-lg hover:bg-[#161616] flex items-center justify-center transition-colors group">
            <svg className="w-5 h-5 text-[#444] group-hover:text-[#888]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </nav>

        {/* User avatar */}
        <button
          onClick={logout}
          className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00dc82] to-[#00b368] flex items-center justify-center text-[#000] text-xs font-semibold"
        >
          {user.full_name?.[0] || user.email[0].toUpperCase()}
        </button>
      </aside>

      {/* Main content */}
      <div className="flex-1">
        {/* Top bar */}
        <header className="h-14 border-b border-[#1a1a1a] flex items-center justify-between px-6 bg-[#0a0a0a]">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-[#00dc82]">⬡</span>
            <span className="text-[#333]">/</span>
            <span className="text-[#ededed]">Dashboard</span>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-md mx-8">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#444]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[#161616] border border-[#222] rounded-lg text-[#ededed] placeholder-[#444] text-sm focus:outline-none focus:border-[#333] transition-colors"
              />
            </div>
          </div>

          {/* User info */}
          <span className="text-[#666] text-sm">{user.email}</span>
        </header>

        {/* Content */}
        <main className="p-8 max-w-6xl mx-auto">
          {/* Hero prompt section - FIRST thing users see */}
          <div className="text-center mb-12 pt-8">
            <h1 className="text-[#ededed] text-3xl font-semibold mb-3">
              What do you want to build today?
            </h1>
            <p className="text-[#666] text-base mb-8">
              Describe your app and let AI generate the code
            </p>
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder="A SaaS dashboard with authentication and billing..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreateProject()}
                  className="w-full px-6 py-4 bg-[#111] border border-[#222] rounded-2xl text-[#ededed] placeholder-[#444] text-base focus:outline-none focus:border-[#00dc82] focus:shadow-[0_0_30px_rgba(0,220,130,0.1)] transition-all pr-28"
                />
                <button
                  onClick={handleCreateProject}
                  disabled={!prompt.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 btn btn-primary py-2.5 px-5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Build →
                </button>
              </div>
            </div>
          </div>

          {/* Projects section header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-[#ededed] text-lg font-medium">Your projects</h2>
            <Link href="/builder/new" className="btn btn-secondary text-sm py-2 px-4">
              + New project
            </Link>
          </div>

          {/* Projects grid */}
          {filteredProjects.length === 0 ? (
            <div className="bg-[#111] border border-[#1a1a1a] rounded-xl p-16 text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[#161616] flex items-center justify-center">
                <svg className="w-8 h-8 text-[#333]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-[#ededed] font-medium text-lg mb-2">No projects yet</h3>
              <p className="text-[#666] text-sm mb-6">Create your first project to get started</p>
              <Link href="/builder/new" className="btn btn-primary py-2.5 px-6">
                Create project
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredProjects.map((project) => {
                const fw = getFrameworkStyle(project.framework);
                return (
                  <div
                    key={project.id}
                    onClick={() => router.push(`/builder/${project.id}`)}
                    className="bg-[#111] border border-[#1a1a1a] rounded-xl overflow-hidden cursor-pointer transition-all hover:border-[#00dc82]/50 hover:shadow-[0_0_30px_rgba(0,220,130,0.08)] group"
                  >
                    {/* Thumbnail area */}
                    <div className="h-32 bg-[#0a0a0a] flex items-center justify-center relative">
                      <span className={`text-sm font-medium ${fw.color}`}>{fw.text}</span>
                      {/* 3-dot menu */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // Menu logic here
                        }}
                        className="absolute top-3 right-3 w-7 h-7 rounded-md flex items-center justify-center text-[#444] hover:text-[#888] hover:bg-[#1a1a1a] opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <circle cx="12" cy="6" r="1.5" />
                          <circle cx="12" cy="12" r="1.5" />
                          <circle cx="12" cy="18" r="1.5" />
                        </svg>
                      </button>
                    </div>

                    {/* Card content */}
                    <div className="p-4">
                      <h4 className="text-[#ededed] font-semibold mb-1 group-hover:text-[#00dc82] transition-colors">
                        {project.name}
                      </h4>
                      <p className="text-[#666] text-sm">
                        Edited {formatDate(project.updated_at)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
