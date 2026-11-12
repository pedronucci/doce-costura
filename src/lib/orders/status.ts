export const ORDER_STATUSES = ["pending_payment", "paid", "in_preparation", "shipped", "delivered", "canceled", "refunded", "partially_refunded"] as const;
export type OrderStatus = typeof ORDER_STATUSES[number];
export const ORDER_LABELS: Record<OrderStatus, string> = {
  pending_payment: "Aguardando pagamento", paid: "Pago", in_preparation: "Em preparação", shipped: "Enviado",
  delivered: "Entregue", canceled: "Cancelado", refunded: "Reembolsado", partially_refunded: "Reembolso parcial",
};
export const PAYMENT_LABELS: Record<string, string> = {
  pending: "Pendente", in_process: "Em análise", approved: "Aprovado", rejected: "Recusado", canceled: "Cancelado",
  refunded: "Reembolsado", charged_back: "Contestado", expired: "Expirado",
};
export const SHIPMENT_LABELS: Record<string, string> = {
  pending: "Aguardando envio", label_purchased: "Etiqueta adquirida", posted: "Postado", in_transit: "Em trânsito",
  out_for_delivery: "Saiu para entrega", delivered: "Entregue", returned: "Devolvido", lost: "Extraviado",
};
