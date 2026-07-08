"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, User } from "lucide-react";
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
    <form onSubmit={submit} className="w-full max-w-md rounded-2xl border border-pdv-border bg-pdv-card p-8 shadow-glow">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-2 w-fit rounded-full border border-pdv-green/30 px-3 py-1 text-xs font-bold tracking-[.25em] text-pdv-green">MERCADINHO</div>
        <h1 className="text-3xl font-black">ALAMEDA DAS <span className="text-pdv-green">ÁRVORES</span></h1>
        <p className="mt-3 text-sm text-pdv-muted">Faça login para acessar o sistema.</p>
      </div>
      <label className="mb-2 block text-sm text-pdv-muted">Usuário</label>
      <div className="relative mb-4"><User className="absolute left-3 top-3 text-pdv-muted" size={18}/><Input value={username} onChange={e => setUsername(e.target.value)} className="w-full pl-10" placeholder="Digite seu usuário" autoFocus /></div>
      <label className="mb-2 block text-sm text-pdv-muted">Senha</label>
      <div className="relative mb-4"><Lock className="absolute left-3 top-3 text-pdv-muted" size={18}/><Input value={password} onChange={e => setPassword(e.target.value)} className="w-full pl-10" placeholder="Digite sua senha" type="password" /></div>
      {error ? <div className="mb-4 rounded-lg border border-red-800 bg-red-950/40 p-3 text-sm text-red-200">{error}</div> : null}
      <Button disabled={loading} className="h-12 w-full">{loading ? "Entrando..." : "Entrar"}</Button>
      <p className="mt-5 text-center text-xs text-pdv-muted">Acesso seguro com sessão protegida.</p>
    </form>
  );
}
