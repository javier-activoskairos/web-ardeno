# web-ardeno

Sitio web de **Ardeno Group**, promotora inmobiliaria en Carolina del Norte.

## Stack

- **Next.js 16** (App Router) + **TypeScript**
- **Tailwind CSS v4** + **shadcn/ui**
- **next-intl** — `en` (publicado) y `es` (preparado, sin publicar)
- Tipografías: **Manrope** (display y contenido) y **Geist** (navegación,
  etiquetas, controles y botones), las dos caras verificadas del sitio real
- SEO base: `metadata`, `sitemap.xml`, `robots.txt`

## Empezar

```bash
npm install
cp .env.example .env.local   # definir NEXT_PUBLIC_SITE_URL
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

## Rutas

| Ruta                            | Estado                                          |
| ------------------------------- | ----------------------------------------------- |
| `/en`                           | Redirección temporal (307) a la ficha publicada |
| `/en/portfolio/720-sherrybrook` | Publicada                                       |
| `/es` y todo `/es/*`            | 404 — sin traducción aprobada                   |

Todavía no existe home. `src/app/[locale]/page.tsx` es donde vivirá: hoy solo
redirige en inglés y devuelve 404 en español.

## Idiomas

- Configuración: [`src/i18n/routing.ts`](src/i18n/routing.ts).
- Textos: [`messages/en.json`](messages/en.json) y
  [`messages/es.json`](messages/es.json).
- `localePrefix: "always"` → ambos idiomas llevan prefijo (`/en/...`, `/es/...`).
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
—financiación, etapa, plazo, disponibilidad, precio, socios, retorno, valor de
salida— no existen en el tipo, así que no pueden renderizarse ni serializarse.

## Sync a Notion

[`.github/workflows/notion-sync.yml`](.github/workflows/notion-sync.yml) ejecuta
[`scripts/notion-sync.mjs`](scripts/notion-sync.mjs) en cada push a `main` y
hace upsert del repo en el panel de control de Notion. Requiere los secrets
`NOTION_TOKEN` y `NOTION_WEBS_DB`.
