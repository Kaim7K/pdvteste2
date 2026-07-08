"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { toMoney } from "@/lib/money";
import { useSaleStore, selectTotals } from "@/store/sale-store";

export function SaleCart({ onOpenPayment, onWrongPrice, onMinimize }: { onOpenPayment: () => void; onWrongPrice: () => void; onMinimize: () => void }) {
  const state = useSaleStore();
  const totals = selectTotals(state);

  return (
    <Card className="flex h-[calc(100vh-9rem)] flex-col p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-black">Venda atual</h2>
        <span className="text-xs text-pdv-muted">Itens: {state.items.length}</span>
      </div>
      <div className="flex-1 overflow-auto pr-1">
        {state.items.length === 0 ? <div className="rounded-xl border border-dashed border-pdv-border p-6 text-center text-sm text-pdv-muted">Escaneie ou pesquise produtos para iniciar.</div> : null}
        <div className="space-y-2">
          {state.items.map((item, index) => (
            <div key={item.productId} className="rounded-lg border border-pdv-border bg-black/20 p-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-xs text-pdv-muted">#{index + 1}</div>
                  <div className="text-sm font-semibold text-white">{item.name}</div>
                </div>
                <button onClick={() => state.removeItem(item.productId)} className="rounded-md p-1 text-red-400 hover:bg-red-950"><Trash2 size={16}/></button>
              </div>
              <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                <label>Qtd.<input type="number" value={item.quantity} min={0.001} step={1} onChange={e => state.updateQuantity(item.productId, Number(e.target.value))} className="mt-1 w-full rounded border border-pdv-border bg-pdv-bg px-2 py-1"/></label>
                {item.unitType === "WEIGHT" ? <label>Peso<input type="number" value={item.weight ?? 0} min={0.001} step={0.001} onChange={e => state.updateWeight(item.productId, Number(e.target.value))} className="mt-1 w-full rounded border border-pdv-border bg-pdv-bg px-2 py-1"/></label> : <div/>}
                <div className="text-right"><div className="text-pdv-muted">Subtotal</div><div className="mt-1 font-bold text-pdv-green">{toMoney(item.subtotal)}</div></div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-4 border-t border-pdv-border pt-4">
        <div className="mb-2 flex items-center justify-between text-sm"><span className="text-pdv-muted">Subtotal</span><span>{toMoney(totals.subtotal)}</span></div>
        <div className="mb-2 grid grid-cols-2 gap-2">
          <select value={state.discountType} onChange={e => state.setDiscount(e.target.value as any, state.discountValue)} className="rounded-lg border border-pdv-border bg-pdv-bg px-2 py-2 text-sm">
            <option value="NONE">Sem desconto</option><option value="FIXED">Desconto R$</option><option value="PERCENTAGE">Desconto %</option>
          </select>
          <input type="number" value={state.discountValue} onChange={e => state.setDiscount(state.discountType, Number(e.target.value))} className="rounded-lg border border-pdv-border bg-pdv-bg px-2 py-2 text-sm"/>
        </div>
        <div className="mb-4 flex items-center justify-between text-xl font-black"><span>Total</span><span className="text-pdv-green">{toMoney(totals.total)}</span></div>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="secondary" onClick={onWrongPrice} disabled={!state.items.length}>Valor errado <span className="text-xs">F7</span></Button>
          <Button variant="secondary" onClick={onMinimize} disabled={!state.items.length}>Minimizar <span className="text-xs">F11</span></Button>
          <Button variant="danger" onClick={state.clear} disabled={!state.items.length}>Descartar <span className="text-xs">F8</span></Button>
          <Button onClick={onOpenPayment} disabled={!state.items.length}>Pagamento <span className="text-xs">F9</span></Button>
        </div>
      </div>
    </Card>
  );
}
