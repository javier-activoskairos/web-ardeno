import type { MetadataRoute } from "next";
import { getPublishedProjectSlugs } from "@/lib/projects";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

/**
 * Solo entra en el sitemap lo que está publicado.
 *
 * Hoy eso son las fichas de proyecto en inglés. Ni la raíz de idioma —que
 * redirige mientras no exista home— ni ninguna ruta en español, que sigue sin
 * traducción aprobada. Al publicar la home o el español, se añaden aquí.
 */
const PUBLISHED_LOCALE = "en";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return getPublishedProjectSlugs().map((slug) => ({
    url: `${siteUrl}/${PUBLISHED_LOCALE}/portfolio/${slug}`,
    lastModified,
  }));
}
