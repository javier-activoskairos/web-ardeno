import Image from "next/image";
import type { PublicProject } from "@/lib/projects";
import { CONTACT_EMAIL, CONTACT_PHONE, CONTACT_PHONE_HREF } from "@/lib/site";
import { InterestForm } from "./interest-form";
import {
  ArdenoChip,
  ArdenoContainer,
  ArdenoLinkButton,
  ImagePending,
} from "./primitives";

/**
 * Secciones de apertura y cierre de la ficha.
 *
 * Server Components salvo el formulario, que es la única isla cliente de este
 * archivo. El CTA del hero es un ancla al bloque de captación: el formulario
 * ya está montado ahí abajo, así que pedir un clic extra para abrir un diálogo
 * sería fricción sin contrapartida. El modal sigue existiendo para el CTA de
 * la cabecera, que tiene que funcionar desde cualquier punto del scroll.
 */

/** Ancla del bloque de captación. Es el destino de todos los CTA de la ficha. */
export const INTEREST_ANCHOR = "interest";

/**
 * Hero de la ficha, en dos composiciones que elige el dato y no el slug.
 *
 * Con `heroMedia`: el render ocupa la pantalla entera y la información se
 * apoya sobre él por el borde inferior, bajo un velo graduado. Es la
 * composición del diseño aprobado y la única imagen a sangre de la ficha.
 *
 * Sin `heroMedia`: composición editorial. Reservar la pantalla entera para un
 * marco vacío deja al marcador flotando en un lienzo negro y empuja el
 * contenido real fuera del primer visionado, así que el hero pasa a dos
 * columnas —marco a un lado, título y conversión al otro— y deja de estirarse
 * hasta el alto del viewport.
 *
 * En ningún caso se introduce imagen de archivo o generada: el marco vacío con
 * "Project imagery pending" es contenido honesto, no decoración.
 */
export function ProjectHero({ project }: { project: PublicProject }) {
  const location = `${project.city}, ${project.state}`;
  const { heroMedia } = project;

  const info = (
    <>
      <h1 id="project-title" className="ar-hero__title ar-reveal">
        {project.name}
      </h1>

      <p className="ar-hero__meta ar-reveal">
        <span>{project.typology}</span>
        <span className="ar-hero__sep" aria-hidden="true" />
        <span>{location}</span>
      </p>

      <p className="ar-hero__thesis ar-reveal">{project.positioningLine}</p>

      <div className="ar-hero__cta ar-reveal">
        <ArdenoLinkButton variant="brand-on-dark" href={`#${INTEREST_ANCHOR}`}>
          Express interest
        </ArdenoLinkButton>
        {project.status ? <ArdenoChip>{project.status}</ArdenoChip> : null}
      </div>
    </>
  );

  if (!heroMedia) {
    return (
      <section
        className="ar-hero ar-hero--nomedia ar-on-dark"
        id="top"
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
      id="top"
      aria-labelledby="project-title"
    >
      <div className="ar-hero__plate">
        {/* Elemento LCP de la ficha. En Next 16 `priority` está obsoleto: la
            propiedad que declara la precarga es `preload`, que inserta el
            <link> en el <head> antes de que el <img> se descubra en el cuerpo.
            A sangre y a pantalla completa, así que el ancho pedido es el del
            viewport en todos los tramos. */}
        <Image
          src={heroMedia.src}
          alt={heroMedia.alt}
          fill
          preload
          sizes="100vw"
          className="ar-hero__media"
        />
        <div className="ar-hero__scrim" aria-hidden="true" />
      </div>

      <div className="ar-hero__body">
        <ArdenoContainer>{info}</ArdenoContainer>
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
          className="ar-snap ar-reveal"
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

/**
 * Cierre de la ficha: la pregunta, el contacto directo y el formulario.
 *
 * Va sobre la superficie oscura del hero, así que la narrativa abre y cierra
 * en el mismo tono y el bloque se lee como conclusión, no como un segundo pie:
 * el footer es claro, bajo y de letra pequeña, y viene justo después.
 *
 * El formulario está montado en la página, dentro de un panel claro. Quien
 * llega hasta aquí ya ha decidido; los campos se ven sin abrir nada. El
 * teléfono y el correo van al lado porque una parte del público prefiere
 * llamar antes que rellenar.
 */
export function ProjectInterest({ project }: { project: PublicProject }) {
  return (
    <section
      className="ar-sec ar-deep ar-on-dark ar-interest"
      id={INTEREST_ANCHOR}
      aria-labelledby="project-interest"
    >
      <span className="ar-interest__mark" aria-hidden="true" />
      <ArdenoContainer className="ar-interest__grid">
        <div className="ar-reveal">
          <p className="ar-eyebrow">Express interest</p>
          <h2 id="project-interest" className="ar-display ar-interest__title">
            Interested in {project.name}?
          </h2>
          <p className="ar-lede ar-interest__lede">
            Leave your details and our team will share the latest verified
            project information, pricing and construction schedule.
          </p>
          <p className="ar-interest__contact">
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
            <a href={`tel:${CONTACT_PHONE_HREF}`}>{CONTACT_PHONE}</a>
          </p>
        </div>

        <div className="ar-panel ar-reveal">
          <InterestForm projectId={project.id} projectSlug={project.slug} />
        </div>
      </ArdenoContainer>
    </section>
  );
}
