"use client";

import { AlertTriangle, CheckCircle2, Clock, Truck } from "lucide-react";
import { AlertsList } from "@/components/alerts/AlertsList";
import { AppShell } from "@/components/layout/AppShell";
import { MachineTable } from "@/components/machinery/MachineTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { LinkButton } from "@/components/ui/LinkButton";
import { LoadingState } from "@/components/ui/LoadingState";
import { MetricCard } from "@/components/ui/MetricCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { useActiveAlerts } from "@/features/alerts/queries";
import { useMachines } from "@/features/machinery/queries";
import { getErrorMessage } from "@/lib/api/errors";
import { routes } from "@/lib/routes";
import { MachineStatus } from "@/types/api";

export default function DashboardPage() {
  const machinesQuery = useMachines();
  const activeAlertsQuery = useActiveAlerts();

  const machines = machinesQuery.data ?? [];
  const activeCount = machines.filter((machine) => machine.currentStatus === MachineStatus.ACTIVE).length;
  const inactiveCount = machines.filter((machine) => machine.currentStatus === MachineStatus.INACTIVE).length;
  const registeredCount = machines.filter((machine) => machine.currentStatus === MachineStatus.REGISTERED).length;
  const activeAlerts = activeAlertsQuery.data ?? [];

  return (
    <AppShell>
      <div className="grid gap-6">
        <PageHeader
          title="Dashboard"
          description="Vista operativa basada en maquinaria y alertas disponibles en la API."
          action={<LinkButton href={routes.newMachine}>Registrar maquinaria</LinkButton>}
        />

        {machinesQuery.isLoading || activeAlertsQuery.isLoading ? <LoadingState /> : null}

        {machinesQuery.isError ? (
          <ErrorState title="No se pudo cargar maquinaria" message={getErrorMessage(machinesQuery.error)} />
        ) : null}

        {activeAlertsQuery.isError ? (
          <ErrorState title="No se pudieron cargar alertas" message={getErrorMessage(activeAlertsQuery.error)} />
        ) : null}

        {!machinesQuery.isLoading && !machinesQuery.isError ? (
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard label="Maquinas registradas" value={`${machines.length}`} icon={Truck} tone="blue" />
            <MetricCard label="Activas" value={`${activeCount}`} icon={CheckCircle2} tone="green" />
            <MetricCard label="Inactivas" value={`${inactiveCount}`} icon={Clock} tone="yellow" />
            <MetricCard
              label="Alertas activas"
              value={`${activeAlerts.length}`}
              icon={AlertTriangle}
              tone={activeAlerts.length > 0 ? "red" : "slate"}
              detail={registeredCount > 0 ? `${registeredCount} maquina(s) aun registradas sin actividad clasificada.` : undefined}
            />
          </section>
        ) : null}

        {!machinesQuery.isLoading && !machinesQuery.isError ? (
          <section className="grid gap-4">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-xl font-black text-workmeter-ink">Maquinaria</h2>
              <LinkButton href={routes.machinery} variant="ghost">
                Ver todo
              </LinkButton>
            </div>
            {machines.length === 0 ? (
              <EmptyState
                title="Aun no hay maquinaria registrada."
                message="Registra una maquina para comenzar a monitorear su estado."
                action={<LinkButton href={routes.newMachine}>Registrar maquinaria</LinkButton>}
              />
            ) : (
              <MachineTable machines={machines.slice(0, 6)} />
            )}
          </section>
        ) : null}

        {!activeAlertsQuery.isLoading && !activeAlertsQuery.isError ? (
          <section className="grid gap-4">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-xl font-black text-workmeter-ink">Alertas activas</h2>
              <LinkButton href={routes.alerts} variant="ghost">
                Ver alertas
              </LinkButton>
            </div>
            <AlertsList alerts={activeAlerts.slice(0, 4)} emptyMessage="No hay alertas activas." />
          </section>
        ) : null}
      </div>
    </AppShell>
  );
}
