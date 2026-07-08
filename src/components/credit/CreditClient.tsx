"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { toMoney } from "@/lib/money";

export function CreditClient() {
  const [rows, setRows] = useState<any[]>([]);
  async function load(){ const j = await fetch('/api/credit').then(r=>r.json()); if(j.ok) setRows(j.data); }
  useEffect(()=>{load();},[]);
  async function pay(id:string){ const amount = prompt('Valor recebido:'); if(!amount) return; const res = await fetch(`/api/credit/${id}/pay`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ amount:Number(amount), paymentMethod:'CASH' })}); const j=await res.json(); if(!j.ok) alert(j.message); load(); }
  async function cancel(id:string){ if(!confirm('Cancelar fiado?')) return; await fetch(`/api/credit/${id}/cancel`, { method:'POST' }); load(); }
  return <div><PageHeader title="Fiado" description="Área secundária para consulta, quitação e controle de vendas fiado."/><Card className="overflow-hidden"><table className="w-full text-sm"><thead className="bg-black/20 text-pdv-muted"><tr><th className="p-3 text-left">Cliente</th><th>Vendedor</th><th>Venda</th><th>Original</th><th>Pago</th><th>Pendente</th><th>Status</th><th></th></tr></thead><tbody>{rows.map(r=><tr key={r.id} className="border-t border-pdv-border"><td className="p-3"><b>{r.creditCustomer?.name}</b><div className="text-xs text-pdv-muted">{r.creditCustomer?.phone}</div></td><td>{r.user?.name}</td><td>#{r.sale?.saleNumber}</td><td>{toMoney(Number(r.originalAmount))}</td><td>{toMoney(Number(r.paidAmount))}</td><td className="font-bold text-pdv-warning">{toMoney(Number(r.pendingAmount))}</td><td>{r.status}</td><td className="p-2 text-right"><Button variant="secondary" onClick={()=>pay(r.id)}>Quitar</Button> <Button variant="danger" onClick={()=>cancel(r.id)}>Cancelar</Button></td></tr>)}</tbody></table></Card></div>;
}
