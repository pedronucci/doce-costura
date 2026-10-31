import Image from "next/image";
import Link from "next/link";
import { storeSettings } from "@/lib/config/store";
import { categoryNav, institutionalNav, policyNav } from "@/lib/catalog/navigation";
import { Pending } from "@/components/ui/pending";

function FooterColumn({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <h3 className="mb-4 font-sans text-[0.7rem] font-medium tracking-[0.24em] text-dourado-texto uppercase">{title}</h3>
      <ul className="space-y-2.5">
        {links.map((l) => (
          <li key={l.href}>
            <Link href={l.href} className="text-[0.92rem] text-tinta transition-colors hover:text-rosa-profundo">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer() {
  const { company } = storeSettings;
  return (
    <footer className="mt-auto border-t border-dourado/20 bg-[#faf3ea]">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 sm:px-8 lg:grid-cols-[1.1fr_2fr] lg:gap-16">
        <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
          <Image
            src="/images/marca/logo-doce-costura.webp"
            alt="Logomarca Doce Costura — enxovais e detalhes para sua cozinha"
            width={720}
            height={695}
            sizes="180px"
            className="h-auto w-44"
          />
          <p className="mt-4 max-w-xs text-[0.92rem] leading-relaxed text-tinta-suave">
            Panos de prato decorados com renda, babados e estampas delicadas.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
          <FooterColumn title="Coleção" links={[{ href: "/colecao", label: "Toda a coleção" }, ...categoryNav]} />
          <FooterColumn title="Atendimento" links={[...institutionalNav, { href: "/conta", label: "Minha conta" }]} />
          <FooterColumn title="Políticas" links={policyNav} />
        </div>
      </div>

      {/* Identificação do fornecedor — exigida pelo Decreto 7.962/2013 (comércio eletrônico) */}
      <div className="border-t border-dourado/15">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-7 text-[0.78rem] leading-relaxed text-tinta-suave sm:px-8 lg:flex-row lg:items-center lg:justify-between">
          <address className="flex flex-wrap gap-x-5 gap-y-1 not-italic">
            <span>
              Razão social: <Pending value={company.legalName} />
            </span>
            <span>
              CNPJ: <Pending value={company.cnpj} />
            </span>
            <span>
              Endereço: <Pending value={company.address} />
            </span>
            <span>
              E-mail: <Pending value={company.email} />
            </span>
          </address>
          <p>© {storeSettings.name}. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
