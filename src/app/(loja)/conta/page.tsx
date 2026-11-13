import { requireCustomer } from "@/lib/customer/session";
import { AccountNav } from "@/components/customer/account-nav";
import { ProfileForm } from "@/components/customer/account-forms";
export const metadata = { title: "Minha conta" };
export default async function Page() {
  const customer = await requireCustomer();
  return <><AccountNav /><h1 className="mb-6 text-4xl">Olá, {customer.name}</h1><ProfileForm profile={customer} /></>;
}

// Esta página depende do acesso e/ou dos parâmetros da requisição.
export const instant = false;
