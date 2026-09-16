import { ArdenoContainer, ArdenoEyebrow } from "./primitives";
import { formatLegalDate, type LegalDocument } from "@/lib/legal";

/**
 * Renderizador de documentos legales.
 *
 * Server Component puro: recibe el documento ya resuelto y lo pinta. Sin
 * estado, sin efectos y sin una sola línea de JavaScript en el navegador —una
 * política de privacidad que necesitara hidratarse para leerse sería una
 * contradicción en sí misma—.
 *
 * Es genérico a propósito. La política de privacidad es el primer documento,
 * pero unos términos de uso o un aviso legal entran por el mismo sitio sin
 * tocar nada: se describen con el tipo `LegalDocument` y se pasan aquí.
 *
 * Decisiones de composición:
 *
 * - Columna editorial (`--w-editorial`, 760px) y no el contenedor de sitio.
 *   Son treinta párrafos seguidos: a 1360px la línea pasaría de 150 caracteres
 *   y nadie llega al final de un renglón así.
 * - Jerarquía real: un solo `<h1>` —el título del documento— y un `<h2>` por
 *   apartado. Nada de saltos de nivel para conseguir un tamaño de letra.
 * - Cada apartado es un `<section>` con `id` estable, de modo que se puede
 *   enlazar «…según el apartado User Rights» desde un correo o desde el propio
 *   texto de consentimiento del formulario cuando exista.
 */
export function LegalDocumentPage({ doc }: { doc: LegalDocument }) {
  return (
    <ArdenoContainer editorial className="ar-doc">
      <header className="ar-doc__head">
        <ArdenoEyebrow>{doc.eyebrow}</ArdenoEyebrow>
        <h1 className="ar-display ar-doc__title">{doc.title}</h1>

        {/* La fecha solo consta si está confirmada: ver src/lib/legal.ts. */}
        {doc.updatedOn ? (
          <p className="ar-doc__meta">
            Last updated:{" "}
            <time dateTime={doc.updatedOn}>
              {formatLegalDate(doc.updatedOn)}
            </time>
          </p>
        ) : null}
      </header>

      {doc.intro.map((paragraph, index) => (
        <p key={index} className="ar-lede ar-doc__intro">
          {paragraph}
        </p>
      ))}

      {doc.sections.map((section) => (
        <section key={section.id} id={section.id} className="ar-doc__section">
          <h2 className="ar-doc__heading">{section.heading}</h2>

          {section.paragraphs.map((paragraph, index) => (
            <p key={index} className="ar-body ar-doc__p">
              {paragraph}
            </p>
          ))}

          {/* Datos registrales: etiqueta y valor sobre filete, la misma lista
              que usa la ficha para materiales y distancias. */}
          {section.facts ? (
            <ul className="ar-list ar-doc__list" data-split="true">
              {section.facts.map((fact) => (
                <li key={fact.label}>
                  <span>{fact.label}</span>
                  <span className="ar-list__val">{fact.value}</span>
                </li>
              ))}
            </ul>
          ) : null}

          {section.contact ? (
            <ul className="ar-list ar-doc__list" data-split="true">
              {section.contact.map((row) => (
                <li key={row.label}>
                  <span>{row.label}</span>
                  <span className="ar-list__val">
                    <a href={row.href}>{row.value}</a>
                  </span>
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      ))}
    </ArdenoContainer>
  );
}
