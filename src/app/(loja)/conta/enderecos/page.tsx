import Link from "next/link";
import { notFound } from "next/navigation";
import { customerAddresses } from "@/lib/customer/repository";
import { AccountNav } from "@/components/customer/account-nav";
import { AddressForm, CustomerRowAction } from "@/components/customer/account-forms";
export const metadata = { title: "Meus endereços" };
export default async function Page({ searchParams }: PageProps<"/conta/enderecos">) {
  const [addresses, params] = await Promise.all([customerAddresses(), searchParams]);
  const editing = typeof params.editar === "string" ? addresses.find((item) => item.id === params.editar) : undefined;
  if (params.editar && !editing) notFound();
  return <><AccountNav /><h1 className="text-4xl">Meus endereços</h1>{params.salvo && <p role="status" className="mt-4 text-salvia-escuro">Endereço salvo.</p>}
    <div className="mt-8 grid items-start gap-6 lg:grid-cols-2"><div className="space-y-5">{!addresses.length && <p className="rounded-xl bg-linho p-5">Você ainda não cadastrou um endereço.</p>}{addresses.map((item) => <section key={item.id} className="rounded-2xl border border-dourado/25 bg-papel p-6"><h2 className="text-2xl">{item.recipient}</h2><p className="mt-3 text-sm leading-relaxed text-tinta-suave">{item.street}, {item.number}{item.complement && ` — ${item.complement}`}<br />{item.neighborhood}<br />{item.city} — {item.state}<br />CEP {item.cep}</p><Link href={`/conta/enderecos?editar=${item.id}`} className="mt-4 inline-block text-sm text-rosa-profundo underline">Editar endereço</Link><CustomerRowAction id={item.id} mode="address" /></section>)}</div><div>{editing && <Link href="/conta/enderecos" className="mb-4 inline-block text-sm underline">Cancelar edição</Link>}<AddressForm key={editing?.id ?? "new"} initial={editing} /></div></div>
  </>;
}

// Esta página depende do acesso e/ou dos parâmetros da requisição.
export const instant = false;
