import { defineRouting } from "next-intl/routing";

// Ardeno sirve en inglés (primario) y español. El español queda preparado a
// nivel de rutas, pero la ficha de proyecto no se publica hasta que exista
// traducción aprobada.
//
// `as-needed`: el inglés se sirve sin prefijo —/portfolio/sherrybrook— y el
// español lo conserva —/es/portfolio/...—. La URL publicada es la que se
// imprime en carteles y códigos QR, así que carga con un prefijo de idioma que
// no distingue nada mientras solo haya un idioma publicado. Al añadir el
// español, la URL inglesa no cambia y la nueva nace prefijada.
//
// next-intl redirige `/en/...` a su forma sin prefijo, así que los enlaces ya
// compartidos con prefijo siguen llegando.
export const routing = defineRouting({
  locales: ["en", "es"],
  defaultLocale: "en",
  localePrefix: "as-needed",
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
