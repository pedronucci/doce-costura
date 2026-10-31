import type { getProductForEdit } from "@/lib/catalog/admin-repo";
import { centsToInput, emptyVariant, newKey, numToInput, type ProductFormValues } from "./types";

type Loaded = NonNullable<Awaited<ReturnType<typeof getProductForEdit>>>;

export function toFormValues(p: Loaded): ProductFormValues {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    summary: p.summary ?? "",
    description: p.description ?? "",
    materials: p.materials ?? "",
    dimensions: p.dimensions ?? "",
    careInstructions: p.careInstructions ?? "",
    status: p.status,
    isFeatured: p.isFeatured,
    seoTitle: p.seoTitle ?? "",
    seoDescription: p.seoDescription ?? "",
    categoryIds: p.categories.map((c) => c.categoryId),
    images: p.images.map((i) => ({ key: newKey(), id: i.id, url: i.url, storageKey: i.storageKey, alt: i.alt, width: i.width, height: i.height })),
    variants: p.variants.map((v) => ({
      key: newKey(),
      id: v.id,
      name: v.name,
      sku: v.sku,
      price: centsToInput(v.priceCents),
      compareAtPrice: centsToInput(v.compareAtPriceCents),
      stock: String(v.stock),
      weightGrams: v.weightGrams === null ? "" : String(v.weightGrams),
      heightCm: numToInput(v.heightCm),
      widthCm: numToInput(v.widthCm),
      lengthCm: numToInput(v.lengthCm),
      swatchUrl: v.swatchUrl,
      isActive: v.isActive,
    })),
  };
}

export function emptyProduct(): ProductFormValues {
  return {
    name: "",
    slug: "",
    summary: "",
    description: "",
    materials: "",
    dimensions: "",
    careInstructions: "",
    status: "draft",
    isFeatured: false,
    seoTitle: "",
    seoDescription: "",
    categoryIds: [],
    images: [],
    variants: [emptyVariant()],
  };
}
