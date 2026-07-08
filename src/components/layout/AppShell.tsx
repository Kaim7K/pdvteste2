"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, BarChart3, Boxes, ClipboardList, CreditCard, History, LogOut, Package, Settings, ShieldCheck, ShoppingCart, Store, Users } from "lucide-react";
import { cn } from "@/lib/cn";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";

type User = { name: string; username: string; role: "MANAGER" | "SELLER" };

const nav = [
  { href: "/app/dashboard", label: "Dashboard", icon: BarChart3, managerOnly: false },
  { href: "/app/vendas", label: "Vendas", icon: ShoppingCart, managerOnly: false },
  { href: "/app/estoque", label: "Estoque", icon: Boxes, managerOnly: false },
  { href: "/app/produtos", label: "Produtos", icon: Package, managerOnly: false },
  { href: "/app/historico", label: "Historico", icon: History, managerOnly: false },
  { href: "/app/fiado", label: "Fiado", icon: CreditCard, managerOnly: false },
  { href: "/app/relatorios", label: "Relatorios", icon: ClipboardList, managerOnly: true },
  { href: "/app/auditoria", label: "Auditoria", icon: ShieldCheck, managerOnly: true },
  { href: "/app/usuarios", label: "Usuarios", icon: Users, managerOnly: true },
  { href: "/app/configuracoes", label: "Configuracoes", icon: Settings, managerOnly: true }
];

export function AppShell({ children, user }: { children: React.ReactNode; user: User }) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <div className="pdv-shell-bg min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-20 flex w-64 flex-col border-r border-white/10 bg-[linear-gradient(180deg,rgba(8,48,18,.92),rgba(4,8,7,.96))] p-5 shadow-[18px_0_45px_rgba(0,0,0,.25)]">
        <div className="mb-9">
          <Logo compact />
        </div>

        <nav className="space-y-1">
          {nav.filter(i => !i.managerOnly || user.role === "MANAGER").map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex h-12 items-center gap-3 rounded-lg px-3 text-sm font-bold text-pdv-muted transition hover:bg-white/7 hover:text-white",
                  active && "bg-pdv-green text-[#0b1407] shadow-[0_12px_26px_rgba(140,203,25,.22)] hover:bg-pdv-green hover:text-[#0b1407]"
                )}
              >
                <Icon size={20} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto space-y-4">
          <div className="rounded-xl border border-white/12 bg-black/25 p-4">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-pdv-green/15 text-pdv-green">
                <Store size={22} />
              </div>
              <div>
                <div className="text-sm font-black text-white">Loja Matriz</div>
                <div className="text-xs text-pdv-muted">Sistema online</div>
              </div>
            </div>
            <div className="text-xs leading-5 text-pdv-muted">Alameda das Arvores, 123<br/>Operacao em tempo real</div>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/25 p-3 text-xs text-pdv-muted">
            <div className="font-black text-white">{user.name}</div>
            <div>{user.role === "MANAGER" ? "Gerente" : "Vendedor"} ativo</div>
            <Button variant="ghost" onClick={logout} className="mt-3 w-full justify-start px-2"><LogOut size={16}/> Sair</Button>
          </div>
        </div>
      </aside>

      <div className="ml-64 min-h-screen">
        <header className="sticky top-0 z-10 flex h-20 items-center justify-between border-b border-white/10 bg-black/30 px-7 backdrop-blur-xl">
          <div className="flex w-full max-w-3xl items-center rounded-xl border border-pdv-green/35 bg-black/35 px-4 py-3 text-pdv-muted">
            <span className="text-sm">Busque produto, codigo de barras, cliente ou venda...</span>
            <kbd className="ml-auto rounded bg-white/10 px-2 py-1 text-xs">F2</kbd>
          </div>
          <div className="ml-6 flex items-center gap-5">
            <div className="relative text-pdv-muted">
              <Bell size={22} />
              <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-pdv-green" />
            </div>
            <div className="text-right">
              <div className="text-xs text-pdv-muted">Caixa 01</div>
              <div className="font-black text-white">{user.name}</div>
            </div>
            <div className="rounded-full border border-pdv-green/30 bg-pdv-green/10 px-3 py-1 text-xs font-black uppercase text-pdv-green">
              {user.role === "MANAGER" ? "Gerente" : "Operador"}
            </div>
          </div>
        </header>
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
