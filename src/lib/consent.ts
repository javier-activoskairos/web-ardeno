/**
 * Texto de consentimiento de la captación.
 *
 * Vive aparte del formulario y del endpoint porque los dos lo necesitan y no
 * pueden discrepar: el navegador enseña un texto y el servidor guarda el que
 * consta como aceptado. Si cada uno tuviera su copia, el día que alguien
 * retocara la del formulario se estaría registrando un consentimiento a un
 * texto que nadie llegó a leer.
 *
 * Por eso el cliente NO envía el texto: envía solo la versión. El servidor
 * resuelve aquí qué decía esa versión y la sella con su propia hora. Un
 * navegador no puede declarar que se aceptó algo distinto de lo que se enseñó.
 *
 * QUÉ HACER AL CAMBIAR EL TEXTO: subir `CONSENT_VERSION` a la fecha del nuevo
 * texto aprobado. Los consentimientos ya guardados conservan su versión, que
 * es justo lo que hay que poder demostrar más adelante: qué aceptó cada
 * persona y cuándo. Nunca se reescribe una versión existente.
 *
 * El contenido no es redacción propia: sale de dos apartados de la política de
 * privacidad aprobada por Ardeno —«How We Use the Information» y «Commercial
 * Communications»— y no introduce ninguna base legal que no esté ya allí.
 */

/** Fecha del texto aprobado. Sube al aprobarse uno nuevo. */
export const CONSENT_VERSION = "2026-09-16";

/**
 * El texto, partido donde va el enlace.
 *
 * Partirlo aquí y no en el formulario es lo que impide que la versión con
 * enlace y la versión guardada se separen: `CONSENT_TEXT` se compone de estos
 * mismos tres trozos, así que no hay dos redacciones que mantener.
 */
export const CONSENT_SEGMENTS = {
  before:
    "By submitting this form, you agree that Ardeno Group may use your " +
    "details to respond to your enquiry and to send you information about " +
    "its developments, as described in the ",
  link: "Privacy Policy",
  after: ". You can ask us to stop at any time at contact@ardenogroup.com.",
} as const;

/** El texto plano, que es lo que se guarda junto al lead. */
export const CONSENT_TEXT = `${CONSENT_SEGMENTS.before}${CONSENT_SEGMENTS.link}${CONSENT_SEGMENTS.after}`;

/** Ruta de la política, para el enlace del propio texto. */
export const PRIVACY_POLICY_PATH = "/privacy-policy";
