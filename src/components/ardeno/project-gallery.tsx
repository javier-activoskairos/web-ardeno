"use client";

import Image from "next/image";
import { useRef } from "react";
import type { PublicGalleryImage } from "@/lib/projects";
import { MediaLightbox, useLightbox } from "./media-lightbox";
import { ArdenoContainer } from "./primitives";

/**
 * Galería de renders del proyecto.
 *
 * En la página hay una cubierta a tamaño editorial y hasta cuatro renders más
 * en dos parejas. Cualquiera de ellos abre el visor a pantalla completa por su
 * propia posición. El resto del archivo vive solo ahí dentro: la galería
 * interrumpe la sucesión de texto con imagen, no la sustituye por una
 * cuadrícula.
 *
 * El visor es compartido con los planos y vive en `media-lightbox.tsx`; aquí
 * solo se decide qué se muestra en página y por dónde se abre.
 *
 * Todo el contenido llega por props desde `projects.ts`; aquí no hay ni una
 * ruta ni una descripción del proyecto.
 */

/** Ancho de la cubierta: el contenedor de sitio, con sus gutters. */
const COVER_SIZES = "(min-width: 1440px) 1360px, 100vw";

/** Las miniaturas ocupan media columna desde 768px. */
const TILE_SIZES = "(min-width: 1440px) 672px, (min-width: 768px) 48vw, 100vw";

/**
 * Cuántos renders se muestran bajo la cubierta antes de mandar al visor.
 *
 * Cuatro, en dos filas de dos: los suficientes para que se vea que hay un
 * archivo detrás, y no tantos como para que la galería se coma el scroll y
 * deje de tener sentido abrir el visor.
 */
const MAX_TILES = 4;

export function ProjectGallery({
  images,
}: {
  images: readonly PublicGalleryImage[];
}) {
  const { index, open, close, goTo } = useLightbox();
  const coverRef = useRef<HTMLButtonElement | null>(null);

  const count = images.length;
  if (count === 0) return null;

  const cover = images[0];
  // Sin recuento: el número no aporta y obliga a recontar cada vez que entra
  // o sale un render.
  const label = count > 1 ? "View all images" : "View image";
  // Las miniaturas empiezan después de la cubierta y se emiten por parejas: una
  // fila suelta con una sola imagen dejaría media columna vacía.
  const tiles = images
    .map((image, position) => ({ image, position }))
    .slice(1, 1 + MAX_TILES);
  const rows = [tiles.slice(0, 2), tiles.slice(2, 4)].filter(
    (row) => row.length === 2,
  );

  return (
    <section className="ar-sec--tight" aria-labelledby="project-gallery">
      <ArdenoContainer>
        <div className="ar-reveal">
          <p className="ar-eyebrow">Gallery</p>
          <h2 id="project-gallery" className="ar-display ar-sechead__title">
            Discover the Residences
          </h2>
        </div>

        {/* La descripción del render viaja en la etiqueta del botón, así que
            la imagen no la repite y el badge queda fuera del árbol. */}
        <button
          type="button"
          className="ar-cover ar-reveal"
          ref={coverRef}
          onClick={() => open(0)}
          aria-label={`${label}. ${cover.alt}`}
        >
          <span className="ar-cover__frame">
            <Image
              src={cover.src}
              alt=""
              fill
              sizes={COVER_SIZES}
              className="ar-cover__img"
            />
          </span>
          <span className="ar-cover__badge" aria-hidden="true">
            {label}
          </span>
        </button>

        {/* Cada miniatura abre el visor por donde está, no por el principio:
            quien pulsa el baño quiere ver el baño. */}
        {rows.map((row) => (
          <div className="ar-pair ar-reveal" key={row[0].image.src}>
            {row.map(({ image, position }) => (
              <button
                type="button"
                className="ar-tile"
                key={image.src}
                onClick={() => open(position)}
                aria-label={`Open render: ${image.alt}`}
              >
                <Image
                  src={image.src}
                  alt=""
                  fill
                  sizes={TILE_SIZES}
                  className="ar-tile__img"
                />
              </button>
            ))}
          </div>
        ))}
      </ArdenoContainer>

      <MediaLightbox
        items={images}
        index={index}
        onClose={close}
        onIndexChange={goTo}
        label="Project renders"
      />
    </section>
  );
}
