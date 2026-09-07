/**
 * Modelo público de proyecto — módulo de servidor.
 *
 * Contiene EXCLUSIVAMENTE datos verificados y aprobados para publicación.
 * Campos operativos o financieros (etapa, financiación, plazo, disponibilidad,
 * precio, valor estimado, socios, retorno, valor de salida) están AUSENTES del
 * tipo, no puestos a `null`: no existen, así que no pueden renderizarse ni
 * viajar a un componente cliente por descuido.
 *
 * Cuando el cliente verifique alguno, se añade aquí de forma explícita y se
 * diseña su estado en la interfaz. Hasta entonces, la ficha no los menciona.
 */

/** Una celda del snapshot: cifra grande sobre etiqueta en versales. */
export type PublicSnapshotItem = {
  readonly value: string;
  readonly label: string;
};

/**
 * Fotografía o render aprobado del proyecto.
 *
 * Su presencia —no el slug— decide qué hero se compone. Mientras sea
 * `undefined`, la ficha muestra el estado explícito de imagen pendiente en una
 * composición pensada para no tener media. En cuanto el cliente entregue
 * material verificado, se rellena y el hero cinematográfico entra sin tocar
 * componentes.
 */
export type PublicHeroMedia = {
  readonly src: string;
  readonly alt: string;
  readonly width: number;
  readonly height: number;
};

export type PublicProject = {
  readonly slug: string;
  readonly name: string;
  readonly city: string;
  readonly state: string;
  /** Abreviatura del estado para líneas de meta cortas. */
  readonly stateShort: string;
  readonly typology: string;
  readonly positioningLine: string;
  readonly snapshot: readonly PublicSnapshotItem[];
  /** Ausente mientras no haya material gráfico verificado del proyecto. */
  readonly heroMedia?: PublicHeroMedia;
};

const PUBLIC_PROJECTS: readonly PublicProject[] = [
  {
    slug: "720-sherrybrook",
    name: "720 Sherrybrook",
    city: "Raleigh",
    state: "North Carolina",
    stateShort: "NC",
    typology: "Four Single-Family Residences",
    positioningLine: "Four homes, one considered plan.",
    snapshot: [
      { value: "4", label: "Residences" },
      { value: "~2,118 SF", label: "Per residence" },
      { value: "Raleigh, NC", label: "Location" },
    ],
    // Sin `heroMedia`: no hay fotografía ni render aprobados del desarrollo.
    // No se rellena con imagen de archivo ni generada.
  },
];

/** Slugs publicados. Alimenta generateStaticParams. */
export function getPublishedProjectSlugs(): readonly string[] {
  return PUBLIC_PROJECTS.map((project) => project.slug);
}

/** Devuelve el proyecto publicado, o undefined si no existe. */
export function getPublicProject(slug: string): PublicProject | undefined {
  return PUBLIC_PROJECTS.find((project) => project.slug === slug);
}
