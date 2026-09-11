import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { IS_INDEXABLE } from "./src/lib/site";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

/**
 * Cabeceras de seguridad de base.
 *
 * Deliberadamente un mínimo verificable, no una política completa. La CSP se
 * limita a `frame-ancestors 'none'`: es la parte que no depende de cómo Next
 * inyecte sus scripts, así que protege contra el embebido sin exigir nonces ni
 * tocar la arquitectura de scripts. Una `script-src` estricta llegará en su
 * propio bloque, con el trabajo de nonces que requiere.
 *
 * Nada de esto afecta a las fuentes: Hanken Grotesk se descarga en el build y
 * se sirve desde `/_next/static/media`, mismo origen.
 */
const SECURITY_HEADERS = [
  // El navegador respeta el `Content-Type` declarado en vez de adivinarlo.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Al salir a otro dominio solo viaja el origen, y nunca desde https a http.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Contra el clickjacking. `X-Frame-Options` para lo antiguo…
  { key: "X-Frame-Options", value: "DENY" },
  // …y `frame-ancestors`, que es lo que miran los navegadores actuales.
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
  // La ficha no usa ninguna de las tres: se deniegan de raíz.
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

/**
 * Fuera de producción, todas las respuestas salen con `X-Robots-Tag`.
 *
 * Es el complemento de `robots.txt` y de la metadata: la cabecera cubre también
 * lo que no lleva `<head>` —imágenes, `sitemap.xml`, respuestas de la API—, que
 * es justo lo que un buscador puede indexar por su cuenta aunque la página que
 * las enmarca diga `noindex`.
 */
const NO_INDEX_HEADER = {
  key: "X-Robots-Tag",
  value: "noindex, nofollow, noarchive",
};

const nextConfig: NextConfig = {
  // No anunciar el framework ni su presencia.
  poweredByHeader: false,

  // Imágenes remotas permitidas por proyecto (añadir dominios del cliente).
  images: {
    remotePatterns: [],
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: IS_INDEXABLE
          ? SECURITY_HEADERS
          : [...SECURITY_HEADERS, NO_INDEX_HEADER],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
