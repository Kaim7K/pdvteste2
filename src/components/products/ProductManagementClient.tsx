"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Boxes, Edit3, ImageIcon, PackagePlus, Search, Upload } from "lucide-react";
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

  const load = useCallback(async () => {
    const [p, c] = await Promise.all([fetch(`/api/products?q=${encodeURIComponent(q)}&take=200`).then(r => r.json()), fetch("/api/categories").then(r => r.json())]);
    if (p.ok) setProducts(p.data);
    if (c.ok) setCategories(c.data);
  }, [q]);

  useEffect(() => { load(); }, [load]);

  const stats = useMemo(() => {
    const active = products.filter(p => p.isActive).length;
    const critical = products.filter(p => Number(p.stockQuantity) <= 5).length;
    const withoutImage = products.filter(p => !p.imageUrl).length;
    const totalValue = products.reduce((sum, p) => sum + Number(p.salePrice) * Number(p.stockQuantity), 0);
    return { active, critical, withoutImage, totalValue };
  }, [products]);

  function startEdit(product?: Product) {
    setEditing(product ?? null);
    setForm(product ? { name: product.name, barcode: product.barcode ?? "", categoryId: product.categoryId ?? "", salePrice: Number(product.salePrice), costPrice: product.costPrice ? Number(product.costPrice) : "", stockQuantity: Number(product.stockQuantity), unitType: product.unitType, isActive: product.isActive } : { name: "", barcode: "", categoryId: "", salePrice: 0, costPrice: "", stockQuantity: 0, unitType: "UNIT", isActive: true });
    setAudits([]);
  }

  async function save() {
    const payload = { ...form, barcode: form.barcode || null, categoryId: form.categoryId || null, costPrice: form.costPrice === "" ? null : Number(form.costPrice), salePrice: Number(form.salePrice), stockQuantity: Number(form.stockQuantity) };
    const res = await fetch(editing ? `/api/products/${editing.id}` : "/api/products", { method: editing ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const json = await res.json();
    if (!json.ok) return alert(json.message);
    setEditing(null);
    await load();
  }

  async function showAudits(product: Product) {
    setEditing(product);
    startEdit(product);
    const res = await fetch(`/api/products/${product.id}/audits`);
    const json = await res.json();
    if (json.ok) setAudits(json.data);
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-black">{stockMode ? "Gerenciamento de estoque" : title}</h1>
          <p className="mt-1 text-pdv-muted">{stockMode ? "Controle completo do estoque, precos e auditoria individual." : "Cadastro completo de produtos com ou sem codigo de barras."}</p>
        </div>
        <Button onClick={() => startEdit()} className="h-12"><PackagePlus size={19}/> Novo produto <span className="text-xs">F3</span></Button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card className="p-5"><div className="text-sm text-pdv-muted">Produtos ativos</div><div className="mt-2 text-3xl font-black">{stats.active}</div></Card>
        <Card className="p-5"><div className="text-sm text-pdv-muted">Estoque critico</div><div className="mt-2 text-3xl font-black text-orange-400">{stats.critical}</div></Card>
        <Card className="p-5"><div className="text-sm text-pdv-muted">Itens sem foto</div><div className="mt-2 text-3xl font-black text-purple-300">{stats.withoutImage}</div></Card>
        <Card className="p-5"><div className="text-sm text-pdv-muted">Valor em estoque</div><div className="mt-2 text-2xl font-black text-pdv-green">{toMoney(stats.totalValue)}</div></Card>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)_420px] gap-5">
        <Card className="overflow-hidden">
          <div className="flex items-center gap-3 border-b border-pdv-border p-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 text-pdv-muted" size={18}/>
              <input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar produto..." className="h-11 w-full rounded-lg border border-pdv-border bg-black/25 pl-10 pr-3 text-sm outline-none focus:border-pdv-green"/>
            </div>
            <Button variant="secondary" onClick={load}>Buscar</Button>
            <Button variant="secondary"><Upload size={17}/> Importar</Button>
          </div>

          <table className="w-full text-sm">
            <thead className="bg-black/25 text-xs uppercase text-pdv-muted">
              <tr>
                <th className="p-3 text-left">Produto</th>
                <th className="text-left">Categoria</th>
                <th className="text-left">Codigo</th>
                <th className="text-right">Preco</th>
                <th className="text-right">Estoque</th>
                <th>Status</th>
                <th className="p-3 text-right">Acoes</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id} className="border-t border-pdv-border/80 hover:bg-white/[.025]">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-black/25">
                        {p.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={p.imageUrl} alt={p.name} className="max-h-10 max-w-10 object-contain" />
                        ) : <Boxes className="text-pdv-muted" size={20}/>}
                      </div>
                      <div><b className="text-white">{p.name}</b><div className="text-xs text-pdv-muted">{p.internalCode}</div></div>
                    </div>
                  </td>
                  <td>{p.category?.name ?? "Sem categoria"}</td>
                  <td className="text-pdv-muted">{p.barcode ?? p.internalCode}</td>
                  <td className="text-right font-black text-white">{toMoney(Number(p.salePrice))}</td>
                  <td className={Number(p.stockQuantity) <= 5 ? "text-right font-black text-orange-400" : "text-right font-black text-pdv-green"}>{String(p.stockQuantity)}</td>
                  <td className="text-center"><span className={p.isActive ? "rounded-full border border-pdv-green/30 bg-pdv-green/10 px-3 py-1 text-xs font-bold text-pdv-green" : "rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-bold text-pdv-muted"}>{p.isActive ? "Ativo" : "Inativo"}</span></td>
                  <td className="p-3 text-right"><Button variant="secondary" onClick={() => startEdit(p)} className="mr-2 h-9 px-3"><Edit3 size={15}/></Button><Button variant="ghost" onClick={() => showAudits(p)} className="h-9 px-3">Auditoria</Button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <div className="space-y-5">
          <Card className="p-5">
            <h2 className="mb-4 text-xl font-black">{editing ? "Detalhes do produto" : "Cadastro rapido"}</h2>
            <div className="mb-4 flex items-center gap-4">
              <div className="flex h-28 w-28 items-center justify-center rounded-xl border border-dashed border-pdv-border bg-black/25">
                <ImageIcon className="text-pdv-muted" />
              </div>
              <Button variant="secondary">Buscar imagem do produto</Button>
            </div>
            <div className="space-y-3">
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Nome do produto" className="h-11 w-full rounded-lg border border-pdv-border bg-black/20 px-3"/>
              <input value={form.barcode} onChange={e => setForm({ ...form, barcode: e.target.value })} placeholder="Codigo de barras opcional" className="h-11 w-full rounded-lg border border-pdv-border bg-black/20 px-3"/>
              <select value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })} className="h-11 w-full rounded-lg border border-pdv-border bg-black/20 px-3"><option value="">Sem categoria</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
              <div className="grid grid-cols-2 gap-3"><input type="number" value={form.salePrice} onChange={e => setForm({ ...form, salePrice: e.target.value })} placeholder="Preco venda" className="h-11 rounded-lg border border-pdv-border bg-black/20 px-3"/><input type="number" value={form.costPrice} onChange={e => setForm({ ...form, costPrice: e.target.value })} placeholder="Custo opcional" className="h-11 rounded-lg border border-pdv-border bg-black/20 px-3"/></div>
              <div className="grid grid-cols-2 gap-3"><input type="number" value={form.stockQuantity} onChange={e => setForm({ ...form, stockQuantity: e.target.value })} placeholder="Estoque" className="h-11 rounded-lg border border-pdv-border bg-black/20 px-3"/><select value={form.unitType} onChange={e => setForm({ ...form, unitType: e.target.value })} className="h-11 rounded-lg border border-pdv-border bg-black/20 px-3"><option value="UNIT">Unidade</option><option value="WEIGHT">Peso kg</option><option value="PACKAGE">Pacote</option></select></div>
              <Button onClick={save} className="h-12 w-full">Salvar produto</Button>
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="mb-3 font-black">Auditoria individual</h3>
            {audits.length ? <div className="max-h-80 space-y-2 overflow-auto">{audits.map(a => <div key={a.id} className="rounded-lg border border-pdv-border bg-black/20 p-3 text-xs"><b>{a.fieldChanged}</b> {a.oldValue ?? "-"} para {a.newValue ?? "-"}<div className="mt-1 text-pdv-muted">{a.user?.name} - {new Date(a.createdAt).toLocaleString("pt-BR")}</div></div>)}</div> : <div className="rounded-lg border border-dashed border-pdv-border p-4 text-sm text-pdv-muted">Selecione auditoria em um produto para visualizar alteracoes recentes.</div>}
          </Card>
        </div>
      </div>
    </div>
  );
}
