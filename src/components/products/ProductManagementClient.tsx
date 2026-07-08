"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { toMoney } from "@/lib/money";

type Product = any;

export function ProductManagementClient({ title = "Produtos", stockMode = false }: { title?: string; stockMode?: boolean }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<any>({ name: "", barcode: "", categoryId: "", salePrice: 0, costPrice: "", stockQuantity: 0, unitType: "UNIT", isActive: true });
  const [audits, setAudits] = useState<any[]>([]);

  async function load() {
    const [p, c] = await Promise.all([fetch(`/api/products?q=${encodeURIComponent(q)}&take=200`).then(r => r.json()), fetch('/api/categories').then(r => r.json())]);
    if (p.ok) setProducts(p.data);
    if (c.ok) setCategories(c.data);
  }
  useEffect(() => { load(); }, []);

  function startEdit(product?: Product) {
    setEditing(product ?? null);
    setForm(product ? { name: product.name, barcode: product.barcode ?? "", categoryId: product.categoryId ?? "", salePrice: Number(product.salePrice), costPrice: product.costPrice ? Number(product.costPrice) : "", stockQuantity: Number(product.stockQuantity), unitType: product.unitType, isActive: product.isActive } : { name: "", barcode: "", categoryId: "", salePrice: 0, costPrice: "", stockQuantity: 0, unitType: "UNIT", isActive: true });
    setAudits([]);
  }

  async function save() {
    const payload = { ...form, barcode: form.barcode || null, categoryId: form.categoryId || null, costPrice: form.costPrice === "" ? null : Number(form.costPrice), salePrice: Number(form.salePrice), stockQuantity: Number(form.stockQuantity) };
    const res = await fetch(editing ? `/api/products/${editing.id}` : '/api/products', { method: editing ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const json = await res.json();
    if (!json.ok) return alert(json.message);
    setEditing(null);
    await load();
  }

  async function showAudits(product: Product) {
    setEditing(product);
    const res = await fetch(`/api/products/${product.id}/audits`);
    const json = await res.json();
    if (json.ok) setAudits(json.data);
  }

  return <div>
    <PageHeader title={title} description={stockMode ? "Controle de estoque, preços e auditoria individual por produto." : "Cadastro completo de produtos com ou sem código de barras."} right={<Button onClick={() => startEdit()}>Novo produto</Button>} />
    <div className="mb-4 flex gap-2"><input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar produto" className="h-11 flex-1 rounded-lg border border-pdv-border bg-black/20 px-3"/><Button onClick={load}>Buscar</Button></div>
    <div className="grid grid-cols-[1fr_420px] gap-5">
      <Card className="overflow-hidden">
        <table className="w-full text-sm"><thead className="bg-black/20 text-pdv-muted"><tr><th className="p-3 text-left">Produto</th><th>Código</th><th>Estoque</th><th>Preço</th><th>Status</th><th></th></tr></thead><tbody>{products.map(p => <tr key={p.id} className="border-t border-pdv-border"><td className="p-3"><b>{p.name}</b><div className="text-xs text-pdv-muted">{p.category?.name ?? 'Sem categoria'}</div></td><td>{p.barcode ?? p.internalCode}</td><td className={Number(p.stockQuantity) <= 0 ? 'text-pdv-warning font-bold' : ''}>{String(p.stockQuantity)}</td><td className="font-bold text-pdv-green">{toMoney(Number(p.salePrice))}</td><td>{p.isActive ? 'Ativo' : 'Inativo'}</td><td className="p-2 text-right"><Button variant="secondary" onClick={() => startEdit(p)}>Editar</Button> <Button variant="ghost" onClick={() => showAudits(p)}>Auditoria</Button></td></tr>)}</tbody></table>
      </Card>
      <Card className="p-4">
        <h2 className="mb-3 text-lg font-black">{editing ? 'Editar produto' : 'Novo produto'}</h2>
        <div className="space-y-2">
          <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Nome" className="h-11 w-full rounded-lg border border-pdv-border bg-black/20 px-3"/>
          <input value={form.barcode} onChange={e => setForm({ ...form, barcode: e.target.value })} placeholder="Código de barras opcional" className="h-11 w-full rounded-lg border border-pdv-border bg-black/20 px-3"/>
          <select value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })} className="h-11 w-full rounded-lg border border-pdv-border bg-black/20 px-3"><option value="">Sem categoria</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
          <div className="grid grid-cols-2 gap-2"><input type="number" value={form.salePrice} onChange={e => setForm({ ...form, salePrice: e.target.value })} placeholder="Preço venda" className="h-11 rounded-lg border border-pdv-border bg-black/20 px-3"/><input type="number" value={form.costPrice} onChange={e => setForm({ ...form, costPrice: e.target.value })} placeholder="Custo opcional" className="h-11 rounded-lg border border-pdv-border bg-black/20 px-3"/></div>
          <div className="grid grid-cols-2 gap-2"><input type="number" value={form.stockQuantity} onChange={e => setForm({ ...form, stockQuantity: e.target.value })} placeholder="Estoque" className="h-11 rounded-lg border border-pdv-border bg-black/20 px-3"/><select value={form.unitType} onChange={e => setForm({ ...form, unitType: e.target.value })} className="h-11 rounded-lg border border-pdv-border bg-black/20 px-3"><option value="UNIT">Unidade</option><option value="WEIGHT">Peso</option><option value="PACKAGE">Pacote</option></select></div>
          <Button variant="secondary" className="w-full">Buscar imagem do produto</Button>
          <Button onClick={save} className="w-full">Salvar produto</Button>
        </div>
        {audits.length ? <div className="mt-6"><h3 className="mb-2 font-bold">Auditoria individual</h3><div className="max-h-80 space-y-2 overflow-auto">{audits.map(a => <div key={a.id} className="rounded-lg border border-pdv-border bg-black/20 p-2 text-xs"><b>{a.fieldChanged}</b> {a.oldValue ?? '-'} → {a.newValue ?? '-'}<div className="text-pdv-muted">{a.user?.name} • {new Date(a.createdAt).toLocaleString('pt-BR')}</div></div>)}</div></div> : null}
      </Card>
    </div>
  </div>;
}
