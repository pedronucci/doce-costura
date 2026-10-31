/**
 * Doce Costura — modelo de dados (Drizzle ORM / PostgreSQL).
 *
 * Princípios:
 * - Valores monetários em centavos (integer). Nunca float.
 * - Pedido guarda "fotografia" (snapshot) de nome, preço e frete no momento da compra.
 * - Pagamento só muda de status pelo backend (webhook verificado + consulta à API).
 * - Nenhum dado de cartão é armazenado: apenas IDs e status do Mercado Pago.
 * - Movimentações de estoque e mudanças relevantes geram registro de auditoria.
 *
 * Tabelas de autenticação (user, session, account, verification, rate_limit)
 * seguem o formato exigido pelo Better Auth.
 */
import { relations, sql } from "drizzle-orm";
import {
  bigint,
  boolean,
  char,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

const createdAt = () => timestamp("created_at", { withTimezone: true }).notNull().defaultNow();
const updatedAt = () =>
  timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date());

// ---------------------------------------------------------------------------
// Autenticação (Better Auth)
// ---------------------------------------------------------------------------

/** Papéis: customer (cliente), staff (atendimento/expedição), admin (acesso total). */
export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  role: text("role").notNull().default("customer"),
  phone: text("phone"),
  cpf: text("cpf"),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    token: text("token").notNull().unique(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("session_user_idx").on(t.userId)],
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    password: text("password"),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", { withTimezone: true }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { withTimezone: true }),
    scope: text("scope"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("account_user_idx").on(t.userId)],
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("verification_identifier_idx").on(t.identifier)],
);

export const rateLimit = pgTable("rate_limit", {
  id: text("id").primaryKey(),
  key: text("key").notNull().unique(),
  count: integer("count").notNull(),
  lastRequest: bigint("last_request", { mode: "number" }).notNull(),
});

export const address = pgTable(
  "address",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    label: text("label"),
    recipient: text("recipient").notNull(),
    cep: text("cep").notNull(),
    street: text("street").notNull(),
    number: text("number").notNull(),
    complement: text("complement"),
    neighborhood: text("neighborhood").notNull(),
    city: text("city").notNull(),
    state: char("state", { length: 2 }).notNull(),
    isDefault: boolean("is_default").notNull().default(false),
  },
  (t) => [index("address_user_idx").on(t.userId)],
);

// ---------------------------------------------------------------------------
// Catálogo
// ---------------------------------------------------------------------------

export const category = pgTable("category", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  shortName: text("short_name"),
  description: text("description"),
  imageUrl: text("image_url"),
  position: integer("position").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

/**
 * draft: em cadastro, invisível na loja.
 * coming_soon: aparece na loja como "Preço em breve", não pode ser comprado.
 * active: à venda (exige foto, preço, peso e dimensões).
 * archived: fora da loja, mantido para histórico de pedidos.
 */
export const productStatus = pgEnum("product_status", ["draft", "coming_soon", "active", "archived"]);

export const product = pgTable(
  "product",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    summary: text("summary"),
    description: text("description"),
    materials: text("materials"),
    dimensions: text("dimensions"),
    careInstructions: text("care_instructions"),
    status: productStatus("status").notNull().default("draft"),
    isFeatured: boolean("is_featured").notNull().default(false),
    seoTitle: text("seo_title"),
    seoDescription: text("seo_description"),
    // Google Merchant Center / Instagram Shopping
    gtin: text("gtin"),
    brand: text("brand").notNull().default("Doce Costura"),
    googleCategory: text("google_category"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("product_status_idx").on(t.status)],
);

export const productCategory = pgTable(
  "product_category",
  {
    productId: uuid("product_id")
      .notNull()
      .references(() => product.id, { onDelete: "cascade" }),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => category.id, { onDelete: "cascade" }),
    position: integer("position").notNull().default(0),
  },
  (t) => [primaryKey({ columns: [t.productId, t.categoryId] })],
);

/** Variação vendável (estampa, cor, kit). Todo produto tem ao menos uma. */
export const productVariant = pgTable(
  "product_variant",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    productId: uuid("product_id")
      .notNull()
      .references(() => product.id, { onDelete: "cascade" }),
    sku: text("sku").notNull().unique(),
    name: text("name").notNull(),
    priceCents: integer("price_cents"), // null = pendente
    compareAtPriceCents: integer("compare_at_price_cents"),
    stock: integer("stock").notNull().default(0),
    reserved: integer("reserved").notNull().default(0),
    weightGrams: integer("weight_grams"),
    heightCm: numeric("height_cm", { precision: 6, scale: 1, mode: "number" }),
    widthCm: numeric("width_cm", { precision: 6, scale: 1, mode: "number" }),
    lengthCm: numeric("length_cm", { precision: 6, scale: 1, mode: "number" }),
    swatchUrl: text("swatch_url"),
    isActive: boolean("is_active").notNull().default(true),
    position: integer("position").notNull().default(0),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("variant_product_idx").on(t.productId)],
);

export const productImage = pgTable(
  "product_image",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    productId: uuid("product_id")
      .notNull()
      .references(() => product.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    storageKey: text("storage_key"), // caminho no Storage; null para imagens estáticas do site
    alt: text("alt").notNull(),
    width: integer("width").notNull(),
    height: integer("height").notNull(),
    position: integer("position").notNull().default(0),
    createdAt: createdAt(),
  },
  (t) => [index("image_product_idx").on(t.productId)],
);

export const stockMovementReason = pgEnum("stock_movement_reason", [
  "manual_adjustment",
  "order_reserved",
  "order_released",
  "order_fulfilled",
  "returned",
]);

export const stockMovement = pgTable(
  "stock_movement",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    variantId: uuid("variant_id")
      .notNull()
      .references(() => productVariant.id, { onDelete: "cascade" }),
    delta: integer("delta").notNull(),
    reason: stockMovementReason("reason").notNull(),
    orderId: uuid("order_id"),
    actorId: text("actor_id"),
    note: text("note"),
    createdAt: createdAt(),
  },
  (t) => [index("stock_movement_variant_idx").on(t.variantId, t.createdAt)],
);

// ---------------------------------------------------------------------------
// Carrinho, favoritos e cupons
// ---------------------------------------------------------------------------

export const cart = pgTable(
  "cart",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
    anonymousToken: text("anonymous_token").unique(),
    couponCode: text("coupon_code"),
    email: text("email"), // somente com consentimento para recuperação de carrinho
    recoveryConsent: boolean("recovery_consent").notNull().default(false),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("cart_user_idx").on(t.userId)],
);

export const cartItem = pgTable(
  "cart_item",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    cartId: uuid("cart_id")
      .notNull()
      .references(() => cart.id, { onDelete: "cascade" }),
    variantId: uuid("variant_id")
      .notNull()
      .references(() => productVariant.id),
    quantity: integer("quantity").notNull(),
  },
  (t) => [uniqueIndex("cart_item_unique").on(t.cartId, t.variantId)],
);

export const favorite = pgTable(
  "favorite",
  {
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    productId: uuid("product_id")
      .notNull()
      .references(() => product.id, { onDelete: "cascade" }),
    createdAt: createdAt(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.productId] })],
);

export const couponType = pgEnum("coupon_type", ["percent", "fixed_cents", "free_shipping"]);

export const coupon = pgTable("coupon", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: text("code").notNull().unique(),
  type: couponType("type").notNull(),
  value: integer("value").notNull(), // % (1–100) ou centavos
  minSubtotalCents: integer("min_subtotal_cents"),
  maxUses: integer("max_uses"),
  maxUsesPerUser: integer("max_uses_per_user"),
  usedCount: integer("used_count").notNull().default(0),
  startsAt: timestamp("starts_at", { withTimezone: true }),
  endsAt: timestamp("ends_at", { withTimezone: true }),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: createdAt(),
});

// ---------------------------------------------------------------------------
// Pedidos, pagamentos e envios
// ---------------------------------------------------------------------------

export const orderStatus = pgEnum("order_status", [
  "pending_payment",
  "paid",
  "in_preparation",
  "shipped",
  "delivered",
  "canceled",
  "refunded",
  "partially_refunded",
]);

export const order = pgTable(
  "order",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    number: serial("number").notNull().unique(), // número exibido ao cliente
    userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
    status: orderStatus("status").notNull().default("pending_payment"),
    idempotencyKey: text("idempotency_key").notNull().unique(),

    customerName: text("customer_name").notNull(),
    customerEmail: text("customer_email").notNull(),
    customerPhone: text("customer_phone"),
    customerCpf: text("customer_cpf"),

    shipRecipient: text("ship_recipient").notNull(),
    shipCep: text("ship_cep").notNull(),
    shipStreet: text("ship_street").notNull(),
    shipNumber: text("ship_number").notNull(),
    shipComplement: text("ship_complement"),
    shipNeighborhood: text("ship_neighborhood").notNull(),
    shipCity: text("ship_city").notNull(),
    shipState: char("ship_state", { length: 2 }).notNull(),

    subtotalCents: integer("subtotal_cents").notNull(),
    discountCents: integer("discount_cents").notNull().default(0),
    shippingCents: integer("shipping_cents").notNull(),
    totalCents: integer("total_cents").notNull(),
    currency: text("currency").notNull().default("BRL"),
    couponId: uuid("coupon_id").references(() => coupon.id),

    acceptedTermsAt: timestamp("accepted_terms_at", { withTimezone: true }).notNull(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("order_status_idx").on(t.status, t.createdAt), index("order_email_idx").on(t.customerEmail)],
);

export const orderItem = pgTable("order_item", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => order.id, { onDelete: "cascade" }),
  variantId: uuid("variant_id").references(() => productVariant.id, { onDelete: "set null" }),
  productName: text("product_name").notNull(),
  variantName: text("variant_name").notNull(),
  sku: text("sku").notNull(),
  unitCents: integer("unit_cents").notNull(),
  quantity: integer("quantity").notNull(),
  totalCents: integer("total_cents").notNull(),
});

export const paymentMethod = pgEnum("payment_method", ["pix", "credit_card", "debit_card", "boleto", "other"]);
export const paymentStatus = pgEnum("payment_status", [
  "pending",
  "in_process",
  "approved",
  "rejected",
  "canceled",
  "refunded",
  "charged_back",
  "expired",
]);

export const payment = pgTable(
  "payment",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => order.id, { onDelete: "cascade" }),
    provider: text("provider").notNull().default("mercadopago"),
    providerPaymentId: text("provider_payment_id").unique(),
    method: paymentMethod("method").notNull(),
    status: paymentStatus("status").notNull().default("pending"),
    statusDetail: text("status_detail"),
    amountCents: integer("amount_cents").notNull(),
    installments: integer("installments"),
    feeCents: integer("fee_cents"),
    pixQrCode: text("pix_qr_code"),
    pixQrCodeBase64: text("pix_qr_code_base64"),
    pixExpiresAt: timestamp("pix_expires_at", { withTimezone: true }),
    boletoUrl: text("boleto_url"),
    cardLastFour: text("card_last_four"), // apenas exibição; nunca número completo/CVV
    cardBrand: text("card_brand"),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    refundedCents: integer("refunded_cents").notNull().default(0),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("payment_order_idx").on(t.orderId)],
);

/** Webhooks recebidos — idempotência e auditoria. */
export const webhookEvent = pgTable(
  "webhook_event",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    provider: text("provider").notNull(),
    eventId: text("event_id").notNull(),
    topic: text("topic").notNull(),
    resourceId: text("resource_id").notNull(),
    signatureOk: boolean("signature_ok").notNull(),
    payload: jsonb("payload").notNull(),
    processedAt: timestamp("processed_at", { withTimezone: true }),
    error: text("error"),
    receivedAt: timestamp("received_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("webhook_event_unique").on(t.provider, t.eventId),
    index("webhook_event_resource_idx").on(t.provider, t.resourceId),
  ],
);

export const shipmentStatus = pgEnum("shipment_status", [
  "pending",
  "label_purchased",
  "posted",
  "in_transit",
  "out_for_delivery",
  "delivered",
  "returned",
  "lost",
]);

export const shipment = pgTable("shipment", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id")
    .notNull()
    .unique()
    .references(() => order.id, { onDelete: "cascade" }),
  provider: text("provider").notNull().default("melhorenvio"),
  serviceName: text("service_name").notNull(),
  quotedCents: integer("quoted_cents").notNull(),
  quotedDays: integer("quoted_days").notNull(),
  providerOrderId: text("provider_order_id"),
  trackingCode: text("tracking_code"),
  trackingUrl: text("tracking_url"),
  status: shipmentStatus("status").notNull().default("pending"),
  postedAt: timestamp("posted_at", { withTimezone: true }),
  deliveredAt: timestamp("delivered_at", { withTimezone: true }),
  updatedAt: updatedAt(),
});

export const orderEvent = pgTable(
  "order_event",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => order.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    message: text("message").notNull(),
    actorId: text("actor_id"),
    data: jsonb("data"),
    createdAt: createdAt(),
  },
  (t) => [index("order_event_order_idx").on(t.orderId, t.createdAt)],
);

// ---------------------------------------------------------------------------
// Avaliações, atendimento, marketing e LGPD
// ---------------------------------------------------------------------------

export const reviewStatus = pgEnum("review_status", ["pending", "approved", "rejected"]);

export const review = pgTable("review", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: uuid("product_id")
    .notNull()
    .references(() => product.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  orderItemId: uuid("order_item_id")
    .notNull()
    .unique() // garante "compra verificada"
    .references(() => orderItem.id),
  rating: integer("rating").notNull(),
  title: text("title"),
  body: text("body").notNull(),
  status: reviewStatus("status").notNull().default("pending"),
  createdAt: createdAt(),
});

export const supportTicket = pgTable("support_ticket", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
  orderId: uuid("order_id"),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  status: text("status").notNull().default("open"),
  createdAt: createdAt(),
});

export const newsletterSubscriber = pgTable("newsletter_subscriber", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  consentAt: timestamp("consent_at", { withTimezone: true }).notNull(),
  consentText: text("consent_text").notNull(),
  confirmedAt: timestamp("confirmed_at", { withTimezone: true }),
  unsubscribedAt: timestamp("unsubscribed_at", { withTimezone: true }),
  source: text("source"),
});

export const dataRequestType = pgEnum("data_request_type", [
  "access",
  "correction",
  "deletion",
  "portability",
  "revoke_consent",
]);

export const dataSubjectRequest = pgTable("data_subject_request", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull(),
  type: dataRequestType("type").notNull(),
  details: text("details"),
  status: text("status").notNull().default("open"),
  resolvedAt: timestamp("resolved_at", { withTimezone: true }),
  createdAt: createdAt(),
});

export const banner = pgTable("banner", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  subtitle: text("subtitle"),
  imageUrl: text("image_url").notNull(),
  imageAlt: text("image_alt").notNull(),
  ctaLabel: text("cta_label"),
  ctaHref: text("cta_href"),
  position: integer("position").notNull().default(0),
  startsAt: timestamp("starts_at", { withTimezone: true }),
  endsAt: timestamp("ends_at", { withTimezone: true }),
  isActive: boolean("is_active").notNull().default(true),
});

/** Configurações editáveis no painel (linha única, id = "default"). */
export const storeSettings = pgTable("store_settings", {
  id: text("id").primaryKey().default("default"),
  announcements: text("announcements")
    .array()
    .notNull()
    .default(sql`'{}'::text[]`),
  whatsappNumber: text("whatsapp_number"),
  whatsappMessage: text("whatsapp_message")
    .notNull()
    .default("Olá! Gostaria de conhecer melhor os produtos da Doce Costura."),
  legalName: text("legal_name"),
  cnpj: text("cnpj"),
  address: text("address"),
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone"),
  serviceHours: text("service_hours"),
  instagramUrl: text("instagram_url"),
  originCep: text("origin_cep"),
  pixExpirationMin: integer("pix_expiration_min").notNull().default(30),
  maxInstallments: integer("max_installments"),
  ga4MeasurementId: text("ga4_measurement_id"),
  metaPixelId: text("meta_pixel_id"),
  searchConsoleToken: text("search_console_token"),
  updatedAt: updatedAt(),
});

export const auditLog = pgTable(
  "audit_log",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    actorId: text("actor_id"),
    action: text("action").notNull(), // "product.update", "category.create"...
    entity: text("entity").notNull(),
    entityId: text("entity_id"),
    diff: jsonb("diff"),
    ip: text("ip"),
    createdAt: createdAt(),
  },
  (t) => [index("audit_entity_idx").on(t.entity, t.entityId)],
);

// ---------------------------------------------------------------------------
// Relações (consultas relacionais do Drizzle)
// ---------------------------------------------------------------------------

export const productRelations = relations(product, ({ many }) => ({
  variants: many(productVariant),
  images: many(productImage),
  categories: many(productCategory),
}));

export const productVariantRelations = relations(productVariant, ({ one }) => ({
  product: one(product, { fields: [productVariant.productId], references: [product.id] }),
}));

export const productImageRelations = relations(productImage, ({ one }) => ({
  product: one(product, { fields: [productImage.productId], references: [product.id] }),
}));

export const categoryRelations = relations(category, ({ many }) => ({
  products: many(productCategory),
}));

export const productCategoryRelations = relations(productCategory, ({ one }) => ({
  product: one(product, { fields: [productCategory.productId], references: [product.id] }),
  category: one(category, { fields: [productCategory.categoryId], references: [category.id] }),
}));
