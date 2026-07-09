import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type MetricCardProps = {
  label: string;
  value: string;
  detail?: string;
  icon?: LucideIcon;
  tone?: "blue" | "green" | "yellow" | "red" | "slate";
};

export function MetricCard({ label, value, detail, icon: Icon, tone = "blue" }: MetricCardProps) {
  const tones = {
    blue: "bg-workmeter-blue/10 text-workmeter-blue",
    green: "bg-emerald-50 text-emerald-700",
    yellow: "bg-amber-50 text-amber-700",
    red: "bg-red-50 text-red-700",
    slate: "bg-slate-100 text-workmeter-steel"
  };

  return (
    <div className="rounded border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-workmeter-steel">{label}</p>
          <p className="mt-3 text-3xl font-black tracking-normal text-workmeter-ink">{value}</p>
        </div>
        {Icon ? (
          <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded", tones[tone])}>
            <Icon className="h-5 w-5" aria-hidden="true" />
          </span>
        ) : null}
      </div>
      {detail ? <p className="mt-3 text-sm leading-6 text-workmeter-steel">{detail}</p> : null}
    </div>
  );
}
