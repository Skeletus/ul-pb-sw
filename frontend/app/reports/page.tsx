"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ClipboardList, Loader2 } from "lucide-react";
import { Suspense } from "react";
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
import { useMachines } from "@/features/machinery/queries";
import { useDailyReportMutation } from "@/features/reports/queries";
import { getErrorMessage } from "@/lib/api/errors";

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
