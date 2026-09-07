import { ArdenoContainer } from "./primitives";

/**
 * Pie mínimo de la ficha.
 *
 * Server Component: solo texto verificado del sitio real —el aviso legal, la
 * ubicación y el correo de contacto— sobre una retícula de tres zonas. Sin
 * navegación: la ficha no tiene a dónde enlazar todavía, y una barra de
 * enlaces inventados sería peor que ninguna.
 *
 * El año se calcula en el servidor. La ficha se prerenderiza, así que el valor
 * queda fijado en el build: cada despliegue lo actualiza.
 */

const CONTACT_EMAIL = "contact@ardenogroup.com";
const LOCATION = "Raleigh, North Carolina (USA)";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="ar-footer">
      <ArdenoContainer className="ar-footer__inner">
        <small className="ar-footer__legal">
          Ardeno Group © {year}
          <br />
          All Rights Reserved.
        </small>

        {/* Decorativo: el símbolo se pinta desde el token de marca, igual que
            en el resto de la ficha, así que el PNG solo aporta la silueta. */}
        <span className="ar-footer__mark" aria-hidden="true" />

        <small className="ar-footer__contact">
          {LOCATION}
          <br />
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
        </small>
      </ArdenoContainer>
    </footer>
  );
}
