import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "./routing";

/**
 * Configuración de next-intl por petición.
 *
 * La zona horaria se fija de forma explícita. Sin ella, next-intl toma la del
 * proceso que renderiza y la serializa en el payload RSC, con lo que la
 * máquina de build acababa filtrándose a la página —en local aparecía una
 * zona europea que nada tiene que ver con el proyecto—. Ardeno promueve en
 * Carolina del Norte, así que la referencia es `America/New_York` y el
 * resultado deja de depender de dónde se compile.
 */
const TIME_ZONE = "America/New_York";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    timeZone: TIME_ZONE,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
