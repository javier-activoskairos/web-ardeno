import type { ComponentProps, ReactNode } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Primitivas del Ardeno Design DNA.
 *
 * Sin estado y sin efectos: son Server Components por defecto y también pueden
 * importarse desde un Client Component. Los estilos viven en globals.css
 * (clases `.ar-*`), portadas de dna.css y project-page.css.
 */

/* -------------------------------------------------------------- Contenedor */

/** Columna editorial centrada de 1040px con gutter fluido. */
export function ArdenoContainer({
  className,
  ...props
}: ComponentProps<"div">) {
  return <div className={cn("ar-wrap", className)} {...props} />;
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

export type ArdenoButtonVariant = "primary" | "secondary" | "light" | "ghost";

/** Píldora de 44px. Cuatro variantes, sin sombras ni degradados. */
export function ArdenoButton({
  variant = "primary",
  type = "button",
  className,
  ...props
}: ComponentProps<"button"> & { variant?: ArdenoButtonVariant }) {
  return (
    <button
      type={type}
      className={cn("ar-btn", `ar-btn--${variant}`, className)}
      {...props}
    />
  );
}

/* --------------------------------------------------------- Imagen pendiente */

/**
 * Estado explícito de ausencia de fotografía.
 *
 * No hay material gráfico del proyecto. En lugar de una imagen genérica o de
 * archivo —que induciría a error sobre cómo será el desarrollo— se muestra una
 * plancha vacía con el símbolo de la marca y una nota legible. La nota es
 * contenido real, no decoración: se anuncia a lectores de pantalla.
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
      <Image
        src="/logos/ardeno-symbol-navy.png"
        alt=""
        width={1215}
        height={1442}
        priority
        sizes="200px"
        className="ar-pending__mark"
      />
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
