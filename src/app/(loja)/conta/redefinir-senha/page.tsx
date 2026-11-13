import { CustomerAuthForm } from "@/components/customer/auth-form";
export const metadata = { title: "Redefinir minha senha" };
export default async function Page({ searchParams }: PageProps<"/conta/redefinir-senha">) {
  const params = await searchParams;
  return <CustomerAuthForm mode="reset" token={typeof params.token === "string" ? params.token : ""} />;
}

// Esta página depende do acesso e/ou dos parâmetros da requisição.
export const instant = false;
