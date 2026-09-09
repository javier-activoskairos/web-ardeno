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
            // El logotipo mide 85x18: nunca es el LCP. Con `priority`
            // —obsoleto en Next 16— insertaba su propio <link rel="preload">
            // y competía con el render del hero, que sí lo es. `eager` también
            // emite esa precarga, así que se deja en el valor por defecto: al
            // estar dentro de la primera pantalla se descarga igual de pronto,
            // pero la única imagen precargada pasa a ser el hero.
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
 * Hero de la ficha, en dos composiciones que elige el dato y no el slug.
 *
 * Con `heroMedia`: hero cinematográfico a viewport completo, la imagen encima
 * y la información debajo. Es la composición que queremos cuando exista
 * material aprobado del desarrollo.
 *
 * Sin `heroMedia`: composición editorial. Reservar la pantalla entera para un
 * marco vacío deja al placeholder flotando en un lienzo negro y empuja el
 * contenido real fuera del primer visionado, así que en escritorio y tablet
 * ancho el hero pasa a dos columnas —marco a un lado, título y conversión al
 * otro— y deja de estirarse hasta el alto del viewport. En móvil se apila y
 * conserva el orden marco → información → CTA.
 *
 * En ningún caso se introduce imagen de archivo o generada: el marco vacío con
 * "Project imagery pending" es contenido honesto, no decoración.
 */
export function ProjectHero({ project }: { project: PublicProject }) {
  const location = `${project.city}, ${project.state}`;
  const { heroMedia } = project;

  const info = (
    <>
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
    </>
  );

  if (!heroMedia) {
    return (
      <section
        className="ar-hero ar-hero--nomedia ar-on-dark"
        aria-labelledby="project-title"
      >
        <ArdenoContainer className="ar-hero__split">
          <div className="ar-hero__plate">
            <ImagePending />
          </div>
          <div className="ar-hero__body">{info}</div>
        </ArdenoContainer>
      </section>
    );
  }

  return (
    <section
      className="ar-hero ar-hero--media ar-on-dark"
      aria-labelledby="project-title"
    >
      <div className="ar-hero__plate">
        <ArdenoContainer>
          {/* Marco de proporción fija: reserva el hueco antes de que la imagen
              llegue, así que no hay salto de composición. El recorte vive en el
              marco y no en el archivo, de modo que sustituir el render no
              obliga a tocar nada más. */}
          <div className="ar-hero__frame">
            {/* Elemento LCP de la ficha. En Next 16 `priority` está obsoleto:
                la propiedad que declara la precarga es `preload`, que inserta
                el <link> en el <head> antes de que el <img> se descubra en el
                cuerpo. */}
            <Image
              src={heroMedia.src}
              alt={heroMedia.alt}
              fill
              preload
              // Desde 1600px el marco deja el contenedor de sitio y crece
              // hasta los 1672px del archivo, así que el `sizes` tiene que
              // decirlo o el navegador pediría una variante corta.
              sizes="(min-width: 1600px) 1672px, (min-width: 1440px) 1360px, 100vw"
              className="ar-hero__media"
            />
          </div>
        </ArdenoContainer>
      </div>

      <div className="ar-hero__body">
        <ArdenoContainer>{info}</ArdenoContainer>
      </div>
    </section>
  );
}

/**
 * Cierre de la ficha: la pregunta y el mismo botón de siempre.
 *
 * Va sobre la superficie oscura del hero, así que la narrativa abre y cierra en
 * el mismo tono y el bloque se lee como conclusión, no como un segundo pie: el
 * footer es claro, bajo y de letra pequeña, y viene justo después.
 *
 * Sin formulario en línea, sin imagen de fondo y sin urgencia inventada. El
 * botón es `InterestButton`, que dispara el modal compartido a través del
 * contexto: no hay una segunda instancia, ni estado duplicado, ni una nueva
 * isla cliente. Al cerrarse, el modal devuelve el foco a quien lo abrió, que
 * aquí es este botón.
 */
export function ProjectClosing({ project }: { project: PublicProject }) {
  return (
    <section
      className="ar-closing ar-on-dark"
      aria-labelledby="project-closing"
    >
      <ArdenoContainer className="ar-closing__inner">
        <h2 id="project-closing" className="ar-display ar-closing__title">
          Interested in {project.name}?
        </h2>
        <p className="ar-body ar-closing__body">
          Leave your details and our team will share the latest verified project
          information.
        </p>
        <div className="ar-closing__cta">
          <InterestButton variant="brand-on-dark" />
        </div>
      </ArdenoContainer>
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
