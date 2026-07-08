import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <main className="grid min-h-screen grid-cols-1 bg-[radial-gradient(circle_at_top_left,rgba(140,203,25,.18),transparent_35%),#07100B] lg:grid-cols-2">
      <section className="hidden items-center justify-center p-10 lg:flex">
        <div className="max-w-lg">
          <div className="mb-4 text-xs font-bold uppercase tracking-[.35em] text-pdv-green">Sistema de gestão</div>
          <h2 className="text-5xl font-black leading-tight">Completo para o seu <span className="text-pdv-green">mercadinho</span>, simples para o dia a dia.</h2>
          <p className="mt-5 text-pdv-muted">Gerencie vendas, estoque, clientes fiado e relatórios com agilidade, segurança e praticidade.</p>
          <div className="mt-8 grid grid-cols-3 gap-3 text-sm">
            {['Vendas rápidas', 'Estoque vivo', 'Relatórios claros', 'Fiado controlado', 'Auditoria', 'Permissões'].map(t => <div key={t} className="rounded-xl border border-pdv-border bg-pdv-card p-4 text-center font-semibold">{t}</div>)}
          </div>
        </div>
      </section>
      <section className="flex items-center justify-center p-6"><LoginForm/></section>
    </main>
  );
}
