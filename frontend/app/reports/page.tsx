"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ClipboardList, Loader2 } from "lucide-react";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { AppShell } from "@/components/layout/AppShell";
import { DailyReportSummary } from "@/components/reports/DailyReportSummary";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingState } from "@/components/ui/LoadingState";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable } from "@/components/ui/DataTable";
import { useMachines } from "@/features/machinery/queries";
import { useDailyReportMutation, useGeneratedDailyReports } from "@/features/reports/queries";
import { getErrorMessage } from "@/lib/api/errors";
import { formatDate, formatMoney, formatPercent } from "@/lib/utils";
import { useUsageComparison } from "@/features/sprint2/queries";
import { useSavingsProjection } from "@/features/reports/queries";
import { downloadUsagePdf } from "@/lib/api/sprint2";

const reportSchema = z.object({
  machineId: z.coerce.number().int("Selecciona una maquinaria valida.").positive("Selecciona una maquinaria."),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Usa el formato YYYY-MM-DD.")
});

type ReportFormValues = z.infer<typeof reportSchema>;

function todayUtcDate() {
  return new Date().toISOString().slice(0, 10);
}

function ReportsContent() {
  const searchParams = useSearchParams();
  const machineIdFromUrl = Number(searchParams.get("machineId"));
  const machinesQuery = useMachines();
  const reportMutation = useDailyReportMutation();
  const [comparisonFrom, setComparisonFrom] = useState(todayUtcDate());
  const [comparisonTo, setComparisonTo] = useState(todayUtcDate());
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [downloadError, setDownloadError] = useState("");
  const comparison = useUsageComparison(comparisonFrom, comparisonTo);
  const [savingsMachineId, setSavingsMachineId] = useState(0);
  const savings = useSavingsProjection(savingsMachineId, comparisonFrom, comparisonTo);
  const generatedReportsQuery = useGeneratedDailyReports();
  const form = useForm<ReportFormValues>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      machineId: Number.isInteger(machineIdFromUrl) && machineIdFromUrl > 0 ? machineIdFromUrl : 0,
      date: todayUtcDate()
    }
  });

  async function onSubmit(values: ReportFormValues) {
    await reportMutation.mutateAsync(values);
  }

  const machines = machinesQuery.data ?? [];

  return (
    <div className="grid gap-6">
      <PageHeader
        title="Reporte diario"
        description="Consulta horas activas, horas inactivas, uso efectivo y costo por inactividad por maquina."
      />

      <section className="rounded border border-slate-200 bg-white p-6 shadow-sm">
        {machinesQuery.isLoading ? <LoadingState label="Cargando maquinaria..." /> : null}
        {machinesQuery.isError ? (
          <ErrorState title="No se pudo cargar maquinaria" message={getErrorMessage(machinesQuery.error)} />
        ) : null}

        {!machinesQuery.isLoading && !machinesQuery.isError && machines.length === 0 ? (
          <EmptyState title="Aun no hay maquinaria registrada." message="Registra maquinaria antes de consultar reportes." />
        ) : null}

        {machines.length > 0 ? (
          <form className="grid gap-5 lg:grid-cols-[1fr_220px_auto]" onSubmit={form.handleSubmit(onSubmit)}>
            <label className="grid gap-2">
              <span className="text-sm font-black text-workmeter-ink">Maquinaria</span>
              <select
                className="h-12 rounded border border-slate-300 bg-white px-4 text-base outline-none transition focus:border-workmeter-orange focus:ring-4 focus:ring-workmeter-orange/20"
                {...form.register("machineId")}
              >
                <option value={0}>Selecciona una maquina</option>
                {machines.map((machine) => (
                  <option key={machine.id} value={machine.id}>
                    {machine.code} · {machine.type}
                  </option>
                ))}
              </select>
              {form.formState.errors.machineId ? (
                <span className="text-sm font-bold text-red-700">{form.formState.errors.machineId.message}</span>
              ) : null}
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-black text-workmeter-ink">Fecha</span>
              <input
                className="h-12 rounded border border-slate-300 px-4 text-base outline-none transition focus:border-workmeter-orange focus:ring-4 focus:ring-workmeter-orange/20"
                type="date"
                {...form.register("date")}
              />
              {form.formState.errors.date ? (
                <span className="text-sm font-bold text-red-700">{form.formState.errors.date.message}</span>
              ) : null}
            </label>

            <div className="flex items-end">
              <Button className="h-12 w-full" type="submit" disabled={reportMutation.isPending}>
                {reportMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
                Consultar
              </Button>
            </div>
          </form>
        ) : null}
      </section>

      {reportMutation.isIdle ? (
        <EmptyState
          title="Selecciona una maquina y fecha para consultar el reporte."
          message="El backend generara o actualizara el reporte diario para esos parametros."
          icon={ClipboardList}
        />
      ) : null}

      {reportMutation.isPending ? <LoadingState label="Consultando reporte..." /> : null}

      {reportMutation.isError ? (
        <ErrorState title="No se pudo consultar el reporte" message={getErrorMessage(reportMutation.error)} />
      ) : null}

      {reportMutation.data ? <DailyReportSummary report={reportMutation.data} /> : null}

      <section className="grid gap-4">
        <h2 className="text-xl font-black text-workmeter-ink">Reportes generados</h2>
        {generatedReportsQuery.isLoading ? <LoadingState label="Cargando reportes generados..." /> : null}
        {generatedReportsQuery.isError ? (
          <ErrorState
            title="No se pudieron cargar los reportes generados"
            message={getErrorMessage(generatedReportsQuery.error)}
          />
        ) : null}
        {generatedReportsQuery.data?.length === 0 ? (
          <EmptyState
            title="No hay reportes diarios generados."
            message="Los reportes apareceran aqui al cierre de jornada o luego de una consulta manual."
          />
        ) : null}
        {generatedReportsQuery.data && generatedReportsQuery.data.length > 0 ? (
          <DataTable>
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  {[
                    "Maquina", "Obra", "Fecha", "Activas", "Inactivas", "Uso efectivo", "Tarifa", "Costo inactividad"
                  ].map((heading) => (
                    <th key={heading} className="px-4 py-3 text-left text-xs font-black uppercase text-workmeter-steel">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {generatedReportsQuery.data.map((report) => (
                  <tr key={report.reportId}>
                    <td className="px-4 py-4 text-sm font-black text-workmeter-ink">{report.machineCode}</td>
                    <td className="px-4 py-4 text-sm text-workmeter-steel">{report.siteName}</td>
                    <td className="whitespace-nowrap px-4 py-4 text-sm text-workmeter-steel">{formatDate(report.date)}</td>
                    {report.hasData ? (
                      <>
                        <td className="px-4 py-4 text-sm text-workmeter-steel">{report.activeHours} h</td>
                        <td className="px-4 py-4 text-sm text-workmeter-steel">{report.inactiveHours} h</td>
                        <td className="px-4 py-4 text-sm font-bold text-workmeter-ink">{formatPercent(report.effectiveUsagePercentage ?? 0)}</td>
                        <td className="whitespace-nowrap px-4 py-4 text-sm text-workmeter-steel">{formatMoney(report.hourlyRate)} / h</td>
                        <td className="whitespace-nowrap px-4 py-4 text-sm font-bold text-red-700">{formatMoney(report.inactivityCost)}</td>
                      </>
                    ) : (
                      <td colSpan={5} className="px-4 py-4 text-sm font-bold text-workmeter-steel">
                        Sin datos activos o inactivos clasificados
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </DataTable>
        ) : null}
      </section>
      <section className="grid gap-4 rounded border bg-white p-6">
        <h2 className="text-xl font-black text-workmeter-ink">Ahorro proyectado</h2>
        <div className="flex flex-wrap gap-3"><select className="h-11 rounded border px-3" value={savingsMachineId} onChange={e=>setSavingsMachineId(Number(e.target.value))}><option value={0}>Selecciona una máquina</option>{machines.map(machine=><option key={machine.id} value={machine.id}>{machine.code}</option>)}</select><input className="h-11 rounded border px-3" type="date" value={comparisonFrom} onChange={e=>setComparisonFrom(e.target.value)}/><input className="h-11 rounded border px-3" type="date" value={comparisonTo} onChange={e=>setComparisonTo(e.target.value)}/></div>
        {savings.isLoading?<LoadingState label="Calculando ahorro..."/>:null}{savings.isError?<ErrorState title="No se pudo calcular el ahorro" message={getErrorMessage(savings.error)}/>:null}{savings.data?<div className="grid gap-2 sm:grid-cols-3"><div><span className="text-sm text-workmeter-steel">Costo actual</span><p className="text-2xl font-black">{formatMoney(savings.data.currentInactivityCost)}</p></div><div><span className="text-sm text-workmeter-steel">Reducción objetivo</span><p className="text-2xl font-black">{savings.data.targetReductionRate*100}%</p></div><div><span className="text-sm text-workmeter-steel">Ahorro proyectado</span><p className="text-2xl font-black text-emerald-700">{formatMoney(savings.data.projectedSavings)}</p></div><p className="text-sm text-workmeter-steel sm:col-span-3">{savings.data.explanation}</p></div>:null}
      </section>

      <section className="grid gap-4">
        <div><h2 className="text-xl font-black text-workmeter-ink">Comparación de utilización y costos</h2><p className="text-sm text-workmeter-steel">Las máquinas sin horas clasificadas no se incluyen.</p></div>
        <div className="flex flex-wrap gap-3"><input className="h-11 rounded border px-3" type="date" value={comparisonFrom} onChange={(event) => setComparisonFrom(event.target.value)} /><input className="h-11 rounded border px-3" type="date" value={comparisonTo} onChange={(event) => setComparisonTo(event.target.value)} /></div>
        {comparison.isLoading ? <LoadingState label="Calculando comparación..." /> : null}
        {comparison.isError ? <ErrorState title="No se pudo calcular la comparación" message={getErrorMessage(comparison.error)} /> : null}
        {comparison.data?.machines.length === 0 ? <EmptyState title="No hay máquinas con datos clasificados en el periodo." /> : null}
        {downloadError ? <p className="font-bold text-red-700">{downloadError}</p> : null}
        {comparison.data?.machines.map((machine) => <article key={machine.machineId} className={machine.lowUtilization ? "rounded border-2 border-amber-500 bg-amber-50 p-5" : "rounded border border-slate-200 bg-white p-5"}><div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-black">{machine.machineCode} · {machine.siteName}</h3><p className="text-sm text-workmeter-steel">{machine.lowUtilization ? `Baja utilización (umbral ${comparison.data.lowUtilizationThreshold}%)` : "Utilización dentro del umbral"}</p></div><button className="rounded bg-workmeter-blue px-4 py-2 text-sm font-black text-white" disabled={downloadingId === machine.machineId} onClick={async () => { setDownloadingId(machine.machineId); setDownloadError(""); try { const blob = await downloadUsagePdf(machine.machineId, comparisonFrom, comparisonTo); const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = `workmeter-${machine.machineCode}.pdf`; link.click(); URL.revokeObjectURL(url); } catch (caught) { setDownloadError(getErrorMessage(caught)); } finally { setDownloadingId(null); } }}>{downloadingId === machine.machineId ? "Generando..." : "Descargar PDF"}</button></div><div className="mt-4 grid gap-3 sm:grid-cols-4"><div><b>Activas</b><div className="mt-1 h-3 bg-emerald-500" style={{ width: `${machine.effectiveUsagePercentage}%` }} /><span>{machine.activeHours} h</span></div><div><b>Inactivas</b><div className="mt-1 h-3 bg-amber-500" style={{ width: `${100 - machine.effectiveUsagePercentage}%` }} /><span>{machine.inactiveHours} h</span></div><div><b>Uso efectivo</b><p>{formatPercent(machine.effectiveUsagePercentage)}</p></div><div><b>Costo inactividad</b><p>{formatMoney(machine.inactivityCost)}</p><small>Operativo disponible: {formatMoney(machine.availableOperatingCost)}</small></div></div></article>)}
      </section>
    </div>
  );
}

export default function ReportsPage() {
  return (
    <AppShell>
      <Suspense fallback={<LoadingState />}>
        <ReportsContent />
      </Suspense>
    </AppShell>
  );
}
