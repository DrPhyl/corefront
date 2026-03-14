export interface User {
  id: number;
  email: string;
  full_name: string | null;
  is_active: boolean;
  created_at: string;
}

export interface AuthTokens {
  access_token: string;
  token_type: string;
}

export interface Project {
  id: number;
  name: string;
  prompt: string;
  framework: "react" | "vue" | "svelte";
  status: "pending" | "generating" | "completed" | "failed";
  generated_code: string | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

export interface GenerateRequest {
  name: string;
  prompt: string;
  framework: "react" | "vue" | "svelte";
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}
