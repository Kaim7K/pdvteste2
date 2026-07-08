import { PrismaClient, RoleName, UnitType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const permissions = [
  ["sales:create", "Criar vendas"],
  ["sales:view-own", "Ver próprias vendas"],
  ["sales:view-all", "Ver todas as vendas"],
  ["sales:cancel-own", "Cancelar próprias vendas"],
  ["sales:cancel-all", "Cancelar qualquer venda"],
  ["products:manage", "Cadastrar e editar produtos"],
  ["stock:manage", "Gerenciar estoque"],
  ["credit:own", "Gerenciar próprios fiados"],
  ["credit:all", "Gerenciar todos os fiados"],
  ["audits:product", "Ver auditoria do produto"],
  ["audits:all", "Ver auditoria geral"],
  ["reports:view", "Ver relatórios"],
  ["users:manage", "Gerenciar usuários"],
  ["settings:manage", "Gerenciar configurações"]
] as const;

async function main() {
  for (const [key, description] of permissions) {
    await prisma.permission.upsert({
      where: { key },
      update: { description },
      create: { key, description }
    });
  }

  const adminPassword = await bcrypt.hash("admin123", 12);
  const sellerPassword = await bcrypt.hash("vendedor123", 12);

  const admin = await prisma.user.upsert({
    where: { username: "admin" },
    update: { name: "Administrador", role: RoleName.MANAGER, isActive: true },
    create: { name: "Administrador", username: "admin", passwordHash: adminPassword, role: RoleName.MANAGER }
  });

  await prisma.user.upsert({
    where: { username: "vendedor" },
    update: { name: "Vendedor Caixa", role: RoleName.SELLER, isActive: true },
    create: { name: "Vendedor Caixa", username: "vendedor", passwordHash: sellerPassword, role: RoleName.SELLER }
  });

  const categories = ["Alimentos", "Bebidas", "Higiene", "Limpeza", "Frios e Laticínios", "Outros"];
  for (const name of categories) {
    await prisma.category.upsert({ where: { name }, update: {}, create: { name } });
  }

  await prisma.setting.upsert({ where: { key: "max_minimized_sales" }, update: { value: "3" }, create: { key: "max_minimized_sales", value: "3", description: "Limite padrão de vendas minimizadas", updatedBy: admin.id }});
  await prisma.setting.upsert({ where: { key: "market_name" }, update: { value: "Mercadinho Alameda das Árvores" }, create: { key: "market_name", value: "Mercadinho Alameda das Árvores", description: "Nome do mercado", updatedBy: admin.id }});
  await prisma.setting.upsert({ where: { key: "allow_negative_stock" }, update: { value: "true" }, create: { key: "allow_negative_stock", value: "true", description: "Permitir venda com estoque negativo", updatedBy: admin.id }});

  const alimentos = await prisma.category.findUnique({ where: { name: "Alimentos" }});
  const bebidas = await prisma.category.findUnique({ where: { name: "Bebidas" }});

  const sampleProducts = [
    { internalCode: "PROD-000001", barcode: "7891000100103", name: "Arroz Tipo 1 5kg", categoryId: alimentos?.id, salePrice: 29.9, costPrice: 22.5, stockQuantity: 45, unitType: UnitType.UNIT },
    { internalCode: "PROD-000002", barcode: "7891000200209", name: "Feijão Carioca 1kg", categoryId: alimentos?.id, salePrice: 7.49, costPrice: 5.1, stockQuantity: 60, unitType: UnitType.UNIT },
    { internalCode: "PROD-000003", barcode: "7891000300305", name: "Óleo de Soja 900ml", categoryId: alimentos?.id, salePrice: 6.49, costPrice: 4.9, stockQuantity: 36, unitType: UnitType.UNIT },
    { internalCode: "PROD-000004", barcode: "7891000400401", name: "Leite Integral 1L", categoryId: bebidas?.id, salePrice: 4.99, costPrice: 3.7, stockQuantity: 80, unitType: UnitType.UNIT },
    { internalCode: "PROD-000005", barcode: null, name: "Banana Prata kg", categoryId: alimentos?.id, salePrice: 5.99, costPrice: 3.2, stockQuantity: 18, unitType: UnitType.WEIGHT }
  ];

  for (const product of sampleProducts) {
    await prisma.product.upsert({
      where: { internalCode: product.internalCode },
      update: {},
      create: { ...product, createdBy: admin.id }
    });
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => prisma.$disconnect());
