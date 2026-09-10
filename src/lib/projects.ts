/**
 * Modelo público de proyecto — módulo de servidor.
 *
 * Contiene EXCLUSIVAMENTE datos verificados y aprobados para publicación.
 * Campos financieros u operativos internos (financiación, precio, valor
 * estimado, socios, retorno, valor de salida) están AUSENTES del tipo, no
 * puestos a `null`: no existen, así que no pueden renderizarse ni viajar a un
 * componente cliente por descuido.
 *
 * La disponibilidad comercial —qué residencias siguen abiertas— forma parte del
 * contrato desde el rediseño v3, porque es información de venta que el
 * comprador necesita. Los precios siguen fuera: la ficha dice explícitamente
 * que los comparte el equipo.
 *
 * Que un campo quepa en el contrato no significa que su valor esté verificado.
 * Hoy 720 Sherrybrook publica MENOS de lo que el tipo admite: la entrega
 * estimada, la disponibilidad por residencia y el distintivo de estado están
 * retirados a la espera de confirmación escrita de Ardeno. La capacidad sigue
 * en pie; lo que falta es el dato.
 *
 * Toda sección es opcional salvo la identidad, el posicionamiento y el
 * snapshot. Un proyecto con menos datos aprobados recorre la misma plantilla
 * con menos paradas: la sección que no tiene dato no se emite.
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
 * Es la forma común de todo medio del contrato: la usan `heroMedia` y los
 * capítulos editoriales. No se duplica por sección; si algún día un rol
 * necesita un campo propio, se extiende ahí y no aquí.
 *
 * En el hero, su presencia —no el slug— decide qué composición se emite.
 * Mientras sea `undefined`, la ficha muestra el estado explícito de imagen
 * pendiente en una composición pensada para no tener media.
 */
export type PublicMedia = {
  readonly src: string;
  readonly alt: string;
  readonly width: number;
  readonly height: number;
  /** Pie corto en versales. Ausente, la imagen va sin pie. */
  readonly caption?: string;
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
 * repiten—; `details` son los bloques de prosa que los acompañan, tantos como
 * haya aprobados. La retícula se ajusta al recuento: uno solo ocupa su fila
 * entera en lugar de dejar columnas vacías.
 */
export type PublicArchitecture = {
  readonly eyebrow?: string;
  readonly headline: string;
  readonly facts: readonly { readonly label: string; readonly value: string }[];
  readonly details: readonly {
    readonly title: string;
    readonly body: string;
  }[];
};

/**
 * Capítulo editorial: un tramo de prosa con su render.
 *
 * Es el recurso con el que la ficha alterna texto e imagen durante el scroll en
 * lugar de acumular párrafos. Deliberadamente mínimo:
 *
 * - `id` da clave estable y ancla; no se muestra.
 * - No hay campo de disposición. Qué lado ocupa la imagen lo decide la
 *   composición a partir de la posición, no el dato: un editor no debe tener
 *   que pensar en columnas.
 * - `highlights` son los cuatro o cinco materiales y acabados que el texto
 *   menciona, listados para quien escanea en lugar de leer. Ausente, el
 *   capítulo es solo prosa.
 */
export type PublicEditorialSection = {
  readonly id: string;
  /** Rótulo en versales: "Interiors", "Outdoor living". */
  readonly eyebrow?: string;
  readonly title: string;
  readonly body: string;
  readonly highlights?: readonly string[];
  readonly media: PublicMedia;
};

/**
 * Estado comercial de una residencia.
 *
 * Tres valores cerrados y nada más: no hay "próximamente", ni "última
 * oportunidad", ni ningún matiz que induzca urgencia. La interfaz decide cómo
 * se pinta cada uno; el dato solo dice cuál es.
 */
export type PublicUnitStatus = "available" | "reserved" | "sold";

/**
 * Disponibilidad por residencia.
 *
 * Sin precios: el propio bloque explica que los comparte el equipo junto al
 * calendario de obra. `note` es esa explicación, y es obligatoria: publicar
 * estados de venta sin decir cómo se obtiene el precio deja la pregunta
 * evidente sin responder.
 */
export type PublicAvailability = {
  readonly eyebrow?: string;
  readonly headline: string;
  readonly note: string;
  readonly units: readonly {
    /** Clave estable de la fila; no se muestra. */
    readonly id: string;
    readonly name: string;
    /** Superficie interior, ya formateada: "2,180 SF". */
    readonly interior: string;
    readonly bedrooms: string;
    readonly status: PublicUnitStatus;
  }[];
};

/**
 * Emplazamiento y distancias.
 *
 * `distances` son tiempos de trayecto verificados, con su unidad ya escrita:
 * el componente no calcula, no convierte y no ordena.
 */
export type PublicLocation = {
  readonly eyebrow?: string;
  readonly headline: string;
  readonly body: string;
  readonly distances: readonly {
    readonly label: string;
    readonly value: string;
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
  /**
   * Estado comercial del conjunto, en dos o tres palabras: "Now selling".
   * Se pinta como distintivo junto al CTA del hero. Ausente, no hay distintivo.
   */
  readonly status?: string;
  readonly snapshot: readonly PublicSnapshotItem[];
  /** Ausente mientras no haya material gráfico verificado del proyecto. */
  readonly heroMedia?: PublicMedia;
  /** Ausente mientras no haya narrativa aprobada. La sección no se renderiza. */
  readonly story?: PublicStory;
  /**
   * Capítulos editoriales, en el orden en el que se leen. Ausente o vacía, no
   * se emite ni un `<section>`: la narrativa enlaza directamente con lo que
   * venga después, sin título, sin separador y sin hueco.
   */
  readonly editorialSections?: readonly PublicEditorialSection[];
  /** Ausente mientras el cliente no verifique los estados de venta. */
  readonly availability?: PublicAvailability;
  /** Ausente mientras no haya arquitectura aprobada. La sección no se renderiza. */
  readonly architecture?: PublicArchitecture;
  /**
   * Renders del proyecto. El primero hace de cubierta. Vacía o ausente, la
   * sección entera desaparece: ni título, ni botón, ni marcador de posición.
   */
  readonly gallery?: readonly PublicGalleryImage[];
  /** Ausente mientras no haya distancias verificadas. */
  readonly location?: PublicLocation;
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
    typology: "Four attached residences",
    // La tesis del hero y el titular de la historia intercambian su sitio: el
    // hero abre con la promesa material, que es lo que engancha, y la historia
    // titula con el plan, que es lo que desarrolla. Mismo copy aprobado, sin
    // una sola frase repetida entre las dos secciones.
    positioningLine: "Modern design, natural light and warm materials.",
    // `status` ("Now selling") viaja con la disponibilidad: es la misma
    // afirmación comercial resumida en dos palabras, y sin la tabla que la
    // sostenga quedaría además huérfana. Retirada hasta confirmación escrita;
    // el campo es opcional y el hero deja de pintar el distintivo del CTA.

    // La celda de entrega estimada ("Q2 2027") está RETIRADA hasta que Ardeno
    // la confirme por escrito: es una afirmación comercial sobre un plazo de
    // obra y nadie la ha verificado. El snapshot admite de 1 a 4 celdas y la
    // retícula sale de `snapshot.length`, así que con tres se reequilibra sola.
    snapshot: [
      { value: "4", label: "Residences" },
      { value: "2,050–2,180 SF", label: "Per residence" },
      { value: "3 + office", label: "Bedrooms" },
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
        width: 1602,
        height: 942,
        caption: "Kitchen",
      },
      {
        src: "/projects/720-sherrybrook/dining-living.jpg",
        alt: "Open dining and living area on the ground floor.",
        width: 1912,
        height: 1118,
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
      headline: "Four homes, one considered plan.",
      body: [
        "The Sherrybrook residences draw inspiration from Scandinavian design, pairing cleanly detailed interiors and exteriors with warm, natural materials.",
        "Light wood finishes and an open plan create welcoming living spaces that emphasize simplicity, comfort, and crafted functionality. Private gardens connect the living areas to outdoors, offering quiet retreats and a close connection to nature. Elevated front porches create a sense of community for this enclave.",
      ],
    },
    /*
     * Cada capítulo se lee junto al render que describe. Los renders son los
     * mismos archivos que la galería y aparecen también en el visor. No es
     * repetición: el visor es el archivo visual completo del proyecto, no otro
     * bloque del scroll.
     */
    editorialSections: [
      {
        id: "interiors",
        eyebrow: "Interiors",
        title: "Light oak, quartz and black steel.",
        body: "Engineered light oak flooring, white quartz island and countertops, custom natural oak cabinetry, recessed LED and indirect lighting, and floor-to-ceiling openings with matte black aluminum frames.",
        highlights: [
          "Light oak flooring",
          "White quartz surfaces",
          "Custom oak millwork",
          "Matte black frames",
        ],
        media: {
          src: "/projects/720-sherrybrook/kitchen-island.jpg",
          alt: "Kitchen with a white quartz island and light oak cabinetry.",
          width: 1602,
          height: 942,
          caption: "Interior render · kitchen",
        },
      },
      {
        id: "outdoor-living",
        eyebrow: "Outdoor living",
        title: "Every room opens to the outdoors.",
        body: "A private patio with a built-in grill in every residence, an upper-floor balcony overlooking the backyard, floor-to-ceiling sliding doors, and low-maintenance native landscaping.",
        highlights: [
          "Patio with grill",
          "Upper balcony",
          "Sliding glass doors",
          "Native landscaping",
        ],
        media: {
          src: "/projects/720-sherrybrook/private-balcony.jpg",
          alt: "Private upper-floor balcony overlooking the backyard.",
          width: 1448,
          height: 1086,
          caption: "Exterior render · upper balcony",
        },
      },
    ],
    /*
     * `availability` está RETIRADA hasta que Ardeno confirme por escrito qué
     * residencias siguen abiertas. Publicar que una unidad está vendida o
     * reservada es una afirmación comercial sobre una venta concreta, y ninguna
     * de las cuatro estaba verificada.
     *
     * Se retira el DATO, no la capacidad: el tipo `PublicAvailability`, los
     * invariantes, `ProjectAvailability` y su CSS siguen intactos. Al ser un
     * campo opcional, la sección desaparece entera —sin título, sin filete y
     * sin el hueco que ocupaba— y vuelve escribiendo otra vez esta clave.
     */
    architecture: {
      eyebrow: "Specifications",
      headline: "Architecture and living",
      facts: [
        { label: "Ground floor", value: "982 SF" },
        { label: "Upper floor", value: "1,136 SF" },
        { label: "Bedrooms", value: "3 + office" },
        { label: "Bathrooms", value: "2 full" },
        { label: "Stories", value: "2" },
        { label: "Outdoor spaces", value: "Patio + balcony" },
      ],
      // Interiors y Outdoor living viven en `editorialSections`, donde cada uno
      // se lee junto a su render. Aquí queda lo que describe el conjunto
      // construido, que es de lo que va esta sección.
      details: [
        {
          title: "Exterior",
          body: "White vertical siding, gabled rooflines, matte black frames, and natural wood accents create a contemporary and restrained material palette.",
        },
        {
          title: "Systems",
          body: "High-efficiency HVAC, tankless water heating, and an insulated envelope built to current North Carolina energy code with Habitech Builders.",
        },
        {
          title: "Parking",
          body: "One covered space and one driveway space per residence, with dedicated guest parking along the shared entry court.",
        },
      ],
    },
    location: {
      eyebrow: "Location",
      headline: "Inside the beltline, minutes from downtown Raleigh",
      body: "Wake County adds roughly 100 new residents a day. Sherrybrook sits on a quiet residential street with direct access to the corridors that carry that growth.",
      distances: [
        { label: "Downtown Raleigh", value: "9 min" },
        { label: "North Carolina State University", value: "12 min" },
        { label: "Research Triangle Park", value: "24 min" },
        { label: "RDU International Airport", value: "21 min" },
        { label: "Nearest elementary school", value: "6 min" },
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

const UNIT_STATUSES: readonly PublicUnitStatus[] = [
  "available",
  "reserved",
  "sold",
];

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

    if (project.status !== undefined && !filled(project.status))
      fail(where, "`status` presente pero vacío; omítalo en su lugar");

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
    const assertMedia = (media: PublicMedia, kind: string) => {
      if (!media.src.startsWith("/") || media.src.startsWith("//"))
        fail(where, `${kind}: \`src\` debe ser una ruta local: "${media.src}"`);
      if (/^[a-z][a-z0-9+.-]*:/i.test(media.src))
        fail(where, `${kind}: \`src\` no puede ser una URL remota`);
      if (!filled(media.alt)) fail(where, `${kind}: \`alt\` vacío`);
      if (!positiveInteger(media.width) || !positiveInteger(media.height))
        fail(where, `${kind}: \`width\` y \`height\` deben ser enteros > 0`);
      if (media.caption !== undefined && !filled(media.caption))
        fail(where, `${kind}: \`caption\` presente pero vacío`);
    };

    if (project.heroMedia) assertMedia(project.heroMedia, "heroMedia");

    if (project.gallery) {
      if (project.gallery.length === 0)
        fail(where, "`gallery` presente pero vacía; omítala en su lugar");
      for (const image of project.gallery) {
        assertMedia(image, "gallery");
        if (!filled(image.caption)) fail(where, "gallery: `caption` vacío");
      }
    }

    if (project.editorialSections) {
      if (project.editorialSections.length === 0)
        fail(
          where,
          "`editorialSections` presente pero vacía; omítela en su lugar",
        );
      // El `id` es la clave de React y el ancla del titular: dos iguales darían
      // dos `id` de HTML repetidos y un `aria-labelledby` ambiguo.
      const seenSectionIds = new Set<string>();
      for (const section of project.editorialSections) {
        if (!filled(section.id)) fail(where, "editorialSections: `id` vacío");
        if (seenSectionIds.has(section.id))
          fail(where, `editorialSections: \`id\` duplicado "${section.id}"`);
        seenSectionIds.add(section.id);
        if (!SLUG_PATTERN.test(section.id))
          fail(
            where,
            `editorialSections: \`id\` con formato inválido: "${section.id}"`,
          );
        if (!filled(section.title))
          fail(where, `editorialSections (${section.id}): \`title\` vacío`);
        if (!filled(section.body))
          fail(where, `editorialSections (${section.id}): \`body\` vacío`);
        if (section.highlights) {
          if (section.highlights.length === 0)
            fail(
              where,
              `editorialSections (${section.id}): \`highlights\` vacía; omítala`,
            );
          for (const item of section.highlights) {
            if (!filled(item))
              fail(where, `editorialSections (${section.id}): highlight vacío`);
          }
        }
        assertMedia(section.media, `editorialSections (${section.id})`);
      }
    }

    if (project.availability) {
      const { headline, note, units } = project.availability;
      if (!filled(headline)) fail(where, "availability: `headline` vacío");
      // Publicar estados de venta sin decir cómo se obtiene el precio deja la
      // pregunta evidente sin responder: la nota es obligatoria.
      if (!filled(note)) fail(where, "availability: `note` vacía");
      if (units.length === 0)
        fail(where, "`availability` presente sin residencias; omítala");
      const seenUnitIds = new Set<string>();
      for (const unit of units) {
        if (!filled(unit.id)) fail(where, "availability: `id` de unidad vacío");
        if (seenUnitIds.has(unit.id))
          fail(where, `availability: \`id\` duplicado "${unit.id}"`);
        seenUnitIds.add(unit.id);
        for (const field of ["name", "interior", "bedrooms"] as const) {
          if (!filled(unit[field]))
            fail(where, `availability (${unit.id}): \`${field}\` vacío`);
        }
        if (!UNIT_STATUSES.includes(unit.status))
          fail(
            where,
            `availability (${unit.id}): estado desconocido "${unit.status}"`,
          );
      }
    }

    if (project.location) {
      const { headline, body, distances } = project.location;
      if (!filled(headline)) fail(where, "location: `headline` vacío");
      if (!filled(body)) fail(where, "location: `body` vacío");
      if (distances.length === 0)
        fail(where, "`location` presente sin distancias; omítala");
      for (const distance of distances) {
        if (!filled(distance.label) || !filled(distance.value))
          fail(where, "location: distancia con `label` o `value` vacío");
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
