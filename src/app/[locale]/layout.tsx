import type { Metadata } from "next";
import { Geist, Manrope } from "next/font/google";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import {
  getMessages,
  getTranslations,
  setRequestLocale,
} from "next-intl/server";
import { routing } from "@/i18n/routing";
import "../globals.css";

// Las dos caras del sitio real, verificadas sobre el CSS computado de
// ardenogroup.com. No se carga ninguna más: Lora aparece allí como acento
// editorial a 50px/600, pero esta primera pantalla no tiene ningún rol
// equivalente, así que descargarla sería peso sin uso.

// Manrope — display y contenido. El h1 del sitio es Manrope 60px/300.
// Variable en Google Fonts, así que un solo archivo cubre 200–800.
const manrope = Manrope({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

// Geist — navegación, etiquetas, controles y botones. Verificado: los enlaces
// de navegación son Geist 18/500 y la etiqueta del CTA, Geist 16/500.
const geist = Geist({
  variable: "--font-ui",
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
      className={`${manrope.variable} ${geist.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <NextIntlClientProvider messages={clientMessages(messages)}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
