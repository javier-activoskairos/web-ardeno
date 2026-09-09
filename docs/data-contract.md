# Contrato de datos públicos

`PublicProject`, en [`src/lib/projects.ts`](../src/lib/projects.ts), es lo único
que la web sabe de un proyecto. Todo lo que se ve en `/en/portfolio/[slug]` sale
de ahí; ningún componente conoce una ruta, un texto ni una cifra por su cuenta.

## Es una lista blanca, no un filtro

El contrato enumera lo que **sí** es público. Lo que no está en el tipo no
existe para la web: no está a `null` ni oculto, sencillamente no se puede
escribir. Eso incluye cualquier dato financiero u operativo interno.

Desde el rediseño v3 la **disponibilidad comercial** —qué residencias siguen
abiertas— sí es pública, porque es información de venta que el comprador
necesita para preguntar por una unidad concreta. Los **precios siguen fuera**:
el propio bloque dice que los comparte el equipo junto al calendario de obra.

La consecuencia práctica: para publicar algo nuevo hay que añadirlo al tipo a
propósito y diseñar su estado en la interfaz. No hay forma de que un dato se
cuele por descuido.

## `id` y `slug` no son lo mismo

|              | `id`                     | `slug`                         |
| ------------ | ------------------------ | ------------------------------ |
| Para qué     | relacionar sistemas      | ser la URL                     |
| ¿Se muestra? | nunca                    | sí, en la barra de direcciones |
| ¿Cambia?     | no, jamás                | sí, es de marketing            |
| Ejemplo      | `ardeno-720-sherrybrook` | `720-sherrybrook`              |

El `id` es la clave estable. El formulario ya lo envía —junto al slug— en cada
lead: así una landing puede cambiar de URL sin romper los leads ya capturados ni
la relación con su fila de Notion.

## `published`

Un booleano explícito. El módulo solo deja salir proyectos con `published:
true`, y el filtro vive en el origen de datos, no en quien consume. Un proyecto
sin publicar no aparece en los listados, ni en `generateStaticParams`, ni en el
sitemap, **ni es alcanzable escribiendo su URL**: `getPublicProject` devuelve
`undefined` y la página responde 404.

## Campos

**Obligatorios** — `id`, `published`, `slug`, `name`, `city`, `state`,
`typology`, `positioningLine`, `snapshot`.

**Opcionales** — `status`, `heroMedia`, `story`, `editorialSections`,
`availability`, `architecture`, `gallery`, `location`.

Un módulo ausente **desaparece entero**: sin `<section>`, sin título, sin
separador y sin el espacio vertical que ocupaba. No quedan huecos ni marcadores
de posición.

| Ausente             | Qué ocurre                                                                                            |
| ------------------- | ----------------------------------------------------------------------------------------------------- |
| `status`            | El hero no pinta distintivo junto al CTA                                                              |
| `heroMedia`         | El hero cambia a su composición editorial con «Project imagery pending». Es una variante, no un vacío |
| `story`             | La sección no se emite                                                                                |
| `editorialSections` | No se emite ningún capítulo: la narrativa enlaza con lo que venga después                             |
| `availability`      | La sección no se emite: la ficha no menciona estados de venta                                         |
| `architecture`      | La sección no se emite                                                                                |
| `gallery`           | Ni se monta la isla cliente: la comprobación está en el servidor                                      |
| `location`          | La sección no se emite                                                                                |

### `editorialSections`

Capítulos de prosa con su render, en el orden en el que se leen. Es lo que
alterna texto e imagen durante el scroll en lugar de acumular párrafos.

```ts
type PublicEditorialSection = {
  id: string; // clave estable y ancla del titular; no se muestra
  eyebrow?: string; // rótulo en versales: "Interiors"
  title: string;
  body: string;
  highlights?: readonly string[]; // materiales y acabados, para quien escanea
  media: PublicMedia; // la misma forma que usa `heroMedia`
};
```

Deliberadamente mínimo:

- **Sin campo de disposición.** Qué lado ocupa el render lo decide la
  composición a partir de la posición del capítulo, no el dato. Quien edita no
  tiene que pensar en columnas, y la alternancia sigue funcionando aunque se
  reordenen, se quite uno o se añada un tercero.
- **Sin variantes.** No hay tamaños, ni tonos, ni tipos de capítulo: no existe
  todavía un consumidor que los pida.

El medio reutiliza `PublicMedia`, la forma común de todo medio del contrato. Su
`caption` es opcional: presente, se imprime bajo el render en versales.

Que un render aparezca a la vez en un capítulo y en la galería es correcto y
esperado: son dos roles distintos del mismo archivo.

### `availability`

Estados de venta por residencia. Tres valores cerrados —`available`, `reserved`,
`sold`— y nada más: no hay «próximamente» ni «última oportunidad», porque el
estado es información, no urgencia fabricada.

```ts
type PublicAvailability = {
  eyebrow?: string;
  headline: string;
  note: string; // obligatoria: dice quién comparte el precio y cuándo
  units: readonly {
    id: string; // clave estable de la fila; no se muestra
    name: string;
    interior: string; // ya formateado: "2,180 SF"
    bedrooms: string;
    status: "available" | "reserved" | "sold";
  }[];
};
```

`note` es obligatoria a propósito: publicar una lista de estados sin decir cómo
se obtiene el precio deja abierta la pregunta evidente.

### `location`

Emplazamiento y tiempos de trayecto verificados, con su unidad ya escrita. El
componente no calcula, no convierte y no ordena, y no hay mapa embebido: sería
un tercero cargando dentro de la ficha para dar menos información que la lista.

```ts
type PublicLocation = {
  eyebrow?: string;
  headline: string;
  body: string;
  distances: readonly { label: string; value: string }[];
};
```

## Invariantes

Se ejecutan al cargar el módulo y **lanzan**, así que un dato mal formado rompe
el build en lugar de publicarse. Corren solo en servidor: los componentes
cliente importan tipos, y los tipos se borran al compilar.

- `id` presente, no vacío y único
- `slug` presente, único y con formato `^[a-z0-9]+(?:-[a-z0-9]+)*$`
- `name`, `city`, `state`, `typology` y `positioningLine` no vacíos
- `snapshot` entre 1 y 4 celdas, con `value` y `label` no vacíos
- `src` de medios: ruta local que empieza por `/`, nunca una URL remota ni
  protocolo relativo
- `alt` no vacío
- `width` y `height` enteros mayores que cero
- si `gallery` existe, al menos una imagen, y todas con `caption` no vacío
- si `editorialSections` existe, al menos un capítulo, con `id` único dentro del
  proyecto y con el mismo formato que un slug, y con `title` y `body` no vacíos
- si un capítulo trae `highlights`, no está vacía y ningún elemento lo está
- si `availability` existe, `headline` y `note` no vacíos, al menos una
  residencia, `id` único dentro del proyecto, `name`, `interior` y `bedrooms` no
  vacíos, y `status` dentro de los tres valores admitidos
- si `location` existe, `headline` y `body` no vacíos y al menos una distancia,
  con `label` y `value` no vacíos
- `caption` de un medio, si está, no vacío

No se comprueba que los archivos existan en disco: eso es trabajo de un script
aparte, no del arranque del módulo.

## La frontera con Notion

Notion **todavía no está conectado**. El origen actual es
`localProjectSource`, que lee un array del propio repositorio.

`ProjectSource` ya es asíncrono a propósito, aunque hoy los datos estén en
memoria, para que el día que lleguen de Notion no haya que tocar ni las
funciones públicas ni la página.

Cuando exista el adaptador:

- Los componentes **nunca** recibirán una fila de Notion. Reciben
  `PublicProject`, y nada más.
- El adaptador construirá `PublicProject` **campo a campo**.
- **Nunca** se hará `{ ...notionRow }`. TypeScript solo detecta propiedades
  sobrantes en literales de objeto, así que un _spread_ destruiría la lista
  blanca en una línea sin que el compilador dijera nada. Es la regla más
  importante de este documento.

### Criterio de publicación

Un proyecto solo llegará a la web si cumple **todo** a la vez:

```
Publicar en web = true
  Y Estado web = Publicado
  Y ID Proyecto presente
  Y slug válido y único
  Y datos públicos mínimos válidos
```

Si algo falla, el proyecto no entra en la lista: ni en la búsqueda por slug, ni
en el sitemap, ni en las rutas generadas.

### Pendiente de cerrar

Nada de esto puede darse por bueno hasta que la base de datos esté definida:

- Nombres técnicos definitivos de las propiedades de Notion.
- El data source ID.
- El formato del rich text y cómo se parte en párrafos.
- La estrategia definitiva de imágenes. Es el punto delicado: Notion entrega
  URLs firmadas que caducan, y el contrato exige rutas locales con `width` y
  `height` reales para reservar el hueco y evitar el salto de composición.
- El orden de la galería y de dónde salen los `caption`.
- Dónde vive la disponibilidad por residencia: si es una base de datos
  relacionada de unidades o propiedades sueltas del proyecto, y quién la
  actualiza cuando una unidad se reserva.
