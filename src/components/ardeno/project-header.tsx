"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { InterestButton } from "./interest-modal";
import { ArdenoContainer } from "./primitives";

/**
 * Cabecera latente de la ficha.
 *
 * La barra está retirada y vuelve cuando se la busca: el puntero entra en la
 * franja superior de 88px, o algo suyo recibe el foco —eso último lo resuelve
 * `:focus-within` en CSS, sin JavaScript—. Así el hero a pantalla completa se
 * ve entero y el CTA sigue a un gesto de distancia en cualquier punto del
 * scroll.
 *
 * En dispositivos sin puntero fino no hay franja que buscar: allí la barra es
 * permanente, y esa condición vive en el CSS (`@media (pointer: coarse)`), de
 * modo que el primer pintado ya es el correcto y no depende de que este
 * componente hidrate.
 */

/** Altura de la franja sensible, en píxeles de viewport. */
const REVEAL_ZONE = 88;

export function ProjectHeader() {
  const headerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;

    // Sin puntero fino la barra ya está fija por CSS: no se le toca el
    // atributo, o un arrastre con el dedo la escondería.
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      return;
    }

    const set = (revealed: boolean) =>
      header.setAttribute("data-revealed", String(revealed));

    const onPointerMove = (event: PointerEvent) =>
      set(event.clientY <= REVEAL_ZONE);
    const onPointerLeave = () => set(false);

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("pointerleave", onPointerLeave);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerleave", onPointerLeave);
    };
  }, []);

  return (
    <header
      className="ar-header ar-on-dark"
      data-revealed="false"
      ref={headerRef}
    >
      <ArdenoContainer className="ar-header__inner">
        <a className="ar-header__mark" href="#top" aria-label="Back to top">
          <Image
            src="/logos/ardeno-logo-horizontal-bone.png"
            alt="Ardeno Group"
            width={3304}
            height={694}
            // El logotipo mide 85x18: nunca es el LCP. Con `priority`
            // —obsoleto en Next 16— insertaba su propio <link rel="preload">
            // y competía con el render del hero, que sí lo es.
            sizes="120px"
            className="h-[18px] w-auto"
          />
        </a>
        <InterestButton variant="light" />
      </ArdenoContainer>
    </header>
  );
}
