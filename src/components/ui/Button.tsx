import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger" | "ghost";
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" && "bg-pdv-green text-black hover:bg-pdv-green2",
        variant === "secondary" && "border border-pdv-border bg-pdv-card text-pdv-text hover:border-pdv-green/60",
        variant === "danger" && "bg-pdv-danger text-white hover:bg-red-700",
        variant === "ghost" && "text-pdv-muted hover:bg-white/5 hover:text-pdv-text",
        className
      )}
      {...props}
    />
  );
}
