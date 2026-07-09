"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/ErrorState";
import { LinkButton } from "@/components/ui/LinkButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { machineryKeys, useCreateMachineMutation } from "@/features/machinery/queries";
import { getErrorMessage } from "@/lib/api/errors";
import { routes } from "@/lib/routes";

const createMachineSchema = z.object({
  siteId: z.coerce.number().int("Debe ser un entero.").positive("Debe ser un entero positivo."),
  code: z.string().min(1, "El codigo es obligatorio.").max(60, "Maximo 60 caracteres."),
  type: z.string().min(1, "El tipo es obligatorio.").max(80, "Maximo 80 caracteres."),
  hourlyRate: z
    .union([z.literal(""), z.coerce.number().min(0, "Debe ser mayor o igual a 0.")])
    .optional()
    .refine((value) => {
      if (value === "" || value === undefined) {
        return true;
      }
      return Number.isInteger(value * 100);
    }, "Maximo 2 decimales.")
});

type CreateMachineFormValues = z.infer<typeof createMachineSchema>;

export default function NewMachinePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const createMachineMutation = useCreateMachineMutation();
  const form = useForm<CreateMachineFormValues>({
    resolver: zodResolver(createMachineSchema),
    defaultValues: {
      siteId: 1,
      code: "",
      type: "",
      hourlyRate: ""
    }
  });

  async function onSubmit(values: CreateMachineFormValues) {
    const created = await createMachineMutation.mutateAsync({
      siteId: values.siteId,
      code: values.code,
      type: values.type,
      hourlyRate: values.hourlyRate === "" || values.hourlyRate === undefined ? undefined : values.hourlyRate
    });
    await queryClient.invalidateQueries({ queryKey: machineryKeys.all });
    router.push(`/machinery/${created.id}`);
  }

  return (
    <AppShell>
      <div className="grid gap-6">
        <PageHeader
          title="Registrar maquinaria"
          description="Formulario alineado al DTO documentado: siteId, code, type y hourlyRate opcional."
          action={
            <LinkButton href={routes.machinery} variant="ghost">
              Volver
            </LinkButton>
          }
        />

        <div className="max-w-2xl rounded border border-slate-200 bg-white p-6 shadow-sm">
          {createMachineMutation.isError ? (
            <div className="mb-5">
              <ErrorState title="No se pudo registrar la maquinaria" message={getErrorMessage(createMachineMutation.error)} />
            </div>
          ) : null}

          <form className="grid gap-5" onSubmit={form.handleSubmit(onSubmit)}>
            <label className="grid gap-2">
              <span className="text-sm font-black text-workmeter-ink">ID de obra</span>
              <input
                className="h-12 rounded border border-slate-300 px-4 text-base outline-none transition focus:border-workmeter-orange focus:ring-4 focus:ring-workmeter-orange/20"
                type="number"
                min={1}
                step={1}
                {...form.register("siteId")}
              />
              {form.formState.errors.siteId ? (
                <span className="text-sm font-bold text-red-700">{form.formState.errors.siteId.message}</span>
              ) : null}
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-black text-workmeter-ink">Codigo</span>
              <input
                className="h-12 rounded border border-slate-300 px-4 text-base uppercase outline-none transition placeholder:normal-case focus:border-workmeter-orange focus:ring-4 focus:ring-workmeter-orange/20"
                placeholder="MACH-004"
                maxLength={60}
                {...form.register("code")}
              />
              {form.formState.errors.code ? (
                <span className="text-sm font-bold text-red-700">{form.formState.errors.code.message}</span>
              ) : null}
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-black text-workmeter-ink">Tipo</span>
              <input
                className="h-12 rounded border border-slate-300 px-4 text-base outline-none transition focus:border-workmeter-orange focus:ring-4 focus:ring-workmeter-orange/20"
                placeholder="Excavadora"
                maxLength={80}
                {...form.register("type")}
              />
              {form.formState.errors.type ? (
                <span className="text-sm font-bold text-red-700">{form.formState.errors.type.message}</span>
              ) : null}
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-black text-workmeter-ink">Tarifa horaria</span>
              <input
                className="h-12 rounded border border-slate-300 px-4 text-base outline-none transition focus:border-workmeter-orange focus:ring-4 focus:ring-workmeter-orange/20"
                type="number"
                min={0}
                step="0.01"
                placeholder="120.50"
                {...form.register("hourlyRate")}
              />
              {form.formState.errors.hourlyRate ? (
                <span className="text-sm font-bold text-red-700">{form.formState.errors.hourlyRate.message}</span>
              ) : null}
            </label>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <LinkButton className="w-full sm:w-auto" href={routes.machinery} variant="ghost">
                Cancelar
              </LinkButton>
              <Button className="w-full sm:w-auto" type="submit" disabled={createMachineMutation.isPending}>
                {createMachineMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
                Guardar maquinaria
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AppShell>
  );
}
