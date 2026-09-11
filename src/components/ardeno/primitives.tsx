import { ArrowRight } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Primitivas del Ardeno Design DNA.
 *
 * Sin estado y sin efectos: son Server Components por defecto y también pueden
 * importarse desde un Client Component. Los estilos viven en globals.css
 * (clases `.ar-*`), portadas de dna.css y project-page.css.
 */

/* -------------------------------------------------------------- Contenedor */

/**
 * Contenedor de sitio: 1360px con gutter fluido, la anchura medida en
 * ardenogroup.com. Con `editorial` se estrecha al token de lectura, que es
 * independiente y no crece con el contenedor general.
 */
export function ArdenoContainer({
  className,
  editorial = false,
  ...props
}: ComponentProps<"div"> & { editorial?: boolean }) {
  return (
    <div
      className={cn("ar-wrap", editorial && "ar-wrap--editorial", className)}
      {...props}
    />
  );
}

/* ----------------------------------------------------------------- Eyebrow */

/** Etiqueta en versales con filete corto. Textura característica de la marca. */
export function ArdenoEyebrow({
  className,
  children,
  ...props
}: ComponentProps<"p">) {
  return (
    <p className={cn("ar-eyebrow", className)} {...props}>
      {children}
    </p>
  );
}

/* ---------------------------------------------------------------- Two-tone */

/**
 * Titular a dos tonos: las primeras palabras en sólido, las últimas en tinte.
 * Es el recurso tipográfico propio de Ardeno.
 */
export function TwoTone({
  lead,
  tail,
  as: Tag = "h2",
  className,
}: {
  lead: string;
  tail?: string;
  as?: "h1" | "h2" | "h3" | "p";
  className?: string;
}) {
  return (
    <Tag className={cn("ar-display", className)}>
      {lead}
      {tail ? (
        <>
          {" "}
          <span className="ar-tint">{tail}</span>
        </>
      ) : null}
    </Tag>
  );
}

/* ------------------------------------------------------------------ Botón */

export type ArdenoButtonVariant =
  | "brand"
  | "brand-on-dark"
  | "primary"
  | "secondary"
  | "light"
  | "ghost";

/** Las variantes que reproducen el CTA medido del sitio real. */
const BRAND_VARIANTS = new Set<ArdenoButtonVariant>(["brand", "brand-on-dark"]);

/**
 * Botón de la ficha.
 *
 * `brand` y `brand-on-dark` reproducen el CTA de ardenogroup.com tal y como
 * se midió: píldora de 60px con radio 50, etiqueta y disco navy de 40px con la
 * flecha girada -45º. Esa flecha es la misma que usa el sitio (el trazo
 * `M5 12h14m-7-7 7 7-7 7`, que es el `arrow-right` de Lucide), así que se toma
 * del paquete en lugar de redibujarla.
 *
 * El resto de variantes conservan la píldora compacta de 44px, que es la que
 * cabe en la cabecera de 78px.
 */
export function ArdenoButton({
  variant = "primary",
  type = "button",
  className,
  children,
  ...props
}: ComponentProps<"button"> & { variant?: ArdenoButtonVariant }) {
  return (
    <button
      type={type}
      className={cn("ar-btn", `ar-btn--${variant}`, className)}
      {...props}
    >
      <ArdenoButtonBody variant={variant}>{children}</ArdenoButtonBody>
    </button>
  );
}

/**
 * El mismo botón cuando lo que hace es llevar a otro sitio de la página.
 *
 * Los CTA del hero saltan al bloque de captación del cierre, que ya tiene el
 * formulario montado: eso es navegación, no una acción, así que es un enlace y
 * no un `<button>`. Con el ancla real el destino se puede abrir en otra
 * pestaña, copiar y compartir, y el teclado lo anuncia como lo que es.
 */
export function ArdenoLinkButton({
  variant = "primary",
  className,
  children,
  ...props
}: ComponentProps<"a"> & { variant?: ArdenoButtonVariant }) {
  return (
    <a className={cn("ar-btn", `ar-btn--${variant}`, className)} {...props}>
      <ArdenoButtonBody variant={variant}>{children}</ArdenoButtonBody>
    </a>
  );
}

/** Interior compartido: solo las variantes de marca llevan disco y flecha. */
function ArdenoButtonBody({
  variant,
  children,
}: {
  variant: ArdenoButtonVariant;
  children: ReactNode;
}) {
  if (!BRAND_VARIANTS.has(variant)) return <>{children}</>;

  return (
    <>
      <span className="ar-btn__label">{children}</span>
      <span className="ar-btn__mark" aria-hidden="true">
        <span className="ar-btn__disc" />
        <ArrowRight className="ar-btn__arrow" strokeWidth={2} />
      </span>
    </>
  );
}

/* -------------------------------------------------------------- Distintivo */

/**
 * Píldora de estado: "Now selling", "Available", "Sold".
 *
 * Toma el color de su contexto en lugar de tener uno propio. El estado
 * comercial es información, no alarma: pintar «vendido» de rojo lo convertiría
 * en un aviso, y lo que hace es simplemente cerrar una fila.
 */
export function ArdenoChip({
  children,
  dot = true,
  className,
}: {
  children: ReactNode;
  dot?: boolean;
  className?: string;
}) {
  return (
    <span className={cn("ar-chip", className)}>
      {dot ? <span className="ar-chip__dot" aria-hidden="true" /> : null}
      {children}
    </span>
  );
}

/* --------------------------------------------------------- Imagen pendiente */

/**
 * Estado explícito de ausencia de fotografía.
 *
 * No hay material gráfico del proyecto. En lugar de una imagen genérica o de
 * archivo —que induciría a error sobre cómo será el desarrollo— se muestra un
 * marco vacío con el símbolo de la marca en hueso sobre el hero oscuro, que es
 * su expresión "sobre navy". La nota es contenido real, no decoración: se
 * anuncia a lectores de pantalla.
 *
 * El símbolo se pinta con `mask` desde el token de color (ver globals.css): el
 * PNG aporta solo la silueta, así el hueso sale de la marca y no del archivo.
 */
export function ImagePending({
  note = "Project imagery pending",
  className,
}: {
  note?: string;
  className?: string;
}) {
  return (
    <figure className={cn("ar-pending", className)}>
      <span className="ar-pending__mark" aria-hidden="true" />
      <figcaption className="ar-pending__note">{note}</figcaption>
    </figure>
  );
}

/* ------------------------------------------------------------------- Campo */

/** Etiqueta + control + error, enlazados por id para lectores de pantalla. */
export function ArdenoField({
  id,
  label,
  error,
  optional = false,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  optional?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="ar-field">
      <label htmlFor={id}>
        {label}
        {optional ? (
          <span className="tracking-normal lowercase"> (optional)</span>
        ) : (
          <span aria-hidden="true" style={{ color: "var(--w-error)" }}>
            {" *"}
          </span>
        )}
      </label>
      {children}
      {error ? (
        <span className="ar-err" id={`${id}-error`}>
          {error}
        </span>
      ) : null}
    </div>
  );
}

export function ArdenoInput({ className, ...props }: ComponentProps<"input">) {
  return <input className={cn("ar-input", className)} {...props} />;
}

export function ArdenoTextarea({
  className,
  ...props
}: ComponentProps<"textarea">) {
  return <textarea className={cn("ar-input", className)} {...props} />;
}
