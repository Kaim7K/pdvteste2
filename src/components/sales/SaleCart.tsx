"use client";

import { CreditCard, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { toMoney } from "@/lib/money";
import { useSaleStore, selectTotals } from "@/store/sale-store";

export function SaleCart({ onOpenPayment, onWrongPrice, onMinimize }: { onOpenPayment: () => void; onWrongPrice: () => void; onMinimize: () => void }) {
  const state = useSaleStore();
  const totals = selectTotals(state);

  return (
    <Card className="sticky top-24 flex h-[calc(100vh-7rem)] flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b border-pdv-border bg-white/[.025] p-4">
        <div>
          <h2 className="text-xl font-black">Venda atual</h2>
          <p className="text-xs text-pdv-muted">Itens adicionados ao caixa</p>
        </div>
        <Button variant="secondary" onClick={state.clear} disabled={!state.items.length} className="h-9 px-3">
          <Trash2 size={16}/> Esvaziar
        </Button>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {state.items.length === 0 ? <div className="rounded-xl border border-dashed border-pdv-border p-8 text-center text-sm text-pdv-muted">Escaneie ou pesquise produtos para iniciar.</div> : null}
        <div className="space-y-2">
          {state.items.map((item, index) => (
            <div key={item.productId} className="grid grid-cols-[28px_1fr_76px_88px_28px] items-center gap-3 rounded-xl border border-pdv-border bg-black/20 p-3">
              <div className="text-sm font-black text-pdv-muted">{index + 1}</div>
              <div className="min-w-0">
                <div className="truncate text-sm font-black text-white">{item.name}</div>
                <div className="text-xs text-pdv-muted">{toMoney(item.unitPrice)} unit.</div>
              </div>
              <input
                type="number"
                value={item.quantity}
                min={0.001}
                step={1}
                onChange={e => state.updateQuantity(item.productId, Number(e.target.value))}
                className="h-10 rounded-lg border border-pdv-border bg-pdv-bg px-2 text-center text-sm font-bold"
              />
              <div className="text-right text-sm font-black text-white">{toMoney(item.subtotal)}</div>
              <button onClick={() => state.removeItem(item.productId)} className="text-red-400 hover:text-red-300"><Trash2 size={18}/></button>
              {item.unitType === "WEIGHT" ? (
                <label className="col-span-5 grid grid-cols-[70px_1fr] items-center gap-2 text-xs text-pdv-muted">
                  Peso
                  <input type="number" value={item.weight ?? 0} min={0.001} step={0.001} onChange={e => state.updateWeight(item.productId, Number(e.target.value))} className="h-9 rounded-lg border border-pdv-border bg-pdv-bg px-2 text-sm"/>
                </label>
              ) : null}
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-pdv-border p-4">
        <div className="mb-4 grid grid-cols-[1fr_auto] gap-y-2 text-sm">
          <span className="text-pdv-muted">Itens</span><b>{state.items.length}</b>
          <span className="text-pdv-muted">Subtotal</span><b>{toMoney(totals.subtotal)}</b>
          <span className="text-pdv-muted">Desconto</span>
          <div className="flex items-center gap-2">
            <select value={state.discountType} onChange={e => state.setDiscount(e.target.value as any, state.discountValue)} className="h-8 rounded border border-pdv-border bg-pdv-bg px-2 text-xs">
              <option value="NONE">Sem</option><option value="FIXED">R$</option><option value="PERCENTAGE">%</option>
            </select>
            <input type="number" value={state.discountValue} onChange={e => state.setDiscount(state.discountType, Number(e.target.value))} className="h-8 w-20 rounded border border-pdv-border bg-pdv-bg px-2 text-xs"/>
          </div>
        </div>
        <div className="mb-4 rounded-xl border border-pdv-green/25 bg-pdv-green/10 p-4">
          <div className="text-xs font-bold uppercase text-pdv-muted">Total geral</div>
          <div className="text-right text-4xl font-black text-pdv-green">{toMoney(totals.total)}</div>
        </div>
        <div className="grid gap-2">
          <Button onClick={onOpenPayment} disabled={!state.items.length} className="h-14 text-base"><CreditCard size={20}/> Forma de pagamento <span className="ml-auto text-xs">F9</span></Button>
          <Button variant="secondary" onClick={onMinimize} disabled={!state.items.length} className="h-12">Minimizar venda <span className="ml-auto text-xs">F11</span></Button>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="secondary" onClick={onWrongPrice} disabled={!state.items.length}><Pencil size={16}/> Valor errado <span className="text-xs">F7</span></Button>
            <Button variant="danger" onClick={state.clear} disabled={!state.items.length}>Descartar <span className="text-xs">F8</span></Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
