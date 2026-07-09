"use client";

import { Bell, History } from "lucide-react";
import { useState } from "react";
import { AlertsList } from "@/components/alerts/AlertsList";
import { AppShell } from "@/components/layout/AppShell";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { MetricCard } from "@/components/ui/MetricCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { useActiveAlerts, useAlerts } from "@/features/alerts/queries";
import { getErrorMessage } from "@/lib/api/errors";
import { cn } from "@/lib/utils";

type AlertTab = "active" | "all";

export default function AlertsPage() {
  const [tab, setTab] = useState<AlertTab>("active");
  const activeAlertsQuery = useActiveAlerts();
  const alertsQuery = useAlerts();
  const activeAlerts = activeAlertsQuery.data ?? [];
  const allAlerts = alertsQuery.data ?? [];
  const visibleAlerts = tab === "active" ? activeAlerts : allAlerts;

  return (
    <AppShell>
      <div className="grid gap-6">
        <PageHeader
          title="Alertas"
          description="Alertas generadas por el backend a partir de telemetria e inactividad prolongada."
        />

        <section className="grid gap-4 md:grid-cols-2">
          <MetricCard label="Alertas activas" value={`${activeAlerts.length}`} icon={Bell} tone={activeAlerts.length > 0 ? "red" : "slate"} />
          <MetricCard label="Alertas totales" value={`${allAlerts.length}`} icon={History} tone="blue" />
        </section>

        {activeAlertsQuery.isLoading || alertsQuery.isLoading ? <LoadingState /> : null}

        {activeAlertsQuery.isError ? (
          <ErrorState title="No se pudieron cargar alertas activas" message={getErrorMessage(activeAlertsQuery.error)} />
        ) : null}
        {alertsQuery.isError ? (
          <ErrorState title="No se pudo cargar el historial de alertas" message={getErrorMessage(alertsQuery.error)} />
        ) : null}

        {!activeAlertsQuery.isLoading && !alertsQuery.isLoading && !activeAlertsQuery.isError && !alertsQuery.isError ? (
          <section className="grid gap-4">
            <div className="inline-flex w-full rounded border border-slate-200 bg-white p-1 sm:w-auto">
              {[
                { id: "active" as const, label: "Activas" },
                { id: "all" as const, label: "Historial" }
              ].map((item) => (
                <button
                  key={item.id}
                  className={cn(
                    "h-10 flex-1 rounded px-4 text-sm font-black transition sm:flex-none",
                    tab === item.id ? "bg-workmeter-blue text-white" : "text-workmeter-steel hover:bg-workmeter-concrete"
                  )}
                  type="button"
                  onClick={() => setTab(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <AlertsList
              alerts={visibleAlerts}
              emptyMessage={tab === "active" ? "No hay alertas activas." : "No hay alertas registradas."}
            />
          </section>
        ) : null}
      </div>
    </AppShell>
  );
}
