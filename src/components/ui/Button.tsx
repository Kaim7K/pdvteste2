import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger" | "ghost";
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-black transition disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" && "pdv-green-sheen text-[#091105] hover:brightness-110",
        variant === "secondary" && "border border-pdv-border bg-white/[.035] text-pdv-text hover:border-pdv-green/60 hover:bg-pdv-green/10",
        variant === "danger" && "bg-gradient-to-br from-red-600 to-red-800 text-white shadow-[0_12px_28px_rgba(220,38,38,.22)] hover:brightness-110",
        variant === "ghost" && "text-pdv-muted hover:bg-white/5 hover:text-pdv-text",
        className
      )}
      {...props}
    />
  );
}
