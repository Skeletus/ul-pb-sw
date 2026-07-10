import { AlertTriangle } from "lucide-react";
import { AlertBadge } from "@/components/alerts/AlertBadge";
import { MachineStatusBadge } from "@/components/machinery/MachineStatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDateTime } from "@/lib/utils";
import type { AlertWithMachine } from "@/types/api";
import Link from "next/link";

export function AlertsList({ alerts, emptyMessage }: { alerts: AlertWithMachine[]; emptyMessage: string }) {
  if (alerts.length === 0) {
    return <EmptyState title={emptyMessage} message="Las alertas apareceran aqui cuando el backend las genere." />;
  }

  return (
    <div className="grid gap-3">
      {alerts.map((alert) => (
        <article key={alert.id} className="rounded border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded bg-red-50 text-red-700">
                <AlertTriangle className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-black text-workmeter-ink">{alert.machine.code}</h3>
                  <span className="rounded bg-red-50 px-2 py-1 text-xs font-black text-red-700">
                    {alert.priority === "HIGH" ? "Prioridad alta" : alert.priority}
                  </span>
                  <AlertBadge status={alert.status} />
                </div>
                <p className="mt-1 text-sm text-workmeter-steel">{alert.machine.type}</p>
                <p className="mt-1 text-sm font-bold text-workmeter-ink">{alert.machine.site.name}</p>
                <p className="mt-2 text-sm font-bold text-workmeter-steel">
                  Generada: {formatDateTime(alert.generationDate)}
                </p>
                {alert.resolvedDate ? (
                  <p className="mt-1 text-sm text-workmeter-steel">Resuelta: {formatDateTime(alert.resolvedDate)}</p>
                ) : null}
                <p className="mt-1 text-sm text-workmeter-steel">
                  Inactividad: {Math.round(alert.inactiveDurationMinutes)} min
                </p>
                <Link className="mt-3 inline-block text-sm font-black text-workmeter-blue" href={`/alerts/${alert.id}`}>Ver detalle</Link>
              </div>
            </div>
            <MachineStatusBadge status={alert.machine.currentStatus} />
          </div>
        </article>
      ))}
    </div>
  );
}
