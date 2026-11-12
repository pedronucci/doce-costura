import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/ui";
import { getSettingsForAdmin } from "@/lib/config/settings-repository";
import { SettingsForm } from "./settings-form";

export const metadata: Metadata = { title: "Configurações da loja" };

export default async function SettingsPage() {
  const settings = await getSettingsForAdmin();
  return <>
    <PageHeader title="Configurações da loja" description="Mantenha os dados e os canais de atendimento da Doce Costura atualizados." />
    <SettingsForm settings={settings} />
  </>;
}
