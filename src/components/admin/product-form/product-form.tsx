"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState, useTransition } from "react";
import { ArrowLeft, ArrowRight, Check, Copy, ImagePlus, Loader2, Plus, Star, Trash2, X } from "lucide-react";
import {
  deleteProductAction,
  duplicateProductAction,
  saveProductAction,
  uploadImageAction,
} from "@/app/admin/(painel)/produtos/actions";
import { PRODUCT_STATUSES, slugify, STATUS_HELP, STATUS_LABELS, type ProductStatus } from "@/lib/catalog/admin-schema";
import { buttonClass, Card, Field, inputClass, Notice } from "@/components/admin/ui";
import { cn } from "@/lib/format";
import { prepareImage } from "./image-prep";
import { emptyVariant, newKey, type CategoryOption, type FormVariant, type ProductFormValues } from "./types";

type Props = { initial: ProductFormValues; categories: CategoryOption[]; notice?: string };

export function ProductForm({ initial, categories, notice }: Props) {
  const router = useRouter();
  const [values, setValues] = useState<ProductFormValues>(initial);
  const [slugTouched, setSlugTouched] = useState(Boolean(initial.id));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<{ message: string; issues?: string[] } | null>(null);
  const [saved, setSaved] = useState<string | null>(notice ?? null);
  const [uploading, setUploading] = useState<{ done: number; total: number; errors: string[] } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [pending, startTransition] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);
  const isNew = !initial.id;

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const update = (patch: Partial<ProductFormValues>) => {
    setValues((v) => ({ ...v, ...patch }));
    setDirty(true);
    setSaved(null);
  };
  const updateVariant = (key: string, patch: Partial<FormVariant>) =>
    update({ variants: values.variants.map((v) => (v.key === key ? { ...v, ...patch } : v)) });

  const err = (path: string) => errors[path];

  // ------------------------------------------------------------------ fotos
  async function handleFiles(list: FileList | null) {
    if (!list?.length) return;
    const files = Array.from(list).slice(0, 12 - values.images.length);
    setUploading({ done: 0, total: files.length, errors: [] });
    const failures: string[] = [];
    for (const file of files) {
      try {
        const prepared = await prepareImage(file);
        const fd = new FormData();
        fd.append("file", prepared);
        const res = await uploadImageAction(fd);
        if (res.ok) {
          setValues((v) => ({ ...v, images: [...v.images, { key: newKey(), ...res.image, alt: v.name || "" }] }));
          setDirty(true);
        } else failures.push(`${file.name}: ${res.error}`);
      } catch (e) {
        failures.push(e instanceof Error ? e.message : `${file.name}: falha no envio.`);
      }
      setUploading((u) => (u ? { ...u, done: u.done + 1 } : u));
    }
    setUploading(failures.length ? { done: files.length, total: files.length, errors: failures } : null);
    if (fileRef.current) fileRef.current.value = "";
  }

  const moveImage = (index: number, dir: -1 | 1) => {
    const imgs = [...values.images];
    const j = index + dir;
    if (j < 0 || j >= imgs.length) return;
    [imgs[index], imgs[j]] = [imgs[j], imgs[index]];
    update({ images: imgs });
  };

  // ------------------------------------------------------------------ salvar
  function payload() {
    return JSON.stringify({
      ...values,
      images: values.images.map((i) => ({ id: i.id, url: i.url, storageKey: i.storageKey, alt: i.alt, width: i.width, height: i.height })),
      variants: values.variants.map((v) => {
        const { key, ...rest } = v;
        void key;
        return rest;
      }),
    });
  }

  function onSave(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setErrors({});
    startTransition(async () => {
      const res = await saveProductAction(payload());
      if (!res.ok) {
        setErrors(res.fieldErrors ?? {});
        setFormError({ message: res.error, issues: res.issues });
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      setDirty(false);
      if (isNew) {
        // A página "novo" pode ficar preservada em segundo plano; volta ao formulário vazio.
        setValues(initial);
        setSlugTouched(false);
        router.replace(`/admin/produtos/${res.id}?salvo=1`);
      } else {
        // recarrega os dados salvos (com IDs novos) e remonta o formulário
        router.replace(`/admin/produtos/${res.id}?atualizado=${Date.now()}`);
      }
    });
  }

  // checklist exibido quando o status é "À venda"
  const activeVariants = values.variants.filter((v) => v.isActive);
  const checklist = [
    { ok: values.images.length > 0, label: "Ao menos uma foto" },
    { ok: values.categoryIds.length > 0, label: "Ao menos uma categoria" },
    { ok: activeVariants.length > 0 && activeVariants.every((v) => v.price.trim()), label: "Preço em todas as variações ativas" },
    { ok: activeVariants.length > 0 && activeVariants.every((v) => v.weightGrams.trim()), label: "Peso da embalagem" },
    {
      ok: activeVariants.length > 0 && activeVariants.every((v) => v.heightCm.trim() && v.widthCm.trim() && v.lengthCm.trim()),
      label: "Medidas da embalagem",
    },
  ];

  return (
    <form onSubmit={onSave} noValidate className="pb-24">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link href="/admin/produtos" className="mb-2 inline-block text-[0.8rem] text-tinta-suave hover:text-rosa-profundo">
            ← Produtos
          </Link>
          <h1 className="font-sans text-[1.5rem] font-semibold tracking-tight text-cacau">
            {isNew ? "Novo produto" : values.name || "Editar produto"}
          </h1>
        </div>
        {!isNew && (
          <div className="flex flex-wrap gap-2">
            {values.status !== "draft" && (
              <Link href={`/produto/${initial.slug}`} target="_blank" className={buttonClass("ghost")}>
                Ver na loja
              </Link>
            )}
            <button type="button" className={buttonClass("secondary")} disabled={pending} onClick={() => startTransition(() => duplicateProductAction(initial.id!))}>
              <Copy className="h-4 w-4" /> Duplicar
            </button>
          </div>
        )}
      </div>

      <div className="space-y-3" aria-live="polite">
        {saved && <Notice tone="success">{saved}</Notice>}
        {formError && (
          <Notice tone="error">
            <p className="font-medium">{formError.message}</p>
            {formError.issues && (
              <ul className="mt-1 list-disc pl-5">
                {formError.issues.map((i) => (
                  <li key={i}>{i}</li>
                ))}
              </ul>
            )}
          </Notice>
        )}
      </div>

      <div className="mt-4 grid gap-5 xl:grid-cols-[1fr_20rem]">
        <div className="min-w-0 space-y-5">
          {/* FOTOS */}
          <Card title="Fotos" description="A primeira foto é a capa. Até 12 fotos em JPG, PNG ou WebP (mínimo de 400 px). Fotos grandes são reduzidas automaticamente.">
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {values.images.map((img, i) => (
                <li key={img.key} className="overflow-hidden rounded-xl border border-[#eadfd3] bg-[#fdf9f5]">
                  <div className="relative aspect-square bg-linho">
                    <Image src={img.url} alt={img.alt || "Foto do produto"} fill sizes="200px" className="object-cover" />
                    {i === 0 && (
                      <span className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-full bg-cacau/85 px-2 py-0.5 text-[0.68rem] text-papel">
                        <Star className="h-3 w-3" /> Capa
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => update({ images: values.images.filter((x) => x.key !== img.key) })}
                      aria-label={`Remover foto ${i + 1}`}
                      className="absolute top-2 right-2 grid h-8 w-8 place-items-center rounded-full bg-white/90 text-rosa-escuro shadow-sm hover:bg-white"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="space-y-2 p-2">
                    <label className="sr-only" htmlFor={`alt-${img.key}`}>
                      Descrição da foto {i + 1}
                    </label>
                    <input
                      id={`alt-${img.key}`}
                      value={img.alt}
                      onChange={(e) => update({ images: values.images.map((x) => (x.key === img.key ? { ...x, alt: e.target.value } : x)) })}
                      placeholder="Descreva a foto"
                      aria-invalid={Boolean(err(`images.${i}.alt`))}
                      className={cn(inputClass, "px-2.5 py-1.5 text-[0.8rem]")}
                    />
                    {err(`images.${i}.alt`) && <p className="text-[0.72rem] text-rosa-escuro">{err(`images.${i}.alt`)}</p>}
                    <div className="flex justify-between">
                      <button type="button" onClick={() => moveImage(i, -1)} disabled={i === 0} aria-label="Mover para a esquerda" className={buttonClass("ghost", "min-h-8 px-2")}>
                        <ArrowLeft className="h-4 w-4" />
                      </button>
                      <button type="button" onClick={() => moveImage(i, 1)} disabled={i === values.images.length - 1} aria-label="Mover para a direita" className={buttonClass("ghost", "min-h-8 px-2")}>
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
              {values.images.length < 12 && (
                <li>
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    disabled={Boolean(uploading && uploading.done < uploading.total)}
                    className="flex aspect-square w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#dccbb9] bg-white text-[0.82rem] text-tinta-suave transition-colors hover:border-rosa-profundo hover:text-rosa-profundo"
                  >
                    {uploading && uploading.done < uploading.total ? (
                      <>
                        <Loader2 className="h-6 w-6 animate-spin" />
                        Enviando {uploading.done + 1} de {uploading.total}…
                      </>
                    ) : (
                      <>
                        <ImagePlus className="h-6 w-6" strokeWidth={1.5} />
                        Adicionar fotos
                      </>
                    )}
                  </button>
                </li>
              )}
            </ul>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif" multiple hidden onChange={(e) => handleFiles(e.target.files)} />
            {uploading?.errors.length ? (
              <div className="mt-3">
                <Notice tone="error">
                  {uploading.errors.map((m) => (
                    <p key={m}>{m}</p>
                  ))}
                </Notice>
              </div>
            ) : null}
          </Card>

          {/* INFORMAÇÕES BÁSICAS */}
          <Card title="Informações básicas">
            <div className="grid gap-4">
              <Field label="Nome do produto" htmlFor="name" required error={err("name")}>
                <input
                  id="name"
                  value={values.name}
                  onChange={(e) => update({ name: e.target.value, ...(!slugTouched && { slug: slugify(e.target.value) }) })}
                  aria-invalid={Boolean(err("name"))}
                  className={inputClass}
                  placeholder="Ex.: Pano de Prato Chá Azul"
                />
              </Field>
              <Field label="Endereço na loja" htmlFor="slug" required error={err("slug")} hint={`/produto/${values.slug || "…"}`}>
                <input
                  id="slug"
                  value={values.slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    update({ slug: slugify(e.target.value) });
                  }}
                  aria-invalid={Boolean(err("slug"))}
                  className={inputClass}
                />
              </Field>
              <Field label="Resumo" htmlFor="summary" error={err("summary")} hint={`Aparece nos cards da loja. ${values.summary.length}/200`}>
                <input id="summary" value={values.summary} maxLength={200} onChange={(e) => update({ summary: e.target.value })} className={inputClass} />
              </Field>
              <Field label="Descrição" htmlFor="description" error={err("description")}>
                <textarea id="description" rows={6} value={values.description} onChange={(e) => update({ description: e.target.value })} className={inputClass} />
              </Field>
              <fieldset>
                <legend className="mb-2 text-[0.82rem] font-medium text-tinta">Categorias</legend>
                <div className="flex flex-wrap gap-2">
                  {categories.map((c) => {
                    const checked = values.categoryIds.includes(c.id);
                    return (
                      <label
                        key={c.id}
                        className={cn(
                          "inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-[0.82rem] transition-colors has-focus-visible:ring-2 has-focus-visible:ring-rosa-profundo/30",
                          checked ? "border-cacau bg-cacau text-papel" : "border-[#dccbb9] bg-white text-tinta hover:border-cacau",
                        )}
                      >
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={checked}
                          onChange={() =>
                            update({ categoryIds: checked ? values.categoryIds.filter((x) => x !== c.id) : [...values.categoryIds, c.id] })
                          }
                        />
                        {checked && <Check className="h-3.5 w-3.5" />}
                        {c.name}
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            </div>
          </Card>

          {/* FICHA TÉCNICA */}
          <Card title="Ficha técnica" description="Deixe em branco o que ainda não souber — na loja aparecerá como “pendente de cadastro”.">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Materiais e composição" htmlFor="materials" error={err("materials")}>
                <textarea id="materials" rows={3} value={values.materials} onChange={(e) => update({ materials: e.target.value })} className={inputClass} placeholder="Ex.: tecido 100% algodão, renda de…" />
              </Field>
              <Field label="Instruções de lavagem" htmlFor="care" error={err("careInstructions")}>
                <textarea id="care" rows={3} value={values.careInstructions} onChange={(e) => update({ careInstructions: e.target.value })} className={inputClass} />
              </Field>
              <Field label="Dimensões do produto" htmlFor="dimensions" error={err("dimensions")} hint="Ex.: 70 × 45 cm" className="md:col-span-2">
                <input id="dimensions" value={values.dimensions} onChange={(e) => update({ dimensions: e.target.value })} className={inputClass} />
              </Field>
            </div>
          </Card>

          {/* VARIAÇÕES */}
          <Card
            title="Variações, preço e estoque"
            description="Cada estampa ou modelo vendido separadamente é uma variação, com preço, estoque e código próprios. Peso e medidas são da embalagem pronta para envio."
          >
            <div className="space-y-4">
              {values.variants.map((v, i) => (
                <VariantEditor
                  key={v.key}
                  index={i}
                  variant={v}
                  images={values.images.map((x) => x.url)}
                  canRemove={values.variants.length > 1}
                  errors={errors}
                  onChange={(patch) => updateVariant(v.key, patch)}
                  onRemove={() => update({ variants: values.variants.filter((x) => x.key !== v.key) })}
                />
              ))}
              <button type="button" onClick={() => update({ variants: [...values.variants, emptyVariant()] })} className={buttonClass("secondary")}>
                <Plus className="h-4 w-4" /> Adicionar variação
              </button>
            </div>
          </Card>

          {/* SEO */}
          <Card title="Busca no Google" description="Opcional. Sem preencher, usamos o nome e o resumo.">
            <div className="grid gap-4">
              <Field label="Título" htmlFor="seoTitle" error={err("seoTitle")} hint={`${values.seoTitle.length}/70`}>
                <input id="seoTitle" maxLength={70} value={values.seoTitle} onChange={(e) => update({ seoTitle: e.target.value })} className={inputClass} />
              </Field>
              <Field label="Descrição" htmlFor="seoDescription" error={err("seoDescription")} hint={`${values.seoDescription.length}/170`}>
                <textarea id="seoDescription" rows={2} maxLength={170} value={values.seoDescription} onChange={(e) => update({ seoDescription: e.target.value })} className={inputClass} />
              </Field>
            </div>
          </Card>

          {!isNew && (
            <Card title="Excluir produto">
              {confirmDelete ? (
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-[0.86rem] text-tinta">Excluir definitivamente? Produtos com pedidos não podem ser excluídos — arquive-os.</p>
                  <button
                    type="button"
                    className={buttonClass("danger")}
                    disabled={pending}
                    onClick={() =>
                      startTransition(async () => {
                        const res = await deleteProductAction(initial.id!);
                        if (res?.error) setFormError({ message: res.error });
                      })
                    }
                  >
                    Sim, excluir
                  </button>
                  <button type="button" className={buttonClass("ghost")} onClick={() => setConfirmDelete(false)}>
                    Cancelar
                  </button>
                </div>
              ) : (
                <button type="button" className={buttonClass("danger")} onClick={() => setConfirmDelete(true)}>
                  <Trash2 className="h-4 w-4" /> Excluir
                </button>
              )}
            </Card>
          )}
        </div>

        {/* STATUS */}
        <div className="space-y-5 xl:sticky xl:top-6 xl:self-start">
          <Card title="Status">
            <fieldset className="space-y-2">
              <legend className="sr-only">Status do produto</legend>
              {PRODUCT_STATUSES.map((s) => (
                <label
                  key={s}
                  className={cn(
                    "flex cursor-pointer gap-3 rounded-xl border p-3 transition-colors",
                    values.status === s ? "border-cacau bg-[#fdf9f5]" : "border-[#eadfd3] hover:border-[#d5c2ae]",
                  )}
                >
                  <input type="radio" name="status" value={s} checked={values.status === s} onChange={() => update({ status: s as ProductStatus })} className="mt-1 accent-cacau" />
                  <span>
                    <span className="block text-[0.88rem] font-medium text-cacau">{STATUS_LABELS[s]}</span>
                    <span className="block text-[0.76rem] leading-snug text-tinta-suave">{STATUS_HELP[s]}</span>
                  </span>
                </label>
              ))}
            </fieldset>
            {values.status === "active" && (
              <ul className="mt-4 space-y-1.5 border-t border-[#f0e6dc] pt-4 text-[0.8rem]">
                {checklist.map((c) => (
                  <li key={c.label} className={cn("flex items-center gap-2", c.ok ? "text-salvia-escuro" : "text-rosa-escuro")}>
                    {c.ok ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                    {c.label}
                  </li>
                ))}
              </ul>
            )}
            <label className="mt-4 flex items-center gap-2 border-t border-[#f0e6dc] pt-4 text-[0.86rem]">
              <input type="checkbox" checked={values.isFeatured} onChange={(e) => update({ isFeatured: e.target.checked })} className="h-4 w-4 accent-cacau" />
              Destacar na página inicial
            </label>
          </Card>
        </div>
      </div>

      {/* Barra de salvar fixa */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[#eadfd3] bg-white/95 backdrop-blur lg:left-60">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <p className="text-[0.8rem] text-tinta-suave" aria-live="polite">
            {pending ? "Salvando…" : dirty ? "Alterações não salvas" : saved ? "Tudo salvo" : ""}
          </p>
          <button type="submit" disabled={pending || Boolean(uploading && uploading.done < uploading.total)} className={buttonClass("primary", "min-w-36")}>
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {isNew ? "Criar produto" : "Salvar alterações"}
          </button>
        </div>
      </div>
    </form>
  );
}

function VariantEditor({
  index,
  variant: v,
  images,
  canRemove,
  errors,
  onChange,
  onRemove,
}: {
  index: number;
  variant: FormVariant;
  images: string[];
  canRemove: boolean;
  errors: Record<string, string>;
  onChange: (patch: Partial<FormVariant>) => void;
  onRemove: () => void;
}) {
  const uid = useId();
  const e = (f: string) => errors[`variants.${index}.${f}`];
  const id = (f: string) => `${uid}-${f}`;
  return (
    <fieldset className="rounded-xl border border-[#eadfd3] bg-[#fdfaf6] p-4">
      <legend className="sr-only">Variação {index + 1}</legend>
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-[0.84rem] font-medium text-cacau">Variação {index + 1}</p>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1.5 text-[0.8rem]">
            <input type="checkbox" checked={v.isActive} onChange={(ev) => onChange({ isActive: ev.target.checked })} className="accent-cacau" />
            Ativa
          </label>
          {canRemove && (
            <button type="button" onClick={onRemove} className={buttonClass("ghost", "min-h-8 px-2 text-rosa-escuro")} aria-label={`Remover variação ${index + 1}`}>
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Nome / estampa" htmlFor={id("name")} required error={e("name")} className="sm:col-span-2">
          <input id={id("name")} value={v.name} onChange={(ev) => onChange({ name: ev.target.value })} className={inputClass} placeholder="Ex.: Chá Azul" />
        </Field>
        <Field label="Código (SKU)" htmlFor={id("sku")} required error={e("sku")} className="sm:col-span-2">
          <input id={id("sku")} value={v.sku} onChange={(ev) => onChange({ sku: ev.target.value.toUpperCase() })} className={cn(inputClass, "font-mono")} placeholder="DC-CHA-AZUL" />
        </Field>
        <Field label="Preço (R$)" htmlFor={id("price")} error={e("price")}>
          <input id={id("price")} inputMode="decimal" value={v.price} onChange={(ev) => onChange({ price: ev.target.value })} className={inputClass} placeholder="49,90" />
        </Field>
        <Field label="Preço “de” (R$)" htmlFor={id("compare")} error={e("compareAtPrice")} hint="Só para promoção">
          <input id={id("compare")} inputMode="decimal" value={v.compareAtPrice} onChange={(ev) => onChange({ compareAtPrice: ev.target.value })} className={inputClass} />
        </Field>
        <Field label="Estoque" htmlFor={id("stock")} error={e("stock")}>
          <input id={id("stock")} inputMode="numeric" value={v.stock} onChange={(ev) => onChange({ stock: ev.target.value })} className={inputClass} />
        </Field>
        <Field label="Peso (g)" htmlFor={id("weight")} error={e("weightGrams")} hint="Com embalagem">
          <input id={id("weight")} inputMode="numeric" value={v.weightGrams} onChange={(ev) => onChange({ weightGrams: ev.target.value })} className={inputClass} />
        </Field>
        <Field label="Altura (cm)" htmlFor={id("h")} error={e("heightCm")}>
          <input id={id("h")} inputMode="decimal" value={v.heightCm} onChange={(ev) => onChange({ heightCm: ev.target.value })} className={inputClass} />
        </Field>
        <Field label="Largura (cm)" htmlFor={id("w")} error={e("widthCm")}>
          <input id={id("w")} inputMode="decimal" value={v.widthCm} onChange={(ev) => onChange({ widthCm: ev.target.value })} className={inputClass} />
        </Field>
        <Field label="Comprimento (cm)" htmlFor={id("l")} error={e("lengthCm")}>
          <input id={id("l")} inputMode="decimal" value={v.lengthCm} onChange={(ev) => onChange({ lengthCm: ev.target.value })} className={inputClass} />
        </Field>
        <Field label="Amostra da estampa" htmlFor={id("swatch")} hint="Usada no seletor de estampas da loja">
          <select
            id={id("swatch")}
            value={v.swatchUrl ?? ""}
            onChange={(ev) => onChange({ swatchUrl: ev.target.value || null })}
            className={inputClass}
          >
            <option value="">Nenhuma</option>
            {v.swatchUrl && !images.includes(v.swatchUrl) && <option value={v.swatchUrl}>Amostra atual</option>}
            {images.map((url, i) => (
              <option key={url} value={url}>
                Foto {i + 1}
              </option>
            ))}
          </select>
        </Field>
      </div>
    </fieldset>
  );
}
