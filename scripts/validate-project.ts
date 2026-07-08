import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const required = [
  "package.json",
  "prisma/schema.prisma",
  "prisma/seed.ts",
  "src/app/login/page.tsx",
  "src/app/app/vendas/page.tsx",
  "src/app/api/sales/route.ts",
  "src/app/api/products/route.ts",
  "src/services/sale.service.ts",
  "src/services/product.service.ts",
  "src/services/report.service.ts"
];

const missing = required.filter((file) => !fs.existsSync(path.join(root, file)));
if (missing.length) {
  console.error("Arquivos ausentes:", missing);
  process.exit(1);
}

const schema = fs.readFileSync(path.join(root, "prisma/schema.prisma"), "utf8");
const models = ["User", "Product", "Sale", "SaleItem", "SalePayment", "DraftSale", "CreditSale", "ProductAudit", "SystemAudit", "Setting"];
const missingModels = models.filter((model) => !schema.includes(`model ${model}`));
if (missingModels.length) {
  console.error("Models ausentes:", missingModels);
  process.exit(1);
}

const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
for (const dep of ["next", "@prisma/client", "zod", "zustand", "recharts", "bcryptjs"]) {
  if (!pkg.dependencies[dep]) {
    console.error(`Dependência ausente: ${dep}`);
    process.exit(1);
  }
}

console.log("Validação estrutural concluída com sucesso.");
