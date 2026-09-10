# web-ardeno

Sitio web de **Ardeno Group**, promotora inmobiliaria en Carolina del Norte.

## Stack

- **Next.js 16** (App Router) + **TypeScript**
- **Tailwind CSS v4** + **shadcn/ui**
- **next-intl** — `en` (publicado) y `es` (preparado, sin publicar)
- Tipografía: **Hanken Grotesk**, la cara que declara el Ardeno Group Design
  System. Cubre los dos roles —`--font-sans` para titulares y prosa,
  `--font-ui` para navegación, etiquetas y controles— y se sirve autoalojada
  vía `next/font`. La web corporativa publicada todavía va con el par anterior
  (Manrope + Geist), así que hasta que se rehaga habrá esa diferencia entre
  ella y las fichas de proyecto
- SEO base: `metadata`, `sitemap.xml`, `robots.txt`

## Empezar

```bash
npm install
cp .env.example .env.local   # revisar ARDENO_DEPLOYMENT_ENV y NEXT_PUBLIC_SITE_URL
npm run dev                  # http://localhost:3000
```

## Scripts

| Script                           | Acción                                        |
| -------------------------------- | --------------------------------------------- |
| `npm run dev`                    | Servidor de desarrollo                        |
| `npm run build`                  | Build de producción                           |
| `npm run start`                  | Servir el build                               |
| `npm run lint`                   | ESLint                                        |
| `npm run format`                 | Formatear con Prettier                        |
| `npm run format:check`           | Verificar formato                             |
| `node scripts/generate-icon.mjs` | Regenerar `src/app/icon.png` desde el símbolo |

## Entorno de despliegue

`ARDENO_DEPLOYMENT_ENV` decide si el sitio puede indexarse. Es **server-only**:
no lleva prefijo `NEXT_PUBLIC_` porque es una decisión de infraestructura y no
información para el navegador. Se resuelve en
[`src/lib/site.ts`](src/lib/site.ts), que es el único módulo que lee estas
variables.

| Valor        | robots.txt           | Metadata                       | Cabecera                                     |
| ------------ | -------------------- | ------------------------------ | -------------------------------------------- |
| `local`      | `Disallow: /`        | `noindex, nofollow, noarchive` | `X-Robots-Tag: noindex, nofollow, noarchive` |
| `preview`    | `Disallow: /`        | `noindex, nofollow, noarchive` | `X-Robots-Tag: noindex, nofollow, noarchive` |
| `production` | `Allow: /` + sitemap | `index, follow`                | —                                            |

**Ausente equivale a `local`**, que es el valor seguro: un despliegue mal
configurado se comporta como una máquina de desarrollo, sin indexar, en vez de
como el sitio real. Un valor escrito mal no se redondea al más cercano: se
rechaza y el build falla.

`robots.txt` es la señal cortés, no la cerradura. Un rastreador que la ignore
sigue pudiendo leer. La cerradura —autenticación en el proxy— pertenece al
bloque de despliegue.

## URL pública

`NEXT_PUBLIC_SITE_URL` es la base de canonical, Open Graph, `sitemap.xml`,
`robots.txt` y la validación de origen de `/api/interest`. No es un secreto: es
la dirección pública del sitio, y por eso sí lleva prefijo `NEXT_PUBLIC_`.

- En `local` puede omitirse; se asume `http://localhost:3000`.
- En `preview` y `production` es **obligatoria**, debe ser **HTTPS** y no puede
  apuntar a la propia máquina.

Si falta, es inválida o apunta a `localhost` en un entorno desplegado, **el
build falla** con el motivo escrito. Es deliberado: es preferible no desplegar a
desplegar una preview cuyo sitemap y cuyos canonical apuntan a `localhost`.

Todo se compone con `siteUrl()` desde [`src/lib/site.ts`](src/lib/site.ts), para
que ningún módulo pueda divergir ni generar barras duplicadas.

## Cabeceras de seguridad

Definidas en [`next.config.ts`](next.config.ts) para todas las rutas:
`X-Content-Type-Options: nosniff`, `Referrer-Policy:
strict-origin-when-cross-origin`, `X-Frame-Options: DENY`, `Content-Security-Policy:
frame-ancestors 'none'` y `Permissions-Policy` denegando cámara, micrófono y
geolocalización. `poweredByHeader` está desactivado.

La CSP es deliberadamente mínima: solo `frame-ancestors`, que es la parte que no
depende de cómo Next inyecte sus scripts. Una `script-src` estricta con nonces
llegará en su propio bloque.

## Rutas

| Ruta                            | Estado                                          |
| ------------------------------- | ----------------------------------------------- |
| `/`                             | Redirección temporal (307) a la ficha publicada |
| `/en`                           | Redirección temporal (307) a la ficha publicada |
| `/en/portfolio/720-sherrybrook` | Publicada                                       |
| `/es` y todo `/es/*`            | 404 — sin traducción aprobada                   |

Todavía no existe home. `src/app/[locale]/page.tsx` es donde vivirá; mientras
tanto, [`src/proxy.ts`](src/proxy.ts) manda `/` directamente a la ficha, de un
solo salto, en vez de encadenar `/` → `/en` → ficha.

## Idiomas

- Configuración: [`src/i18n/routing.ts`](src/i18n/routing.ts).
- Textos: [`messages/en.json`](messages/en.json) y
  [`messages/es.json`](messages/es.json).
- `localePrefix: "always"` → ambos idiomas llevan prefijo (`/en/...`, `/es/...`).
- `alternateLinks: false` → **no se anuncia la alternativa española** mientras
  `/es/portfolio/[slug]` devuelva 404. `es` sigue declarado en `locales`: la
  arquitectura no cambia y publicar el español será volver a activarlo cuando
  exista contenido al otro lado.
- Al cliente solo viajan los espacios de nombres declarados en
  `CLIENT_NAMESPACES` (`src/app/[locale]/layout.tsx`), hoy ninguno.

## Lenguaje visual

El DNA vive en el bloque `ARDENO DESIGN DNA` de
[`src/app/globals.css`](src/app/globals.css). Sus valores están calibrados
contra el CSS computado de ardenogroup.com; los marcados `[ok]` son mediciones
exactas y los `[~]` siguen siendo aproximaciones.

## Datos de proyecto

[`src/lib/projects.ts`](src/lib/projects.ts) contiene únicamente campos
verificados y aprobados para publicación. Los campos financieros y operativos
—financiación, etapa, precio, socios, retorno, valor de salida— no existen en el
tipo, así que no pueden renderizarse ni serializarse.

### Retirados a la espera de confirmación escrita de Ardeno

Estos datos **estuvieron publicados y hoy no lo están**. Nadie los verificó:

| Dato                                           | Dónde vivía                             |
| ---------------------------------------------- | --------------------------------------- |
| `Q2 2027` / «Estimated delivery»               | celda de `snapshot`                     |
| Disponibilidad por residencia (`availability`) | Unit A–D, `available`/`reserved`/`sold` |
| `Now selling`                                  | `status`, distintivo del hero           |

Se retiró el **dato**, no la capacidad: `PublicUnitStatus`,
`PublicAvailability`, los invariantes, `ProjectAvailability` y su CSS siguen
intactos. Al ser campos opcionales, las secciones desaparecen enteras y vuelven
escribiendo otra vez esas claves — cuando Ardeno lo confirme por escrito, y no
antes.

## Despliegue

La preview se desplegará en el **VPS propio de Ardeno con EasyPanel +
Nixpacks**. Nixpacks detecta el proyecto Next.js y construye sin necesidad de
Dockerfile: el despliegue se configura desde EasyPanel indicando el repositorio,
la rama y las variables de entorno.

Variables a definir en EasyPanel para la preview:

```
ARDENO_DEPLOYMENT_ENV=preview
NEXT_PUBLIC_SITE_URL=https://<dominio de preview>
```

La captación de leads permanece apagada: **no definas**
`ARDENO_LEAD_CAPTURE_ENABLED` (ver [docs/lead-capture.md](docs/lead-capture.md)).

## Sync a Notion

[`.github/workflows/notion-sync.yml`](.github/workflows/notion-sync.yml) ejecuta
[`scripts/notion-sync.mjs`](scripts/notion-sync.mjs) en cada push a `main` y
hace upsert del repo en el panel de control de Notion. Requiere los secrets
`NOTION_TOKEN` y `NOTION_WEBS_DB`.

> **Pendiente:** el script sigue escribiendo `Entorno: "Render"` y `Estado: "En
producción"`, que no corresponden al VPS propio ni al estado real. Corregirlo
> **antes** de mergear a `main`, porque el merge lo dispara.
