"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { LoadingState } from "@/components/ui/LoadingState";
import { useAuthStore } from "@/features/auth/auth-store";
import { routes } from "@/lib/routes";

export default function HomePage() {
  const router = useRouter();
  const hydrated = useAuthStore((state) => state.hydrated);
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    router.replace(token ? routes.dashboard : routes.login);
  }, [hydrated, router, token]);

  return <LoadingState label="Cargando WorkMeter..." fullScreen />;
}
