"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { toMoney } from "@/lib/money";
import { useSaleStore } from "@/store/sale-store";

export function WrongPriceModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const state = useSaleStore();
  const [productId, setProductId] = useState("");
  const item = state.items.find(i => i.productId === productId) ?? state.items[0];
  const [newPrice, setNewPrice] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  if (!open) return null;
  async function save() {
    if (!item) return;
    setLoading(true); setError("");
    const value = Number(newPrice);
    const res = await fetch("/api/products/wrong-price", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productId: item.productId, newPrice: value, origin: "WRONG_PRICE" }) });
    const json = await res.json();
    setLoading(false);
    if (!json.ok) return setError(json.message ?? "Erro ao corrigir preço.");
    state.updateItemPrice(item.productId, value);
    onClose();
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6">
      <div className="w-full max-w-lg rounded-2xl border border-pdv-green/40 bg-pdv-card p-6 shadow-glow">
        <h2 className="text-xl font-black">Produto com valor errado</h2>
        <label className="mt-4 block text-sm text-pdv-muted">Item da venda</label>
        <select value={productId || item?.productId || ""} onChange={e => setProductId(e.target.value)} className="mt-1 h-11 w-full rounded-lg border border-pdv-border bg-black/20 px-3">
          {state.items.map(i => <option key={i.productId} value={i.productId}>{i.name}</option>)}
        </select>
        {item ? <div className="mt-4 rounded-xl border border-pdv-border bg-black/20 p-4 text-sm"><div>Valor atual</div><b className="text-xl text-pdv-green">{toMoney(item.unitPrice)}</b></div> : null}
        <label className="mt-4 block text-sm text-pdv-muted">Valor correto</label>
        <input value={newPrice} onChange={e => setNewPrice(e.target.value)} type="number" className="mt-1 h-11 w-full rounded-lg border border-pdv-border bg-black/20 px-3" />
        {error ? <div className="mt-3 rounded-lg border border-red-800 bg-red-950/30 p-3 text-sm text-red-200">{error}</div> : null}
        <div className="mt-6 flex justify-end gap-2"><Button variant="secondary" onClick={onClose}>Cancelar</Button><Button disabled={loading || !newPrice} onClick={save}>Salvar correção</Button></div>
      </div>
    </div>
  );
}
