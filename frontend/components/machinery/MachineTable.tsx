import { Eye } from "lucide-react";
import Link from "next/link";
import { DataTable } from "@/components/ui/DataTable";
import { MachineStatusBadge } from "@/components/machinery/MachineStatusBadge";
import type { MachineWithSite } from "@/types/api";

export function MachineTable({ machines }: { machines: MachineWithSite[] }) {
  return (
    <DataTable>
      <table className="min-w-full divide-y divide-slate-200">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-black uppercase text-workmeter-steel">Codigo</th>
            <th className="px-4 py-3 text-left text-xs font-black uppercase text-workmeter-steel">Tipo</th>
            <th className="px-4 py-3 text-left text-xs font-black uppercase text-workmeter-steel">Obra</th>
            <th className="px-4 py-3 text-left text-xs font-black uppercase text-workmeter-steel">Estado</th>
            <th className="px-4 py-3 text-right text-xs font-black uppercase text-workmeter-steel">Tarifa</th>
            <th className="px-4 py-3 text-right text-xs font-black uppercase text-workmeter-steel">Accion</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {machines.map((machine) => (
            <tr key={machine.id} className="hover:bg-workmeter-concrete/70">
              <td className="whitespace-nowrap px-4 py-4 text-sm font-black text-workmeter-ink">{machine.code}</td>
              <td className="whitespace-nowrap px-4 py-4 text-sm text-workmeter-steel">{machine.type}</td>
              <td className="px-4 py-4 text-sm text-workmeter-steel">
                <span className="font-bold text-workmeter-ink">{machine.site.name}</span>
                {machine.site.location ? <span className="block text-xs">{machine.site.location}</span> : null}
              </td>
              <td className="whitespace-nowrap px-4 py-4">
                <MachineStatusBadge status={machine.currentStatus} />
              </td>
              <td className="whitespace-nowrap px-4 py-4 text-right text-sm font-bold text-workmeter-ink">
                S/ {machine.hourlyRate}
              </td>
              <td className="whitespace-nowrap px-4 py-4 text-right">
                <Link
                  className="inline-flex h-9 items-center gap-2 rounded border border-slate-200 px-3 text-sm font-bold text-workmeter-blue transition hover:border-workmeter-blue hover:bg-blue-50"
                  href={`/machinery/${machine.id}`}
                >
                  <Eye className="h-4 w-4" aria-hidden="true" />
                  Ver
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </DataTable>
  );
}
