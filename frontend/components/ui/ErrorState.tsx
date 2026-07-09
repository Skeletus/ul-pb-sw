import { AlertCircle } from "lucide-react";

export function ErrorState({
  title = "No se pudo cargar la informacion",
  message,
  action
}: {
  title?: string;
  message?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded border border-red-200 bg-white p-6 shadow-sm">
      <div className="flex gap-4">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded bg-red-50 text-red-700">
          <AlertCircle className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <h2 className="text-base font-black text-workmeter-ink">{title}</h2>
          {message ? <p className="mt-2 text-sm leading-6 text-workmeter-steel">{message}</p> : null}
          {action ? <div className="mt-4">{action}</div> : null}
        </div>
      </div>
    </div>
  );
}
