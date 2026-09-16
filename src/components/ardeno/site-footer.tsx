import Link from "next/link";
import { ArdenoContainer } from "./primitives";

/**
 * Pie mínimo de la ficha.
 *
 * Server Component: solo texto verificado del sitio real —el aviso legal, la
 * ubicación y el correo de contacto— sobre una retícula de tres zonas. El
 * único enlace de navegación es el de la política de privacidad, que no está
 * aquí por diseño sino por obligación: un sitio que recoge nombre, correo y
 * teléfono tiene que dejarla siempre a la vista, en todas sus páginas.
 *
 * Va en la zona legal y no junto al formulario a propósito. Es un enlace
 * permanente del pie, no el texto de consentimiento de la captación: ese
 * vendrá aparte, con su copy aprobado, y hasta entonces la captación sigue
 * apagada (ver docs/lead-capture.md).
 *
 * El `Link` es el de `next/link` y no el de next-intl: la ruta se escribe sin
 * prefijo de idioma porque el inglés se publica en la raíz (`as-needed`), y el
 * pie solo se pinta bajo páginas inglesas —el español devuelve 404—, así que
 * no hay prefijo que resolver en tiempo de ejecución.
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
          <br />
          <Link href="/privacy-policy">Privacy Policy</Link>
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
