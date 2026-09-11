"use client";

import Image from "next/image";
import type { PublicFloorPlans } from "@/lib/projects";
import { MediaLightbox, useLightbox } from "./media-lightbox";
import { ArdenoContainer } from "./primitives";

/**
 * Planos de planta.
 *
 * En página van como previsualización: lo justo para reconocer la distribución
 * y decidir si interesa. Impresos a tamaño legible ocupaban media pantalla cada
 * uno y empujaban el resto de la ficha fuera del scroll, así que las cotas se
 * leen en el visor —el mismo que la galería, con el mismo Escape, la misma
 * trampa de foco y el mismo retorno de foco—.
 *
 * La única diferencia con los renders es el ajuste: un plano se ve entero,
 * sobre su fondo claro, y no recortado a sangre.
 *
 * Todo el contenido llega por props desde `projects.ts`; aquí no hay ni una
 * ruta ni un nombre de tipología.
 */

/** En previsualización cada plano ocupa media columna desde 900px. */
const PLAN_SIZES = "(min-width: 1440px) 660px, (min-width: 900px) 46vw, 100vw";

export function ProjectFloorPlans({
  floorPlans,
}: {
  floorPlans: PublicFloorPlans;
}) {
  const { index, open, close, goTo } = useLightbox();
  const { eyebrow, headline, note, plans } = floorPlans;

  if (plans.length === 0) return null;

  const items = plans.map((plan) => ({
    src: plan.media.src,
    alt: plan.media.alt,
    caption: plan.name,
    width: plan.media.width,
    height: plan.media.height,
  }));

  return (
    <section className="ar-sec" aria-labelledby="project-floor-plans">
      <ArdenoContainer>
        <div className="ar-avail__head ar-reveal">
          <div>
            {eyebrow ? <p className="ar-eyebrow">{eyebrow}</p> : null}
            <h2
              id="project-floor-plans"
              className="ar-display ar-sechead__title"
            >
              {headline}
            </h2>
          </div>
          {note ? <p className="ar-body ar-avail__note">{note}</p> : null}
        </div>

        <div className="ar-plans ar-reveal">
          {plans.map((plan, position) => (
            <div className="ar-plan" key={plan.id}>
              {/* El nombre de la tipología viaja en la etiqueta del botón, así
                  que el dibujo no lo repite para un lector de pantalla. */}
              <button
                type="button"
                className="ar-plan__button"
                onClick={() => open(position)}
                aria-label={`Open floor plan: ${plan.name}`}
              >
                <span className="ar-plan__frame">
                  <Image
                    src={plan.media.src}
                    alt=""
                    width={plan.media.width}
                    height={plan.media.height}
                    sizes={PLAN_SIZES}
                    className="ar-plan__img"
                  />
                </span>
                <span className="ar-plan__badge" aria-hidden="true">
                  View plan
                </span>
              </button>

              <h3 className="ar-plan__name">{plan.name}</h3>
              {plan.summary ? (
                <p className="ar-plan__summary">{plan.summary}</p>
              ) : null}
            </div>
          ))}
        </div>
      </ArdenoContainer>

      <MediaLightbox
        items={items}
        index={index}
        onClose={close}
        onIndexChange={goTo}
        label="Floor plans"
        fit="contain"
      />
    </section>
  );
}
