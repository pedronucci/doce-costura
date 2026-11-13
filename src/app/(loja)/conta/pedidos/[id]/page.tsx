import { notFound } from "next/navigation";
import { customerOrder } from "@/lib/orders/customer-repository";
import { ORDER_LABELS } from "@/lib/orders/status";
import { formatBRL } from "@/lib/format";
import { AccountNav } from "@/components/customer/account-nav";
import { CustomerRowAction } from "@/components/customer/account-forms";
export const metadata = { title: "Meu pedido" };
export default async function Page({ params }: PageProps<"/conta/pedidos/[id]">) {
  const { id } = await params;
  const result = await customerOrder(id);
  if (!result) notFound();
  const { record, items, events } = result;
  return <><AccountNav /><h1 className="text-4xl">Pedido #{record.number}</h1><p className="mt-4 text-rosa-profundo">{ORDER_LABELS[record.status]}</p>
    {record.status === "awaiting_checkout" && <div className="mt-6 rounded-xl bg-linho p-5 text-sm leading-relaxed"><p>Este pedido reserva as peças temporariamente. Não há cobrança, frete contratado ou compra concluída.</p><p className="mt-2">Reserva até {record.reservationExpiresAt?.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}. Após esse horário, as peças são liberadas automaticamente.</p><CustomerRowAction id={record.id} mode="order" /></div>}
    <div className="mt-8 grid items-start gap-6 lg:grid-cols-[1fr_20rem]"><section className="rounded-2xl border border-dourado/25 bg-papel p-6"><h2 className="text-3xl">Suas peças</h2><ul className="mt-4 divide-y divide-linho">{items.map((item) => <li key={item.id} className="flex justify-between gap-4 py-4"><div><p className="font-medium">{item.productName}</p><p className="mt-1 text-sm text-tinta-suave">{item.variantName} · {item.quantity} × {formatBRL(item.unitCents)}</p></div><p className="whitespace-nowrap text-sm">{formatBRL(item.totalCents)}</p></li>)}</ul></section><div className="space-y-5"><section className="rounded-2xl bg-papel p-6"><h2 className="text-3xl">Resumo</h2><dl className="mt-5 space-y-3 text-sm"><div className="flex justify-between gap-3"><dt>Subtotal das peças</dt><dd>{formatBRL(record.subtotalCents)}</dd></div><div className="flex justify-between gap-3"><dt>Frete</dt><dd>{record.shippingCents === null ? "A calcular" : formatBRL(record.shippingCents)}</dd></div><div className="flex justify-between gap-3"><dt>Total</dt><dd>{record.totalCents === null ? "A confirmar" : formatBRL(record.totalCents)}</dd></div></dl></section><section className="rounded-2xl bg-papel p-6"><h2 className="text-3xl">Endereço informado</h2><p className="mt-4 text-sm leading-relaxed">{record.shipRecipient}<br />{record.shipStreet}, {record.shipNumber}{record.shipComplement && ` — ${record.shipComplement}`}<br />{record.shipNeighborhood}<br />{record.shipCity} — {record.shipState}<br />CEP {record.shipCep}</p></section></div></div>
    <section className="mt-8 rounded-2xl bg-papel p-6"><h2 className="text-3xl">Histórico</h2><ol className="mt-5 space-y-4">{events.map((event) => <li key={event.id}><p className="text-xs text-tinta-suave">{event.createdAt.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}</p><p className="mt-1 text-sm">{event.message}</p></li>)}</ol></section>
  </>;
}

// Esta página depende do acesso e/ou dos parâmetros da requisição.
export const instant = false;
