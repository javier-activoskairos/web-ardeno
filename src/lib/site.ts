/**
 * Configuración del propio Ardeno Group, no de un proyecto.
 *
 * Vive aquí y no en `projects.ts` porque no cambia de una ficha a otra: la
 * dirección de contacto es la misma en 720 Sherrybrook que en el siguiente
 * desarrollo. El día que existan varias oficinas, eso pasa a ser un dato del
 * proyecto y no antes.
 *
 * Es además el único sitio donde se resuelven el entorno de despliegue y la
 * URL pública del sitio. Antes cada módulo leía `process.env` por su cuenta
 * —layout, robots, sitemap y el endpoint de captación repetían el mismo
 * `?? "http://localhost:3000"`—, así que bastaba con olvidarse de uno para que
 * el canonical, el sitemap y la validación de origen dejaran de coincidir.
 *
 * MÓDULO DE SERVIDOR. `ARDENO_DEPLOYMENT_ENV` no lleva prefijo `NEXT_PUBLIC_`
 * a propósito: es una decisión de infraestructura, no información para el
 * navegador. Ningún componente cliente importa este módulo, y si algún día lo
 * hiciera, Next no inlinearía la variable y el entorno se leería como `local`
 * —el valor seguro—, nunca el real.
 */

/* ------------------------------------------------------------- Contacto */

export const CONTACT_EMAIL = "contact@ardenogroup.com";
export const CONTACT_PHONE = "+1 (984) 999-8856";
/** Forma marcable del teléfono, para el `href` de `tel:`. */
export const CONTACT_PHONE_HREF = "+19849998856";
export const COMPANY_LOCATION = "Raleigh, North Carolina (USA)";

/* --------------------------------------------------- Entorno de despliegue */

/**
 * Dónde se está sirviendo esto.
 *
 * - `local` — desarrollo en la máquina de quien programa.
 * - `preview` — la instancia interna del VPS de Ardeno, para revisar antes de
 *   publicar. No es pública aunque sea alcanzable.
 * - `production` — el sitio real, y el único que puede indexarse.
 */
export type DeploymentEnv = "local" | "preview" | "production";

const DEPLOYMENT_ENVS: readonly DeploymentEnv[] = [
  "local",
  "preview",
  "production",
];

/**
 * Ausente es `local`, que es el valor seguro: un despliegue mal configurado se
 * comporta como una máquina de desarrollo —sin indexar— en vez de como el sitio
 * real. Un valor escrito mal no se redondea al más cercano: se rechaza, porque
 * `ARDENO_DEPLOYMENT_ENV=prod` que silenciosamente valiera `local` dejaría el
 * sitio real fuera de los buscadores sin que nadie se enterara.
 */
function readDeploymentEnv(): DeploymentEnv {
  const raw = process.env.ARDENO_DEPLOYMENT_ENV?.trim();
  if (!raw) return "local";

  if (!(DEPLOYMENT_ENVS as readonly string[]).includes(raw)) {
    throw new Error(
      `ARDENO_DEPLOYMENT_ENV no válido: "${raw}". ` +
        `Valores admitidos: ${DEPLOYMENT_ENVS.join(", ")}.`,
    );
  }

  return raw as DeploymentEnv;
}

export const DEPLOYMENT_ENV: DeploymentEnv = readDeploymentEnv();

/**
 * Si los buscadores pueden indexar. Solo producción.
 *
 * Se deriva del entorno en lugar de tener interruptor propio: dos variables
 * para lo mismo acaban contradiciéndose, y la que se olvida siempre es la que
 * protege.
 */
export const IS_INDEXABLE = DEPLOYMENT_ENV === "production";

/* ------------------------------------------------------- URL pública */

const LOCAL_SITE_URL = "http://localhost:3000";

const LOOPBACK_HOSTNAMES = new Set([
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "::1",
  "[::1]",
]);

/**
 * Deja la URL en su forma canónica: solo origen, sin barra final y sin ruta.
 *
 * Todo lo que se compone después —canonical, Open Graph, sitemap— concatena
 * rutas que ya empiezan por `/`. Con la barra final puesta salían `//en/...`,
 * que los buscadores tratan como una URL distinta.
 */
function normalizeSiteUrl(value: string): string {
  return new URL(value).origin;
}

/**
 * La URL pública del sitio, ya normalizada.
 *
 * En `local` puede faltar y se asume `http://localhost:3000`. En `preview` y
 * `production` es obligatoria, tiene que ser HTTPS y no puede apuntar a la
 * propia máquina: un sitio desplegado que se anuncia a sí mismo como
 * `localhost` publica un sitemap y unos canonical que no llevan a ninguna
 * parte. Si algo de eso falla, esto lanza al cargar el módulo y el build se
 * detiene con el motivo escrito, en lugar de desplegar una preview rota.
 */
function readSiteUrl(environment: DeploymentEnv): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (environment === "local") {
    if (!raw) return LOCAL_SITE_URL;
    try {
      return normalizeSiteUrl(raw);
    } catch {
      throw new Error(`NEXT_PUBLIC_SITE_URL no es una URL válida: "${raw}".`);
    }
  }

  const requirement =
    `En ARDENO_DEPLOYMENT_ENV=${environment}, NEXT_PUBLIC_SITE_URL es ` +
    `obligatoria y debe ser una URL HTTPS absoluta del dominio real ` +
    `(por ejemplo https://preview.ardenogroup.com).`;

  if (!raw) {
    throw new Error(`NEXT_PUBLIC_SITE_URL no está definida. ${requirement}`);
  }

  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    throw new Error(
      `NEXT_PUBLIC_SITE_URL no es una URL válida: "${raw}". ${requirement}`,
    );
  }

  if (parsed.protocol !== "https:") {
    throw new Error(
      `NEXT_PUBLIC_SITE_URL debe usar https (recibido "${parsed.protocol}//"). ${requirement}`,
    );
  }

  if (LOOPBACK_HOSTNAMES.has(parsed.hostname)) {
    throw new Error(
      `NEXT_PUBLIC_SITE_URL apunta a la propia máquina ("${parsed.hostname}"). ${requirement}`,
    );
  }

  return normalizeSiteUrl(raw);
}

export const SITE_URL = readSiteUrl(DEPLOYMENT_ENV);

/**
 * Compone una URL absoluta del sitio a partir de una ruta.
 *
 * Acepta la ruta con o sin barra inicial y nunca produce barras duplicadas:
 * es la única forma admitida de construir enlaces absolutos, para que canonical,
 * Open Graph y sitemap no puedan divergir entre sí.
 */
export function siteUrl(path = "/"): string {
  if (!path || path === "/") return SITE_URL;
  return `${SITE_URL}/${path.replace(/^\/+/, "")}`;
}
