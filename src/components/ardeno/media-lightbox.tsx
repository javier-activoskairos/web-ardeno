"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Visor de medios a pantalla completa.
 *
 * Vivía dentro de la galería y salió de ahí cuando los planos también
 * necesitaron ampliarse: dos visores habrían sido dos trampas de foco, dos
 * manejadores de Escape y dos bloqueos de scroll que mantener en paralelo. Aquí
 * está una sola vez y lo usan los dos.
 *
 * Lo que el visor sabe es abrir, cerrar, recorrer y devolver el foco. Qué se
 * pulsa para abrirlo —una cubierta, una miniatura, un plano— es cosa de quien lo
 * monta, que llama a `open(posición)` desde donde quiera.
 *
 * `fit` es la única concesión a que no todos los medios se miran igual: un
 * render llena la pantalla y un plano tiene que verse entero, con su fondo
 * claro, o no se leen las cotas.
 */

export type LightboxItem = {
  readonly src: string;
  readonly alt: string;
  readonly caption?: string;
  /**
   * Dimensiones intrínsecas. Solo hacen falta con `fit="contain"`: sin ellas el
   * fondo claro se estira a todo el escenario y el dibujo queda como un bloque
   * suelto dentro de una plancha mucho mayor. Con ellas, el fondo toma la
   * proporción del medio y lo abraza.
   */
  readonly width?: number;
  readonly height?: number;
};

export type LightboxFit = "cover" | "contain";

/**
 * Estado del visor, para que quien lo monta dispare la apertura sin conocer sus
 * interioridades.
 */
export function useLightbox() {
  const [index, setIndex] = useState<number | null>(null);
  const openerRef = useRef<HTMLElement | null>(null);

  const open = useCallback((position: number) => {
    // Quién abrió el visor, para devolverle el foco al cerrarlo. No siempre es
    // el mismo control: cerrar y aparecer a tres pantallas de donde estabas es
    // exactamente lo que hay que evitar.
    openerRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    setIndex(position);
  }, []);

  const close = useCallback(() => {
    setIndex(null);
    openerRef.current?.focus();
  }, []);

  // Moverse dentro del visor no cambia a quién se le devuelve el foco: el
  // opener se fija al abrir y sobrevive a las flechas y al deslizamiento.
  const goTo = useCallback((position: number) => setIndex(position), []);

  return { index, open, close, goTo };
}

export function MediaLightbox({
  items,
  index,
  onClose,
  onIndexChange,
  label,
  fit = "cover",
}: {
  items: readonly LightboxItem[];
  index: number | null;
  onClose: () => void;
  onIndexChange: (next: number) => void;
  /** Etiqueta del diálogo: "Project renders", "Floor plans". */
  label: string;
  fit?: LightboxFit;
}) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const touchX = useRef<number | null>(null);

  const count = items.length;
  const isOpen = index !== null;

  // Navegación circular: del último se vuelve al primero y al revés.
  const step = useCallback(
    (delta: number) => {
      if (index === null) return;
      onIndexChange((index + delta + count) % count);
    },
    [index, count, onIndexChange],
  );

  // Escape, flechas, trampa de foco y bloqueo del scroll de fondo.
  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
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
      const active = document.activeElement;

      // Si el foco se quedó fuera del visor, el Tab lo mete dentro en vez de
      // recorrer la página de fondo. Comparar solo contra el primero y el
      // último daba por supuesto que el foco ya estaba dentro, y no siempre lo
      // está: al abrir desde una miniatura el navegador puede devolverlo al
      // botón de origen después de que el efecto lo haya movido, y entonces la
      // trampa no llegaba a activarse.
      if (!panelRef.current.contains(active)) {
        event.preventDefault();
        first.focus();
        return;
      }

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown, true);

    // El foco entra en el visor en cuanto se monta. El temporizador queda como
    // red por si el panel todavía no tiene botones en este punto del ciclo;
    // volver a enfocar lo ya enfocado no hace nada.
    panelRef.current?.querySelector("button")?.focus();
    const focusTimer = window.setTimeout(
      () => panelRef.current?.querySelector("button")?.focus(),
      30,
    );

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown, true);
      window.clearTimeout(focusTimer);
    };
  }, [isOpen, onClose, step, count]);

  if (index === null) return null;

  const active = items[index];

  return (
    <div
      className="ar-lightbox"
      data-fit={fit}
      role="dialog"
      aria-modal="true"
      aria-label={label}
      ref={panelRef}
      // Cierra al pulsar el fondo. El visor es una columna cuyos hijos lo
      // cubren entero, así que comparar con `currentTarget` sólo habría
      // funcionado en la franja exacta del contenedor: se descarta por lo
      // que hay debajo del puntero, no por en qué caja ha caído.
      onMouseDown={(event) => {
        const target = event.target as HTMLElement;
        if (!target.closest("button") && target.tagName !== "IMG") onClose();
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
          {index + 1} / {count}
        </span>
        <button
          type="button"
          className="ar-lightbox__close"
          onClick={onClose}
          aria-label="Close"
        >
          ✕
        </button>
      </div>

      <figure className="ar-lightbox__stage">
        <span
          className="ar-lightbox__frame"
          style={
            fit === "contain" && active.width && active.height
              ? ({
                  "--ar-lightbox-ratio": `${active.width} / ${active.height}`,
                } as React.CSSProperties)
              : undefined
          }
        >
          <Image
            src={active.src}
            alt={active.alt}
            fill
            sizes="100vw"
            className="ar-lightbox__img"
          />
        </span>
        {active.caption ? (
          <figcaption className="ar-lightbox__cap">{active.caption}</figcaption>
        ) : null}
      </figure>

      {count > 1 ? (
        <>
          <button
            type="button"
            className="ar-lightbox__nav ar-lightbox__nav--prev"
            onClick={() => step(-1)}
            aria-label="Previous"
          >
            ‹
          </button>
          <button
            type="button"
            className="ar-lightbox__nav ar-lightbox__nav--next"
            onClick={() => step(1)}
            aria-label="Next"
          >
            ›
          </button>
        </>
      ) : null}
    </div>
  );
}
