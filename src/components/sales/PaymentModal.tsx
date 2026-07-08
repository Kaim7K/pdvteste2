"use client";

import { useState } from "react";
import { Banknote, CreditCard, HandCoins, Landmark, MoreHorizontal, Users, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { toMoney } from "@/lib/money";
import { selectTotals, useSaleStore } from "@/store/sale-store";

const methods = [
  ["CASH", "Dinheiro", Banknote],
  ["DEBIT", "Debito", CreditCard],
  ["CREDIT", "Credito", CreditCard],
  ["PIX", "Pix", Landmark],
  ["OTHER", "Outros", MoreHorizontal],
  ["CREDIT_SALE", "Fiado", Users]
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
  const discountAmount = Math.max(0, totals.subtotal - totals.total);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6 backdrop-blur-sm">
      <div className="pdv-glass grid max-h-[92vh] w-full max-w-6xl grid-cols-[1fr_1.08fr] gap-7 overflow-auto rounded-2xl border-pdv-green/60 p-7">
        <button onClick={onClose} className="absolute right-8 top-8 text-pdv-muted hover:text-white"><X/></button>
        <div>
          <h2 className="mb-5 text-2xl font-black uppercase">Forma de pagamento</h2>
          <label className="mb-2 block text-sm font-bold">Observacao</label>
          <textarea value={state.observation} onChange={e => state.setObservation(e.target.value)} placeholder="Adicione uma observacao para esta venda..." className="mb-5 h-20 w-full rounded-xl border border-pdv-border bg-black/25 p-3 text-sm outline-none focus:border-pdv-green" />
          <h3 className="mb-3 font-black">Itens do pedido ({state.items.length})</h3>
          <div className="max-h-72 space-y-2 overflow-auto pr-1">
            {state.items.map(item => (
              <div key={item.productId} className="grid grid-cols-[44px_1fr_auto] items-center gap-3 rounded-xl border border-pdv-border bg-black/20 p-2 text-sm">
                <div className="flex h-10 w-10 items-center justify-center rounded bg-pdv-green/10 text-xs font-black text-pdv-green">{item.quantity}x</div>
                <div className="min-w-0"><div className="truncate font-bold text-white">{item.name}</div><div className="text-xs text-pdv-muted">{item.productId.slice(0, 10)}</div></div>
                <b>{toMoney(item.subtotal)}</b>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-5 rounded-xl border border-pdv-border bg-black/20 p-5">
            <h3 className="mb-4 font-black">Resumo do pedido</h3>
            <div className="grid grid-cols-[1fr_auto] gap-y-3 text-sm">
              <span className="text-pdv-muted">Quantidade total de itens</span><b>{state.items.length}</b>
              <span className="text-pdv-muted">Subtotal</span><b>{toMoney(totals.subtotal)}</b>
              <span className="text-pdv-muted">Desconto</span><b className="text-pdv-green">{toMoney(discountAmount)}</b>
              <span className="text-pdv-muted">Valor ja pago</span><b>{toMoney(totals.paid)}</b>
              <span className="text-pdv-muted">Valor restante</span><b className="text-orange-400">{toMoney(totals.remaining)}</b>
            </div>
            <div className="mt-5 flex items-end justify-between border-t border-pdv-border pt-4">
              <span className="font-black">Valor total</span>
              <span className="text-4xl font-black text-pdv-green">{toMoney(totals.total)}</span>
            </div>
            <div className="mt-4 rounded-xl border border-pdv-green/45 bg-pdv-green/10 p-4">
              <div className="text-sm font-black text-pdv-green">Troco</div>
              <div className="text-right text-3xl font-black text-pdv-green">{toMoney(totals.change)}</div>
            </div>
          </div>

          <div className="mb-4 grid grid-cols-6 gap-2">
            {methods.map(([value, label, Icon]) => (
              <button key={value} onClick={() => setMethod(value)} className={method === value ? "rounded-xl border border-pdv-green bg-pdv-green/20 p-3 text-pdv-green" : "rounded-xl border border-pdv-border bg-black/20 p-3 text-pdv-muted hover:border-pdv-green/60"}>
                <Icon className="mx-auto mb-2" size={28}/>
                <span className="text-xs font-black">{label}</span>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-[1fr_auto] gap-3">
            <input value={amount} onChange={e => setAmount(e.target.value)} type="number" placeholder={toMoney(totals.remaining)} className="h-14 rounded-xl border border-pdv-border bg-black/25 px-4 text-2xl font-black text-pdv-green outline-none focus:border-pdv-green"/>
            <Button variant="secondary" onClick={addPayment} className="h-14"><HandCoins size={18}/> Adicionar</Button>
          </div>

          {hasCredit ? <div className="mt-3 grid grid-cols-2 gap-2"><input value={creditName} onChange={e => setCreditName(e.target.value)} placeholder="Nome do responsavel" className="h-12 rounded-lg border border-pdv-border bg-black/20 px-3"/><input value={creditPhone} onChange={e => setCreditPhone(e.target.value)} placeholder="Telefone opcional" className="h-12 rounded-lg border border-pdv-border bg-black/20 px-3"/></div> : null}

          <div className="mt-3 grid grid-cols-2 gap-3">{state.payments.map((p, i) => <div key={i} className="rounded-xl border border-pdv-border bg-black/20 p-3 text-sm"><div className="flex justify-between"><span>{p.paymentMethod}</span><button onClick={() => state.removePayment(i)} className="text-red-400">x</button></div><b className="mt-1 block text-2xl text-pdv-green">{toMoney(p.amount)}</b></div>)}</div>
          {error ? <div className="mt-3 rounded-lg border border-red-800 bg-red-950/30 p-3 text-sm text-red-200">{error}</div> : null}

          <div className="mt-6 grid grid-cols-3 gap-3">
            <Button variant="secondary" onClick={onClose} className="h-14">Minimizar <span className="ml-auto text-xs">F11</span></Button>
            <Button disabled={loading || (!state.payments.some(p => p.paymentMethod === "CREDIT_SALE") && totals.remaining > 0)} onClick={finish} className="h-14">Concluir venda <span className="ml-auto text-xs">F10</span></Button>
            <Button variant="danger" onClick={state.clear} className="h-14">Descartar <span className="ml-auto text-xs">F8</span></Button>
          </div>
        </div>
      </div>
    </div>
  );
}
