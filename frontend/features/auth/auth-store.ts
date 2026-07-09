"use client";

import { create } from "zustand";
import {
  clearStoredSession,
  readStoredToken,
  readStoredUser,
  storeSession,
  storeUser
} from "@/lib/auth/token-storage";
import type { AuthUser, CurrentUser } from "@/types/api";

type AuthState = {
  token: string | null;
  user: AuthUser | CurrentUser | null;
  hydrated: boolean;
  hydrate: () => void;
  setSession: (token: string, user: AuthUser | CurrentUser) => void;
  setUser: (user: AuthUser | CurrentUser) => void;
  clearSession: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  hydrated: false,
  hydrate: () =>
    set({
      token: readStoredToken(),
      user: readStoredUser(),
      hydrated: true
    }),
  setSession: (token, user) => {
    storeSession(token, user);
    set({ token, user, hydrated: true });
  },
  setUser: (user) => {
    storeUser(user);
    set({ user });
  },
  clearSession: () => {
    clearStoredSession();
    set({ token: null, user: null, hydrated: true });
  }
}));
