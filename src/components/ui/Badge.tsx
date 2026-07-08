import { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return <span className={cn("inline-flex items-center rounded-full border border-pdv-border bg-black/20 px-2 py-1 text-xs text-pdv-muted", className)} {...props} />;
}
