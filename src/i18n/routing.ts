import { defineRouting } from "next-intl/routing";

// Ardeno sirve en inglés (primario) y español. El español queda preparado a
// nivel de rutas, pero la ficha de proyecto no se publica hasta que exista
// traducción aprobada. `always` mantiene el prefijo en ambos idiomas para que
// las URL canónicas (/en/..., /es/...) sean estables.
export const routing = defineRouting({
  locales: ["en", "es"],
  defaultLocale: "en",
  localePrefix: "always",
});
