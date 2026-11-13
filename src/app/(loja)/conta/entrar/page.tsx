import { CustomerAuthForm } from "@/components/customer/auth-form";
export const metadata = { title: "Entrar na minha conta" };
export default async function Page({ searchParams }: PageProps<"/conta/entrar">) {
  const params = await searchParams;
  return <CustomerAuthForm mode="signin" next={params.next === "checkout" ? "/checkout" : undefined} resetNotice={params.senha === "redefinida"} />;
}

// Esta página depende do acesso e/ou dos parâmetros da requisição.
export const instant = false;
