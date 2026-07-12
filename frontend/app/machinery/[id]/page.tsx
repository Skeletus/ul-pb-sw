"use client";

import { Activity, Clock, Gauge, Zap } from "lucide-react";
import { useParams } from "next/navigation";
import { AlertsList } from "@/components/alerts/AlertsList";
import { AppShell } from "@/components/layout/AppShell";
import { getMachineStatusLabel, MachineStatusBadge } from "@/components/machinery/MachineStatusBadge";
import { DataTable } from "@/components/ui/DataTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { LinkButton } from "@/components/ui/LinkButton";
import { LoadingState } from "@/components/ui/LoadingState";
import { MetricCard } from "@/components/ui/MetricCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { useAlerts } from "@/features/alerts/queries";
import { useMachine, useMachineStatus } from "@/features/machinery/queries";
import { useTelemetryByMachine } from "@/features/telemetry/queries";
import { getErrorMessage } from "@/lib/api/errors";
import { formatDateTime } from "@/lib/utils";
import { routes } from "@/lib/routes";
import { MachineSprint2Panel } from "@/components/machinery/MachineSprint2Panel";
import { MaintenancePanel } from "@/components/machinery/MaintenancePanel";

export default function MachineDetailPage() {
  const params = useParams<{ id: string }>();
  const machineId = Number(params.id);
  const validId = Number.isInteger(machineId) && machineId > 0;

  const machineQuery = useMachine(machineId, validId);
  const statusQuery = useMachineStatus(machineId, validId);
  const telemetryQuery = useTelemetryByMachine(machineId, validId);
  const alertsQuery = useAlerts();

  const machine = machineQuery.data;
  const telemetry = telemetryQuery.data ?? [];
  const relatedAlerts = (alertsQuery.data ?? []).filter((alert) => alert.machineId === machineId);
  const latestReading = telemetry[0];

  return (
    <AppShell>
      <div className="grid gap-6">
        <PageHeader
          title={machine ? machine.code : "Detalle de maquinaria"}
          description="Datos basicos, estado actual y lecturas recientes disponibles en la API."
          action={
            <div className="flex flex-wrap gap-3">
              <LinkButton href={`${routes.reports}?machineId=${machineId}`} variant="secondary">
                Ver reporte diario
              </LinkButton>
              <LinkButton href={routes.machinery} variant="ghost">
                Volver
              </LinkButton>
            </div>
          }
        />

        {!validId ? <ErrorState title="ID de maquinaria invalido" message="La ruta debe contener un identificador numerico." /> : null}

        {validId && (machineQuery.isLoading || statusQuery.isLoading || telemetryQuery.isLoading) ? <LoadingState /> : null}

        {machineQuery.isError ? (
          <ErrorState title="No se pudo cargar la maquinaria" message={getErrorMessage(machineQuery.error)} />
        ) : null}

        {machine ? (
          <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-workmeter-steel">{machine.type}</p>
                  <h2 className="mt-1 text-2xl font-black text-workmeter-ink">{machine.code}</h2>
                </div>
                <MachineStatusBadge status={machine.currentStatus} />
              </div>
              <dl className="mt-6 grid gap-4 text-sm">
                <div>
                  <dt className="font-black text-workmeter-ink">Obra</dt>
                  <dd className="mt-1 text-workmeter-steel">{machine.site.name}</dd>
                </div>
                <div>
                  <dt className="font-black text-workmeter-ink">Ubicacion</dt>
                  <dd className="mt-1 text-workmeter-steel">{machine.site.location ?? "Sin ubicacion"}</dd>
                </div>
                <div>
                  <dt className="font-black text-workmeter-ink">Tarifa horaria</dt>
                  <dd className="mt-1 text-workmeter-steel">S/ {machine.hourlyRate}</dd>
                </div>
              </dl>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <MetricCard
                label="Estado actual"
                value={getMachineStatusLabel(statusQuery.data?.currentStatus ?? machine.currentStatus)}
                icon={Gauge}
                tone={machine.currentStatus === "ACTIVE" ? "green" : machine.currentStatus === "INACTIVE" ? "yellow" : "slate"}
              />
              <MetricCard
                label="Inicio de ultimo estado"
                value={statusQuery.data?.lastStateStartDate ? formatDateTime(statusQuery.data.lastStateStartDate) : "Sin registro"}
                icon={Clock}
                tone="blue"
              />
              <MetricCard
                label="Ultima vibracion"
                value={latestReading ? latestReading.vibration : "Sin lectura"}
                icon={Activity}
                tone="slate"
              />
              <MetricCard
                label="Ultimo consumo"
                value={latestReading ? latestReading.energyConsumption : "Sin lectura"}
                icon={Zap}
                tone="slate"
              />
            </div>
          </section>
        ) : null}

        {telemetryQuery.isError ? (
          <ErrorState title="No se pudo cargar telemetria" message={getErrorMessage(telemetryQuery.error)} />
        ) : null}

        {!telemetryQuery.isLoading && !telemetryQuery.isError ? (
          <section className="grid gap-4">
            <h2 className="text-xl font-black text-workmeter-ink">Telemetria reciente</h2>
            {telemetry.length === 0 ? (
              <EmptyState title="No hay lecturas recientes para esta maquinaria." />
            ) : (
              <DataTable>
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-black uppercase text-workmeter-steel">Fecha</th>
                      <th className="px-4 py-3 text-right text-xs font-black uppercase text-workmeter-steel">Vibracion</th>
                      <th className="px-4 py-3 text-right text-xs font-black uppercase text-workmeter-steel">Consumo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {telemetry.map((reading) => (
                      <tr key={reading.id}>
                        <td className="px-4 py-4 text-sm font-bold text-workmeter-ink">{formatDateTime(reading.timestamp)}</td>
                        <td className="px-4 py-4 text-right text-sm text-workmeter-steel">{reading.vibration}</td>
                        <td className="px-4 py-4 text-right text-sm text-workmeter-steel">{reading.energyConsumption}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </DataTable>
            )}
          </section>
        ) : null}

        {alertsQuery.isError ? (
          <ErrorState title="No se pudieron cargar alertas" message={getErrorMessage(alertsQuery.error)} />
        ) : null}

        {!alertsQuery.isLoading && !alertsQuery.isError ? (
          <section className="grid gap-4">
            <h2 className="text-xl font-black text-workmeter-ink">Alertas asociadas</h2>
            <AlertsList alerts={relatedAlerts} emptyMessage="No hay alertas asociadas a esta maquinaria." />
          </section>
        ) : null}
        {validId ? <MachineSprint2Panel machineId={machineId} /> : null}
        {validId ? <MaintenancePanel machineId={machineId} /> : null}
      </div>
    </AppShell>
  );
}
