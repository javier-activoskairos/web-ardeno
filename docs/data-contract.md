# Contrato de datos públicos

`PublicProject`, en [`src/lib/projects.ts`](../src/lib/projects.ts), es lo único
que la web sabe de un proyecto. Todo lo que se ve en `/en/portfolio/[slug]` sale
de ahí; ningún componente conoce una ruta, un texto ni una cifra por su cuenta.

## Es una lista blanca, no un filtro

El contrato enumera lo que **sí** es público. Lo que no está en el tipo no
existe para la web: no está a `null` ni oculto, sencillamente no se puede
escribir. Eso incluye cualquier dato operativo o financiero.

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

El `id` es la clave estable. Cuando el formulario envíe un lead, irá el `id`, no
el slug: así una landing puede cambiar de URL sin romper los leads ya
capturados ni la relación con su fila de Notion. Todavía **no** se pasa al
formulario; eso corresponde al bloque de captación.

## `published`

Un booleano explícito. El módulo solo deja salir proyectos con `published:
true`, y el filtro vive en el origen de datos, no en quien consume. Un proyecto
sin publicar no aparece en los listados, ni en `generateStaticParams`, ni en el
sitemap, **ni es alcanzable escribiendo su URL**: `getPublicProject` devuelve
`undefined` y la página responde 404.

## Campos

**Obligatorios** — `id`, `published`, `slug`, `name`, `city`, `state`,
`typology`, `positioningLine`, `snapshot`.

**Opcionales** — `heroMedia`, `story`, `architecture`, `gallery`.

Un módulo ausente **desaparece entero**: sin `<section>`, sin título, sin
separador y sin el espacio vertical que ocupaba. No quedan huecos ni marcadores
de posición.

| Ausente        | Qué ocurre                                                                                            |
| -------------- | ----------------------------------------------------------------------------------------------------- |
| `heroMedia`    | El hero cambia a su composición editorial con «Project imagery pending». Es una variante, no un vacío |
| `story`        | La sección no se emite                                                                                |
| `architecture` | La sección no se emite                                                                                |
| `gallery`      | Ni se monta la isla cliente: la comprobación está en el servidor                                      |

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
