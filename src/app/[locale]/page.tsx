import { notFound, redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";

/**
 * Raíz de idioma — /[locale]
 *
 * Todavía no existe home de Ardeno. Este archivo se conserva porque es donde
 * vivirá, pero de momento no renderiza nada propio:
 *
 * - `/en` redirige de forma temporal a la única ficha publicada. Es un 307, no
 *   un 308: la redirección desaparece en cuanto exista la home y no debe
 *   quedarse cacheada como permanente en navegadores ni intermediarios.
 * - `/es` devuelve 404. La versión española existe a nivel de rutas pero no
 *   tiene contenido aprobado, y publicar una traducción automática sería peor
 *   que no publicar nada.
 *
 * Al construir la home real, se sustituye el cuerpo de esta función por su
 * render y se retira `TEMPORARY_HOME_TARGET`.
 */

const PUBLISHED_LOCALE = "en";
const TEMPORARY_HOME_TARGET = "/en/portfolio/720-sherrybrook";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleRootPage({
  params,
}: PageProps<"/[locale]">) {
  const { locale } = await params;
  setRequestLocale(locale);

  if (locale !== PUBLISHED_LOCALE) {
    notFound();
  }

  redirect(TEMPORARY_HOME_TARGET);
}
