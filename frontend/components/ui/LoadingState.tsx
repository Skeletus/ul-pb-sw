import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function LoadingState({ label = "Cargando...", fullScreen = false }: { label?: string; fullScreen?: boolean }) {
  return (
    <div className={cn("grid place-items-center", fullScreen ? "min-h-screen" : "min-h-48")}>
      <div className="flex items-center gap-3 rounded border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-workmeter-steel shadow-sm">
        <Loader2 className="h-4 w-4 animate-spin text-workmeter-orange" aria-hidden="true" />
        {label}
      </div>
    </div>
  );
}
