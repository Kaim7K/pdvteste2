import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().min(1, "Informe o usuário."),
  password: z.string().min(1, "Informe a senha.")
});

export const productSchema = z.object({
  name: z.string().min(2, "Nome muito curto."),
  barcode: z.string().trim().optional().nullable().transform(v => v || null),
  categoryId: z.string().optional().nullable().transform(v => v || null),
  imageUrl: z.string().url().optional().nullable().or(z.literal("")),
  salePrice: z.coerce.number().min(0, "Preço inválido."),
  costPrice: z.coerce.number().min(0).optional().nullable(),
  stockQuantity: z.coerce.number().optional().default(0),
  unitType: z.enum(["UNIT", "WEIGHT", "PACKAGE"]).default("UNIT"),
  isActive: z.boolean().optional().default(true)
});

export const quickProductSchema = z.object({
  barcode: z.string().trim().optional().nullable(),
  name: z.string().min(2, "Informe o nome do produto.")
});

export const saleItemSchema = z.object({
  productId: z.string(),
  quantity: z.coerce.number().positive(),
  weight: z.coerce.number().positive().optional().nullable(),
  unitPrice: z.coerce.number().min(0),
  subtotal: z.coerce.number().min(0)
});

export const paymentSchema = z.object({
  paymentMethod: z.enum(["CASH", "DEBIT", "CREDIT", "PIX", "OTHER", "CREDIT_SALE"]),
  amount: z.coerce.number().min(0),
  changeAmount: z.coerce.number().min(0).optional().default(0)
});

export const completeSaleSchema = z.object({
  items: z.array(saleItemSchema).min(1, "Venda sem itens."),
  payments: z.array(paymentSchema).min(1, "Informe ao menos uma forma de pagamento."),
  discountType: z.enum(["NONE", "FIXED", "PERCENTAGE"]).default("NONE"),
  discountValue: z.coerce.number().min(0).default(0),
  observation: z.string().optional().nullable(),
  creditCustomer: z.object({
    name: z.string().min(2, "Nome do responsável é obrigatório."),
    phone: z.string().optional().nullable(),
    observation: z.string().optional().nullable()
  }).optional().nullable()
});

export const wrongPriceSchema = z.object({
  productId: z.string(),
  saleId: z.string().optional().nullable(),
  newPrice: z.coerce.number().min(0.01, "Preço inválido."),
  origin: z.enum(["SALES_SCREEN", "STOCK_SCREEN", "WRONG_PRICE", "MANUAL_EDIT"]).default("WRONG_PRICE")
});

export const cancelSaleSchema = z.object({
  reason: z.string().optional().nullable()
});

export const createUserSchema = z.object({
  name: z.string().min(2),
  username: z.string().min(3),
  password: z.string().min(6),
  role: z.enum(["MANAGER", "SELLER"]),
  isActive: z.boolean().default(true)
});

export const settingSchema = z.object({
  key: z.string().min(1),
  value: z.string(),
  description: z.string().optional().nullable()
});

export const creditPaymentSchema = z.object({
  amount: z.coerce.number().min(0.01),
  paymentMethod: z.enum(["CASH", "DEBIT", "CREDIT", "PIX", "OTHER"]),
  observation: z.string().optional().nullable()
});
