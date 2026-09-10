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
const LANDING_PATH = "/en/portfolio/720-sherrybrook";

const handleI18nRouting = createMiddleware(routing);

export default function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === "/") {
    const target = request.nextUrl.clone();
    target.pathname = LANDING_PATH;
    return NextResponse.redirect(target, 307);
  }

  return handleI18nRouting(request);
}

export const config = {
  // Aplica el routing de idioma a todo salvo API, internos y archivos estáticos.
  matcher: ["/((?!api|trpc|_next|_vercel|.*\\..*).*)"],
};
