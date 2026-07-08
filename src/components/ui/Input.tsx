import { InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn("h-11 rounded-lg border border-pdv-border bg-black/20 px-3 text-sm outline-none placeholder:text-pdv-muted focus:border-pdv-green", className)} {...props} />;
}
