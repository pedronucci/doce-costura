import Link from "next/link";
import { customerOrders } from "@/lib/orders/customer-repository";
import { ORDER_LABELS } from "@/lib/orders/status";
import { formatBRL } from "@/lib/format";
import { AccountNav } from "@/components/customer/account-nav";
export const metadata = { title: "Meus pedidos" };
export default async function Page({ searchParams }: PageProps<"/conta/pedidos">) {
  const params = await searchParams;
  const result = await customerOrders(typeof params.page === "string" ? Number(params.page) : 1);
  return <><AccountNav /><h1 className="text-4xl">Meus pedidos</h1><p className="mt-4 text-tinta-suave">Acompanhe suas escolhas e as reservas de peças.</p>
    {!result.orders.length ? <div className="mt-8 rounded-2xl bg-papel p-8"><p>Você ainda não tem pedidos nesta página.</p><Link href="/colecao" className="mt-5 inline-block text-rosa-profundo underline">Conhecer a coleção</Link></div> : <ul className="mt-8 divide-y divide-linho overflow-hidden rounded-2xl border border-dourado/25 bg-papel">{result.orders.map((record) => <li key={record.id}><Link href={`/conta/pedidos/${record.id}`} className="flex flex-wrap justify-between gap-4 p-6 hover:bg-linho/40"><div><h2 className="text-2xl">Pedido #{record.number}</h2><p className="mt-2 text-sm text-tinta-suave">{ORDER_LABELS[record.status]}</p></div><p className="text-sm">{record.totalCents === null ? `Peças: ${formatBRL(record.subtotalCents)} · total a confirmar` : formatBRL(record.totalCents)}</p></Link></li>)}</ul>}
    <nav aria-label="Páginas de pedidos" className="mt-6 flex gap-5 text-sm text-rosa-profundo">{result.page > 1 && <Link href={`/conta/pedidos?page=${result.page - 1}`}>Página anterior</Link>}{result.hasNext && <Link href={`/conta/pedidos?page=${result.page + 1}`}>Próxima página</Link>}</nav>
  </>;
}

// Esta página depende do acesso e/ou dos parâmetros da requisição.
export const instant = false;
