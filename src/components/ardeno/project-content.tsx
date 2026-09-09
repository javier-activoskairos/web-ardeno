import Image from "next/image";
import type { PublicProject } from "@/lib/projects";
import { ArdenoContainer } from "./primitives";

/**
 * Contenido del proyecto: narrativa, capítulos editoriales y arquitectura.
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

/* ------------------------------------------------------ Capítulos editoriales */

/**
 * Anchura que ocupará el render, para que el navegador pida la variante justa.
 *
 * Desde 1200px la imagen es la columna de 7/12 del contenedor: 709px medidos
 * cuando el contenedor topa en sus 1360px, y algo menos mientras crece. Por
 * debajo la composición se apila y ocupa el ancho del contenedor; `100vw` se
 * pasa un poco —los gutters— y esa dirección es la segura: pedir de menos daría
 * una imagen ampliada.
 *
 * Los valores salen de la medición y no de redondear al alza: con 764px y 57vw
 * el navegador subía a la variante de 828 donde le basta la de 750.
 */
const CHAPTER_SIZES =
  "(min-width: 1440px) 712px, (min-width: 1200px) 53vw, 100vw";

/**
 * Capítulos: prosa y render, alternando el lado.
 *
 * Es lo que interrumpe la sucesión de texto durante el scroll. Cada capítulo
 * ocupa su propia `<section>`, sin fondo propio, sin tarjeta y sin caja: la
 * escala del render es todo el cambio de ritmo.
 *
 * La disposición sale de la posición, no del dato: los pares llevan el render a
 * la derecha y los impares lo llevan a la izquierda. Así el contenido no tiene
 * que declarar columnas y la alternancia sigue funcionando aunque se reordenen
 * los capítulos, se quite uno o se añada un tercero.
 *
 * En el DOM el texto va siempre primero. En una columna —móvil y tablet— eso ya
 * es el orden que se lee; el intercambio de lados solo existe cuando hay dos
 * columnas de verdad.
 *
 * Las imágenes no son botones y no abren el visor: ilustran el texto que tienen
 * al lado. El archivo visual completo es la galería.
 */
export function ProjectEditorial({ project }: { project: PublicProject }) {
  const sections = project.editorialSections;
  if (!sections || sections.length === 0) return null;

  return (
    <>
      {sections.map((section, index) => {
        const titleId = `chapter-${section.id}`;
        return (
          <section
            key={section.id}
            className={
              index % 2 === 1
                ? "ar-sec ar-chapter ar-chapter--mirror"
                : "ar-sec ar-chapter"
            }
            aria-labelledby={titleId}
          >
            <ArdenoContainer className="ar-chapter__grid">
              <div className="ar-chapter__text">
                <h2 id={titleId} className="ar-display ar-chapter__title">
                  {section.title}
                </h2>
                <p className="ar-body ar-chapter__body">{section.body}</p>
              </div>

              {/* Sin `fill`: el archivo manda su propia proporción, así que no
                  hay recorte y el hueco queda reservado desde el primer pintado.
                  La carga es diferida por defecto — ninguno de los dos entra en
                  la primera pantalla. */}
              <div className="ar-chapter__media">
                <Image
                  src={section.media.src}
                  alt={section.media.alt}
                  width={section.media.width}
                  height={section.media.height}
                  sizes={CHAPTER_SIZES}
                  className="ar-chapter__img"
                />
              </div>
            </ArdenoContainer>
          </section>
        );
      })}
    </>
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
          /* Las columnas salen del recuento, igual que en el snapshot: con un
             solo detalle la retícula es de una columna y ocupa su fila entera,
             en vez de dejar dos huecos a la derecha. Nunca pasa de tres. */
          <div
            className="ar-details"
            style={
              { "--ar-details-cols": details.length } as React.CSSProperties
            }
          >
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
