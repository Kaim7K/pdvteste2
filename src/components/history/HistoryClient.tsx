"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { toMoney } from "@/lib/money";

export function HistoryClient() {
  const [sales, setSales] = useState<any[]>([]);
  async function load() { const j = await fetch('/api/sales').then(r => r.json()); if (j.ok) setSales(j.data); }
  useEffect(() => { load(); }, []);
  async function cancel(id: string) { if (!confirm('Cancelar esta venda?')) return; await fetch(`/api/sales/${id}/cancel`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reason: 'Cancelamento manual' }) }); load(); }
  async function del(id: string) { if (!confirm('Excluir logicamente esta venda?')) return; await fetch(`/api/sales/${id}/delete`, { method: 'POST' }); load(); }
  return <div><PageHeader title="Histórico de vendas" description="Gerente vê todas. Vendedor vê apenas as próprias vendas."/><Card className="overflow-hidden"><table className="w-full text-sm"><thead className="bg-black/20 text-pdv-muted"><tr><th className="p-3 text-left">Venda</th><th>Data</th><th>Vendedor</th><th>Pagamento</th><th>Status</th><th>Total</th><th></th></tr></thead><tbody>{sales.map(s => <tr key={s.id} className="border-t border-pdv-border"><td className="p-3">#{s.saleNumber}</td><td>{new Date(s.createdAt).toLocaleString('pt-BR')}</td><td>{s.user?.name}</td><td>{s.payments.map((p:any)=>p.paymentMethod).join(', ')}</td><td>{s.status}</td><td className="font-bold text-pdv-green">{toMoney(Number(s.total))}</td><td className="p-2 text-right"><Button variant="secondary" onClick={() => window.open(`/api/sales/${s.id}/receipt`, '_blank')}>Recibo</Button> <Button variant="danger" onClick={() => cancel(s.id)}>Cancelar</Button> <Button variant="ghost" onClick={() => del(s.id)}>Excluir</Button></td></tr>)}</tbody></table></Card></div>;
}
