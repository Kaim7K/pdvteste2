"use client";

import { useCallback, useEffect, useState } from "react";
import { Search } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
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
    setMessage(result.stockWarning ? "Por favor, revisar estoque desse produto." : `${product.name} adicionado à venda.`);
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

  async function minimize() {
    const res = await fetch("/api/draft-sales", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items: sale.items, payments: sale.payments, discountType: sale.discountType, discountValue: sale.discountValue, observation: sale.observation }) });
    const json = await res.json();
    if (!json.ok) return setMessage(json.message ?? "Erro ao minimizar venda.");
    sale.clear();
    await loadDrafts();
    setMessage("Venda minimizada.");
  }

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
  }, [sale]);

  return (
    <div>
      <PageHeader title="Vendas" description="Tela principal do caixa. Venda por leitor, teclado, código interno ou pesquisa manual." right={<div className="text-right"><div className="text-xs text-pdv-muted">Total atual</div><div className="text-2xl font-black text-pdv-green">{toMoney(totals.total)}</div></div>} />
      {message ? <div className="mb-4 rounded-xl border border-pdv-green/30 bg-pdv-green/10 p-3 text-sm text-pdv-green">{message}</div> : null}
      <div className="grid grid-cols-[1fr_430px] gap-5">
        <div>
          <form onSubmit={search} className="mb-4 flex gap-2">
            <div className="relative flex-1"><Search className="absolute left-3 top-3 text-pdv-muted" size={18}/><input id="product-search" value={q} onChange={e => setQ(e.target.value)} placeholder="Busque por nome, categoria, código de barras ou código interno..." className="h-11 w-full rounded-lg border border-pdv-border bg-black/20 pl-10 pr-3 outline-none focus:border-pdv-green" /></div>
            <Button>Filtrar F2</Button>
          </form>
          <ProductGrid products={products} onSelect={addProduct}/>
          <Card className="mt-4 p-3">
            <div className="mb-2 text-sm font-bold text-white">Vendas minimizadas</div>
            <div className="flex flex-wrap gap-2">{drafts.map(d => <button key={d.id} onClick={() => restoreDraft(d)} className="rounded-lg border border-pdv-green/30 bg-pdv-green/10 px-4 py-2 text-sm font-bold text-pdv-green">Venda {d.draftNumber}<br/><span className="text-xs text-pdv-muted">{toMoney(Number(d.total))}</span></button>)}</div>
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
