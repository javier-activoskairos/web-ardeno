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
 *
 * El contrato y su frontera están descritos en `docs/data-contract.md`.
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
 * Un render de la galería.
 *
 * `width` y `height` son las dimensiones intrínsecas del archivo: reservan el
 * hueco antes de que la imagen llegue y evitan el salto de composición. Al
 * sustituir un render solo hay que tocarlas si cambian.
 */
export type PublicGalleryImage = {
  readonly src: string;
  readonly alt: string;
  readonly width: number;
  readonly height: number;
  readonly caption: string;
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
  /**
   * Identificador estable e interno. No se muestra, no viaja en la URL y no
   * cambia aunque cambie el slug. Es la clave con la que más adelante se
   * relacionarán proyecto, formulario, lead y fila de Notion.
   */
  readonly id: string;
  /**
   * Publicación explícita. Solo `true` sale del módulo: ni en los listados, ni
   * en el sitemap, ni escribiendo la URL a mano.
   */
  readonly published: boolean;
  /** Segmento de URL. Es de marketing y puede cambiar; el `id` no. */
  readonly slug: string;
  readonly name: string;
  readonly city: string;
  readonly state: string;
  readonly typology: string;
  readonly positioningLine: string;
  readonly snapshot: readonly PublicSnapshotItem[];
  /** Ausente mientras no haya material gráfico verificado del proyecto. */
  readonly heroMedia?: PublicHeroMedia;
  /** Ausente mientras no haya narrativa aprobada. La sección no se renderiza. */
  readonly story?: PublicStory;
  /** Ausente mientras no haya arquitectura aprobada. La sección no se renderiza. */
  readonly architecture?: PublicArchitecture;
  /**
   * Renders del proyecto. El primero hace de cubierta. Vacía o ausente, la
   * sección entera desaparece: ni título, ni botón, ni marcador de posición.
   */
  readonly gallery?: readonly PublicGalleryImage[];
};

/**
 * `satisfies` en lugar de anotación: comprueba la forma y además delata
 * propiedades sobrantes, que es justo lo que hay que impedir el día que estos
 * objetos dejen de escribirse a mano.
 */
const PROJECTS = [
  {
    id: "ardeno-720-sherrybrook",
    published: true,
    slug: "720-sherrybrook",
    name: "720 Sherrybrook",
    city: "Raleigh",
    state: "North Carolina",
    typology: "Four Single-Family Residences",
    positioningLine: "Four homes, one considered plan.",
    snapshot: [
      { value: "4", label: "Residences" },
      { value: "~2,118 SF", label: "Per residence" },
      { value: "Raleigh, NC", label: "Location" },
    ],
    heroMedia: {
      src: "/projects/720-sherrybrook/hero-front-exterior.jpg",
      alt: "Front exterior rendering of the four residences at 720 Sherrybrook.",
      width: 1672,
      height: 941,
    },
    // El primero es la cubierta. El hero no se repite aquí.
    gallery: [
      {
        src: "/projects/720-sherrybrook/exterior-rear.jpg",
        alt: "Rear exterior rendering of the four residences.",
        width: 1672,
        height: 941,
        caption: "Rear exterior",
      },
      {
        src: "/projects/720-sherrybrook/kitchen-island.jpg",
        alt: "Kitchen with a white quartz island and light oak cabinetry.",
        width: 1759,
        height: 1200,
        caption: "Kitchen",
      },
      {
        src: "/projects/720-sherrybrook/dining-living.jpg",
        alt: "Open dining and living area on the ground floor.",
        width: 2099,
        height: 1431,
        caption: "Dining and living",
      },
      {
        src: "/projects/720-sherrybrook/primary-suite.jpg",
        alt: "Primary suite with access to the private balcony.",
        width: 1448,
        height: 1086,
        caption: "Primary suite",
      },
      {
        src: "/projects/720-sherrybrook/primary-bathroom.jpg",
        alt: "Primary bathroom with double vanity and walk-in shower.",
        width: 1448,
        height: 1086,
        caption: "Primary bathroom",
      },
      {
        src: "/projects/720-sherrybrook/private-balcony.jpg",
        alt: "Private upper-floor balcony overlooking the backyard.",
        width: 1448,
        height: 1086,
        caption: "Private balcony",
      },
      {
        src: "/projects/720-sherrybrook/home-office.jpg",
        alt: "Dedicated home office on the upper floor.",
        width: 1419,
        height: 1064,
        caption: "Home office",
      },
    ],
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
] satisfies readonly PublicProject[];

/* ------------------------------------------------------------- Invariantes */

/**
 * Comprobaciones sobre los datos locales.
 *
 * Se ejecutan una sola vez, al cargar el módulo, y lanzan: así un dato mal
 * formado rompe el build en lugar de publicarse. No comprueban que los
 * archivos existan —eso es trabajo de un script aparte, no del runtime— y solo
 * corren en servidor: los componentes cliente importan tipos, que se borran al
 * compilar, así que nada de esto llega al navegador.
 */
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function assertProjectsAreValid(projects: readonly PublicProject[]): void {
  const fail = (id: string, message: string): never => {
    throw new Error(`Datos de proyecto inválidos (${id}): ${message}`);
  };
  const filled = (value: string) => value.trim().length > 0;
  const positiveInteger = (value: number) =>
    Number.isInteger(value) && value > 0;

  const seenIds = new Set<string>();
  const seenSlugs = new Set<string>();

  for (const project of projects) {
    const where = project.id || project.slug || "sin identificar";

    if (!filled(project.id)) fail(where, "`id` vacío");
    if (seenIds.has(project.id)) fail(where, "`id` duplicado");
    seenIds.add(project.id);

    if (!filled(project.slug)) fail(where, "`slug` vacío");
    if (!SLUG_PATTERN.test(project.slug))
      fail(where, `slug con formato inválido: "${project.slug}"`);
    if (seenSlugs.has(project.slug)) fail(where, "`slug` duplicado");
    seenSlugs.add(project.slug);

    for (const field of [
      "name",
      "city",
      "state",
      "typology",
      "positioningLine",
    ] as const) {
      if (!filled(project[field])) fail(where, `\`${field}\` vacío`);
    }

    if (project.snapshot.length < 1 || project.snapshot.length > 4)
      fail(
        where,
        `snapshot con ${project.snapshot.length} celdas; se esperan 1-4`,
      );
    for (const item of project.snapshot) {
      if (!filled(item.value) || !filled(item.label))
        fail(where, "celda de snapshot con `value` o `label` vacío");
    }

    // Solo rutas locales: nada de orígenes remotos ni protocolo relativo.
    const assertMedia = (
      media: { src: string; alt: string; width: number; height: number },
      kind: string,
    ) => {
      if (!media.src.startsWith("/") || media.src.startsWith("//"))
        fail(where, `${kind}: \`src\` debe ser una ruta local: "${media.src}"`);
      if (/^[a-z][a-z0-9+.-]*:/i.test(media.src))
        fail(where, `${kind}: \`src\` no puede ser una URL remota`);
      if (!filled(media.alt)) fail(where, `${kind}: \`alt\` vacío`);
      if (!positiveInteger(media.width) || !positiveInteger(media.height))
        fail(where, `${kind}: \`width\` y \`height\` deben ser enteros > 0`);
    };

    if (project.heroMedia) assertMedia(project.heroMedia, "heroMedia");

    if (project.gallery) {
      if (project.gallery.length === 0)
        fail(where, "`gallery` presente pero vacía; omítela en su lugar");
      for (const image of project.gallery) {
        assertMedia(image, "gallery");
        if (!filled(image.caption)) fail(where, "gallery: `caption` vacío");
      }
    }
  }
}

assertProjectsAreValid(PROJECTS);

/* ------------------------------------------------------------------ Origen */

/**
 * Origen de proyectos.
 *
 * Es asíncrono a propósito, aunque hoy los datos estén en memoria: el día que
 * lleguen de Notion no habrá que tocar ni las funciones públicas ni la página.
 * Un origen solo devuelve proyectos publicados; el filtro no es cosa de quien
 * consume.
 */
export type ProjectSource = {
  listPublished(): Promise<readonly PublicProject[]>;
  getBySlug(slug: string): Promise<PublicProject | undefined>;
};

export const localProjectSource: ProjectSource = {
  async listPublished() {
    return PROJECTS.filter((project) => project.published);
  },
  async getBySlug(slug) {
    return PROJECTS.find(
      (project) => project.published && project.slug === slug,
    );
  },
};

/** El origen en uso. Aquí se enchufará el adaptador de Notion. */
const source: ProjectSource = localProjectSource;

/* --------------------------------------------------------- API del módulo */

/** Proyectos publicados. */
export function getPublishedProjects(): Promise<readonly PublicProject[]> {
  return source.listPublished();
}

/** Slugs publicados. Alimenta `generateStaticParams` y el sitemap. */
export async function getPublishedProjectSlugs(): Promise<readonly string[]> {
  return (await source.listPublished()).map((project) => project.slug);
}

/**
 * Devuelve el proyecto publicado, o `undefined`. Un proyecto sin publicar no
 * es alcanzable ni escribiendo su URL.
 */
export function getPublicProject(
  slug: string,
): Promise<PublicProject | undefined> {
  return source.getBySlug(slug);
}
