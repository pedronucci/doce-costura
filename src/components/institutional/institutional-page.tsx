import Image from "next/image";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/button-link";
import { FlourishHeart } from "@/components/ui/ornaments";
import { Pending } from "@/components/ui/pending";
import { CookiePreferencesButton } from "@/components/layout/cookie-consent";
import type { StoreSettings } from "@/lib/config/store";
import { faqItems, institutionalPages, policyContent, type InstitutionalSlug } from "@/lib/config/institutional";
import { institutionalNav, policyNav } from "@/lib/catalog/navigation";

function ContactChannels({ settings }: { settings: StoreSettings }) {
  const { company, whatsapp, social } = settings;
  const available = company.email || company.phone || whatsapp.number || social.instagram;
  const linkClass = "break-words text-rosa-profundo underline underline-offset-4";
  return (
    <section aria-labelledby="contact-channels" className="rounded-2xl border border-dourado/25 bg-papel p-6 sm:p-8">
      <h2 id="contact-channels" className="text-3xl">Vamos conversar?</h2>
      <p className="mt-3 leading-relaxed text-tinta-suave">Tire dúvidas sobre as peças e encontre o canal mais confortável para falar com a loja.</p>
      {!available && <p className="mt-5 rounded-xl bg-linho p-4 text-sm leading-relaxed">Os canais de atendimento ainda não foram informados. Volte a esta página para consultar os contatos assim que estiverem disponíveis.</p>}
      <dl className="mt-6 grid gap-5 sm:grid-cols-2">
        {company.email && <div><dt className="text-sm text-tinta-suave">E-mail</dt><dd className="mt-1"><a href={`mailto:${company.email}`} className={linkClass}>{company.email}</a></dd></div>}
        {company.phone && <div><dt className="text-sm text-tinta-suave">Telefone</dt><dd className="mt-1"><a href={`tel:${company.phone}`} className={linkClass}>{company.phone}</a></dd></div>}
        {whatsapp.number && <div><dt className="text-sm text-tinta-suave">WhatsApp</dt><dd className="mt-1"><a href={`https://wa.me/${whatsapp.number}?text=${encodeURIComponent(whatsapp.message)}`} target="_blank" rel="noopener noreferrer" className={linkClass}>Conversar pelo WhatsApp</a></dd></div>}
        {social.instagram && <div><dt className="text-sm text-tinta-suave">Instagram</dt><dd className="mt-1"><a href={social.instagram} target="_blank" rel="noopener noreferrer" className={linkClass}>Conhecer nosso perfil</a></dd></div>}
        <div className="sm:col-span-2"><dt className="text-sm text-tinta-suave">Horários de atendimento</dt><dd className="mt-1">{company.serviceHours ?? "Horários ainda não informados."}</dd></div>
      </dl>
    </section>
  );
}

function CompanyIdentity({ settings }: { settings: StoreSettings }) {
  return <section className="rounded-2xl bg-linho/60 p-6 sm:p-8" aria-labelledby="company-identity">
    <h2 id="company-identity" className="text-3xl">Identificação da loja</h2>
    <dl className="mt-5 space-y-4 text-sm">
      <div><dt className="text-tinta-suave">Razão social</dt><dd className="mt-1"><Pending value={settings.company.legalName} /></dd></div>
      <div><dt className="text-tinta-suave">CNPJ</dt><dd className="mt-1"><Pending value={settings.company.cnpj} /></dd></div>
      <div><dt className="text-tinta-suave">Endereço público</dt><dd className="mt-1 whitespace-pre-line"><Pending value={settings.company.address} /></dd></div>
    </dl>
  </section>;
}

function About() {
  return <>
    <div className="grid items-center gap-10 lg:grid-cols-2">
      <div className="relative aspect-[4/5] overflow-hidden rounded-t-[48%] rounded-b-2xl bg-linho">
        <Image src="/images/produtos/cha-azul.jpg" alt="Pano de prato com renda branca, estampa de bules e babado xadrez azul" fill sizes="(max-width: 1023px) 90vw, 500px" className="object-cover" />
      </div>
      <div className="space-y-6 leading-relaxed text-tinta-suave">
        <h2 className="text-4xl text-cacau">A cozinha é o coração da casa</h2>
        <p>Na Doce Costura, enxovais e detalhes de cozinha ganham espaço entre as pequenas escolhas que deixam a casa com a nossa cara.</p>
        <p>Rendas delicadas, babados e estampas de bules, flores e legumes fazem parte da nossa coleção de panos de prato. São combinações para trazer cor ao cotidiano e inspirar um presente cheio de carinho.</p>
        <p>Explore as estampas, olhe os acabamentos de perto e encontre a peça que combina com a sua cozinha. Os materiais, as medidas e os cuidados disponíveis podem ser consultados na página de cada modelo.</p>
        <ButtonLink href="/colecao">Conhecer a coleção</ButtonLink>
      </div>
    </div>
    <section aria-labelledby="about-details" className="mt-14">
      <h2 id="about-details" className="text-center text-3xl">Feito de detalhes que encantam</h2>
      <div className="mt-8 grid gap-5 sm:grid-cols-3">{[
        ["Estampas", "Bules, flores e elementos da cozinha em combinações de cores para o dia a dia."],
        ["Acabamentos", "Rendas, faixas e babados que dão personalidade aos modelos da coleção."],
        ["Suas escolhas", "Salve favoritos no navegador e volte para olhar com calma cada detalhe."],
      ].map(([title, text]) => <div key={title} className="rounded-2xl border border-dourado/25 bg-papel p-6"><h3 className="text-2xl">{title}</h3><p className="mt-3 text-sm leading-relaxed text-tinta-suave">{text}</p></div>)}</div>
    </section>
  </>;
}

const references = {
  cdc: { href: "https://www2.camara.leg.br/legin/fed/lei/1990/lei-8078-11-setembro-1990-365086-normaatualizada-pl.html", label: "Código de Defesa do Consumidor" },
  ecommerce: { href: "https://www2.camara.leg.br/legin/fed/decret/2013/decreto-7962-15-marco-2013-775557-publicacaooriginal-139266-pe.html", label: "Decreto sobre comércio eletrônico" },
  privacy: { href: "https://www.gov.br/anpd/pt-br/assuntos/titular-de-dados/direito-dos-titulares", label: "ANPD — direitos dos titulares" },
};

export function InstitutionalPage({ slug, settings }: { slug: InstitutionalSlug; settings: StoreSettings }) {
  const page = institutionalPages[slug];
  const policy = slug !== "sobre" && slug !== "contato" && slug !== "perguntas-frequentes" ? policyContent[slug] : null;
  const sources = slug === "politica-de-privacidade" ? [references.privacy] : [references.cdc, references.ecommerce];
  return (
    <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
      <header className="mx-auto mb-12 max-w-2xl text-center">
        <p className="text-xs tracking-[0.2em] text-dourado-texto uppercase">{policy ? "Informação e cuidado" : "Um pouco mais de nós"}</p>
        <h1 className="mt-4 text-4xl sm:text-5xl">{page.title}</h1>
        <FlourishHeart className="mx-auto mt-5 text-dourado" />
        <p className="mt-5 leading-relaxed text-tinta-suave">{page.description}</p>
      </header>
      {slug === "sobre" && <About />}
      {slug === "contato" && <div className="grid items-start gap-6 lg:grid-cols-[1.3fr_1fr]"><ContactChannels settings={settings} /><CompanyIdentity settings={settings} /></div>}
      {slug === "perguntas-frequentes" && <div className="mx-auto max-w-3xl space-y-4">{faqItems.map((item) => <details key={item.question} className="rounded-2xl border border-dourado/25 bg-papel p-5 sm:p-6"><summary className="cursor-pointer text-lg font-medium text-cacau marker:text-rosa-profundo">{item.question}</summary><p className="mt-4 leading-relaxed text-tinta-suave">{item.answer}</p>{item.href && <Link href={item.href} className="mt-4 inline-block text-sm text-rosa-profundo underline underline-offset-4">{item.linkLabel}</Link>}</details>)}</div>}
      {policy && <article className="mx-auto max-w-3xl">
        <p className="mb-8 rounded-xl bg-linho p-5 text-sm leading-relaxed">A loja online está em preparação. As informações desta página refletem o funcionamento atual e serão atualizadas para acompanhar a abertura das vendas.</p>
        <div className="space-y-8">{policy.map((section) => <section key={section.title}><h2 className="text-3xl">{section.title}</h2>{section.paragraphs.map((paragraph) => <p key={paragraph} className="mt-4 leading-relaxed text-tinta-suave">{paragraph}</p>)}</section>)}</div>
        {slug === "politica-de-privacidade" && <div className="mt-6"><CookiePreferencesButton /></div>}
        <p className="mt-8 text-sm text-tinta-suave">Referências oficiais: {sources.map((source, index) => <span key={source.href}>{index > 0 && " · "}<a href={source.href} target="_blank" rel="noopener noreferrer" className="text-rosa-profundo underline underline-offset-4">{source.label}</a></span>)}</p>
        <div className="mt-10 space-y-6"><ContactChannels settings={settings} /><CompanyIdentity settings={settings} /></div>
      </article>}
      <nav aria-label="Outras informações da loja" className="mt-14 border-t border-dourado/25 pt-8">
        <h2 className="text-center text-2xl">Continue por aqui</h2>
        <ul className="mt-5 flex flex-wrap justify-center gap-x-6 gap-y-4 text-sm">{[...institutionalNav, ...policyNav].filter((item) => item.href !== `/${slug}`).map((item) => <li key={item.href}><Link href={item.href} className="text-rosa-profundo underline underline-offset-4">{item.label}</Link></li>)}</ul>
      </nav>
    </div>
  );
}
