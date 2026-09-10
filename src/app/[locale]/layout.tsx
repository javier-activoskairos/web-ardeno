import type { Metadata } from "next";
import { Hanken_Grotesk } from "next/font/google";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import {
  getMessages,
  getTranslations,
  setRequestLocale,
} from "next-intl/server";
import { routing } from "@/i18n/routing";
import "../globals.css";

// Hanken Grotesk — una sola cara para toda la ficha.
//
// Es la que declara el Ardeno Group Design System, y la que gana tras
// compararla con el par Manrope + Geist que se midió en ardenogroup.com. Cubre
// los dos roles: `--font-sans` (titulares y prosa) y `--font-ui` (navegación,
// etiquetas, controles).
//
// La web corporativa publicada todavía va con el par anterior, así que hasta
// que se rehaga habrá esa diferencia entre ella y las fichas de proyecto. Los
// tokens de tamaño, interlineado e interletraje siguen siendo los medidos y no
// se han recalibrado para esta cara.
const hanken = Hanken_Grotesk({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

// Base URL del sitio (para canonical / Open Graph). Definir por proyecto.
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

/**
 * Espacios de nombres que viajan al cliente.
 *
 * `NextIntlClientProvider` serializa en el payload RSC todo lo que reciba en
 * `messages`; si no se le pasa nada, hereda el archivo entero del idioma. Hoy
 * ningún componente cliente traduce —el modal lleva su copy en el propio
 * componente—, así que la lista está vacía a propósito y no se serializa ni un
 * mensaje. Cuando un componente cliente necesite traducir, se añade aquí su
 * espacio de nombres y solo ese.
 */
const CLIENT_NAMESPACES: readonly string[] = [];

function clientMessages(all: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    CLIENT_NAMESPACES.filter((ns) => ns in all).map((ns) => [ns, all[ns]]),
  );
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });

  return {
    metadataBase: new URL(siteUrl),
    title: { default: t("title"), template: "%s — Ardeno Group" },
    description: t("description"),
    applicationName: "Ardeno Group",
    openGraph: {
      siteName: "Ardeno Group",
      title: t("title"),
      description: t("description"),
      locale,
      type: "website",
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  const messages = await getMessages({ locale });

  return (
    <html
      lang={locale}
      className={`${hanken.variable} h-full antialiased`}
      // El rol de interfaz apunta a la misma familia en lugar de declararla
      // otra vez: dos llamadas a `next/font` con la misma fuente descargan el
      // mismo woff2 dos veces.
      style={{ "--font-ui": "var(--font-sans)" } as React.CSSProperties}
    >
      <body className="flex min-h-full flex-col">
        <NextIntlClientProvider messages={clientMessages(messages)}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
