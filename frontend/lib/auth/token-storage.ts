import type { AuthUser, CurrentUser } from "@/types/api";

const tokenKey = "workmeter.accessToken";
const userKey = "workmeter.user";

export function readStoredToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(tokenKey);
}

export function readStoredUser() {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(userKey);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuthUser | CurrentUser;
  } catch {
    return null;
  }
}

export function storeSession(token: string, user: AuthUser | CurrentUser) {
  window.localStorage.setItem(tokenKey, token);
  window.localStorage.setItem(userKey, JSON.stringify(user));
}

export function storeUser(user: AuthUser | CurrentUser) {
  window.localStorage.setItem(userKey, JSON.stringify(user));
}

export function clearStoredSession() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(tokenKey);
  window.localStorage.removeItem(userKey);
}
