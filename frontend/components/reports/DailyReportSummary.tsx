import { Activity, Clock, Gauge, Wallet } from "lucide-react";
import { MetricCard } from "@/components/ui/MetricCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate, formatMoney, formatPercent } from "@/lib/utils";
import type { DailyReport } from "@/types/api";

export function DailyReportSummary({ report }: { report: DailyReport }) {
  if (!report.hasData) {
    return (
      <EmptyState
        title={`Sin datos clasificados para ${report.machineCode}.`}
        message={`${report.siteName} · ${formatDate(report.date)}. El reporte fue generado, pero no existen intervalos activos o inactivos en la jornada.`}
      />
    );
  }

  return (
    <section className="grid gap-4">
      <div className="rounded border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-sm font-bold text-workmeter-steel">Reporte diario</p>
        <h2 className="mt-2 text-2xl font-black text-workmeter-ink">
          {report.machineCode} · {report.siteName} · {formatDate(report.date)}
        </h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Horas activas" value={`${report.activeHours}`} icon={Activity} tone="green" />
        <MetricCard label="Horas inactivas" value={`${report.inactiveHours}`} icon={Clock} tone="yellow" />
        <MetricCard
          label="Uso efectivo"
          value={formatPercent(report.effectiveUsagePercentage ?? 0)}
          icon={Gauge}
          tone="blue"
        />
        <MetricCard label="Costo por inactividad" value={formatMoney(report.inactivityCost)} icon={Wallet} tone="red" />
      </div>
      <div className="grid gap-2 border-t border-slate-200 pt-4 text-sm text-workmeter-steel sm:grid-cols-2">
        <p><span className="font-black text-workmeter-ink">Tarifa:</span> {formatMoney(report.hourlyRate)} / h</p>
        <p><span className="font-black text-workmeter-ink">Horas clasificadas:</span> {report.totalClassifiedHours}</p>
      </div>
    </section>
  );
}
