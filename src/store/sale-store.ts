import { create } from "zustand";
import { applyDiscount, roundMoney } from "@/lib/money";

export type ProductLite = {
  id: string;
  name: string;
  internalCode: string;
  barcode?: string | null;
  salePrice: string | number;
  stockQuantity: string | number;
  unitType: "UNIT" | "WEIGHT" | "PACKAGE";
  imageUrl?: string | null;
  category?: { name: string } | null;
};

export type CartItem = {
  productId: string;
  name: string;
  quantity: number;
  weight?: number | null;
  unitPrice: number;
  subtotal: number;
  stockQuantity: number;
  unitType: "UNIT" | "WEIGHT" | "PACKAGE";
};

export type PaymentDraft = {
  paymentMethod: "CASH" | "DEBIT" | "CREDIT" | "PIX" | "OTHER" | "CREDIT_SALE";
  amount: number;
  changeAmount?: number;
};

type SaleState = {
  items: CartItem[];
  payments: PaymentDraft[];
  discountType: "NONE" | "FIXED" | "PERCENTAGE";
  discountValue: number;
  observation: string;
  addProduct: (product: ProductLite) => { stockWarning: boolean };
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  updateWeight: (productId: string, weight: number) => void;
  updateItemPrice: (productId: string, price: number) => void;
  addPayment: (payment: PaymentDraft) => void;
  removePayment: (index: number) => void;
  setDiscount: (type: SaleState["discountType"], value: number) => void;
  setObservation: (value: string) => void;
  clear: () => void;
  loadDraft: (payload: { items: CartItem[]; payments?: PaymentDraft[]; discountType?: SaleState["discountType"]; discountValue?: number; observation?: string }) => void;
};

function recalc(item: CartItem) {
  const baseQty = item.unitType === "WEIGHT" ? Number(item.weight || 0) : Number(item.quantity || 0);
  return { ...item, subtotal: roundMoney(baseQty * item.unitPrice) };
}

export const useSaleStore = create<SaleState>((set, get) => ({
  items: [],
  payments: [],
  discountType: "NONE",
  discountValue: 0,
  observation: "",
  addProduct(product) {
    const stock = Number(product.stockQuantity ?? 0);
    set((state) => {
      const existing = state.items.find((i) => i.productId === product.id);
      if (existing) {
        return { items: state.items.map((i) => i.productId === product.id ? recalc({ ...i, quantity: i.quantity + 1 }) : i) };
      }
      const item: CartItem = recalc({ productId: product.id, name: product.name, quantity: 1, weight: product.unitType === "WEIGHT" ? 1 : null, unitPrice: Number(product.salePrice), subtotal: 0, stockQuantity: stock, unitType: product.unitType });
      return { items: [...state.items, item] };
    });
    return { stockWarning: stock <= 0 };
  },
  removeItem(productId) { set((state) => ({ items: state.items.filter((i) => i.productId !== productId) })); },
  updateQuantity(productId, quantity) { set((state) => ({ items: state.items.map((i) => i.productId === productId ? recalc({ ...i, quantity: Math.max(0.001, quantity) }) : i) })); },
  updateWeight(productId, weight) { set((state) => ({ items: state.items.map((i) => i.productId === productId ? recalc({ ...i, weight: Math.max(0.001, weight) }) : i) })); },
  updateItemPrice(productId, price) { set((state) => ({ items: state.items.map((i) => i.productId === productId ? recalc({ ...i, unitPrice: price }) : i) })); },
  addPayment(payment) { set((state) => ({ payments: [...state.payments, payment] })); },
  removePayment(index) { set((state) => ({ payments: state.payments.filter((_, i) => i !== index) })); },
  setDiscount(type, value) { set({ discountType: type, discountValue: value }); },
  setObservation(value) { set({ observation: value }); },
  clear() { set({ items: [], payments: [], discountType: "NONE", discountValue: 0, observation: "" }); },
  loadDraft(payload) { set({ items: payload.items, payments: payload.payments ?? [], discountType: payload.discountType ?? "NONE", discountValue: payload.discountValue ?? 0, observation: payload.observation ?? "" }); }
}));

export function selectTotals(state: Pick<SaleState, "items" | "payments" | "discountType" | "discountValue">) {
  const subtotal = roundMoney(state.items.reduce((sum, item) => sum + item.subtotal, 0));
  const total = applyDiscount(subtotal, state.discountType, state.discountValue);
  const paid = roundMoney(state.payments.reduce((sum, p) => sum + p.amount, 0));
  const remaining = roundMoney(Math.max(0, total - paid));
  const change = roundMoney(Math.max(0, paid - total));
  return { subtotal, total, paid, remaining, change, totalItems: state.items.reduce((s, i) => s + i.quantity, 0) };
}
