import type { PublicProject } from "@/lib/projects";
import { ArdenoContainer } from "./primitives";

/**
 * Contenido del proyecto: narrativa y arquitectura.
 *
 * Server Components puros. No llevan estado, ni efectos, ni JavaScript de
 * cliente: son texto compuesto en el servidor. Todo el contenido llega desde
 * `projects.ts`; aquí no hay ni una cadena específica de Sherrybrook.
 *
 * Cada sección decide su propia existencia. Si el dato no está aprobado, el
 * `<section>` no se emite y su ritmo vertical se va con él: no quedan títulos
 * huérfanos, filetes sueltos ni huecos.
 */

const hasText = (value: string | undefined): value is string =>
  typeof value === "string" && value.trim().length > 0;

/* ----------------------------------------------------------- The project */

/**
 * Narrativa a dos columnas: el titular sostiene la izquierda y el cuerpo
 * ocupa la derecha, que es donde la medida de lectura se mantiene corta. En
 * una sola columna el titular editorial y el texto competirían por el mismo
 * ancho de 1360px. Se apila por debajo de 900px.
 */
export function ProjectStory({ project }: { project: PublicProject }) {
  const story = project.story;
  const body = story?.body.filter(hasText) ?? [];

  if (!story || (!hasText(story.headline) && body.length === 0)) return null;

  return (
    <section className="ar-sec" aria-labelledby="project-story">
      <ArdenoContainer className="ar-story">
        <div className="ar-story__head">
          {hasText(story.eyebrow) ? (
            <p className="ar-eyebrow">{story.eyebrow}</p>
          ) : null}
          {hasText(story.headline) ? (
            <h2 id="project-story" className="ar-display ar-story__title">
              {story.headline}
            </h2>
          ) : null}
        </div>

        {body.length > 0 ? (
          <div className="ar-story__body">
            {body.map((paragraph, index) => (
              <p
                key={paragraph}
                className={index === 0 ? "ar-lede" : "ar-body"}
              >
                {paragraph}
              </p>
            ))}
          </div>
        ) : null}
      </ArdenoContainer>
    </section>
  );
}

/* -------------------------------------------------- Architecture and living */

/**
 * Desarrollo de lo que el snapshot resume.
 *
 * Los hechos se leen etiqueta arriba y cifra abajo, alineados a la izquierda
 * sobre un filete: la orientación opuesta a la del snapshot, que centra la
 * cifra sobre la etiqueta. Así la sección amplía en lugar de repetir.
 *
 * Sin tarjetas, sin sombras y sin iconos: la retícula y los filetes son toda
 * la estructura, igual que en el resto de la ficha.
 */
export function ProjectArchitecture({ project }: { project: PublicProject }) {
  const architecture = project.architecture;
  if (!architecture) return null;

  const { headline, facts, details } = architecture;
  if (facts.length === 0 && details.length === 0) return null;

  return (
    <section className="ar-sec ar-stone" aria-labelledby="project-architecture">
      <ArdenoContainer>
        {hasText(headline) ? (
          <h2 id="project-architecture" className="ar-display ar-arch__title">
            {headline}
          </h2>
        ) : null}

        {facts.length > 0 ? (
          <dl className="ar-facts">
            {facts.map((fact) => (
              <div className="ar-fact" key={fact.label}>
                <dt className="ar-label">{fact.label}</dt>
                <dd className="ar-fact__val">{fact.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}

        {details.length > 0 ? (
          <div className="ar-details">
            {details.map((detail) => (
              <div className="ar-detail" key={detail.title}>
                <h3 className="ar-detail__title">{detail.title}</h3>
                <p className="ar-detail__body">{detail.body}</p>
              </div>
            ))}
          </div>
        ) : null}
      </ArdenoContainer>
    </section>
  );
}
