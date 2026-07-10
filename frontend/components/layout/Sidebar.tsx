"use client";

import { Bell, Gauge, ClipboardList, Truck, UserRound, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { routes } from "@/lib/routes";
import { useAuthStore } from "@/features/auth/auth-store";

const items = [
  { label: "Dashboard", href: routes.dashboard, icon: Gauge },
  { label: "Maquinaria", href: routes.machinery, icon: Truck },
  { label: "Reportes", href: routes.reports, icon: ClipboardList },
  { label: "Alertas", href: routes.alerts, icon: Bell },
  { label: "Historial", href: routes.reportsHistory, icon: ClipboardList },
  { label: "Perfil", href: routes.profile, icon: UserRound },
  { label: "Usuarios", href: routes.users, icon: Users, adminOnly: true }
];

export function Sidebar() {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);

  return (
    <aside className="hidden min-h-screen w-72 shrink-0 border-r border-white/10 bg-workmeter-ink text-white lg:block">
      <div className="sticky top-0 flex min-h-screen flex-col p-5">
        <Link className="flex items-center gap-3" href={routes.dashboard} aria-label="WorkMeter dashboard">
          <span className="grid h-11 w-11 place-items-center rounded bg-workmeter-orange text-sm font-black text-white">
            WM
          </span>
          <span>
            <span className="block text-xl font-black tracking-normal">WorkMeter</span>
            <span className="block text-xs font-bold text-slate-300">Panel operativo</span>
          </span>
        </Link>

        <nav className="mt-8 grid gap-2">
          {items.filter((item) => !item.adminOnly || user?.role?.name === "ADMINISTRATOR").map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                className={cn(
                  "flex min-h-11 items-center gap-3 rounded px-3 text-sm font-black transition",
                  active
                    ? "bg-white text-workmeter-ink"
                    : "text-slate-200 hover:bg-white/10 hover:text-white"
                )}
                href={item.href}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto rounded border border-white/10 bg-white/7 p-4">
          <p className="text-sm font-black text-white">Operacion en obra</p>
          <p className="mt-2 text-xs leading-5 text-slate-300">
            Datos consumidos desde la API real configurada para WorkMeter.
          </p>
        </div>
      </div>
    </aside>
  );
}
