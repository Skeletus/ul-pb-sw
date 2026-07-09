import { MachineStatus } from "@/types/api";
import { cn } from "@/lib/utils";

const statusLabels: Record<MachineStatus, string> = {
  [MachineStatus.REGISTERED]: "REGISTERED",
  [MachineStatus.ACTIVE]: "ACTIVE",
  [MachineStatus.INACTIVE]: "INACTIVE",
  [MachineStatus.POWERED_ON_NO_PRODUCTIVE_USE]: "POWERED_ON_NO_PRODUCTIVE_USE",
  [MachineStatus.UNDER_DOCUMENTED_MAINTENANCE]: "UNDER_DOCUMENTED_MAINTENANCE",
  [MachineStatus.DECOMMISSIONED]: "DECOMMISSIONED"
};

const statusClasses: Record<MachineStatus, string> = {
  [MachineStatus.REGISTERED]: "bg-slate-100 text-slate-700",
  [MachineStatus.ACTIVE]: "bg-emerald-50 text-emerald-700",
  [MachineStatus.INACTIVE]: "bg-amber-50 text-amber-800",
  [MachineStatus.POWERED_ON_NO_PRODUCTIVE_USE]: "bg-red-50 text-red-700",
  [MachineStatus.UNDER_DOCUMENTED_MAINTENANCE]: "bg-blue-50 text-workmeter-blue",
  [MachineStatus.DECOMMISSIONED]: "bg-slate-200 text-slate-700"
};

export function MachineStatusBadge({ status }: { status: MachineStatus }) {
  return (
    <span
      className={cn(
        "inline-flex min-h-7 items-center rounded px-2.5 py-1 text-xs font-black",
        statusClasses[status]
      )}
    >
      {statusLabels[status]}
    </span>
  );
}
