"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export function SettingsClient(){
 const [rows,setRows]=useState<any[]>([]); const [values,setValues]=useState<Record<string,string>>({});
 async function load(){const j=await fetch('/api/settings').then(r=>r.json()); if(j.ok){setRows(j.data); setValues(Object.fromEntries(j.data.map((s:any)=>[s.key,s.value])))}else alert(j.message)}
 useEffect(()=>{load()},[]);
 async function save(key:string){const j=await fetch('/api/settings',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({key,value:values[key]??''})}).then(r=>r.json()); if(!j.ok) alert(j.message); else load();}
 return <div><PageHeader title="Configurações" description="Área administrativa para regras globais do sistema."/><Card className="p-4"><div className="space-y-3">{rows.map(s=><div key={s.id} className="grid grid-cols-[280px_1fr_120px] items-center gap-3 rounded-lg border border-pdv-border bg-black/20 p-3"><div><b>{s.key}</b><div className="text-xs text-pdv-muted">{s.description}</div></div><input value={values[s.key]??''} onChange={e=>setValues({...values,[s.key]:e.target.value})} className="h-10 rounded-lg border border-pdv-border bg-pdv-bg px-3"/><Button variant="secondary" onClick={()=>save(s.key)}>Salvar</Button></div>)}</div></Card></div>
}
