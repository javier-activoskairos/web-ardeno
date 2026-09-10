# QA local previo al lanzamiento — 720 Sherrybrook

Última pasada completa antes de desplegar la preview en el VPS de Ardeno. Todo
lo que sigue se comprobó en local: lo que depende del servidor está listado
aparte, en [Pendiente del VPS](#pendiente-del-vps), y no se da por bueno.

## 1. Fecha y commit

- **Fecha:** 10 de septiembre de 2026.
- **Rama:** `feat/sherrybrook-foundation`.
- **Commit de partida:** `c0eb9a68f60f5da8ae2b9336d22516d164215e88`
  (_fix: harden the Sherrybrook preview_).
- **PR:** [#1](https://github.com/javier-activoskairos/web-ardeno/pull/1), en
  borrador. Sin merge a `main`.

## 2. Entorno

| Componente | Versión                                      |
| ---------- | -------------------------------------------- |
| Sistema    | macOS (Darwin 25.5.0)                        |
| Node       | **24.18.0** — fijado en `.nvmrc` y `engines` |
| npm        | 11.16.0                                      |
| Next.js    | 16.2.9                                       |
| Navegador  | Chrome 152.0.7977.84 headless, vía CDP       |

El navegador se condujo con un cliente CDP mínimo sobre el `WebSocket` nativo de
Node. No se instaló Playwright, Puppeteer ni Lighthouse, ni se añadió ninguna
dependencia al proyecto.

## 3. Comandos ejecutados

```bash
npm run format:check
npm run lint
npx tsc --noEmit
npm run build                      # modo local (por defecto)

ARDENO_DEPLOYMENT_ENV=preview \
NEXT_PUBLIC_SITE_URL=https://preview.example.com \
npm run build && npx next start --hostname 127.0.0.1 --port 3220
```

`ARDENO_LEAD_CAPTURE_ENABLED` **no se definió** en ningún momento.

## 4. Resultados

| Comprobación    | Resultado | Errores | Warnings |
| --------------- | --------- | ------- | -------- |
| `format:check`  | ✅ exit 0 | 0       | 0        |
| `lint`          | ✅ exit 0 | 0       | 0        |
| `tsc --noEmit`  | ✅ exit 0 | 0       | 0        |
| `build` local   | ✅        | 0       | 0        |
| `build` preview | ✅        | 0       | 0        |

Rutas generadas: `/_not-found`, `/[locale]` (`/en`, `/es`), `/[locale]/[...rest]`,
`/[locale]/portfolio/[slug]`, `/api/interest`, `/icon.png`, `/robots.txt`,
`/sitemap.xml`, más el proxy de idioma.

## 5. Viewports revisados

Cinco anchos, con recorrido completo de la página y captura en cada uno.

| Viewport   | Overflow horizontal | Texto cortado | Imágenes sin cargar | Errores de consola |
| ---------- | ------------------- | ------------- | ------------------- | ------------------ |
| 1440 × 900 | 0 px                | ninguno       | 0                   | 0                  |
| 1024 × 768 | 0 px                | ninguno       | 0                   | 0                  |
| 768 × 1024 | 0 px                | ninguno       | 0                   | 0                  |
| 390 × 844  | 0 px                | ninguno       | 0                   | 0                  |
| 320 × 568  | 0 px                | ninguno       | 0                   | 0                  |

Comprobado en cada uno: hero encuadrado y legible; snapshot equilibrado con
**tres** celdas; story y capítulos con medida de lectura correcta; retícula de
`Architecture` sin columnas estranguladas —se reduce a una columna en móvil—;
galería con cubierta y parejas; cierre de conversión; footer.

### La retirada de `availability` no dejó rastro

Era el riesgo principal de esta pasada. Verificado por DOM en los cinco anchos:

- **9 secciones** en la página, **ninguna vacía**. `project-availability` no se
  emite en absoluto.
- **Separación entre secciones consecutivas: 0 px.** El capítulo _Outdoor
  living_ enlaza directamente con _Architecture and living_, y el cambio de
  fondo (blanco → piedra) marca la transición. Sin hueco, sin salto de ritmo.
- **0** elementos `<hr>`, **0** titulares vacíos, **0** secciones vacías.
- Sin referencias comerciales residuales (ver §11).

## 6. Rutas verificadas

Servidor de producción local en modo `preview`.

| Ruta                            | Resultado                      |
| ------------------------------- | ------------------------------ |
| `/`                             | 307 → ficha, **un solo salto** |
| `/en`                           | 307 → ficha, **un solo salto** |
| `/en/portfolio/720-sherrybrook` | **200**                        |
| `/es`                           | 404                            |
| `/es/portfolio/720-sherrybrook` | 404                            |
| `/en/portfolio/no-existe`       | 404                            |
| `/en/cualquiera`                | 404                            |
| `/robots.txt`, `/sitemap.xml`   | 200                            |
| `POST /api/interest`            | **503 `unconfigured`**         |

## 7. Accesibilidad

**Navegación por teclado.** El primer `Tab` da el enlace de salto («Skip to
project content»). El recorrido cubre cabecera, CTA, cubierta y miniaturas de la
galería, contactos y formulario. Todos los elementos enfocables muestran
indicador visible: contorno sólido de 2 px con desplazamiento de 3 px —tinta
sobre claro, blanco sobre oscuro— y los campos del formulario, halo propio.

**Diálogo de captación.** `role="dialog"`, `aria-modal="true"` y
`aria-labelledby`. Bloquea el scroll de fondo al abrir y lo restaura al cerrar.
Trampa de foco sin fugas en 14 tabulaciones, y `Shift+Tab` tampoco escapa.
`Escape` cierra y el foco vuelve al botón que lo abrió. El envío en vacío marca
los tres campos obligatorios con `aria-invalid`, imprime sus mensajes y lleva el
foco al primero.

**Visor de la galería.** `role="dialog"`, `aria-modal="true"` y etiqueta.
Contador correcto, flechas circulares (`1/7 → 2/7`, y hacia atrás `7/7`), scroll
de fondo bloqueado y restaurado, `Escape` cierra y el foco vuelve a la miniatura
de origen. La trampa de foco tenía un defecto; ver §12.

**Movimiento reducido.** Con `prefers-reduced-motion: reduce`, los 21 elementos
animados quedan en `opacity: 1`, sin `transform` y con transición de `0s`. No se
esconde contenido tras una animación que no llega a ejecutarse.

**Contraste.** Barrido automático sobre todo el texto renderizado comparando
color efectivo contra el fondo real heredado: **0 incumplimientos** de WCAG AA
(4.5:1 normal, 3:1 grande).

**Objetivos táctiles.** Todos los controles superan 24 × 24 px salvo tres
enlaces de texto —correo y teléfono del cierre, y correo del footer—, de 18–21 px
de alto. Son enlaces en línea dentro de un bloque de texto, el caso que WCAG
2.5.8 exime expresamente. Se deja anotado, no corregido: agrandarlos sería una
decisión de diseño.

## 8. Rendimiento

Medido sobre el build de producción servido en local, sin caché y sin latencia
de red. **No es un Lighthouse**: no está instalado y no se ha añadido. Las cifras
absolutas de tiempo no son extrapolables a la preview; las de peso y estabilidad
sí.

| Métrica                      | Valor                                   |
| ---------------------------- | --------------------------------------- |
| CLS                          | **0**                                   |
| TBT                          | **0 ms**                                |
| First Contentful Paint       | 28 ms                                   |
| TTFB                         | 4 ms                                    |
| Peso total de la página      | **398 KB**                              |
| Peticiones                   | 17                                      |
| JavaScript de cliente        | 176 KB en 11 chunks                     |
| CSS                          | 14 KB                                   |
| Fuentes                      | **1** archivo woff2, 34 KB, autoalojado |
| Imágenes en la primera carga | 3 (130 KB)                              |
| Peticiones externas          | **0**                                   |

**CLS de 0** confirma que declarar `width`/`height` reales en el contrato cumple
su función: no hay un solo salto de composición.

**Una sola fuente.** Hanken Grotesk cubre los dos roles y se descarga una vez,
desde el propio origen. Ninguna petición a Google Fonts en ejecución.

**Imágenes.** Las ocho del proyecto pesan **2,3 MB** en el repositorio
(206–390 KB cada una), pero solo tres se piden en la primera carga: el hero
(106 KB servidos a 1920 px), el logotipo (2 KB) y el primer capítulo (22 KB). El
resto va diferido. Todas las etiquetas `Image` declaran `sizes` explícito. No se
ha tocado calidad ni recorte: no hay problema objetivo que lo justifique.

## 9. SEO e indexación

| Elemento          | Estado en `preview`                                              |
| ----------------- | ---------------------------------------------------------------- |
| `robots.txt`      | `User-Agent: *` / `Disallow: /`, sin anunciar sitemap            |
| Metadata `robots` | `noindex, nofollow, noarchive`                                   |
| `X-Robots-Tag`    | Presente en ficha, `robots.txt`, `sitemap.xml` y `/api/interest` |
| Canonical         | `https://preview.example.com/en/portfolio/720-sherrybrook`       |
| `hreflang`        | **0** — no se anuncia el español mientras devuelva 404           |
| Open Graph        | title, description, site_name, locale y type                     |
| Sitemap           | Una URL, solo `/en/...`, sin barras duplicadas                   |
| Favicon           | `/icon.png`, 200, 14,5 KB                                        |

Cabeceras de seguridad presentes en todas las respuestas: `X-Content-Type-Options`,
`Referrer-Policy`, `X-Frame-Options`, `Content-Security-Policy: frame-ancestors 'none'`
y `Permissions-Policy`. Sin `X-Powered-By`.

## 10. Captación apagada

`POST /api/interest` responde **503 `unconfigured`** con y sin cabecera `Origin`
válida. El registro del servidor solo contiene `correlationId`, `projectId`,
desenlace y duración: **ni un dato personal** de los enviados en la prueba. El
servidor **no abrió ninguna conexión saliente** durante toda la sesión
(comprobado con `lsof` sobre el proceso y sus hijos).

En los bundles de cliente: 0 apariciones de `ARDENO_DEPLOYMENT_ENV`,
`ARDENO_LEAD`, `WEBHOOK` ni del dominio de prueba.

## 11. Datos comerciales retirados

Barrido sobre el HTML servido de la ficha:

| Término                                   | Apariciones                                               |
| ----------------------------------------- | --------------------------------------------------------- |
| `Q2 2027`                                 | 0                                                         |
| `Estimated delivery`                      | 0                                                         |
| `Now selling`                             | 0                                                         |
| `Four residences, two still open`         | 0                                                         |
| `Pricing is shared`                       | 0                                                         |
| `Unit A` / `Unit B` / `Unit C` / `Unit D` | 0                                                         |
| `Available` / `Sold`                      | 0                                                         |
| `data-status` / `ar-units`                | 0                                                         |
| `Reserved`                                | 2 — **«All Rights Reserved.»** del aviso legal del footer |

Las dos apariciones de «Reserved» son la fórmula legal del pie, sin relación con
estados de venta. En minúscula sobreviven dos frases genéricas del copy
—«When submission is available…» en el formulario y «…is not available.» en el
404— que no son información comercial.

## 12. Problemas encontrados

**1. Trampa de foco del visor de la galería — corregido.** Al abrir el visor, el
foco podía quedarse fuera del diálogo, y entonces `Tab` recorría la página de
fondo en lugar de ciclar dentro. Reproducido **1 de cada 5 veces** cuando antes
se había abierto y cerrado el modal de captación: una condición de carrera, no un
fallo constante. La causa es que el manejador de `Tab` solo comparaba el foco
contra el primer y el último botón, y daba por supuesto que ya estaba dentro.

**2. Listas de materiales apretadas contra su filete — corregido a petición de
Javier.** Revisando la preview en local, los renglones de `highlights` de los
capítulos se leían pegados a la línea que los separa. Es un juicio de
composición, no una medición, así que no se tocó por iniciativa propia: se
corrigió cuando Javier lo pidió durante la sesión.

**3. Enlaces de contacto por debajo de 24 × 24 px — no corregido, anotado.** Ver
§7. Entra en la excepción de WCAG para enlaces en línea; agrandarlos es una
decisión de diseño y queda para revisión humana.

**4. Aviso de precarga de imagen en anchos ≤ 768 px — descartado.** Chrome avisa
de que la imagen del hero se precargó «sin usarse en unos segundos». Verificado
que el `imagesrcset` del `<link rel=preload>` y la variante que el navegador
acaba usando **son la misma** (`w=640`). Es un artefacto del recorrido
automático del headless, no un desperdicio real. No aparece en escritorio.

**5. Falso positivo de «texto cortado» en la cubierta de la galería —
descartado.** El botón mide 350 px y su marco sangra a 390 px por diseño; el
rótulo queda dentro del botón y dentro del viewport. Era mi heurística
confundiendo el sangrado deliberado con un recorte.

## 13. Problemas corregidos

**Trampa de foco del visor** ([`project-gallery.tsx`](../../src/components/ardeno/project-gallery.tsx)),
en dos partes:

- Si el foco está fuera del panel, el `Tab` lo devuelve al primer control en
  lugar de dejarlo escapar al fondo.
- El foco entra en el visor en cuanto se monta, sin esperar al temporizador de
  30 ms, que queda como red de seguridad.

Verificado después: **5 de 5** aperturas dejan el foco en el botón de cierre, y
las tabulaciones ya no salen del diálogo. No cambia nada visual ni de copy.

**Aire en las listas de materiales**
([`globals.css`](../../src/app/globals.css)): `padding-block` de `.ar-list li`
pasa de 13 px a 18 px, igual arriba y abajo. Afecta a los `highlights` de los
capítulos y a la lista de distancias del emplazamiento, que son la misma lista.
No cambia tipografía, color ni composición.

**Node fijado a 24** — `.nvmrc` y `engines.node` (`>=24.0.0 <25.0.0`), sin tocar
gestor de paquetes ni dependencias. `package-lock.json` quedó byte a byte igual.

## Pendiente del VPS

Nada de esto puede darse por bueno hasta desplegar:

- **HTTPS real** y validez del **certificado**.
- **Traefik**: que la cabecera `Origin` llegue intacta al endpoint.
- **`x-forwarded-for`**: que traiga la IP del visitante y no la del proxy, o el
  límite de frecuencia deja de discriminar.
- **Recursos del servidor** durante `npm ci` + `next build`: el build local
  alcanza un pico de ~713 MB de memoria residente y `node_modules` ocupa 601 MB.
- **Redeploy** desde GitHub sin intervención manual.
- **Rollback** por revert de Git.

## Decisiones pendientes de Ardeno

- **`Q2 2027`** como fecha de entrega publicable: confirmar o dejar retirada.
- **Disponibilidad de las unidades** (Unit A–D y sus estados): confirmar o dejar
  retirada. Arrastra también el distintivo `Now selling`.
- **Textos definitivos** y sustitución de los renders provisionales del brochure.
- **Política de privacidad** publicada y texto de consentimiento: es el bloqueo
  que impide encender la captación.
- **Receptor de los leads**: persona y canal.
