"use client";

import { Package } from "lucide-react";
import { toMoney } from "@/lib/money";
import type { ProductLite } from "@/store/sale-store";

export function ProductGrid({ products, onSelect }: { products: ProductLite[]; onSelect: (product: ProductLite) => void }) {
  return (
    <div className="grid grid-cols-2 gap-2 xl:grid-cols-4 2xl:grid-cols-5">
      {products.map((product) => (
        <button key={product.id} onClick={() => onSelect(product)} className="group text-left">
          <div className="flex h-full min-h-44 flex-col rounded-xl border border-pdv-border bg-white/[.035] p-3 transition hover:border-pdv-green/70 hover:bg-pdv-green/5">
            <div className="mb-3 flex h-20 items-center justify-center rounded-lg bg-black/25">
              {product.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={product.imageUrl} alt={product.name} className="max-h-16 max-w-full object-contain drop-shadow-lg"/>
              ) : <Package className="text-pdv-muted" />}
            </div>
            <div className="line-clamp-2 min-h-10 text-sm font-black text-white">{product.name}</div>
            <div className="mt-1 text-xs text-pdv-muted">{product.internalCode}</div>
            <div className="mt-auto pt-3 text-xl font-black text-pdv-green">{toMoney(Number(product.salePrice))}</div>
            <div className="mt-1 flex items-center justify-between text-xs text-pdv-muted">
              <span>Estoque</span>
              <b className={Number(product.stockQuantity) <= 0 ? "text-red-400" : "text-white"}>{String(product.stockQuantity)} un</b>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
