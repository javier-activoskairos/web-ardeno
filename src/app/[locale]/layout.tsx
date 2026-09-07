import type { Metadata } from "next";
import { Geist, Manrope } from "next/font/google";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
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
    title: t("title"),
    description: t("description"),
    openGraph: {
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

  return (
    <html
      lang={locale}
      className={`${manrope.variable} ${geist.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
