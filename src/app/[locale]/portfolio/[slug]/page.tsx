import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { InterestProvider } from "@/components/ardeno/interest-modal";
import {
  ProjectArchitecture,
  ProjectStory,
} from "@/components/ardeno/project-content";
import { ProjectGallery } from "@/components/ardeno/project-gallery";
import {
  ProjectHeader,
  ProjectHero,
  ProjectSnapshot,
} from "@/components/ardeno/project-sections";
import { SiteFooter } from "@/components/ardeno/site-footer";
import { getPublicProject, getPublishedProjectSlugs } from "@/lib/projects";

/**
 * Ficha pública de proyecto — /[locale]/portfolio/[slug]
 *
 * Solo se publica en inglés. El español está preparado a nivel de rutas pero
 * la ficha permanece sin publicar hasta que exista traducción aprobada: el
 * copy largo no se traduce automáticamente.
 */

const PUBLISHED_LOCALE = "en";

/**
 * Un slug que no se haya prerenderizado se resuelve bajo demanda. Hoy solo
 * afecta a slugs inexistentes, que acaban en `notFound()`; cuando los
 * proyectos lleguen de Notion, permitirá publicar uno nuevo sin reconstruir.
 */
export const dynamicParams = true;

export async function generateStaticParams({
  params,
}: {
  params: { locale: string };
}) {
  if (params.locale !== PUBLISHED_LOCALE) return [];
  const slugs = await getPublishedProjectSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[locale]/portfolio/[slug]">): Promise<Metadata> {
  const { locale, slug } = await params;
  const project = await getPublicProject(slug);

  if (locale !== PUBLISHED_LOCALE || !project) {
    return { title: { absolute: "Ardeno Group" } };
  }

  const description = `${project.typology} in ${project.city}, ${project.state}.`;

  // El sufijo de marca lo pone la plantilla del layout: aquí solo el proyecto.
  return {
    title: project.name,
    description,
    openGraph: {
      siteName: "Ardeno Group",
      title: `${project.name} — Ardeno Group`,
      description,
      locale,
      type: "website",
    },
  };
}

export default async function ProjectPage({
  params,
}: PageProps<"/[locale]/portfolio/[slug]">) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const project = await getPublicProject(slug);

  // La ficha en español no está publicada: sin traducción aprobada, 404.
  if (locale !== PUBLISHED_LOCALE || !project) {
    notFound();
  }

  return (
    <InterestProvider projectName={project.name}>
      <div className="ar-page flex flex-1 flex-col">
        <a className="ar-skip" href="#project-content">
          Skip to project content
        </a>

        <ProjectHeader />

        <main id="project-content">
          <ProjectHero project={project} />
          <ProjectSnapshot project={project} />
          <ProjectStory project={project} />
          {/* La comprobación vive aquí, en el servidor: sin renders no se monta
              la isla cliente y la sección no existe. */}
          {project.gallery && project.gallery.length > 0 ? (
            <ProjectGallery images={project.gallery} />
          ) : null}
          <ProjectArchitecture project={project} />
        </main>

        <SiteFooter />
      </div>
    </InterestProvider>
  );
}
