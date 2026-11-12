import type { Metadata } from "next";
import Link from "next/link";
import { listOrdersForAdmin } from "@/lib/orders/admin-repository";
import { ORDER_LABELS, ORDER_STATUSES } from "@/lib/orders/status";
import { Badge, inputClass, LinkButton, Notice, PageHeader } from "@/components/admin/ui";
import { formatBRL } from "@/lib/format";

export const metadata: Metadata = { title: "Pedidos" };
const date = (value: Date) => value.toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" });

export default async function OrdersPage({ searchParams }: PageProps<"/admin/pedidos">) {
  const sp = await searchParams;
  const { orders, filters, hasNext } = await listOrdersForAdmin({
    status: typeof sp.status === "string" ? sp.status : undefined,
    number: typeof sp.number === "string" && sp.number ? sp.number : undefined,
    page: typeof sp.page === "string" ? sp.page : undefined,
  });
  const pageHref = (page: number) => `/admin/pedidos?${new URLSearchParams({ page: String(page), ...(filters.status && { status: filters.status }), ...(filters.number && { number: String(filters.number) }) })}`;
  return <>
    <PageHeader title="Pedidos" description="Consulte o pagamento, as peças e a entrega de cada pedido." />
    <Notice>O checkout ainda está em preparação. Esta área exibe somente pedidos registrados; pagamentos e envios não podem ser confirmados manualmente por aqui.</Notice>
    <form className="my-5 grid items-end gap-3 sm:grid-cols-[1fr_1fr_auto]">
      <div><label htmlFor="order-number" className="mb-2 block text-sm">Número do pedido</label><input id="order-number" name="number" type="number" min="1" max="2147483647" defaultValue={filters.number} className={inputClass} placeholder="Ex.: 123" /></div>
      <div><label htmlFor="order-status" className="mb-2 block text-sm">Situação</label><select id="order-status" name="status" defaultValue={filters.status ?? ""} className={inputClass}><option value="">Todas</option>{ORDER_STATUSES.map((status) => <option key={status} value={status}>{ORDER_LABELS[status]}</option>)}</select></div>
      <button type="submit" className="min-h-11 rounded-lg bg-cacau px-5 text-sm text-papel">Filtrar pedidos</button>
    </form>
    {!orders.length ? <div className="rounded-2xl border border-dashed border-dourado/40 bg-white px-6 py-14 text-center"><h2 className="text-2xl">{filters.status || filters.number ? "Nenhum pedido encontrado" : "Seus pedidos aparecerão aqui"}</h2><p className="mt-3 text-sm text-tinta-suave">{filters.status || filters.number ? "Tente outros filtros." : "Quando a compra online estiver disponível, acompanhe cada pedido neste espaço."}</p></div> : <ul className="divide-y divide-linho overflow-hidden rounded-2xl border border-dourado/25 bg-white">{orders.map((item) => <li key={item.id}><Link href={`/admin/pedidos/${item.id}`} className="flex flex-wrap items-center justify-between gap-3 p-5 hover:bg-creme"><div><p className="font-medium">Pedido #{item.number}</p><p className="mt-1 text-sm text-tinta-suave">{item.customerName} · {date(item.createdAt)}</p></div><div className="flex flex-wrap items-center gap-4"><Badge>{ORDER_LABELS[item.status]}</Badge><strong className="text-sm font-medium">{formatBRL(item.totalCents)}</strong></div></Link></li>)}</ul>}
    <nav aria-label="Páginas de pedidos" className="mt-6 flex items-center justify-between gap-3"><span className="text-sm text-tinta-suave">Página {filters.page}</span><div className="flex gap-3">{filters.page > 1 && <LinkButton href={pageHref(filters.page - 1)} variant="secondary">Anterior</LinkButton>}{hasNext && <LinkButton href={pageHref(filters.page + 1)} variant="secondary">Próxima</LinkButton>}</div></nav>
  </>;
}
