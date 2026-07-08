"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { toMoney } from "@/lib/money";

export function ReceiptModal({ saleId, onClose }: { saleId: string | null; onClose: () => void }) {
  const [sale, setSale] = useState<any>(null);
  useEffect(() => { if (saleId) fetch(`/api/sales/${saleId}/receipt`).then(r => r.json()).then(j => setSale(j.data)); }, [saleId]);
  if (!saleId) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6">
      <div className="w-full max-w-xl rounded-2xl border border-pdv-border bg-pdv-card p-6 shadow-glow">
        {!sale ? <div>Carregando recibo...</div> : <div className="receipt-print rounded-xl bg-white p-6 text-black">
          <div className="text-center"><div className="text-xl font-black">Mercadinho Alameda das Árvores</div><div className="text-xs">Recibo de venda</div></div>
          <hr className="my-4"/>
          <div className="text-sm">Venda #{sale.saleNumber}</div><div className="text-sm">Vendedor: {sale.user.name}</div><div className="text-sm">Data: {new Date(sale.completedAt ?? sale.createdAt).toLocaleString("pt-BR")}</div>
          <div className="my-4 space-y-2">{sale.items.map((item: any) => <div key={item.id} className="flex justify-between text-sm"><span>{String(item.quantity)}x {item.productNameSnapshot}</span><b>{toMoney(Number(item.subtotal))}</b></div>)}</div>
          <hr className="my-4"/>
          <div className="flex justify-between"><span>Subtotal</span><b>{toMoney(Number(sale.subtotal))}</b></div>
          <div className="flex justify-between"><span>Desconto</span><b>{toMoney(Number(sale.discountValue))}</b></div>
          <div className="flex justify-between text-xl font-black"><span>Total</span><b>{toMoney(Number(sale.total))}</b></div>
          <div className="mt-3 text-sm">Pagamento: {sale.payments.map((p: any) => `${p.paymentMethod} ${toMoney(Number(p.amount))}`).join(" | ")}</div>
          {sale.observation ? <div className="mt-2 text-sm">Obs.: {sale.observation}</div> : null}
        </div>}
        <div className="no-print mt-4 flex justify-end gap-2"><Button variant="secondary" onClick={() => window.print()}>Imprimir</Button><Button variant="secondary" onClick={() => window.print()}>Salvar PDF</Button><Button onClick={onClose}>Fechar e iniciar nova venda</Button></div>
      </div>
    </div>
  );
}
