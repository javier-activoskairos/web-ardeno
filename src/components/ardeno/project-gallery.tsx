"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import type { PublicGalleryImage } from "@/lib/projects";
import { ArdenoContainer } from "./primitives";

/**
 * Galería de renders del proyecto.
 *
 * En la página solo hay una cubierta: el primer render a tamaño editorial con
 * un botón que abre el resto a pantalla completa. Sin cuadrícula, sin
 * miniaturas permanentes y sin copy explicativo — la sucesión de texto se
 * interrumpe con una imagen, no con más texto.
 *
 * Todo el contenido llega por props desde `projects.ts`; aquí no hay ni una
 * ruta ni una descripción del proyecto. El estado del visor es React puro: no
 * hay eventos globales, ni almacenamiento, ni peticiones externas.
 */

/** Ancho de la cubierta: el contenedor de sitio, con sus gutters. */
const COVER_SIZES = "(min-width: 1440px) 1360px, 100vw";

export function ProjectGallery({
  images,
}: {
  images: readonly PublicGalleryImage[];
}) {
  const [index, setIndex] = useState<number | null>(null);
  const coverRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const touchX = useRef<number | null>(null);

  const count = images.length;
  const isOpen = index !== null;

  const close = useCallback(() => {
    setIndex(null);
    coverRef.current?.focus();
  }, []);

  // Navegación circular: del último se vuelve al primero y al revés.
  const step = useCallback(
    (delta: number) =>
      setIndex((current) =>
        current === null ? current : (current + delta + count) % count,
      ),
    [count],
  );

  // Escape, flechas, trampa de foco y bloqueo del scroll de fondo.
  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        close();
        return;
      }
      if (
        count > 1 &&
        (event.key === "ArrowRight" || event.key === "ArrowLeft")
      ) {
        event.preventDefault();
        step(event.key === "ArrowRight" ? 1 : -1);
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;

      const focusables =
        panelRef.current.querySelectorAll<HTMLElement>("button");
      if (focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown, true);
    const focusTimer = window.setTimeout(
      () => panelRef.current?.querySelector("button")?.focus(),
      30,
    );

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown, true);
      window.clearTimeout(focusTimer);
    };
  }, [isOpen, close, step, count]);

  if (count === 0) return null;

  const cover = images[0];
  const label = count > 1 ? `View all ${count} renders` : "View render";
  // Imagen y posición juntas: un solo objeto que TypeScript sabe estrechar.
  const active =
    index === null ? null : { image: images[index], position: index + 1 };

  return (
    <section className="ar-sec--tight" aria-label="Project renders">
      <ArdenoContainer>
        {/* La descripción del render viaja en la etiqueta del botón, así que
            la imagen no la repite y el badge queda fuera del árbol. */}
        <button
          type="button"
          className="ar-cover"
          ref={coverRef}
          onClick={() => setIndex(0)}
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
      </ArdenoContainer>

      {active ? (
        <div
          className="ar-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Project renders"
          ref={panelRef}
          // Cierra al pulsar el fondo. El visor es una columna cuyos hijos lo
          // cubren entero, así que comparar con `currentTarget` sólo habría
          // funcionado en la franja exacta del contenedor: se descarta por lo
          // que hay debajo del puntero, no por en qué caja ha caído.
          onMouseDown={(event) => {
            const target = event.target as HTMLElement;
            if (!target.closest("button") && target.tagName !== "IMG") close();
          }}
          onTouchStart={(event) => {
            touchX.current = event.touches[0].clientX;
          }}
          onTouchEnd={(event) => {
            if (touchX.current === null || count < 2) return;
            const dx = event.changedTouches[0].clientX - touchX.current;
            if (Math.abs(dx) > 48) step(dx < 0 ? 1 : -1);
            touchX.current = null;
          }}
        >
          <div className="ar-lightbox__bar">
            <span className="ar-lightbox__count">
              {active.position} / {count}
            </span>
            <button
              type="button"
              className="ar-lightbox__close"
              onClick={close}
              aria-label="Close gallery"
            >
              ✕
            </button>
          </div>

          <figure className="ar-lightbox__stage">
            <span className="ar-lightbox__frame">
              <Image
                src={active.image.src}
                alt={active.image.alt}
                fill
                sizes="100vw"
                className="ar-lightbox__img"
              />
            </span>
            <figcaption className="ar-lightbox__cap">
              {active.image.caption}
            </figcaption>
          </figure>

          {count > 1 ? (
            <>
              <button
                type="button"
                className="ar-lightbox__nav ar-lightbox__nav--prev"
                onClick={() => step(-1)}
                aria-label="Previous render"
              >
                ‹
              </button>
              <button
                type="button"
                className="ar-lightbox__nav ar-lightbox__nav--next"
                onClick={() => step(1)}
                aria-label="Next render"
              >
                ›
              </button>
            </>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
