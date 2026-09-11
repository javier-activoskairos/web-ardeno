import Image from "next/image";
import type { PublicProject, PublicUnitStatus } from "@/lib/projects";
import { ArdenoChip, ArdenoContainer } from "./primitives";

/**
 * Contenido del proyecto: narrativa, capítulos, disponibilidad, arquitectura y
 * emplazamiento.
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

/**
 * Cuántas columnas reparten mejor `count` celdas sin dejar huérfanas.
 *
 * Una retícula fija se rompe en cuanto cambia el recuento: seis datos en tres
 * columnas son dos filas llenas, pero cuatro dejan tres arriba y una sola
 * abajo, flotando contra el vacío. Y el recuento cambia solo —basta con que un
 * proyecto no tenga un dato aprobado—, así que la retícula tiene que salir del
 * contenido y no al revés.
 *
 * Se prueba de más a menos columnas y gana la que deja la última fila más
 * llena; a igualdad, la de más columnas, que es la más compacta. Con 4 da 4, con
 * 6 da 3, con 5 da 3 —tres y dos, mejor que cuatro y uno—.
 */
function balancedColumns(count: number, max = 4): number {
  if (count <= 1) return 1;
  let best = 1;
  let fewestGaps = Number.POSITIVE_INFINITY;
  for (let columns = Math.min(max, count); columns >= 1; columns--) {
    const gaps = (columns - (count % columns)) % columns;
    if (gaps < fewestGaps) {
      fewestGaps = gaps;
      best = columns;
    }
  }
  return best;
}

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
        <div className="ar-story__head ar-reveal">
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
          <div className="ar-story__body ar-reveal">
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
              <div className="ar-chapter__text ar-reveal">
                {hasText(section.eyebrow) ? (
                  <p className="ar-eyebrow">{section.eyebrow}</p>
                ) : null}
                <h2 id={titleId} className="ar-display ar-chapter__title">
                  {section.title}
                </h2>
                <p className="ar-body ar-chapter__body">{section.body}</p>

                {section.highlights && section.highlights.length > 0 ? (
                  <ul className="ar-list ar-chapter__list">
                    {section.highlights.map((item) => (
                      <li key={item}>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>

              {/* La carga es diferida por defecto: ninguno de los capítulos
                  entra en la primera pantalla. */}
              <figure className="ar-chapter__figure ar-reveal">
                <div className="ar-chapter__frame">
                  <Image
                    src={section.media.src}
                    alt={section.media.alt}
                    fill
                    sizes={CHAPTER_SIZES}
                    className="ar-chapter__img"
                  />
                </div>
                {hasText(section.media.caption) ? (
                  <figcaption className="ar-cap">
                    {section.media.caption}
                  </figcaption>
                ) : null}
              </figure>
            </ArdenoContainer>
          </section>
        );
      })}
    </>
  );
}

/* ------------------------------------------------------------ Availability */

/** Etiqueta pública de cada estado. El dato es interno; esto es lo que se lee. */
const UNIT_STATUS_LABEL: Record<PublicUnitStatus, string> = {
  available: "Available",
  reserved: "Reserved",
  sold: "Sold",
};

/**
 * Disponibilidad por residencia.
 *
 * Es la única parte de la ficha donde el visitante compara filas, así que va en
 * una tabla de verdad —cabecera, ámbito y celdas— y no en una retícula de
 * `<div>`: un lector de pantalla anuncia «Unit B, interior 2.050 SF» en lugar
 * de leer catorce fragmentos sueltos.
 *
 * Sin precios. La nota dice quién los comparte y cuándo, que es la pregunta
 * que deja abierta cualquier lista de estados de venta.
 */
export function ProjectAvailability({ project }: { project: PublicProject }) {
  const availability = project.availability;
  if (!availability) return null;

  const { eyebrow, headline, note, units } = availability;

  return (
    <section
      className="ar-sec ar-navy ar-on-dark"
      aria-labelledby="project-availability"
    >
      <ArdenoContainer>
        <div className="ar-avail__head ar-reveal">
          <div>
            {hasText(eyebrow) ? <p className="ar-eyebrow">{eyebrow}</p> : null}
            <h2
              id="project-availability"
              className="ar-display ar-sechead__title"
            >
              {headline}
            </h2>
          </div>
          <p className="ar-body ar-avail__note">{note}</p>
        </div>

        {/* La tabla se desplaza dentro de su caja en pantallas estrechas; la
            página no. La región lleva `tabIndex` y etiqueta porque un
            contenedor con scroll tiene que ser alcanzable con el teclado. */}
        <div
          className="ar-scroll ar-reveal"
          role="region"
          aria-labelledby="project-availability"
          tabIndex={0}
        >
          {/* Los roles van escritos porque en móvil la tabla se rompe en
              bloques con `display: block`, y eso borra la semántica que el
              navegador deduce del elemento. */}
          <table className="ar-units" role="table">
            <thead role="rowgroup">
              <tr role="row">
                <th role="columnheader" scope="col">
                  Residence
                </th>
                <th role="columnheader" scope="col">
                  Interior
                </th>
                <th role="columnheader" scope="col">
                  Bedrooms
                </th>
                <th role="columnheader" scope="col">
                  Status
                </th>
              </tr>
            </thead>
            <tbody role="rowgroup">
              {units.map((unit) => (
                <tr key={unit.id} data-status={unit.status} role="row">
                  <th role="rowheader" scope="row">
                    {unit.name}
                  </th>
                  <td role="cell" data-label="Interior">
                    {unit.interior}
                  </td>
                  <td role="cell" data-label="Bedrooms">
                    {unit.bedrooms}
                  </td>
                  <td role="cell" data-label="Status">
                    {/* Lo que sigue abierto lleva punto; lo cerrado, no. La
                        distinción no es de color: el punto es la señal. */}
                    <ArdenoChip dot={unit.status === "available"}>
                      {UNIT_STATUS_LABEL[unit.status]}
                    </ArdenoChip>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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

  const { eyebrow, headline, facts, details } = architecture;
  if (facts.length === 0 && details.length === 0) return null;

  return (
    <section className="ar-sec ar-stone" aria-labelledby="project-architecture">
      <ArdenoContainer>
        <div className="ar-reveal">
          {hasText(eyebrow) ? <p className="ar-eyebrow">{eyebrow}</p> : null}
          {hasText(headline) ? (
            <h2
              id="project-architecture"
              className="ar-display ar-sechead__title"
            >
              {headline}
            </h2>
          ) : null}
        </div>

        {facts.length > 0 ? (
          <dl
            className="ar-facts ar-reveal"
            style={
              {
                "--ar-facts-cols": balancedColumns(facts.length),
              } as React.CSSProperties
            }
          >
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
            className="ar-details ar-reveal"
            style={
              {
                "--ar-details-cols": balancedColumns(details.length, 3),
              } as React.CSSProperties
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

/* ----------------------------------------------------------------- Location */

/**
 * Emplazamiento y distancias, entre dos filetes.
 *
 * Sin mapa embebido: sería un tercero cargando dentro de la ficha —con su
 * script, sus cookies y su consentimiento— para dar menos información que esta
 * lista. Los tiempos llegan ya escritos desde el contrato; aquí no se calcula
 * nada.
 */
export function ProjectLocation({ project }: { project: PublicProject }) {
  const location = project.location;
  if (!location) return null;

  const { eyebrow, headline, body, distances } = location;

  return (
    <section className="ar-sec--tight" aria-labelledby="project-location">
      <ArdenoContainer>
        <div className="ar-authority ar-reveal">
          <div>
            {hasText(eyebrow) ? <p className="ar-eyebrow">{eyebrow}</p> : null}
            <h2
              id="project-location"
              className="ar-display ar-authority__title"
            >
              {headline}
            </h2>
            <p className="ar-body ar-authority__body">{body}</p>
          </div>

          <ul className="ar-list" data-split="true">
            {distances.map((distance) => (
              <li key={distance.label}>
                <span>{distance.label}</span>
                <span className="ar-list__val">{distance.value}</span>
              </li>
            ))}
          </ul>
        </div>
      </ArdenoContainer>
    </section>
  );
}
