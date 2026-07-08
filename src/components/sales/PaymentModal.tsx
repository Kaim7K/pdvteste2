"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { toMoney } from "@/lib/money";
import { selectTotals, useSaleStore } from "@/store/sale-store";

const methods = [
  ["CASH", "Dinheiro"], ["DEBIT", "Débito"], ["CREDIT", "Crédito"], ["PIX", "Pix"], ["OTHER", "Outros"], ["CREDIT_SALE", "Fiado"]
] as const;

export function PaymentModal({ open, onClose, onFinished }: { open: boolean; onClose: () => void; onFinished: (saleId: string) => void }) {
  const state = useSaleStore();
  const totals = selectTotals(state);
  const [method, setMethod] = useState<typeof methods[number][0]>("CASH");
  const [amount, setAmount] = useState("");
  const [creditName, setCreditName] = useState("");
  const [creditPhone, setCreditPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  function addPayment() {
    const value = amount ? Number(amount) : totals.remaining;
    state.addPayment({ paymentMethod: method, amount: value, changeAmount: method === "CASH" ? Math.max(0, value - totals.remaining) : 0 });
    setAmount("");
  }

  async function finish() {
    setError("");
    setLoading(true);
    const hasCredit = state.payments.some(p => p.paymentMethod === "CREDIT_SALE");
    const res = await fetch("/api/sales", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({
      items: state.items.map(i => ({ productId: i.productId, quantity: i.quantity, weight: i.weight, unitPrice: i.unitPrice, subtotal: i.subtotal })),
      payments: state.payments,
      discountType: state.discountType,
      discountValue: state.discountValue,
      observation: state.observation,
      creditCustomer: hasCredit ? { name: creditName, phone: creditPhone } : null
    }) });
    const json = await res.json();
    setLoading(false);
    if (!json.ok) return setError(json.message ?? "Erro ao finalizar venda.");
    const saleId = json.data.id;
    state.clear();
    onFinished(saleId);
    onClose();
  }

  const hasCredit = state.payments.some(p => p.paymentMethod === "CREDIT_SALE") || method === "CREDIT_SALE";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6">
      <div className="w-full max-w-5xl rounded-2xl border border-pdv-green/40 bg-pdv-card p-6 shadow-glow">
        <div className="mb-4 flex items-center justify-between"><h2 className="text-xl font-black">Forma de pagamento</h2><button onClick={onClose}><X/></button></div>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <textarea value={state.observation} onChange={e => state.setObservation(e.target.value)} placeholder="Observação opcional" className="mb-4 h-20 w-full rounded-lg border border-pdv-border bg-black/20 p-3 text-sm" />
            <div className="max-h-64 overflow-auto rounded-xl border border-pdv-border">
              {state.items.map(item => <div key={item.productId} className="flex justify-between border-b border-pdv-border p-3 text-sm"><span>{item.quantity}x {item.name}</span><b>{toMoney(item.subtotal)}</b></div>)}
            </div>
          </div>
          <div>
            <div className="mb-4 rounded-xl border border-pdv-border bg-black/20 p-4">
              <div className="flex justify-between text-sm"><span>Quantidade de itens</span><b>{state.items.length}</b></div>
              <div className="flex justify-between text-sm"><span>Subtotal</span><b>{toMoney(totals.subtotal)}</b></div>
              <div className="flex justify-between text-sm"><span>Valor já pago</span><b>{toMoney(totals.paid)}</b></div>
              <div className="mt-2 flex justify-between text-2xl font-black"><span>Total</span><span className="text-pdv-green">{toMoney(totals.total)}</span></div>
              <div className="mt-2 rounded-lg border border-pdv-green/30 bg-pdv-green/10 p-3 text-right text-xl font-black text-pdv-green">Troco: {toMoney(totals.change)}</div>
              <div className="mt-2 text-right text-sm text-pdv-muted">Restante: {toMoney(totals.remaining)}</div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {methods.map(([value, label]) => <button key={value} onClick={() => setMethod(value)} className={`rounded-xl border p-3 text-sm font-bold ${method === value ? "border-pdv-green bg-pdv-green text-black" : "border-pdv-border bg-black/20 text-pdv-muted"}`}>{label}</button>)}
            </div>
            <div className="mt-3 flex gap-2"><input value={amount} onChange={e => setAmount(e.target.value)} type="number" placeholder={toMoney(totals.remaining)} className="h-11 flex-1 rounded-lg border border-pdv-border bg-black/20 px-3"/><Button variant="secondary" onClick={addPayment}>Adicionar</Button></div>
            {hasCredit ? <div className="mt-3 grid grid-cols-2 gap-2"><input value={creditName} onChange={e => setCreditName(e.target.value)} placeholder="Nome do responsável" className="h-11 rounded-lg border border-pdv-border bg-black/20 px-3"/><input value={creditPhone} onChange={e => setCreditPhone(e.target.value)} placeholder="Telefone opcional" className="h-11 rounded-lg border border-pdv-border bg-black/20 px-3"/></div> : null}
            <div className="mt-3 space-y-2">{state.payments.map((p, i) => <div key={i} className="flex justify-between rounded-lg border border-pdv-border bg-black/20 p-2 text-sm"><span>{p.paymentMethod}</span><b>{toMoney(p.amount)}</b><button onClick={() => state.removePayment(i)} className="text-red-400">remover</button></div>)}</div>
            {error ? <div className="mt-3 rounded-lg border border-red-800 bg-red-950/30 p-3 text-sm text-red-200">{error}</div> : null}
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3"><Button variant="secondary" onClick={onClose}>Minimizar modal</Button><Button disabled={loading || (!state.payments.some(p => p.paymentMethod === "CREDIT_SALE") && totals.remaining > 0)} onClick={finish}>Concluir venda F10</Button></div>
      </div>
    </div>
  );
}
