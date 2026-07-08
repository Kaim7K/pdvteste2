import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { toMoney } from "@/lib/money";

export default async function DashboardPage() {
  const start = new Date(); start.setHours(0,0,0,0);
  const [sales, products, negative, credit] = await Promise.all([
    prisma.sale.findMany({ where: { status: "COMPLETED", completedAt: { gte: start } } }),
    prisma.product.count({ where: { deletedAt: null } }),
    prisma.product.count({ where: { deletedAt: null, stockQuantity: { lte: 0 } } }),
    prisma.creditSale.aggregate({ _sum: { pendingAmount: true }, where: { status: { in: ["OPEN", "PARTIAL"] } } })
  ]);
  const revenue = sales.reduce((s, v) => s + Number(v.total), 0);
  const cards = [
    ["Vendido hoje", toMoney(revenue)], ["Vendas hoje", String(sales.length)], ["Produtos cadastrados", String(products)], ["Estoque negativo", String(negative)], ["Fiado pendente", toMoney(Number(credit._sum.pendingAmount ?? 0))]
  ];
  return <div><PageHeader title="Dashboard" description="Resumo operacional do sistema."/><div className="grid grid-cols-1 gap-4 md:grid-cols-5">{cards.map(([k,v]) => <Card key={k} className="p-5"><div className="text-sm text-pdv-muted">{k}</div><div className="mt-2 text-2xl font-black text-pdv-green">{v}</div></Card>)}</div><Card className="mt-6 p-6"><h2 className="text-lg font-black">Próxima ação correta</h2><p className="mt-2 text-pdv-muted">Use a tela de vendas como centro operacional. Relatórios, auditoria e fiado ficam em áreas secundárias para não poluir o caixa.</p></Card></div>;
}
