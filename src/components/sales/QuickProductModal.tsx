"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

export function QuickProductModal({ barcode, open, onClose, onCreated }: { barcode: string; open: boolean; onClose: () => void; onCreated: (product: any) => void }) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  if (!open) return null;
  async function save() {
    setError("");
    setLoading(true);
    const res = await fetch("/api/products/quick", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ barcode, name }) });
    const json = await res.json();
    setLoading(false);
    if (!json.ok) return setError(json.message ?? "Erro ao cadastrar produto.");
    setName("");
    onCreated(json.data);
    onClose();
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6">
      <div className="w-full max-w-md rounded-2xl border border-pdv-green/40 bg-pdv-card p-6 shadow-glow">
        <h2 className="text-xl font-black">Cadastro rápido</h2>
        <p className="mt-1 text-sm text-pdv-muted">Código não cadastrado. Cadastre só o essencial e venda.</p>
        <label className="mt-5 block text-sm text-pdv-muted">Código de barras</label>
        <input value={barcode} readOnly className="mt-1 h-11 w-full rounded-lg border border-pdv-border bg-black/20 px-3 text-sm" />
        <label className="mt-4 block text-sm text-pdv-muted">Nome do produto</label>
        <input value={name} onChange={e => setName(e.target.value)} autoFocus className="mt-1 h-11 w-full rounded-lg border border-pdv-border bg-black/20 px-3 text-sm" />
        <Button variant="secondary" className="mt-4 w-full" type="button">Buscar imagem do produto</Button>
        {error ? <div className="mt-3 rounded-lg border border-red-800 bg-red-950/30 p-3 text-sm text-red-200">{error}</div> : null}
        <div className="mt-6 flex justify-end gap-2"><Button variant="secondary" onClick={onClose}>Cancelar</Button><Button disabled={loading || name.length < 2} onClick={save}>{loading ? "Salvando..." : "Salvar e adicionar"}</Button></div>
      </div>
    </div>
  );
}
