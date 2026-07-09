"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { routes } from "@/lib/routes";
import { useAuthStore } from "@/features/auth/auth-store";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const hydrate = useAuthStore((state) => state.hydrate);
  const clearSession = useAuthStore((state) => state.clearSession);
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    function handleUnauthorized() {
      clearSession();
      queryClient.clear();
      router.replace(routes.login);
    }

    window.addEventListener("workmeter:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("workmeter:unauthorized", handleUnauthorized);
  }, [clearSession, queryClient, router]);

  return children;
}
