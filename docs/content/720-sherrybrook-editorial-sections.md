# Capítulos editoriales de 720 Sherrybrook — retirados

Los dos capítulos —**Interiors** y **Outdoor living**— estuvieron publicados y hoy
no lo están. No se han borrado: este documento guarda el contenido exacto para
poder volver a ponerlo tal cual.

## Por qué se retiraron

Decisión de Javier, 10 de septiembre de 2026. La web se está construyendo para
ser **reutilizable**, con los proyectos llegando desde Notion. Los capítulos
editoriales son la parte del contrato más difícil de mapear: cada uno lleva
prosa larga, una lista de materiales y un render propio con sus dimensiones,
y eso obliga a modelar en Notion una base de datos anidada por proyecto.

Retirarlos ahora **simplifica el esquema** que hay que definir y evita construir
un adaptador para un campo cuyo diseño todavía no está cerrado.

No es una decisión sobre la calidad del contenido: se retira porque complica el
sistema, no porque el texto o los renders estén mal.

## Qué desapareció de la ficha

Las dos secciones enteras: rótulo, titular, prosa, lista de materiales y render.
`editorialSections` es un campo opcional del contrato, así que la ficha pasa
directamente de la narrativa (**The project**) a **Architecture and living**, sin
hueco, sin separador huérfano y sin título vacío.

**Ninguna imagen se pierde de la ficha.** Los dos renders que usaban los
capítulos —`kitchen-island.jpg` y `private-balcony.jpg`— siguen publicados en la
galería y en el visor, que es el archivo visual completo del proyecto.

## Lo que sigue intacto en el código

Se retiró el **dato**, no la capacidad:

- El tipo `PublicEditorialSection` y el campo opcional `editorialSections` en
  `PublicProject`.
- Los invariantes que los validan (`id` único, formato de slug, `title` y `body`
  no vacíos, `highlights` sin elementos vacíos, media con ruta local).
- El componente `ProjectEditorial` en `project-content.tsx`, con su alternancia
  de lado por posición.
- Todo el CSS de `.ar-chapter__*`.

Volver a publicarlos es pegar el bloque de abajo en el proyecto. Nada más.

## Cómo restaurarlos

Pegar esta clave dentro del objeto de 720 Sherrybrook en
[`src/lib/projects.ts`](../../src/lib/projects.ts), entre `gallery` y
`architecture` —el orden de las claves no afecta al render, que lo decide la
página, pero así queda donde estaba—:

```ts
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
```

## El otro respaldo: el historial

Este documento es la copia cómoda, pero el respaldo de verdad es Git. El
contenido vive en `0f2d307` y en todos los commits anteriores desde `9682ae9`.
Para verlo tal como estaba, sin tocar nada del árbol de trabajo:

```bash
git show 0f2d307:src/lib/projects.ts | sed -n '/editorialSections: \[/,/^    \],/p'
```

Y para ver la ficha entera como se publicaba con los capítulos, basta con abrir
ese commit en GitHub. Nada de esto se pierde aunque se borre este archivo.

## Si se decide eliminarlos del contrato

Retirar el dato es reversible en un minuto. **Eliminar la capacidad** —el tipo,
los invariantes, el componente y el CSS— es un paso distinto y mayor, y conviene
tomarlo cuando el esquema de Notion esté definido, no antes: es entonces cuando
se sabrá si el capítulo editorial se mapea a una base relacionada, a propiedades
sueltas o a nada.

Mientras tanto, el código que sostiene la capacidad no molesta a nadie: sin dato,
no se emite ni una etiqueta.
