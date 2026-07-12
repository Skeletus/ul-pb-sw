"use client";
import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { DataTable } from "@/components/ui/DataTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { PageHeader } from "@/components/ui/PageHeader";
import { usePrioritizedIncidents, useUpdateIncidentStatus } from "@/features/sprint4/queries";
import { getErrorMessage } from "@/lib/api/errors";
import type { IncidentSeverity, IncidentStatus, PrioritizedIncident } from "@/types/api";

export default function IncidentsPage() {
  const [severity, setSeverity] = useState<IncidentSeverity>();
  const [status, setStatus] = useState<IncidentStatus>();
  const query = usePrioritizedIncidents({ severity, status });
  const update = useUpdateIncidentStatus();
  return <AppShell><div className="grid gap-5"><PageHeader title="Incidencias priorizadas" description="La prioridad se calcula en el backend y las críticas aparecen primero." />
    <div className="flex gap-3 rounded border bg-white p-4"><select aria-label="Severidad" className="h-10 rounded border px-3" value={severity ?? ""} onChange={event => setSeverity((event.target.value || undefined) as IncidentSeverity | undefined)}><option value="">Todas las severidades</option>{["LOW", "MEDIUM", "HIGH", "CRITICAL"].map(value => <option key={value}>{value}</option>)}</select><select aria-label="Estado" className="h-10 rounded border px-3" value={status ?? ""} onChange={event => setStatus((event.target.value || undefined) as IncidentStatus | undefined)}><option value="">Todos los estados</option>{["OPEN", "IN_PROGRESS", "RESOLVED"].map(value => <option key={value}>{value}</option>)}</select></div>
    {query.isLoading ? <LoadingState /> : null}{query.isError ? <ErrorState title="No se pudieron cargar incidencias" message={getErrorMessage(query.error)} /> : null}{query.data?.length === 0 ? <EmptyState title="No hay incidencias para este filtro." /> : null}
    {query.data && query.data.length > 0 ? <DataTable><table className="min-w-full"><thead><tr>{["Incidencia", "Severidad", "Puntaje", "Estado", "Fecha", "Acción"].map(value => <th key={value} className="px-4 py-3 text-left text-xs font-black uppercase">{value}</th>)}</tr></thead><tbody>{query.data.map((incident: PrioritizedIncident) => <tr key={incident.id} className={`border-t ${incident.severity === "CRITICAL" ? "bg-red-50" : ""}`}><td className="px-4 py-3"><strong>{incident.title}</strong><div className="text-xs text-workmeter-steel">{incident.machine?.code ?? incident.machineId}</div></td><td className="px-4 py-3 font-black">{incident.severity}</td><td className="px-4 py-3">{Number(incident.priorityScore ?? 0).toFixed(2)}</td><td className="px-4 py-3"><select aria-label={`Estado de ${incident.title}`} className="rounded border px-2 py-1" value={incident.status} onChange={event => update.mutate({ id: incident.id, status: event.target.value as IncidentStatus })}>{["OPEN", "IN_PROGRESS", "RESOLVED"].map(value => <option key={value}>{value}</option>)}</select></td><td className="px-4 py-3">{new Date(incident.registrationDate).toLocaleDateString("es-PE")}</td><td className="px-4 py-3">{incident.severity === "CRITICAL" ? <span className="font-black text-red-700">Crítica</span> : "—"}</td></tr>)}</tbody></table></DataTable> : null}
  </div></AppShell>;
}
