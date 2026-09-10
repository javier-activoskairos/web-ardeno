import { defineRouting } from "next-intl/routing";

// Ardeno sirve en inglés (primario) y español. El español queda preparado a
// nivel de rutas, pero la ficha de proyecto no se publica hasta que exista
// traducción aprobada. `always` mantiene el prefijo en ambos idiomas para que
// las URL canónicas (/en/..., /es/...) sean estables.
export const routing = defineRouting({
  locales: ["en", "es"],
  defaultLocale: "en",
  localePrefix: "always",
  /*
   * Sin cabecera `Link` de alternativas.
   *
   * Por defecto next-intl anuncia una alternativa por idioma declarado, así que
   * cada respuesta ofrecía `hreflang="es"` hacia `/es/...`, que devuelve 404
   * mientras no haya traducción aprobada. Un buscador que sigue ese enlace
   * encuentra una página inexistente y lo apunta contra el dominio.
   *
   * `es` sigue en `locales` a propósito: la arquitectura de rutas no cambia y
   * publicar el español será volver a poner esto en `true` —o declarar las
   * alternativas en la metadata— cuando exista contenido al otro lado.
   */
  alternateLinks: false,
});
