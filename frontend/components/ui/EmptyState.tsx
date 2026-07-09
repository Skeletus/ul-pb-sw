import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";

export function EmptyState({
  title,
  message,
  icon: Icon = Inbox,
  action
}: {
  title: string;
  message?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded border border-dashed border-slate-300 bg-white p-8 text-center">
      <span className="mx-auto grid h-12 w-12 place-items-center rounded bg-workmeter-concrete text-workmeter-steel">
        <Icon className="h-6 w-6" aria-hidden="true" />
      </span>
      <h2 className="mt-4 text-base font-black text-workmeter-ink">{title}</h2>
      {message ? <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-workmeter-steel">{message}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
