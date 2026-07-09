import { Activity, Clock, Gauge, Wallet } from "lucide-react";
import { MetricCard } from "@/components/ui/MetricCard";
import { formatDate, formatMoney, formatPercent } from "@/lib/utils";
import type { DailyReport } from "@/types/api";

export function DailyReportSummary({ report }: { report: DailyReport }) {
  return (
    <section className="grid gap-4">
      <div className="rounded border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-sm font-bold text-workmeter-steel">Reporte diario</p>
        <h2 className="mt-2 text-2xl font-black text-workmeter-ink">
          {report.machineCode} · {formatDate(report.date)}
        </h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Horas activas" value={`${report.activeHours}`} icon={Activity} tone="green" />
        <MetricCard label="Horas inactivas" value={`${report.inactiveHours}`} icon={Clock} tone="yellow" />
        <MetricCard
          label="Uso efectivo"
          value={formatPercent(report.effectiveUsagePercentage)}
          icon={Gauge}
          tone="blue"
        />
        <MetricCard label="Costo por inactividad" value={formatMoney(report.inactivityCost)} icon={Wallet} tone="red" />
      </div>
    </section>
  );
}
