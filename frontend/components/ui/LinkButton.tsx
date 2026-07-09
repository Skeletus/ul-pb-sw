import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

type LinkButtonProps = ComponentProps<typeof Link> & {
  variant?: "primary" | "secondary" | "ghost";
};

export function LinkButton({ className, variant = "primary", ...props }: LinkButtonProps) {
  const variants = {
    primary: "bg-workmeter-orange text-white hover:bg-workmeter-rust",
    secondary: "bg-workmeter-blue text-white hover:bg-workmeter-ink",
    ghost: "border border-slate-200 bg-white text-workmeter-steel hover:border-workmeter-blue hover:text-workmeter-blue"
  };

  return (
    <Link
      className={cn(
        "inline-flex h-11 items-center justify-center gap-2 rounded px-4 text-sm font-black transition",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
