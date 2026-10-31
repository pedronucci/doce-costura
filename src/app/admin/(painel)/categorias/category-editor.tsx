"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { ArrowDown, ArrowUp, Pencil, Trash2 } from "lucide-react";
import { Badge, buttonClass, Field, inputClass, Notice } from "@/components/admin/ui";
import { SubmitButton } from "@/components/admin/submit-button";
import { deleteCategoryAction, moveCategoryAction, saveCategoryAction, type CategoryFormState } from "./actions";

type Category = {
  id: string;
  name: string;
  shortName: string | null;
  slug: string;
  description: string | null;
  isActive: boolean;
  productCount: number;
};

function CategoryForm({ category, onDone }: { category?: Category; onDone?: () => void }) {
  const [state, action] = useActionState<CategoryFormState, FormData>(saveCategoryAction, {});
  useEffect(() => {
    if (state.ok) onDone?.();
  }, [state.at, state.ok, onDone]);

  return (
    // após criar, a nova chave limpa o formulário
    <form key={category ? category.id : (state.at ?? 0)} action={action} className="grid gap-3 sm:grid-cols-2" noValidate>
      {category && <input type="hidden" name="id" value={category.id} />}
      {state.error && (
        <div className="sm:col-span-2">
          <Notice tone="error">{state.error}</Notice>
        </div>
      )}
      <Field label="Nome" htmlFor={`name-${category?.id ?? "nova"}`} required>
        <input id={`name-${category?.id ?? "nova"}`} name="name" defaultValue={category?.name} className={inputClass} placeholder="Ex.: Coleção Natal" />
      </Field>
      <Field label="Nome curto no menu" htmlFor={`short-${category?.id ?? "nova"}`} hint="Opcional">
        <input id={`short-${category?.id ?? "nova"}`} name="shortName" defaultValue={category?.shortName ?? ""} className={inputClass} />
      </Field>
      <Field label="Endereço" htmlFor={`slug-${category?.id ?? "nova"}`} hint="Gerado a partir do nome se ficar em branco">
        <input id={`slug-${category?.id ?? "nova"}`} name="slug" defaultValue={category?.slug} className={inputClass} />
      </Field>
      <Field label="Descrição" htmlFor={`desc-${category?.id ?? "nova"}`} hint="Opcional">
        <input id={`desc-${category?.id ?? "nova"}`} name="description" defaultValue={category?.description ?? ""} className={inputClass} />
      </Field>
      <label className="flex items-center gap-2 text-[0.86rem]">
        <input type="checkbox" name="isActive" defaultChecked={category?.isActive ?? true} className="accent-cacau" />
        Visível na loja
      </label>
      <div className="flex justify-end gap-2 sm:col-span-2">
        {onDone && category && (
          <button type="button" onClick={onDone} className={buttonClass("ghost")}>
            Cancelar
          </button>
        )}
        <SubmitButton>{category ? "Salvar" : "Criar categoria"}</SubmitButton>
      </div>
    </form>
  );
}

export function NewCategoryForm() {
  return <CategoryForm />;
}

export function CategoryList({ categories }: { categories: Category[] }) {
  const [editing, setEditing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  return (
    <div>
      {error && (
        <div className="mb-3">
          <Notice tone="error">{error}</Notice>
        </div>
      )}
      <ul className="divide-y divide-[#f0e6dc] overflow-hidden rounded-2xl border border-[#eadfd3] bg-white">
        {categories.map((c, i) => (
          <li key={c.id} className="px-4 py-3 sm:px-5">
            {editing === c.id ? (
              <CategoryForm category={c} onDone={() => setEditing(null)} />
            ) : (
              <div className="flex flex-wrap items-center gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-cacau">
                    {c.name} {!c.isActive && <Badge>Oculta</Badge>}
                  </p>
                  <p className="text-[0.78rem] text-tinta-suave">
                    /categoria/{c.slug} · {c.productCount} produto(s)
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button type="button" disabled={pending || i === 0} onClick={() => start(() => moveCategoryAction(c.id, "up"))} aria-label={`Subir ${c.name}`} className={buttonClass("ghost", "min-h-9 px-2")}>
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  <button type="button" disabled={pending || i === categories.length - 1} onClick={() => start(() => moveCategoryAction(c.id, "down"))} aria-label={`Descer ${c.name}`} className={buttonClass("ghost", "min-h-9 px-2")}>
                    <ArrowDown className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={() => setEditing(c.id)} aria-label={`Editar ${c.name}`} className={buttonClass("ghost", "min-h-9 px-2")}>
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    disabled={pending}
                    aria-label={`Excluir ${c.name}`}
                    className={buttonClass("ghost", "min-h-9 px-2 text-rosa-escuro")}
                    onClick={() =>
                      start(async () => {
                        setError(null);
                        const res = await deleteCategoryAction(c.id);
                        if (res.error) setError(res.error);
                      })
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
