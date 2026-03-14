"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Project } from "@/types";

export default function DashboardPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();

  const [name, setName] = useState("");
  const [prompt, setPrompt] = useState("");
  const [framework, setFramework] = useState<"react" | "vue" | "svelte">(
    "react"
  );
  const [generating, setGenerating] = useState(false);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [error, setError] = useState("");

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

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setGenerating(true);
    setCurrentProject(null);

    try {
      const project = await api.generateCode({ name, prompt, framework });
      setCurrentProject(project);
      loadProjects();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setGenerating(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-white">Corefront</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-400 text-sm">
              {user.full_name || user.email}
            </span>
            <Button variant="outline" size="sm" onClick={logout}>
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel - Generation Form */}
          <div className="space-y-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Generate App</CardTitle>
                <CardDescription>
                  Describe your app and let AI build it for you
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleGenerate} className="space-y-4">
                  {error && (
                    <div className="p-3 text-sm text-red-400 bg-red-900/20 rounded-md border border-red-800">
                      {error}
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-gray-200">
                      Project Name
                    </Label>
                    <Input
                      id="name"
                      placeholder="My Awesome App"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="framework" className="text-gray-200">
                      Framework
                    </Label>
                    <Select
                      value={framework}
                      onValueChange={(v) =>
                        setFramework(v as "react" | "vue" | "svelte")
                      }
                    >
                      <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="react">React</SelectItem>
                        <SelectItem value="vue">Vue</SelectItem>
                        <SelectItem value="svelte">Svelte</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="prompt" className="text-gray-200">
                      Describe Your App
                    </Label>
                    <Textarea
                      id="prompt"
                      placeholder="A modern todo list app with the ability to add tasks, mark them as complete, and delete them. Include a clean UI with animations..."
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white min-h-32"
                      required
                      minLength={10}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={generating}
                  >
                    {generating ? (
                      <>
                        <span className="animate-spin mr-2">&#9696;</span>
                        Generating...
                      </>
                    ) : (
                      "Generate Code"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Recent Projects */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white text-lg">
                  Recent Projects
                </CardTitle>
              </CardHeader>
              <CardContent>
                {projects.length === 0 ? (
                  <p className="text-gray-400 text-sm">No projects yet</p>
                ) : (
                  <div className="space-y-2">
                    {projects.slice(0, 5).map((project) => (
                      <button
                        key={project.id}
                        onClick={() => setCurrentProject(project)}
                        className="w-full text-left p-3 rounded-md bg-gray-700 hover:bg-gray-600 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-white font-medium">
                            {project.name}
                          </span>
                          <span
                            className={`text-xs px-2 py-1 rounded ${
                              project.status === "completed"
                                ? "bg-green-900 text-green-300"
                                : project.status === "failed"
                                  ? "bg-red-900 text-red-300"
                                  : "bg-yellow-900 text-yellow-300"
                            }`}
                          >
                            {project.status}
                          </span>
                        </div>
                        <p className="text-gray-400 text-sm truncate mt-1">
                          {project.prompt}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Code Preview */}
          <Card className="bg-gray-800 border-gray-700 h-fit">
            <CardHeader>
              <CardTitle className="text-white">
                {currentProject ? currentProject.name : "Code Preview"}
              </CardTitle>
              {currentProject && (
                <CardDescription>
                  Framework: {currentProject.framework.toUpperCase()}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              {!currentProject ? (
                <div className="flex items-center justify-center h-64 text-gray-500">
                  Generate an app to see the code here
                </div>
              ) : currentProject.status === "failed" ? (
                <div className="p-4 bg-red-900/20 border border-red-800 rounded-md text-red-400">
                  {currentProject.error_message || "Generation failed"}
                </div>
              ) : currentProject.status === "generating" ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-gray-400">Generating code...</div>
                </div>
              ) : (
                <Tabs defaultValue="code" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 bg-gray-700">
                    <TabsTrigger value="code">Code</TabsTrigger>
                    <TabsTrigger value="prompt">Prompt</TabsTrigger>
                  </TabsList>
                  <TabsContent value="code" className="mt-4">
                    <div className="relative">
                      <pre className="p-4 bg-gray-900 rounded-md overflow-auto max-h-[600px] text-sm">
                        <code className="text-gray-300">
                          {currentProject.generated_code}
                        </code>
                      </pre>
                      <Button
                        variant="outline"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => {
                          navigator.clipboard.writeText(
                            currentProject.generated_code || ""
                          );
                        }}
                      >
                        Copy
                      </Button>
                    </div>
                  </TabsContent>
                  <TabsContent value="prompt" className="mt-4">
                    <div className="p-4 bg-gray-900 rounded-md">
                      <p className="text-gray-300">{currentProject.prompt}</p>
                    </div>
                  </TabsContent>
                </Tabs>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
