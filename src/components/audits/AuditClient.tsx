"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";

export function AuditClient() {
  const [rows,setRows]=useState<any[]>([]);
  useEffect(()=>{fetch('/api/audits').then(r=>r.json()).then(j=>{if(j.ok)setRows(j.data);else alert(j.message)})},[]);
  return <div><PageHeader title="Auditoria geral" description="Área administrativa separada para rastrear alterações críticas."/><Card className="overflow-hidden"><table className="w-full text-sm"><thead className="bg-black/20 text-pdv-muted"><tr><th className="p-3 text-left">Data</th><th>Usuário</th><th>Entidade</th><th>Ação</th><th>Origem</th><th>Venda</th></tr></thead><tbody>{rows.map(r=><tr key={r.id} className="border-t border-pdv-border"><td className="p-3">{new Date(r.createdAt).toLocaleString('pt-BR')}</td><td>{r.user?.name ?? '-'}</td><td>{r.entityType}</td><td>{r.action}</td><td>{r.origin}</td><td>{r.sale?.saleNumber ? '#'+r.sale.saleNumber : '-'}</td></tr>)}</tbody></table></Card></div>;
}
