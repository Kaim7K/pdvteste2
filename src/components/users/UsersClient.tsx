"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export function UsersClient(){
 const [rows,setRows]=useState<any[]>([]); const [form,setForm]=useState({name:'',username:'',password:'',role:'SELLER'});
 async function load(){const j=await fetch('/api/users').then(r=>r.json()); if(j.ok)setRows(j.data); else alert(j.message)}
 useEffect(()=>{load()},[]);
 async function save(){const j=await fetch('/api/users',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(form)}).then(r=>r.json()); if(!j.ok)return alert(j.message); setForm({name:'',username:'',password:'',role:'SELLER'}); load();}
 return <div><PageHeader title="Usuários" description="Gerenciamento de gerente e vendedor."/><div className="grid grid-cols-[1fr_360px] gap-5"><Card className="overflow-hidden"><table className="w-full text-sm"><thead className="bg-black/20 text-pdv-muted"><tr><th className="p-3 text-left">Nome</th><th>Usuário</th><th>Perfil</th><th>Status</th></tr></thead><tbody>{rows.map(u=><tr key={u.id} className="border-t border-pdv-border"><td className="p-3">{u.name}</td><td>{u.username}</td><td>{u.role}</td><td>{u.isActive?'Ativo':'Inativo'}</td></tr>)}</tbody></table></Card><Card className="p-4"><h2 className="mb-3 font-black">Novo usuário</h2><div className="space-y-2"><input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Nome" className="h-11 w-full rounded-lg border border-pdv-border bg-black/20 px-3"/><input value={form.username} onChange={e=>setForm({...form,username:e.target.value})} placeholder="Usuário" className="h-11 w-full rounded-lg border border-pdv-border bg-black/20 px-3"/><input value={form.password} onChange={e=>setForm({...form,password:e.target.value})} placeholder="Senha" type="password" className="h-11 w-full rounded-lg border border-pdv-border bg-black/20 px-3"/><select value={form.role} onChange={e=>setForm({...form,role:e.target.value})} className="h-11 w-full rounded-lg border border-pdv-border bg-black/20 px-3"><option value="SELLER">Vendedor</option><option value="MANAGER">Gerente</option></select><Button onClick={save} className="w-full">Criar</Button></div></Card></div></div>
}
