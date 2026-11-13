"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireCustomer } from "@/lib/customer/session";
import { customerAddresses, deleteCustomerAddress, saveCustomerAddress, saveCustomerProfile } from "@/lib/customer/repository";
import { CustomerInputError } from "@/lib/customer/schema";
import { cancelCustomerOrder, createCustomerOrder } from "@/lib/orders/customer-repository";
import { OrderInputError } from "@/lib/orders/input";
import { CATALOG_TAG } from "@/lib/catalog/tags";
import { clientIp, hitRateLimit } from "@/lib/rate-limit";

export type CustomerFormState = { error?: string; success?: string };
function message(error: unknown) {
  if (error instanceof CustomerInputError || error instanceof OrderInputError) return error.message;
  if (error instanceof z.ZodError) return error.issues[0].message;
  return "Não foi possível salvar agora. Tente novamente em instantes.";
}

export async function saveProfileAction(_previous: CustomerFormState, form: FormData): Promise<CustomerFormState> {
  await requireCustomer();
  try { await saveCustomerProfile({ name: String(form.get("name") ?? ""), phone: String(form.get("phone") ?? "") }); }
  catch (error) { return { error: message(error) }; }
  revalidatePath("/conta");
  return { success: "Seus dados foram atualizados." };
}

export async function saveAddressAction(_previous: CustomerFormState, form: FormData): Promise<CustomerFormState> {
  await requireCustomer();
  const text = (key: string) => String(form.get(key) ?? "");
  try { await saveCustomerAddress({ id: form.get("id") || undefined, recipient: text("recipient"), cep: text("cep"), street: text("street"), number: text("number"), complement: text("complement"), neighborhood: text("neighborhood"), city: text("city"), state: text("state") }); }
  catch (error) { return { error: message(error) }; }
  revalidatePath("/conta/enderecos");
  redirect("/conta/enderecos?salvo=1");
}

export async function deleteAddressAction(_previous: CustomerFormState, form: FormData): Promise<CustomerFormState> {
  await requireCustomer();
  try { await deleteCustomerAddress(String(form.get("id") ?? "")); }
  catch (error) { return { error: message(error) }; }
  revalidatePath("/conta/enderecos");
  return { success: "Endereço removido." };
}

export async function checkoutAccountData() {
  const customer = await requireCustomer();
  const addresses = await customerAddresses();
  return { name: customer.name, addresses: addresses.map(({ id, recipient, cep, street, number, complement, neighborhood, city, state }) => ({ id, recipient, cep, street, number, complement, neighborhood, city, state })) };
}

export async function createOrderAction(input: unknown): Promise<{ id?: string; error?: string }> {
  const customer = await requireCustomer();
  const userLimit = await hitRateLimit(`order:create:user:${customer.id}`, 10, 3600);
  const ipLimit = await hitRateLimit(`order:create:ip:${await clientIp()}`, 20, 3600);
  if (!userLimit.allowed || !ipLimit.allowed) return { error: "Muitas tentativas. Consulte seus pedidos e tente novamente mais tarde." };
  try {
    const created = await createCustomerOrder(input);
    updateTag(CATALOG_TAG);
    revalidatePath("/conta/pedidos");
    return { id: created.id };
  } catch (error) { return { error: message(error) }; }
}

export async function cancelOrderAction(_previous: CustomerFormState, form: FormData): Promise<CustomerFormState> {
  await requireCustomer();
  const id = String(form.get("id") ?? "");
  try { await cancelCustomerOrder(id); }
  catch (error) { return { error: message(error) }; }
  updateTag(CATALOG_TAG);
  revalidatePath("/conta/pedidos");
  return { success: "Reserva cancelada. As unidades foram liberadas." };
}
