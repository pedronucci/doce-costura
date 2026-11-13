import { CustomerAuthForm } from "@/components/customer/auth-form";
export const metadata = { title: "Criar minha conta" };
export default async function Page({ searchParams }: PageProps<"/conta/criar">) {
  const params = await searchParams;
  return <CustomerAuthForm mode="signup" next={params.next === "checkout" ? "/checkout" : undefined} />;
}

// Esta página depende do acesso e/ou dos parâmetros da requisição.
export const instant = false;
