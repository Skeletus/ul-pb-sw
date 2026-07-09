import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  const variants = {
    primary: "bg-workmeter-orange text-white hover:bg-workmeter-rust",
    secondary: "bg-workmeter-blue text-white hover:bg-workmeter-ink",
    ghost: "border border-slate-200 bg-white text-workmeter-steel hover:border-workmeter-blue hover:text-workmeter-blue",
    danger: "bg-red-600 text-white hover:bg-red-700"
  };

  return (
    <button
      className={cn(
        "inline-flex h-11 items-center justify-center gap-2 rounded px-4 text-sm font-black transition disabled:cursor-not-allowed disabled:opacity-60",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
