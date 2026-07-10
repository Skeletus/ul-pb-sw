import { apiRequest } from "@/lib/api/client";
import type { AuthResponse, CurrentUser, LoginRequest } from "@/types/api";

export function login(payload: LoginRequest) {
  return apiRequest<AuthResponse>("/auth/login", {
    method: "POST",
    authenticated: false,
    body: JSON.stringify(payload)
  });
}

export function logout() {
  return apiRequest<{ message: string }>("/auth/logout", {
    method: "POST"
  });
}

export function getCurrentUser() {
  return apiRequest<CurrentUser>("/auth/me");
}

export function updateProfile(payload: { name?: string; email?: string }) {
  return apiRequest<CurrentUser>("/auth/me", { method: "PATCH", body: JSON.stringify(payload) });
}

export function changePassword(payload: { currentPassword: string; newPassword: string }) {
  return apiRequest<{ message: string }>("/auth/change-password", { method: "POST", body: JSON.stringify(payload) });
}
