# Política de privacidad

> **La página está publicada; el documento no está cerrado.**
> Faltan datos legales que solo puede confirmar Ardeno. Están recogidos en
> [Pendiente de Ardeno](#pendiente-de-ardeno) y hasta que lleguen no se pintan.

## Qué hay

| Pieza                                                                                         | Qué es                                                |
| --------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| [`src/app/[locale]/privacy-policy/page.tsx`](../src/app/%5Blocale%5D/privacy-policy/page.tsx) | La ruta. Metadata, canonical y 404 en español         |
| [`src/lib/privacy-policy.ts`](../src/lib/privacy-policy.ts)                                   | El texto aprobado, en apartados con ancla             |
| [`src/lib/legal.ts`](../src/lib/legal.ts)                                                     | Tipo `LegalDocument` y datos registrales por entorno  |
| [`src/components/ardeno/legal-document.tsx`](../src/components/ardeno/legal-document.tsx)     | El renderizador, reutilizable por cualquier documento |

La ruta publicada es `/privacy-policy` (inglés, sin prefijo de idioma).
`/es/privacy-policy` devuelve 404 mientras no haya traducción aprobada, igual
que la ficha de proyecto.

Server Components de principio a fin: **la página no lleva JavaScript de
cliente**, ni cookies, ni trackers, ni dependencias nuevas.

## Fuente

El texto es el del documento **«Privacy Policy_Ardeno Web»** aprobado por
Ardeno, transcrito literalmente. No se resume, no se reescribe y no se adapta
el tono: es contenido legal.

Se separa en apartados con `id` estable —`#user-rights`, `#data-controller`…—
para poder enlazar a uno concreto desde un correo o desde el futuro texto de
consentimiento del formulario.

### Lo único que no se publica del documento

La frase «_Before publication, the company may add its legal entity name,
registered address, and any additional corporate details required by applicable
law_» **no se pinta**. Es una nota interna para quien redacta, no una cláusula:
publicarla le diría al visitante que el documento está a medias.

Lo que esa frase pide no se pierde: son las dos primeras variables de la tabla
de abajo.

## Pendiente de Ardeno

Nada de esto se inventa y nada de esto aparece como «pendiente» en la página
pública. Mientras la variable esté vacía, la línea sencillamente no existe.

| Variable de entorno                | Dato                               | Dónde aparece cuando se defina        |
| ---------------------------------- | ---------------------------------- | ------------------------------------- |
| `ARDENO_LEGAL_ENTITY_NAME`         | Razón social inscrita              | Apartado _Data Controller_, como dato |
| `ARDENO_LEGAL_REGISTERED_ADDRESS`  | Domicilio registral                | Apartado _Data Controller_, como dato |
| `ARDENO_PRIVACY_POLICY_UPDATED_ON` | Fecha de aprobación (`YYYY-MM-DD`) | «Last updated: …», bajo el titular    |

La fecha es la más urgente de las tres: el propio documento promete, en
_Changes to This Privacy Policy_, indicar la fecha de la última actualización.
Mientras no conste, la página cumple lo que dice el resto del texto pero no
esa promesa.

Si la variable de fecha está escrita en otro formato, **el build falla**. Es
deliberado: una fecha equivocada en un documento legal no puede colarse en
silencio.

## Lo que esta página NO habilita

Publicarla **no enciende la captación de leads**. `ARDENO_LEAD_CAPTURE_ENABLED`
sigue en `false` y el formulario sigue sin texto de consentimiento.

De los cinco bloqueos de [`docs/lead-capture.md`](lead-capture.md#antes-de-encenderla),
esta página resuelve el primero —la política publicada— y deja abiertos los
otros cuatro, empezando por el segundo: **el texto o la casilla de
consentimiento**, que hay que redactar y aprobar aparte. El enlace del pie no
es consentimiento; es solo el enlace permanente que cualquier sitio que recoja
datos personales tiene que mostrar.

## Añadir otro documento legal

Unos términos de uso o un aviso legal no necesitan tocar el renderizador:

1. Describir el documento con el tipo `LegalDocument` en su propio módulo de
   `src/lib/`.
2. Crear la ruta bajo `src/app/[locale]/` y pasarle el documento a
   `<LegalDocumentPage doc={…} />`.
3. Añadir la ruta al `sitemap.ts` y, si procede, el enlace al pie.
