"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BarChart3, Boxes, ClipboardList, CreditCard, History, LogOut, Package, Settings, ShieldCheck, ShoppingCart, Users } from "lucide-react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";

type User = { name: string; username: string; role: "MANAGER" | "SELLER" };

const nav = [
  { href: "/app/dashboard", label: "Dashboard", icon: BarChart3, managerOnly: false },
  { href: "/app/vendas", label: "Vendas", icon: ShoppingCart, managerOnly: false },
  { href: "/app/produtos", label: "Produtos", icon: Package, managerOnly: false },
  { href: "/app/estoque", label: "Estoque", icon: Boxes, managerOnly: false },
  { href: "/app/historico", label: "Histórico", icon: History, managerOnly: false },
  { href: "/app/fiado", label: "Fiado", icon: CreditCard, managerOnly: false },
  { href: "/app/relatorios", label: "Relatórios", icon: ClipboardList, managerOnly: true },
  { href: "/app/auditoria", label: "Auditoria", icon: ShieldCheck, managerOnly: true },
  { href: "/app/usuarios", label: "Usuários", icon: Users, managerOnly: true },
  { href: "/app/configuracoes", label: "Configurações", icon: Settings, managerOnly: true }
];

export function AppShell({ children, user }: { children: React.ReactNode; user: User }) {
  const pathname = usePathname();
  const router = useRouter();
  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }
  return (
    <div className="flex min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(140,203,25,.12),transparent_35%),#07100B]">
      <aside className="fixed inset-y-0 left-0 z-10 flex w-64 flex-col border-r border-pdv-border bg-black/35 p-4 backdrop-blur">
        <div className="mb-8">
          <div className="text-[10px] font-bold uppercase tracking-[.35em] text-pdv-green">Sistema de Gestão</div>
          <div className="text-xl font-black leading-tight text-white">ALAMEDA DAS<br/><span className="text-pdv-green">ÁRVORES</span></div>
        </div>
        <nav className="space-y-1">
          {nav.filter(i => !i.managerOnly || user.role === "MANAGER").map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return <Link key={item.href} href={item.href} className={cn("flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-pdv-muted hover:bg-white/5 hover:text-white", active && "bg-pdv-green text-black hover:bg-pdv-green hover:text-black")}> <Icon size={18}/> {item.label}</Link>;
          })}
        </nav>
        <div className="mt-auto rounded-xl border border-pdv-border bg-pdv-card p-3 text-xs text-pdv-muted">
          <div className="font-semibold text-white">{user.name}</div>
          <div>{user.role === "MANAGER" ? "Gerente" : "Vendedor"}</div>
          <Button variant="ghost" onClick={logout} className="mt-3 w-full justify-start px-2"><LogOut size={16}/> Sair</Button>
        </div>
      </aside>
      <main className="ml-64 w-[calc(100%-16rem)] p-6">
        {children}
      </main>
    </div>
  );
}
