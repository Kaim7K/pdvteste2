"use client";

import { Package } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { toMoney } from "@/lib/money";
import type { ProductLite } from "@/store/sale-store";

export function ProductGrid({ products, onSelect }: { products: ProductLite[]; onSelect: (product: ProductLite) => void }) {
  return (
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
      {products.map((product) => (
        <button key={product.id} onClick={() => onSelect(product)} className="text-left">
          <Card className="h-full p-3 transition hover:border-pdv-green/70">
            <div className="mb-3 flex h-24 items-center justify-center rounded-lg bg-black/20">
              {product.imageUrl ? <img src={product.imageUrl} alt={product.name} className="max-h-20 max-w-full object-contain"/> : <Package className="text-pdv-muted" />}
            </div>
            <div className="line-clamp-2 min-h-10 text-sm font-semibold text-white">{product.name}</div>
            <div className="mt-1 text-xs text-pdv-muted">{product.internalCode}</div>
            <div className="mt-2 text-lg font-black text-pdv-green">{toMoney(Number(product.salePrice))}</div>
            <div className="text-xs text-pdv-muted">Estoque: {String(product.stockQuantity)}</div>
          </Card>
        </button>
      ))}
    </div>
  );
}
