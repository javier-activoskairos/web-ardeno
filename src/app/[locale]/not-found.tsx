import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

/**
 * 404 localizado.
 *
 * Es la página que ven las rutas en español mientras la ficha no tenga
 * traducción aprobada, así que no muestra copy de proyecto ni de plantilla:
 * solo el aviso y una salida.
 */
export default async function NotFound() {
  const t = await getTranslations("NotFound");

  return (
    <div className="ar-page flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <h1 className="ar-display">{t("title")}</h1>
      <p className="ar-body mt-4">{t("body")}</p>
      <Link href="/" className="ar-btn ar-btn--primary mt-8">
        {t("action")}
      </Link>
    </div>
  );
}
