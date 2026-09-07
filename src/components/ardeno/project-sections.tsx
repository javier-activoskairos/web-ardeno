import Image from "next/image";
import type { PublicProject } from "@/lib/projects";
import { InterestButton } from "./interest-modal";
import { ArdenoContainer, ImagePending } from "./primitives";

/**
 * Secciones de la ficha de proyecto.
 *
 * Server Components: no llevan estado ni efectos. La única isla cliente es
 * <InterestButton>, que abre el modal compartido.
 */

/** Barra fija oscura: marca a la izquierda, conversión a la derecha. */
export function ProjectHeader() {
  return (
    <header className="ar-header ar-on-dark">
      <ArdenoContainer className="ar-header__inner">
        <span className="ar-header__mark">
          <Image
            src="/logos/ardeno-logo-horizontal-bone.png"
            alt="Ardeno Group"
            width={3304}
            height={694}
            priority
            sizes="120px"
            className="h-[18px] w-auto"
          />
        </span>
        <InterestButton variant="light" />
      </ArdenoContainer>
    </header>
  );
}

/**
 * Hero a viewport completo.
 *
 * No hay fotografía del desarrollo, así que el fondo es el estado explícito
 * "Project imagery pending" en lugar de una imagen de archivo que induciría a
 * error sobre el aspecto final del proyecto.
 */
export function ProjectHero({ project }: { project: PublicProject }) {
  const location = `${project.city}, ${project.state}`;

  return (
    <section className="ar-hero ar-on-dark" aria-labelledby="project-title">
      <div className="ar-hero__plate">
        <ImagePending />
      </div>

      <div className="ar-hero__body">
        <ArdenoContainer>
          <h1 id="project-title" className="ar-hero__title">
            {project.name}
          </h1>

          <p className="ar-hero__meta">
            <span>{project.typology}</span>
            <span className="ar-hero__sep" aria-hidden="true" />
            <span>{location}</span>
          </p>

          <p className="ar-hero__thesis">{project.positioningLine}</p>

          <div className="ar-hero__cta">
            <InterestButton variant="brand-on-dark" />
          </div>
        </ArdenoContainer>
      </div>
    </section>
  );
}

/** Fila de cifras verificadas. Se reequilibra según cuántas haya. */
export function ProjectSnapshot({ project }: { project: PublicProject }) {
  if (project.snapshot.length === 0) return null;

  return (
    <section className="ar-sec--tight" aria-label="Project snapshot">
      <ArdenoContainer>
        <dl
          className="ar-snap"
          style={
            { "--ar-snap-cols": project.snapshot.length } as React.CSSProperties
          }
        >
          {project.snapshot.map((item) => (
            <div className="ar-snap__cell" key={item.label}>
              <dd className="ar-snap__val m-0">{item.value}</dd>
              <dt className="ar-label">{item.label}</dt>
            </div>
          ))}
        </dl>
      </ArdenoContainer>
    </section>
  );
}
