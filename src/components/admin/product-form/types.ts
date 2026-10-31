import type { ProductStatus } from "@/lib/catalog/admin-schema";

export type FormImage = {
  key: string;
  id?: string;
  url: string;
  storageKey: string | null;
  alt: string;
  width: number;
  height: number;
};

export type FormVariant = {
  key: string;
  id?: string;
  name: string;
  sku: string;
  price: string;
  compareAtPrice: string;
  stock: string;
  weightGrams: string;
  heightCm: string;
  widthCm: string;
  lengthCm: string;
  swatchUrl: string | null;
  isActive: boolean;
};

export type ProductFormValues = {
  id?: string;
  name: string;
  slug: string;
  summary: string;
  description: string;
  materials: string;
  dimensions: string;
  careInstructions: string;
  status: ProductStatus;
  isFeatured: boolean;
  seoTitle: string;
  seoDescription: string;
  categoryIds: string[];
  images: FormImage[];
  variants: FormVariant[];
};

export type CategoryOption = { id: string; name: string };

export const centsToInput = (c: number | null) => (c === null ? "" : (c / 100).toFixed(2).replace(".", ","));
export const numToInput = (n: number | null) => (n === null ? "" : String(n).replace(".", ","));

let counter = 0;
export const newKey = () => `k${Date.now().toString(36)}${(counter++).toString(36)}`;

export function emptyVariant(): FormVariant {
  return {
    key: newKey(),
    name: "",
    sku: "",
    price: "",
    compareAtPrice: "",
    stock: "0",
    weightGrams: "",
    heightCm: "",
    widthCm: "",
    lengthCm: "",
    swatchUrl: null,
    isActive: true,
  };
}
