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

/**
 * Narrativa del proyecto: lo que el snapshot resume, contado en prosa.
 *
 * `body` son párrafos ya redactados y aprobados; nunca HTML, nunca texto que
 * el componente componga por su cuenta.
 */
export type PublicStory = {
  readonly eyebrow?: string;
  readonly headline: string;
  readonly body: readonly string[];
};

/**
 * Arquitectura y uso.
 *
 * `facts` son cifras y recuentos escaneables —desarrollan el snapshot, no lo
 * repiten—; `details` son los tres bloques de prosa que los acompañan.
 */
export type PublicArchitecture = {
  readonly headline: string;
  readonly facts: readonly { readonly label: string; readonly value: string }[];
  readonly details: readonly {
    readonly title: string;
    readonly body: string;
  }[];
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
  /** Ausente mientras no haya narrativa aprobada. La sección no se renderiza. */
  readonly story?: PublicStory;
  /** Ausente mientras no haya arquitectura aprobada. La sección no se renderiza. */
  readonly architecture?: PublicArchitecture;
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
    story: {
      eyebrow: "The project",
      headline: "Modern design, natural light and warm materials.",
      body: [
        "Each of the four residences at 720 Sherrybrook combines bright, functional interiors with custom light oak millwork, white quartz countertops, and large black-framed openings that connect every room to the outdoors.",
        "A contemporary, warm, and timeless language — designed for everyday living.",
      ],
    },
    architecture: {
      headline: "Architecture and living",
      facts: [
        { label: "Ground floor", value: "982 SF" },
        { label: "Upper floor", value: "1,136 SF" },
        { label: "Bedrooms", value: "3 + office" },
        { label: "Bathrooms", value: "2 full" },
        { label: "Stories", value: "2" },
        { label: "Outdoor spaces", value: "Patio + balcony" },
      ],
      details: [
        {
          title: "Interiors",
          body: "Engineered light oak flooring, white quartz island and countertops, custom natural oak cabinetry, recessed LED and indirect lighting, and floor-to-ceiling openings with matte black aluminum frames.",
        },
        {
          title: "Outdoor living",
          body: "A private patio with a built-in grill in every residence, an upper-floor balcony overlooking the backyard, floor-to-ceiling sliding doors, and low-maintenance native landscaping.",
        },
        {
          title: "Exterior",
          body: "White vertical siding, gabled rooflines, matte black frames, and natural wood accents create a contemporary and restrained material palette.",
        },
      ],
    },
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
