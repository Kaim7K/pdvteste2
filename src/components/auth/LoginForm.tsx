"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Lock, ShieldCheck, User } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function LoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username, password }) });
    const json = await res.json();
    setLoading(false);
    if (!json.ok) return setError(json.message ?? "Falha no login.");
    router.push("/app/dashboard");
  }

  return (
    <form onSubmit={submit} className="pdv-glass w-full rounded-2xl p-9">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-pdv-green/30 bg-pdv-green/10 text-pdv-green shadow-glow">
          <Lock size={26} />
        </div>
        <h1 className="text-3xl font-black">Bem-vindo de volta!</h1>
        <p className="mt-3 text-sm text-pdv-muted">Faca login para acessar o sistema</p>
      </div>
      <label className="mb-2 block text-sm text-white">Usuario</label>
      <div className="relative mb-5">
        <User className="absolute left-4 top-3.5 text-pdv-muted" size={20} />
        <Input value={username} onChange={e => setUsername(e.target.value)} className="w-full pl-12" placeholder="Digite seu usuario" autoFocus />
      </div>
      <label className="mb-2 block text-sm text-white">Senha</label>
      <div className="relative mb-5">
        <Lock className="absolute left-4 top-3.5 text-pdv-muted" size={20} />
        <Input value={password} onChange={e => setPassword(e.target.value)} className="w-full pl-12" placeholder="Digite sua senha" type="password" />
      </div>
      <div className="mb-6 flex items-center justify-between text-sm">
        <label className="flex items-center gap-2 text-pdv-muted"><input type="checkbox" className="h-4 w-4 accent-pdv-green" defaultChecked /> Lembrar acesso</label>
        <span className="font-semibold text-pdv-green">Esqueci minha senha</span>
      </div>
      {error ? <div className="mb-4 rounded-lg border border-red-800 bg-red-950/40 p-3 text-sm text-red-200">{error}</div> : null}
      <Button disabled={loading} className="h-14 w-full text-base">{loading ? "Entrando..." : <>Entrar <ArrowRight size={20}/></>}</Button>
      <div className="mt-7 flex items-center justify-center gap-3 border-t border-pdv-border pt-6 text-sm text-pdv-muted">
        <ShieldCheck size={20} className="text-pdv-green" />
        Acesso seguro com sessao protegida.
      </div>
    </form>
  );
}
