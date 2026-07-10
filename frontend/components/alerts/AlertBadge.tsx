import { AlertStatus } from "@/types/api";
import { cn } from "@/lib/utils";

export function AlertBadge({ status }: { status: AlertStatus }) {
  const classes = {
    [AlertStatus.ACTIVE]: "bg-red-50 text-red-700",
    [AlertStatus.RESOLVED]: "bg-emerald-50 text-emerald-700"
  };

  return (
    <span className={cn("inline-flex min-h-7 items-center rounded px-2.5 py-1 text-xs font-black", classes[status])}>
      {status === AlertStatus.ACTIVE ? "Activa" : "Resuelta"}
    </span>
  );
}
