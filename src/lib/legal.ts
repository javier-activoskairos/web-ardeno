/**
 * Datos legales de Ardeno Group y forma de un documento legal.
 *
 * Aquí no hay texto de política: solo el tipo con el que se describe un
 * documento legal —lo usa el renderizador de `legal-document.tsx`— y los datos
 * registrales de la empresa, que llegan por entorno.
 *
 * Por qué por entorno y no escritos en el repositorio: el documento aprobado
 * por Ardeno deja explícitamente pendientes la razón social, el domicilio
 * registral y la fecha de última actualización. Escribirlos a mano sería
 * inventarse información legal; dejarlos como texto «pendiente» en la página
 * publicada sería peor. Así, mientras no existan, sencillamente no se pintan:
 * la página es correcta sin ellos y se completa sola el día que se configuren,
 * sin tocar código ni volver a desplegar nada más que las variables.
 *
 * MÓDULO DE SERVIDOR. Ninguna variable lleva prefijo `NEXT_PUBLIC_`: son datos
 * de la empresa que resuelve el servidor al renderizar, no información que el
 * navegador tenga que recibir por su cuenta.
 */

/* ------------------------------------------------------- Forma del documento */

/** Par etiqueta/valor. Para datos registrales, que no son prosa. */
export type LegalFact = {
  label: string;
  value: string;
};

/** Vía de contacto: se pinta como valor enlazable (correo o web). */
export type LegalContactRow = {
  label: string;
  value: string;
  href: string;
};

/**
 * Un apartado del documento. `paragraphs` es el texto aprobado tal cual; los
 * dos campos opcionales solo existen donde el documento pide algo que no es
 * prosa —los datos registrales del responsable y el bloque de contacto final—.
 */
export type LegalSection = {
  /** Ancla estable: permite enlazar a un apartado concreto desde fuera. */
  id: string;
  heading: string;
  paragraphs: string[];
  facts?: LegalFact[];
  contact?: LegalContactRow[];
};

/**
 * Un documento legal completo.
 *
 * El tipo es genérico a propósito: la política de privacidad es el primero,
 * pero unos términos de uso o un aviso legal se describen igual y reutilizan
 * el mismo renderizador sin tocarlo.
 */
export type LegalDocument = {
  eyebrow: string;
  title: string;
  /** Fecha ISO (YYYY-MM-DD) de la última actualización, si está confirmada. */
  updatedOn?: string;
  /** Párrafos de apertura, antes del primer apartado. */
  intro: string[];
  sections: LegalSection[];
};

/* --------------------------------------------------- Datos de la empresa */

function readOptional(name: string): string | undefined {
  const raw = process.env[name]?.trim();
  return raw ? raw : undefined;
}

/**
 * Fecha ISO de una variable de entorno.
 *
 * Se valida al cargar el módulo y, si está mal escrita, el build se detiene con
 * el motivo. Una fecha inválida en un documento legal no puede degradarse en
 * silencio: o la que consta es la correcta, o no consta ninguna.
 */
function readOptionalIsoDate(name: string): string | undefined {
  const raw = readOptional(name);
  if (!raw) return undefined;

  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw) || Number.isNaN(Date.parse(raw))) {
    throw new Error(
      `${name} no es una fecha válida: "${raw}". Formato esperado: YYYY-MM-DD.`,
    );
  }

  return raw;
}

/**
 * Razón social inscrita. Pendiente de confirmación escrita de Ardeno.
 *
 * Mientras esté vacía, el apartado «Data Controller» se publica sin ella: el
 * documento aprobado nombra a «Ardeno Group» y eso ya identifica al
 * responsable.
 */
export const LEGAL_ENTITY_NAME = readOptional("ARDENO_LEGAL_ENTITY_NAME");

/** Domicilio registral. Pendiente, igual que la razón social. */
export const LEGAL_REGISTERED_ADDRESS = readOptional(
  "ARDENO_LEGAL_REGISTERED_ADDRESS",
);

/**
 * Fecha de la última actualización de la política.
 *
 * El propio documento promete indicarla, así que en cuanto Ardeno confirme la
 * fecha de aprobación se configura aquí y aparece bajo el titular.
 */
export const PRIVACY_POLICY_UPDATED_ON = readOptionalIsoDate(
  "ARDENO_PRIVACY_POLICY_UPDATED_ON",
);

/**
 * Fecha larga en inglés, estable entre máquinas.
 *
 * `UTC` fijo y no la zona del proceso: la fecha de un documento legal no puede
 * cambiar de día según dónde se compile.
 */
export function formatLegalDate(isoDate: string): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${isoDate}T00:00:00Z`));
}
