import { cn } from "@/lib/cn";

export function Logo({ compact = false, className }: { compact?: boolean; className?: string }) {
  return (
    <div className={cn("relative inline-flex flex-col leading-none", compact ? "pl-3" : "pl-5", className)}>
      <span
        aria-hidden
        className={cn(
          "absolute left-0 top-2 rounded-tl-[2rem] border-l-2 border-t-2 border-pdv-green",
          compact ? "h-12 w-16" : "h-20 w-28"
        )}
      />
      <span className={cn("relative z-10 ml-7 w-fit rounded-full bg-pdv-green px-3 py-1 text-[8px] font-black uppercase tracking-[.42em] text-[#183314]", compact && "ml-5 px-2 py-0.5 text-[6px]")}>
        Mercadinho
      </span>
      <span className={cn("relative z-10 mt-2 block font-black uppercase tracking-[-.02em] text-white", compact ? "text-xl" : "text-4xl")}>
        Alameda das
      </span>
      <span className={cn("relative z-10 block font-black uppercase tracking-[-.03em] text-pdv-green", compact ? "text-2xl" : "text-5xl")}>
        Arvores
      </span>
    </div>
  );
}
