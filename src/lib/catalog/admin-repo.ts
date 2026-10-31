import "server-only";
import { and, asc, count, desc, eq, ilike, inArray, ne, or, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  auditLog,
  cartItem,
  category,
  orderItem,
  product,
  productCategory,
  productImage,
  productVariant,
  stockMovement,
} from "@/db/schema";
import { deleteFile } from "@/lib/storage";
import type { ProductData, ProductStatus } from "./admin-schema";

export class UserFacingError extends Error {}

// ---------------------------------------------------------------------------
// Leitura
// ---------------------------------------------------------------------------

export async function listProductsForAdmin(opts: { q?: string; status?: ProductStatus | "all" }) {
  const filters = [];
  if (opts.status && opts.status !== "all") filters.push(eq(product.status, opts.status));
  if (opts.q) {
    const term = `%${opts.q.replace(/[%_]/g, "")}%`;
    filters.push(
      or(
        ilike(product.name, term),
        ilike(product.slug, term),
        sql`exists (select 1 from ${productVariant} v where v.product_id = ${product.id} and v.sku ilike ${term})`,
      ),
    );
  }
  const rows = await db.query.product.findMany({
    where: filters.length ? and(...filters) : undefined,
    orderBy: [desc(product.updatedAt)],
    with: {
      images: { orderBy: [asc(productImage.position)], limit: 1 },
      variants: { orderBy: [asc(productVariant.position)] },
    },
  });
  return rows.map((p) => {
    const prices = p.variants.filter((v) => v.priceCents !== null).map((v) => v.priceCents!);
    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      status: p.status,
      updatedAt: p.updatedAt,
      thumb: p.images[0] ?? null,
      variantCount: p.variants.length,
      stock: p.variants.reduce((s, v) => s + v.stock, 0),
      minPrice: prices.length ? Math.min(...prices) : null,
      maxPrice: prices.length ? Math.max(...prices) : null,
    };
  });
}

export async function countProductsByStatus() {
  const rows = await db.select({ status: product.status, n: count() }).from(product).groupBy(product.status);
  return Object.fromEntries(rows.map((r) => [r.status, r.n])) as Partial<Record<ProductStatus, number>>;
}

export async function getProductForEdit(id: string) {
  return db.query.product.findFirst({
    where: eq(product.id, id),
    with: {
      images: { orderBy: [asc(productImage.position)] },
      variants: { orderBy: [asc(productVariant.position)] },
      categories: true,
    },
  });
}

export async function listCategoriesForAdmin() {
  const rows = await db
    .select({
      id: category.id,
      name: category.name,
      shortName: category.shortName,
      slug: category.slug,
      description: category.description,
      isActive: category.isActive,
      position: category.position,
      productCount: sql<number>`(select count(*)::int from ${productCategory} pc where pc.category_id = ${category.id})`,
    })
    .from(category)
    .orderBy(asc(category.position), asc(category.name));
  return rows;
}

// ---------------------------------------------------------------------------
// Escrita
// ---------------------------------------------------------------------------

async function deleteOrphanFiles(keys: string[]) {
  if (keys.length === 0) return;
  const stillUsed = await db
    .select({ key: productImage.storageKey })
    .from(productImage)
    .where(inArray(productImage.storageKey, keys));
  const used = new Set(stillUsed.map((r) => r.key));
  await Promise.allSettled(keys.filter((k) => !used.has(k)).map((k) => deleteFile(k)));
}

/** Cria ou atualiza um produto completo (dados, categorias, fotos, variações) em uma transação. */
export async function saveProduct(data: ProductData, actorId: string) {
  const removedKeys: string[] = [];

  const productId = await db.transaction(async (tx) => {
    // Endereço (slug) único
    const slugTaken = await tx
      .select({ id: product.id })
      .from(product)
      .where(data.id ? and(eq(product.slug, data.slug), ne(product.id, data.id)) : eq(product.slug, data.slug))
      .limit(1);
    if (slugTaken.length) throw new UserFacingError("Já existe outro produto com este endereço (slug).");

    // SKU único entre produtos
    const skus = data.variants.map((v) => v.sku);
    const skuTaken = await tx
      .select({ sku: productVariant.sku })
      .from(productVariant)
      .where(
        data.id
          ? and(inArray(productVariant.sku, skus), ne(productVariant.productId, data.id))
          : inArray(productVariant.sku, skus),
      );
    if (skuTaken.length) throw new UserFacingError(`SKU já usado em outro produto: ${skuTaken.map((s) => s.sku).join(", ")}.`);

    const values = {
      name: data.name,
      slug: data.slug,
      summary: data.summary,
      description: data.description,
      materials: data.materials,
      dimensions: data.dimensions,
      careInstructions: data.careInstructions,
      status: data.status,
      isFeatured: data.isFeatured,
      seoTitle: data.seoTitle,
      seoDescription: data.seoDescription,
    };

    let id = data.id;
    let before: unknown = null;
    if (id) {
      const [existing] = await tx.select().from(product).where(eq(product.id, id));
      if (!existing) throw new UserFacingError("Produto não encontrado.");
      before = existing;
      await tx.update(product).set(values).where(eq(product.id, id));
    } else {
      const [created] = await tx.insert(product).values(values).returning({ id: product.id });
      id = created.id;
    }

    // Categorias
    await tx.delete(productCategory).where(eq(productCategory.productId, id));
    if (data.categoryIds.length) {
      await tx
        .insert(productCategory)
        .values(data.categoryIds.map((categoryId, position) => ({ productId: id!, categoryId, position })));
    }

    // Fotos
    const currentImages = await tx.select().from(productImage).where(eq(productImage.productId, id));
    const keepIds = new Set(data.images.filter((i) => i.id).map((i) => i.id!));
    for (const img of currentImages) {
      if (!keepIds.has(img.id)) {
        await tx.delete(productImage).where(eq(productImage.id, img.id));
        if (img.storageKey) removedKeys.push(img.storageKey);
      }
    }
    for (const [position, img] of data.images.entries()) {
      if (img.id && currentImages.some((c) => c.id === img.id)) {
        await tx.update(productImage).set({ alt: img.alt, position }).where(eq(productImage.id, img.id));
      } else {
        await tx.insert(productImage).values({
          productId: id,
          url: img.url,
          storageKey: img.storageKey,
          alt: img.alt,
          width: img.width,
          height: img.height,
          position,
        });
      }
    }

    // Variações (estoque ajustado gera movimentação para auditoria)
    const currentVariants = await tx.select().from(productVariant).where(eq(productVariant.productId, id));
    const inputIds = new Set(data.variants.filter((v) => v.id).map((v) => v.id!));
    for (const old of currentVariants) {
      if (inputIds.has(old.id)) continue;
      const [{ n }] = await tx.select({ n: count() }).from(orderItem).where(eq(orderItem.variantId, old.id));
      if (n > 0) {
        // Já vendida: não apaga, apenas desativa para preservar o histórico.
        await tx.update(productVariant).set({ isActive: false }).where(eq(productVariant.id, old.id));
      } else {
        await tx.delete(cartItem).where(eq(cartItem.variantId, old.id));
        await tx.delete(productVariant).where(eq(productVariant.id, old.id));
      }
    }
    for (const [position, v] of data.variants.entries()) {
      const row = {
        name: v.name,
        sku: v.sku,
        priceCents: v.price,
        compareAtPriceCents: v.compareAtPrice,
        stock: v.stock,
        weightGrams: v.weightGrams,
        heightCm: v.heightCm,
        widthCm: v.widthCm,
        lengthCm: v.lengthCm,
        swatchUrl: v.swatchUrl,
        isActive: v.isActive,
        position,
      };
      const old = v.id ? currentVariants.find((c) => c.id === v.id) : undefined;
      if (old) {
        await tx.update(productVariant).set(row).where(eq(productVariant.id, old.id));
        if (old.stock !== v.stock) {
          await tx.insert(stockMovement).values({
            variantId: old.id,
            delta: v.stock - old.stock,
            reason: "manual_adjustment",
            actorId,
          });
        }
      } else {
        const [created] = await tx
          .insert(productVariant)
          .values({ ...row, productId: id })
          .returning({ id: productVariant.id });
        if (v.stock > 0) {
          await tx.insert(stockMovement).values({
            variantId: created.id,
            delta: v.stock,
            reason: "manual_adjustment",
            actorId,
            note: "Estoque inicial",
          });
        }
      }
    }

    await tx.insert(auditLog).values({
      actorId,
      action: data.id ? "product.update" : "product.create",
      entity: "product",
      entityId: id,
      diff: { before, after: { ...values, categoryIds: data.categoryIds, variants: data.variants.length, images: data.images.length } },
    });
    return id;
  });

  await deleteOrphanFiles(removedKeys);
  return productId;
}

export async function duplicateProduct(id: string, actorId: string) {
  const source = await getProductForEdit(id);
  if (!source) throw new UserFacingError("Produto não encontrado.");

  return db.transaction(async (tx) => {
    let n = 1;
    let slug = `${source.slug}-copia`;
    while ((await tx.select({ id: product.id }).from(product).where(eq(product.slug, slug))).length) {
      n += 1;
      slug = `${source.slug}-copia-${n}`;
    }
    const [created] = await tx
      .insert(product)
      .values({
        slug,
        name: `${source.name} (cópia)`,
        summary: source.summary,
        description: source.description,
        materials: source.materials,
        dimensions: source.dimensions,
        careInstructions: source.careInstructions,
        status: "draft",
        isFeatured: false,
      })
      .returning({ id: product.id });

    if (source.categories.length) {
      await tx.insert(productCategory).values(
        source.categories.map((c) => ({ productId: created.id, categoryId: c.categoryId, position: c.position })),
      );
    }
    if (source.images.length) {
      await tx.insert(productImage).values(
        source.images.map((i) => ({
          productId: created.id,
          url: i.url,
          storageKey: i.storageKey,
          alt: i.alt,
          width: i.width,
          height: i.height,
          position: i.position,
        })),
      );
    }
    const suffix = n === 1 ? "COPIA" : `COPIA${n}`;
    await tx.insert(productVariant).values(
      source.variants.map((v) => ({
        productId: created.id,
        sku: `${v.sku}-${suffix}`.slice(0, 40),
        name: v.name,
        priceCents: v.priceCents,
        compareAtPriceCents: v.compareAtPriceCents,
        stock: 0, // estoque nunca é copiado
        weightGrams: v.weightGrams,
        heightCm: v.heightCm,
        widthCm: v.widthCm,
        lengthCm: v.lengthCm,
        swatchUrl: v.swatchUrl,
        isActive: v.isActive,
        position: v.position,
      })),
    );
    await tx.insert(auditLog).values({ actorId, action: "product.duplicate", entity: "product", entityId: created.id, diff: { from: id } });
    return created.id;
  });
}

export async function deleteProduct(id: string, actorId: string) {
  const keys = await db.transaction(async (tx) => {
    const variants = await tx.select({ id: productVariant.id }).from(productVariant).where(eq(productVariant.productId, id));
    const variantIds = variants.map((v) => v.id);
    if (variantIds.length) {
      const [{ n }] = await tx.select({ n: count() }).from(orderItem).where(inArray(orderItem.variantId, variantIds));
      if (n > 0) throw new UserFacingError("Este produto já tem pedidos. Arquive-o em vez de excluir.");
      await tx.delete(cartItem).where(inArray(cartItem.variantId, variantIds));
    }
    const images = await tx.select({ key: productImage.storageKey }).from(productImage).where(eq(productImage.productId, id));
    const [deleted] = await tx.delete(product).where(eq(product.id, id)).returning({ name: product.name });
    if (!deleted) throw new UserFacingError("Produto não encontrado.");
    await tx.insert(auditLog).values({ actorId, action: "product.delete", entity: "product", entityId: id, diff: { name: deleted.name } });
    return images.map((i) => i.key).filter((k): k is string => Boolean(k));
  });
  await deleteOrphanFiles(keys);
}

// ---------------------------------------------------------------------------
// Categorias
// ---------------------------------------------------------------------------

export async function saveCategory(
  data: { id?: string; name: string; shortName: string | null; slug: string; description: string | null; isActive: boolean },
  actorId: string,
) {
  const taken = await db
    .select({ id: category.id })
    .from(category)
    .where(data.id ? and(eq(category.slug, data.slug), ne(category.id, data.id)) : eq(category.slug, data.slug));
  if (taken.length) throw new UserFacingError("Já existe uma categoria com este endereço.");

  const values = { name: data.name, shortName: data.shortName, slug: data.slug, description: data.description, isActive: data.isActive };
  if (data.id) {
    await db.update(category).set(values).where(eq(category.id, data.id));
  } else {
    const [{ max }] = await db.select({ max: sql<number>`coalesce(max(${category.position}), 0)::int` }).from(category);
    await db.insert(category).values({ ...values, position: max + 1 });
  }
  await db.insert(auditLog).values({ actorId, action: data.id ? "category.update" : "category.create", entity: "category", entityId: data.id ?? null, diff: values });
}

export async function moveCategory(id: string, direction: "up" | "down", actorId: string) {
  await db.transaction(async (tx) => {
    const all = await tx.select({ id: category.id }).from(category).orderBy(asc(category.position), asc(category.name));
    const i = all.findIndex((c) => c.id === id);
    const j = direction === "up" ? i - 1 : i + 1;
    if (i < 0 || j < 0 || j >= all.length) return;
    [all[i], all[j]] = [all[j], all[i]];
    for (const [position, c] of all.entries()) {
      await tx.update(category).set({ position: position + 1 }).where(eq(category.id, c.id));
    }
    await tx.insert(auditLog).values({ actorId, action: "category.reorder", entity: "category", entityId: id });
  });
}

export async function deleteCategory(id: string, actorId: string) {
  const [{ n }] = await db.select({ n: count() }).from(productCategory).where(eq(productCategory.categoryId, id));
  if (n > 0) throw new UserFacingError("Esta categoria tem produtos. Remova-os da categoria ou desative-a.");
  await db.delete(category).where(eq(category.id, id));
  await db.insert(auditLog).values({ actorId, action: "category.delete", entity: "category", entityId: id });
}
