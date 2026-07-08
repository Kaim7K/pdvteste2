"use client";

import { useCallback, useEffect, useState } from "react";
import { Filter, Plus, Search, SlidersHorizontal } from "lucide-react";
import { ProductGrid } from "@/components/sales/ProductGrid";
import { SaleCart } from "@/components/sales/SaleCart";
import { PaymentModal } from "@/components/sales/PaymentModal";
import { QuickProductModal } from "@/components/sales/QuickProductModal";
import { WrongPriceModal } from "@/components/sales/WrongPriceModal";
import { ReceiptModal } from "@/components/sales/ReceiptModal";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useBarcodeCapture } from "@/hooks/useBarcodeCapture";
import { ProductLite, selectTotals, useSaleStore } from "@/store/sale-store";
import { toMoney } from "@/lib/money";

const categories = ["Todos", "Alimentos", "Bebidas", "Higiene", "Limpeza", "Frios", "Outros"];

export function SalesClient() {
  const sale = useSaleStore();
  const totals = selectTotals(sale);
  const [products, setProducts] = useState<ProductLite[]>([]);
  const [q, setQ] = useState("");
  const [message, setMessage] = useState("");
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [quickBarcode, setQuickBarcode] = useState("");
  const [wrongPriceOpen, setWrongPriceOpen] = useState(false);
  const [receiptSaleId, setReceiptSaleId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<any[]>([]);

  async function loadProducts(search = "") {
    const res = await fetch(`/api/products?q=${encodeURIComponent(search)}&take=40`);
    const json = await res.json();
    if (json.ok) setProducts(json.data);
  }

  async function loadDrafts() {
    const res = await fetch("/api/draft-sales");
    const json = await res.json();
    if (json.ok) setDrafts(json.data);
  }

  useEffect(() => { loadProducts(); loadDrafts(); }, []);

  const addProduct = useCallback((product: ProductLite) => {
    const result = sale.addProduct(product);
    setMessage(result.stockWarning ? "Por favor, revisar estoque desse produto." : `${product.name} adicionado a venda.`);
    setTimeout(() => setMessage(""), 2400);
  }, [sale]);

  const handleCode = useCallback(async (code: string) => {
    const res = await fetch(`/api/products?q=${encodeURIComponent(code)}&take=5`);
    const json = await res.json();
    if (!json.ok) return;
    const exact = json.data.find((p: ProductLite) => p.barcode === code || p.internalCode === code || p.name.toLowerCase() === code.toLowerCase());
    if (exact) addProduct(exact);
    else if (json.data.length === 1) addProduct(json.data[0]);
    else if (json.data.length > 1) setProducts(json.data);
    else setQuickBarcode(code);
  }, [addProduct]);

  useBarcodeCapture(handleCode);

  async function search(e: React.FormEvent) {
    e.preventDefault();
    await loadProducts(q);
  }

  const minimize = useCallback(async () => {
    const res = await fetch("/api/draft-sales", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items: sale.items, payments: sale.payments, discountType: sale.discountType, discountValue: sale.discountValue, observation: sale.observation }) });
    const json = await res.json();
    if (!json.ok) return setMessage(json.message ?? "Erro ao minimizar venda.");
    sale.clear();
    await loadDrafts();
    setMessage("Venda minimizada.");
  }, [sale]);

  function restoreDraft(draft: any) {
    sale.loadDraft({
      items: draft.items.map((i: any) => ({ productId: i.productId, name: i.product.name, quantity: Number(i.quantity), weight: i.weight ? Number(i.weight) : null, unitPrice: Number(i.unitPrice), subtotal: Number(i.subtotal), stockQuantity: Number(i.product.stockQuantity), unitType: i.product.unitType })),
      payments: draft.payments.map((p: any) => ({ paymentMethod: p.paymentMethod, amount: Number(p.amount) })),
      discountType: draft.discountType,
      discountValue: Number(draft.discountValue),
      observation: draft.observation ?? ""
    });
  }

  useEffect(() => {
    function hotkeys(e: KeyboardEvent) {
      if (e.key === "F9") { e.preventDefault(); setPaymentOpen(true); }
      if (e.key === "F7") { e.preventDefault(); setWrongPriceOpen(true); }
      if (e.key === "F8") { e.preventDefault(); sale.clear(); }
      if (e.key === "F11") { e.preventDefault(); if (sale.items.length) minimize(); }
      if (e.key === "F2") { e.preventDefault(); document.getElementById("product-search")?.focus(); }
    }
    window.addEventListener("keydown", hotkeys);
    return () => window.removeEventListener("keydown", hotkeys);
  }, [minimize, sale]);

  return (
    <div className="space-y-5">
      {message ? <div className="rounded-xl border border-pdv-green/30 bg-pdv-green/10 p-3 text-sm font-bold text-pdv-green">{message}</div> : null}
      <div className="grid grid-cols-[minmax(0,1fr)_440px] gap-5">
        <div className="min-w-0 space-y-4">
          <form onSubmit={search} className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-3.5 text-pdv-muted" size={22}/>
              <input id="product-search" value={q} onChange={e => setQ(e.target.value)} placeholder="Busque por nome, categoria, codigo de barras ou codigo interno..." className="h-13 w-full rounded-xl border border-pdv-green/35 bg-black/35 pl-12 pr-14 text-sm outline-none focus:border-pdv-green focus:ring-2 focus:ring-pdv-green/20" />
              <kbd className="absolute right-3 top-3 rounded bg-white/10 px-2 py-1 text-xs text-pdv-muted">F2</kbd>
            </div>
            <Button type="submit" variant="secondary"><Filter size={18}/> Filtrar</Button>
          </form>

          <div className="flex flex-wrap items-center gap-2">
            {categories.map((category, index) => (
              <button key={category} className={index === 0 ? "h-10 rounded-lg bg-pdv-green px-4 text-sm font-black text-[#0a1306]" : "h-10 rounded-lg border border-pdv-border bg-white/[.035] px-4 text-sm text-pdv-muted hover:border-pdv-green/50 hover:text-white"}>
                {category}
              </button>
            ))}
            <Button variant="secondary" className="ml-auto"><SlidersHorizontal size={17}/> Ordenar</Button>
          </div>

          <ProductGrid products={products} onSelect={addProduct}/>

          <Card className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <div className="text-sm font-black uppercase text-pdv-muted">Vendas abertas</div>
                <div className="text-xs text-pdv-muted">Recupere uma venda minimizada sem perder itens</div>
              </div>
              <Button variant="secondary" disabled><Plus size={18}/> Nova venda <span className="text-xs">F6</span></Button>
            </div>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {drafts.map((d, index) => (
                <button key={d.id} onClick={() => restoreDraft(d)} className="rounded-xl border border-pdv-green/30 bg-gradient-to-br from-pdv-green/20 to-black/20 p-3 text-left hover:border-pdv-green">
                  <div className="flex items-center justify-between text-xs text-pdv-muted"><span>Venda {d.draftNumber}</span><b className="rounded-full bg-pdv-green px-2 text-black">{index + 1}</b></div>
                  <div className="mt-2 text-lg font-black text-pdv-green">{toMoney(Number(d.total))}</div>
                </button>
              ))}
              {!drafts.length ? <div className="col-span-full rounded-xl border border-dashed border-pdv-border p-4 text-center text-sm text-pdv-muted">Nenhuma venda minimizada.</div> : null}
            </div>
          </Card>
        </div>
        <SaleCart onOpenPayment={() => setPaymentOpen(true)} onWrongPrice={() => setWrongPriceOpen(true)} onMinimize={minimize}/>
      </div>
      <PaymentModal open={paymentOpen} onClose={() => setPaymentOpen(false)} onFinished={setReceiptSaleId}/>
      <QuickProductModal barcode={quickBarcode} open={!!quickBarcode} onClose={() => setQuickBarcode("")} onCreated={addProduct}/>
      <WrongPriceModal open={wrongPriceOpen} onClose={() => setWrongPriceOpen(false)}/>
      <ReceiptModal saleId={receiptSaleId} onClose={() => setReceiptSaleId(null)}/>
    </div>
  );
}
