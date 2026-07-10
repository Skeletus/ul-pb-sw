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
import { useSites } from "@/features/sites/queries";
import { useState } from "react";

export default function MachineryPage() {
  const [siteId,setSiteId]=useState(0); const machinesQuery = useMachines(siteId||undefined); const sites=useSites();
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
        <select className="h-11 max-w-xs rounded border px-3" value={siteId} onChange={e=>setSiteId(Number(e.target.value))}><option value={0}>Todas las obras</option>{sites.data?.map(site=><option key={site.id} value={site.id}>{site.name}</option>)}</select>

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
