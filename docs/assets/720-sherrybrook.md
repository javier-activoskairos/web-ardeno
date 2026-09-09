# 720 Sherrybrook — activos gráficos

**Estado: provisionales.** Sirven para construir y previsualizar la ficha; se
sustituyen en cuanto lleguen los originales finales.

- **Procedencia:** brochure de 720 Sherrybrook en inglés.
- **Autorización:** Fran autoriza su uso para construcción y preview, con
  sustitución posterior si aparecen versiones finales.
- **Incorporados el:** 8 de septiembre de 2026.

La provisionalidad se documenta aquí, no en la interfaz. La ficha pública no
lleva ninguna marca de borrador, aviso ni etiqueta sobre estos renders: son
imágenes del proyecto y así se presentan.

## Archivos

Todos en `public/projects/720-sherrybrook/`.

| Archivo                   | Rol      | Dimensiones |   Peso |
| ------------------------- | -------- | ----------: | -----: |
| `hero-front-exterior.jpg` | Hero     |    1672×941 | 306 KB |
| `exterior-rear.jpg`       | Cubierta |    1672×941 | 349 KB |
| `kitchen-island.jpg`      | Galería  |    1602×942 | 253 KB |
| `dining-living.jpg`       | Galería  |   1912×1118 | 390 KB |
| `primary-suite.jpg`       | Galería  |   1448×1086 | 264 KB |
| `primary-bathroom.jpg`    | Galería  |   1448×1086 | 206 KB |
| `private-balcony.jpg`     | Galería  |   1448×1086 | 306 KB |
| `home-office.jpg`         | Galería  |   1419×1064 | 215 KB |

Total: 2,2 MB. JPEG sRGB sin canal alfa.

Cocina y comedor se sustituyeron el 9 de septiembre de 2026 por una segunda
extracción del brochure, sin la franja de mobiliario suelto que arrastraba el
borde inferior de las primeras.

## Sustitución

Los nombres de archivo son estables y forman parte del contrato. Para cambiar
un render basta con reemplazar el archivo en su sitio; solo hay que tocar
`src/lib/projects.ts` si cambian las dimensiones —que alimentan la reserva de
espacio de `next/image` y evitan el salto de composición— o el texto
alternativo. Ningún componente conoce una ruta: todas viven en los datos del
proyecto.

### Hay que invalidar la caché del optimizador

`next/image` cachea cada variante por URL, y la URL no cambia al sobrescribir
el archivo: mientras la caché siga ahí, el sitio seguirá sirviendo el render
antiguo aunque el nuevo esté en disco. Se ha comprobado que no basta con
reiniciar el servidor ni con borrar `.next/cache/images` —el modo de desarrollo
guarda una segunda copia en `.next/dev/cache`—.

Al reemplazar un render:

1. `rm -rf .next` y volver a arrancar (o purgar la caché de imágenes del
   despliegue).
2. Recargar el navegador forzando caché (⌘⇧R): las variantes se sirven con
   cabecera de larga duración.
3. Comprobar el resultado pidiendo la variante directamente, que dice qué
   archivo hay detrás sin pasar por el navegador:

   ```
   curl -s -H "Accept: image/webp" \
     "http://localhost:3000/_next/image?url=%2Fprojects%2F720-sherrybrook%2Fkitchen-island.jpg&w=1920&q=75" \
     -o /tmp/check.webp && file /tmp/check.webp
   ```

   Las dimensiones que devuelva tienen que ser las del archivo nuevo.

## Excluido a propósito

- **La referencia vertical de inversión.** Queda fuera por completo.
- **La imagen del skyline de Raleigh.** Baja resolución y no es del proyecto.
- **El PDF del brochure.** No se publica ni se ofrece como descarga.
- **El diseño del brochure.** Aporta medios, no lenguaje visual: la ficha
  mantiene el design system web.
