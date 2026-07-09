"use client";

import { LogOut, Menu } from "lucide-react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/features/auth/auth-store";
import { useLogoutMutation } from "@/features/auth/queries";
import { routes } from "@/lib/routes";

const mobileItems = [
  { label: "Dashboard", href: routes.dashboard },
  { label: "Maquinaria", href: routes.machinery },
  { label: "Reportes", href: routes.reports },
  { label: "Alertas", href: routes.alerts }
];

export function Topbar() {
  const user = useAuthStore((state) => state.user);
  const clearSession = useAuthStore((state) => state.clearSession);
  const logoutMutation = useLogoutMutation();
  const queryClient = useQueryClient();
  const router = useRouter();

  async function handleLogout() {
    try {
      await logoutMutation.mutateAsync();
    } catch {
      // The local session must be cleared even if the server session is already invalid.
    } finally {
      clearSession();
      queryClient.clear();
      router.replace(routes.login);
    }
  }

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="flex min-h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 lg:hidden">
          <span className="grid h-10 w-10 place-items-center rounded bg-workmeter-orange text-xs font-black text-white">
            WM
          </span>
          <span className="text-base font-black text-workmeter-ink">WorkMeter</span>
        </div>

        <div className="hidden items-center gap-2 lg:flex">
          <Menu className="h-5 w-5 text-workmeter-steel" aria-hidden="true" />
          <span className="text-sm font-bold text-workmeter-steel">Aplicacion autenticada</span>
        </div>

        <nav className="hidden items-center gap-2 md:flex lg:hidden">
          {mobileItems.map((item) => (
            <Link
              key={item.href}
              className="rounded px-3 py-2 text-sm font-bold text-workmeter-steel transition hover:bg-workmeter-concrete hover:text-workmeter-blue"
              href={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-black text-workmeter-ink">{user?.name ?? "Usuario"}</p>
            <p className="text-xs font-bold text-workmeter-steel">{user?.email ?? "Sesion activa"}</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
            aria-label="Cerrar sesion"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Cerrar sesion</span>
          </Button>
        </div>
      </div>

      <nav className="flex gap-2 overflow-x-auto border-t border-slate-100 px-4 py-2 md:hidden">
        {mobileItems.map((item) => (
          <Link
            key={item.href}
            className="whitespace-nowrap rounded bg-workmeter-concrete px-3 py-2 text-sm font-bold text-workmeter-steel"
            href={item.href}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
