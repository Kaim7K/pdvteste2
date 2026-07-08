"use client";

import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { toMoney } from "@/lib/money";

export function ReportsClient() {
  const [preset, setPreset] = useState('today');
  const [report, setReport] = useState<any>(null);
  async function load(p = preset){ const j = await fetch(`/api/reports?preset=${p}`).then(r=>r.json()); if(j.ok) setReport(j.data); else alert(j.message); }
  useEffect(()=>{load();},[]);
  const cards = report?.cards;
  return <div><PageHeader title="Relatórios gerenciais" description="Cards, gráficos, rankings e insights automáticos por regra."/><div className="mb-4 flex gap-2">{[['today','Hoje'],['week','Semana'],['month','Mês'],['year','Ano']].map(([v,l])=><Button key={v} variant={preset===v?'primary':'secondary'} onClick={()=>{setPreset(v);load(v)}}>{l}</Button>)}</div>{cards ? <><div className="grid grid-cols-4 gap-4">{[['Faturamento',toMoney(cards.revenue)],['Vendas',cards.salesCount],['Ticket médio',toMoney(cards.ticket)],['Fiado pendente',toMoney(cards.pendingCredit)],['Cancelamentos',cards.cancelledCount],['Estoque negativo',cards.negativeProducts],['Produto mais vendido',cards.topProduct],['Pagamento mais usado',cards.topPayment]].map(([k,v])=><Card key={k} className="p-4"><div className="text-sm text-pdv-muted">{k}</div><div className="mt-2 text-xl font-black text-pdv-green">{v}</div></Card>)}</div><div className="mt-5 grid grid-cols-2 gap-5"><Card className="p-4"><h2 className="mb-4 font-black">Faturamento por dia</h2><div className="h-72"><ResponsiveContainer width="100%" height="100%"><BarChart data={report.charts.dailyRevenue}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="date"/><YAxis/><Tooltip/><Bar dataKey="amount" fill="#8CCB19"/></BarChart></ResponsiveContainer></div></Card><Card className="p-4"><h2 className="mb-4 font-black">Insights do período</h2><div className="space-y-3">{report.insights.map((i:string)=><div key={i} className="rounded-lg border border-pdv-green/30 bg-pdv-green/10 p-3 text-sm text-pdv-green">{i}</div>)}</div></Card></div></> : null}</div>;
}
