import type { MetadataRoute } from "next";
import { getPublishedProjectSlugs } from "@/lib/projects";
import { siteUrl } from "@/lib/site";

/**
 * Solo entra en el sitemap lo que está publicado.
 *
 * Hoy eso son las fichas de proyecto en inglés. Ni la raíz de idioma —que
 * redirige mientras no exista home— ni ninguna ruta en español, que sigue sin
 * traducción aprobada y devuelve 404. Al publicar la home o el español, se
 * añaden aquí.
 *
 * Las URL se componen con `siteUrl()` para que salgan del mismo origen
 * normalizado que el canonical y la validación de origen del endpoint.
 */
const PUBLISHED_LOCALE = "en";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();
  const slugs = await getPublishedProjectSlugs();

  return slugs.map((slug) => ({
    url: siteUrl(`/${PUBLISHED_LOCALE}/portfolio/${slug}`),
    lastModified,
  }));
}
