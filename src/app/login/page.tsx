import { BarChart3, Boxes, History, ShieldCheck, ShoppingCart, Users } from "lucide-react";
import { LoginForm } from "@/components/auth/LoginForm";
import { Logo } from "@/components/brand/Logo";

const features = [
  { label: "Vendas", text: "PDV rapido e eficiente", icon: ShoppingCart },
  { label: "Estoque", text: "Produtos e inventario", icon: Boxes },
  { label: "Historico", text: "Movimentacoes claras", icon: History },
  { label: "Usuarios", text: "Perfis e permissoes", icon: Users },
  { label: "Relatorios", text: "Insights gerenciais", icon: BarChart3 },
  { label: "Seguro", text: "Sessao protegida", icon: ShieldCheck }
];

export default function LoginPage() {
  return (
    <main className="pdv-shell-bg grid min-h-screen grid-cols-1 overflow-hidden p-5 lg:grid-cols-[1fr_620px]">
      <section className="relative hidden min-h-[calc(100vh-2.5rem)] items-center rounded-2xl border border-pdv-green/20 bg-[linear-gradient(90deg,rgba(6,38,14,.92),rgba(5,8,7,.7)),url('/icon.svg')] bg-[length:180px] bg-left-top p-16 shadow-glow lg:flex">
        <div className="absolute inset-y-12 right-0 w-px bg-gradient-to-b from-transparent via-pdv-green to-transparent" />
        <div className="max-w-2xl">
          <div className="mb-6 w-fit rounded bg-pdv-green px-3 py-1 text-xs font-black uppercase tracking-[.45em] text-[#17330f]">Sistema de gestao</div>
          <h2 className="max-w-xl text-5xl font-black leading-tight text-white">
            Completo para o <span className="text-pdv-green">seu mercadinho</span>, simples para o dia a dia.
          </h2>
          <p className="mt-5 max-w-lg text-lg leading-8 text-pdv-muted">Gerencie vendas, estoque, clientes e relatorios com agilidade, seguranca e praticidade.</p>
          <div className="mt-10 grid max-w-xl grid-cols-3 gap-4">
            {features.map(({ label, text, icon: Icon }) => (
              <div key={label} className="rounded-xl border border-white/10 bg-white/[.055] p-4 text-center shadow-glow">
                <Icon className="mx-auto mb-3 text-pdv-green" size={30} />
                <div className="font-black text-white">{label}</div>
                <div className="mt-1 text-xs leading-5 text-pdv-muted">{text}</div>
              </div>
            ))}
          </div>
          <div className="mt-8 rounded-xl border border-white/10 bg-white/[.055] p-4 text-sm text-pdv-muted">
            <b className="text-white">Seguro, confiavel e sempre disponivel.</b>
            <span className="ml-2">Operacao pensada para balcao de mercado.</span>
          </div>
        </div>
      </section>
      <section className="flex min-h-[calc(100vh-2.5rem)] items-center justify-center p-6">
        <div className="w-full max-w-xl">
          <div className="mb-8 flex justify-center"><Logo /></div>
          <LoginForm />
        </div>
      </section>
    </main>
  );
}
