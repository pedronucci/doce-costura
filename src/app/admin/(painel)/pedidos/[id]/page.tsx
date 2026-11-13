import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getOrderForAdmin } from "@/lib/orders/admin-repository";
import { ORDER_LABELS, PAYMENT_LABELS, SHIPMENT_LABELS } from "@/lib/orders/status";
import { Badge, Card, Notice, PageHeader } from "@/components/admin/ui";
import { formatBRL } from "@/lib/format";

export const metadata: Metadata = { title: "Detalhes do pedido" };
const date = (value: Date) => value.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", dateStyle: "short", timeStyle: "short" });

export default async function OrderPage({ params }: PageProps<"/admin/pedidos/[id]">) {
  const { id } = await params;
  const data = await getOrderForAdmin(id);
  if (!data) notFound();
  const { record, items, payments, shipments, events } = data;
  return <>
    <PageHeader title={`Pedido #${record.number}`} description={`Registrado em ${date(record.createdAt)}`} back={{ href: "/admin/pedidos", label: "Pedidos" }} actions={<Badge>{ORDER_LABELS[record.status]}</Badge>} />
    <div className="grid items-start gap-5 xl:grid-cols-[1fr_22rem]">
      <div className="space-y-5">
        <Card title="Peças do pedido"><ul className="divide-y divide-linho">{items.map((item) => <li key={item.id} className="flex justify-between gap-4 py-4 first:pt-0"><div><p className="font-medium">{item.productName}</p><p className="mt-1 text-sm text-tinta-suave">{item.variantName} · SKU {item.sku}</p><p className="mt-1 text-sm">{item.quantity} × {formatBRL(item.unitCents)}</p></div><p className="whitespace-nowrap text-sm">{formatBRL(item.totalCents)}</p></li>)}</ul><p className="mt-3 text-xs text-tinta-suave">Dados registrados no momento da compra. Alterações no catálogo não mudam este pedido.</p></Card>
        <Card title="Pagamentos">{!payments.length ? <p className="text-sm text-tinta-suave">Nenhum pagamento registrado.</p> : <ul className="space-y-4">{payments.map((item) => <li key={item.id} className="flex flex-wrap justify-between gap-2 text-sm"><span>{item.provider} · {item.method}<span className="mt-1 block text-tinta-suave">{PAYMENT_LABELS[item.status] ?? item.status}</span></span><span>{formatBRL(item.amountCents)}{item.refundedCents > 0 && <span className="mt-1 block text-tinta-suave">Reembolsado: {formatBRL(item.refundedCents)}</span>}</span></li>)}</ul>}<div className="mt-5"><Notice>A confirmação do pagamento depende da integração com o provedor. Este painel não aprova cobranças.</Notice></div></Card>
        <Card title="Histórico">{!events.length ? <p className="text-sm text-tinta-suave">Nenhum evento registrado.</p> : <ol className="space-y-4">{events.map((event) => <li key={event.id}><p className="text-xs text-tinta-suave">{date(event.createdAt)}</p><p className="mt-1 text-sm">{event.message}</p></li>)}</ol>}</Card>
      </div>
      <div className="space-y-5">
        <Card title="Resumo financeiro"><dl className="space-y-3 text-sm">{[["Subtotal", record.subtotalCents], ["Desconto", -record.discountCents], ["Frete", record.shippingCents], ["Total", record.totalCents]].map(([label, value]) => <div key={label} className="flex justify-between gap-3"><dt>{label}</dt><dd>{value === null ? "A confirmar" : formatBRL(Number(value))}</dd></div>)}</dl></Card>
        <Card title="Cliente"><p className="text-sm">{record.customerName}</p><p className="mt-2 break-all text-sm text-tinta-suave">{record.customerEmail}</p>{record.customerPhone && <p className="mt-2 text-sm">{record.customerPhone}</p>}</Card>
        <Card title="Entrega"><address className="text-sm leading-relaxed not-italic">{record.shipRecipient}<br />{record.shipStreet}, {record.shipNumber}{record.shipComplement && ` — ${record.shipComplement}`}<br />{record.shipNeighborhood}<br />{record.shipCity} — {record.shipState}<br />CEP {record.shipCep}</address>{shipments.map((item) => <div key={item.serviceName} className="mt-5 border-t border-linho pt-4 text-sm"><p>{item.serviceName}</p><p className="mt-1 text-tinta-suave">{SHIPMENT_LABELS[item.status] ?? item.status}</p>{item.trackingCode && <p className="mt-2 break-all">Rastreio: {item.trackingCode}</p>}</div>)}{!shipments.length && <p className="mt-4 text-sm text-tinta-suave">Nenhum envio registrado.</p>}</Card>
      </div>
    </div>
  </>;
}
