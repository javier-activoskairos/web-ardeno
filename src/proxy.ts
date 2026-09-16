import { NextResponse, type NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

/**
 * Convención `proxy` de Next.js 16 (sustituye a `middleware`).
 *
 * Hace dos cosas, en este orden:
 *
 * 1. Manda la raíz del dominio a la única ficha publicada, de un solo salto.
 *    Sin esto, `/` caía en el middleware de idioma, que redirigía a `/en`, y
 *    `/en` volvía a redirigir a la ficha: dos saltos encadenados para llegar
 *    al mismo sitio. Un rastreador los ve como redirecciones en cadena y quien
 *    entra por el dominio paga dos viajes.
 * 2. Delega en next-intl todo lo demás, que es el routing de idioma.
 *
 * La redirección es temporal (307) a propósito, igual que la de `/[locale]`:
 * desaparece en cuanto exista la home de Ardeno y no debe quedarse cacheada
 * como permanente en navegadores ni intermediarios. Al construir la home real,
 * se retira `LANDING_PATH` de aquí y de `src/app/[locale]/page.tsx`.
 */

/** Destino temporal de la raíz. Es el mismo que usa `/[locale]`. */
const LANDING_PATH = "/portfolio/sherrybrook";

/**
 * Slugs retirados y su destino actual.
 *
 * Una ficha ya compartida no puede romperse porque su URL se acorte: el enlace
 * vive en conversaciones, correos y —en cuanto se imprima— en un cartel. Se
 * entra por aquí con cualquier prefijo de idioma y se sale por la URL
 * publicada, sin prefijo.
 *
 * Es un 307 y no un 308 a propósito: mientras el dominio definitivo no esté
 * cerrado, una redirección permanente cacheada en el navegador de alguien es
 * muy difícil de retirar.
 */
const RETIRED_SLUGS: Record<string, string> = {
  "720-sherrybrook": "sherrybrook",
};

const PORTFOLIO_PATH = /^\/(?:en\/|es\/)?portfolio\/([^/]+)\/?$/;

const handleI18nRouting = createMiddleware(routing);

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/") {
    const target = request.nextUrl.clone();
    target.pathname = LANDING_PATH;
    return NextResponse.redirect(target, 307);
  }

  const retired = PORTFOLIO_PATH.exec(pathname)?.[1];
  if (retired && retired in RETIRED_SLUGS) {
    const target = request.nextUrl.clone();
    target.pathname = `/portfolio/${RETIRED_SLUGS[retired]}`;
    return NextResponse.redirect(target, 307);
  }

  return handleI18nRouting(request);
}

export const config = {
  // Aplica el routing de idioma a todo salvo API, internos y archivos estáticos.
  matcher: ["/((?!api|trpc|_next|_vercel|.*\\..*).*)"],
};
