"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { useAuthStore } from "@/features/auth/auth-store";
import { useCurrentUser } from "@/features/auth/queries";
import { isApiClientError } from "@/lib/api/errors";
import { routes } from "@/lib/routes";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);
  const hydrated = useAuthStore((state) => state.hydrated);
  const setUser = useAuthStore((state) => state.setUser);
  const clearSession = useAuthStore((state) => state.clearSession);
  const currentUser = useCurrentUser(Boolean(hydrated && token));

  useEffect(() => {
    if (hydrated && !token) {
      router.replace(routes.login);
    }
  }, [hydrated, router, token]);

  useEffect(() => {
    if (currentUser.data) {
      setUser(currentUser.data);
    }
  }, [currentUser.data, setUser]);

  useEffect(() => {
    if (isApiClientError(currentUser.error) && currentUser.error.statusCode === 401) {
      clearSession();
      router.replace(routes.login);
    }
  }, [clearSession, currentUser.error, router]);

  if (!hydrated || (token && currentUser.isLoading)) {
    return <LoadingState label="Validando sesion..." fullScreen />;
  }

  if (!token) {
    return <LoadingState label="Redirigiendo..." fullScreen />;
  }

  if (currentUser.isError) {
    return (
      <div className="min-h-screen bg-workmeter-concrete p-6">
        <ErrorState
          title="No se pudo validar la sesion"
          message="Revisa que el backend este disponible e intenta nuevamente."
        />
      </div>
    );
  }

  return children;
}
