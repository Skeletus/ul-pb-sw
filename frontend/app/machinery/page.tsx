"use client";

import { Plus } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { MachineTable } from "@/components/machinery/MachineTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { LinkButton } from "@/components/ui/LinkButton";
import { LoadingState } from "@/components/ui/LoadingState";
import { PageHeader } from "@/components/ui/PageHeader";
import { useMachines } from "@/features/machinery/queries";
import { getErrorMessage } from "@/lib/api/errors";
import { routes } from "@/lib/routes";

export default function MachineryPage() {
  const machinesQuery = useMachines();
  const machines = machinesQuery.data ?? [];

  return (
    <AppShell>
      <div className="grid gap-6">
        <PageHeader
          title="Maquinaria"
          description="Listado de maquinas registradas y estado actual entregado por el backend."
          action={
            <LinkButton href={routes.newMachine}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              Registrar maquinaria
            </LinkButton>
          }
        />

        {machinesQuery.isLoading ? <LoadingState /> : null}
        {machinesQuery.isError ? (
          <ErrorState title="No se pudo cargar maquinaria" message={getErrorMessage(machinesQuery.error)} />
        ) : null}
        {!machinesQuery.isLoading && !machinesQuery.isError && machines.length === 0 ? (
          <EmptyState
            title="Aun no hay maquinaria registrada."
            message="Usa el formulario de registro para crear la primera maquina."
            action={<LinkButton href={routes.newMachine}>Registrar maquinaria</LinkButton>}
          />
        ) : null}
        {!machinesQuery.isLoading && !machinesQuery.isError && machines.length > 0 ? (
          <MachineTable machines={machines} />
        ) : null}
      </div>
    </AppShell>
  );
}
