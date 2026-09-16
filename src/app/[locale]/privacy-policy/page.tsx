import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { LegalDocumentPage } from "@/components/ardeno/legal-document";
import { SiteFooter } from "@/components/ardeno/site-footer";
import { privacyPolicy } from "@/lib/privacy-policy";
import { siteUrl } from "@/lib/site";

/**
 * Política de privacidad — /[locale]/privacy-policy
 *
 * Página estática y sin JavaScript de cliente: no monta la cabecera latente ni
 * el proveedor de captación, porque ninguno de los dos pinta nada aquí y el
 * primero arrastraría consigo el modal del formulario. Una página legal no
 * tiene que convertir.
 *
 * Solo se publica en inglés, igual que la ficha: el documento aprobado por
 * Ardeno está en inglés y una traducción automática de un texto legal es peor
 * que no tenerlo. `/es/privacy-policy` devuelve 404 hasta que exista versión
 * española aprobada.
 */

const PUBLISHED_LOCALE = "en";

/**
 * Resumen del propio documento, no una frase de marketing: dice exactamente lo
 * que la política anuncia en su apertura.
 */
const DESCRIPTION =
  "How Ardeno Group collects, uses, shares, and protects the personal " +
  "information of people who visit its website, contact it, or express " +
  "interest in its real estate developments.";

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/privacy-policy">): Promise<Metadata> {
  const { locale } = await params;

  if (locale !== PUBLISHED_LOCALE) {
    return { title: { absolute: "Ardeno Group" } };
  }

  /*
   * `absolute` porque el título pedido lleva su propia marca. El layout aplica
   * la plantilla «%s — Ardeno Group», que aquí duplicaría el nombre.
   *
   * El canonical se compone con `siteUrl()`, que resuelve `NEXT_PUBLIC_SITE_URL`
   * una sola vez para todo el sitio: la misma página sirve en el dominio
   * temporal y en projects.ardenogroup.com sin tocar código. Sin `languages`,
   * por lo mismo que la ficha: anunciar una alternativa española que devuelve
   * 404 es anunciar una URL rota.
   */
  return {
    title: { absolute: "Privacy Policy | Ardeno Group" },
    description: DESCRIPTION,
    alternates: {
      canonical: siteUrl("/privacy-policy"),
    },
    openGraph: {
      siteName: "Ardeno Group",
      title: "Privacy Policy | Ardeno Group",
      description: DESCRIPTION,
      locale,
      type: "website",
    },
  };
}

export default async function PrivacyPolicyPage({
  params,
}: PageProps<"/[locale]/privacy-policy">) {
  const { locale } = await params;
  setRequestLocale(locale);

  if (locale !== PUBLISHED_LOCALE) {
    notFound();
  }

  return (
    <div className="ar-page flex flex-1 flex-col">
      <a className="ar-skip" href="#privacy-policy">
        Skip to the policy
      </a>

      <main id="privacy-policy" className="ar-sec">
        <LegalDocumentPage doc={privacyPolicy} />
      </main>

      <SiteFooter />
    </div>
  );
}
