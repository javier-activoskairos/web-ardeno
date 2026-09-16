import type { MetadataRoute } from "next";
import { IS_INDEXABLE, siteUrl } from "@/lib/site";

/**
 * `robots.txt`, decidido por el entorno de despliegue.
 *
 * Fuera de producción el archivo desautoriza el sitio entero y no anuncia el
 * sitemap: una preview alcanzable es, para un rastreador, un sitio como
 * cualquier otro, y publicaría en los buscadores renders provisionales y datos
 * pendientes de confirmar. `IS_INDEXABLE` solo es cierto en `production`, así
 * que un despliegue sin configurar cae del lado que no indexa.
 *
 * Esto es la señal cortés, no la cerradura: un rastreador que ignore
 * `robots.txt` sigue pudiendo leer. La cerradura es la autenticación del proxy,
 * y se pone en el bloque de despliegue.
 */
export default function robots(): MetadataRoute.Robots {
  if (!IS_INDEXABLE) {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: siteUrl("/sitemap.xml"),
  };
}
