# Captación de interés

> **La captación sigue apagada.** Ya no por falta de política ni de
> consentimiento —los dos están hechos—, sino porque todavía no hay webhook de
> n8n ni base de leads al otro lado. Lee
> [Antes de encenderla](#antes-de-encenderla) antes de tocar el interruptor.

## Arquitectura

```
InterestForm            (Client Component, uno solo)
 ├─ bloque en línea del cierre de la ficha
 └─ modal que abre el CTA de la cabecera
        │  POST JSON, mismo origen
        ▼
/api/interest           (Route Handler, servidor)
        │  interruptor → validación → payload campo a campo
        ▼
Webhook de n8n          (instancia propia de Ardeno en su VPS)
        ▼
BBDD de contactos/leads de Ardeno
```

Hoy la cadena se corta en el primer paso: sin `ARDENO_LEAD_CAPTURE_ENABLED`
en `"true"`, el endpoint responde `unconfigured` y no llama a nadie.

## Variables de entorno

| Variable                      | Qué hace                                                                            |
| ----------------------------- | ----------------------------------------------------------------------------------- |
| `ARDENO_LEAD_CAPTURE_ENABLED` | Interruptor maestro. Cualquier valor distinto de `"true"` deja la captación apagada |
| `ARDENO_LEAD_WEBHOOK_URL`     | Webhook de n8n                                                                      |
| `ARDENO_LEAD_WEBHOOK_SECRET`  | Se envía como `Authorization: Bearer`                                               |

Ninguna lleva prefijo `NEXT_PUBLIC_`: se leen en servidor y no deben llegar
jamás al navegador. Verificado: no aparecen ni en el HTML ni en los bundles.

Si falta cualquiera de las tres, la captación queda apagada. **Aunque el
webhook esté configurado, el interruptor manda.**

## Dos superficies, un solo formulario

La ficha convierte por dos sitios: el **bloque en línea** del cierre, con los
campos ya montados en la página para quien llega hasta abajo, y el **modal** que
abre el CTA de la cabecera, que tiene que funcionar desde cualquier punto del
scroll. Los CTA del hero no abren nada: son anclas a `#interest`.

Los dos montan el mismo `<InterestForm>`
([`src/components/ardeno/interest-form.tsx`](../src/components/ardeno/interest-form.tsx)),
que es donde vive toda la lógica: validación, trampa para bots, atribución de
campaña, estados y la llamada al endpoint. El modal
([`interest-modal.tsx`](../src/components/ardeno/interest-modal.tsx)) solo añade
lo propio de un diálogo —foco, Escape, bloqueo del scroll— y ajusta su titular a
partir del estado que el formulario le comunica.

Una segunda copia del formulario sería una segunda validación que alguien
olvidaría actualizar; por eso no la hay.

## Estados del formulario

| Estado         | Cuándo                             | Qué ve quien lo usa                              |
| -------------- | ---------------------------------- | ------------------------------------------------ |
| `idle`         | de partida                         | El formulario                                    |
| `pending`      | mientras se envía                  | Botón bloqueado, «Sending…», `aria-busy`         |
| `success`      | solo tras un 200 real              | Agradecimiento, campos limpios, sin cerrar nada  |
| `error`        | red caída o 4xx/5xx que no sea 503 | Mensaje reintentable, valores conservados        |
| `unconfigured` | el servidor responde 503           | Aviso honesto: no se ha enviado ni guardado nada |

El éxito **nunca** se pinta sin respuesta 200. El modal no se cierra solo: la
confirmación recibe el foco y el control de cierre queda a un tabulador.

## Respuestas del endpoint

| Código | Estado                   | Motivo                                   |
| ------ | ------------------------ | ---------------------------------------- |
| 200    | `success`                | Reenviado, o trampa para bots activada   |
| 400    | `invalid_request`        | Origen, tamaño, JSON o validación        |
| 415    | `unsupported_media_type` | El `Content-Type` no es JSON             |
| 429    | `rate_limited`           | Más de 5 intentos en 10 minutos          |
| 502    | `upstream_error`         | El webhook falla o agota el tiempo       |
| 503    | `unconfigured`           | Interruptor apagado o variables ausentes |

El cuerpo lleva solo `status` y `correlationId`. Nada personal.

## Consentimiento

La casilla es obligatoria y nace desmarcada. No hay envío sin ella: el
formulario no deja continuar y el endpoint **rechaza con 400** cualquier
petición sin `consentAccepted: true`, venga o no de la página. Sin
consentimiento no hay base sobre la que tratar el dato, así que el lead no se
reenvía a ningún sitio.

El texto vive en [`src/lib/consent.ts`](../src/lib/consent.ts), partido en los
tres trozos que lo componen —lo de antes del enlace, el enlace y lo de
después—. Formulario y servidor se sirven de la misma fuente, así que no
pueden acabar diciendo cosas distintas.

**El navegador nunca envía el texto, solo la versión.** El servidor resuelve
qué decía esa versión y la sella con su propia hora. Así ningún cliente puede
declarar que se aceptó algo que no se llegó a enseñar. Al webhook viaja:

```json
"consent": {
  "accepted": true,
  "version": "2026-09-16",
  "text": "By submitting this form, you agree that…",
  "acceptedAt": "2026-09-16T15:59:56.022Z"
}
```

Si la versión que llega no es la vigente, el envío se rechaza. Ocurre cuando
alguien tenía la página abierta mientras se aprobaba un texto nuevo: al
recargar acepta el actual. Es preferible perder un envío a guardar un
consentimiento contra un texto que esa persona no leyó.

### Al cambiar el texto

Subir `CONSENT_VERSION` a la fecha del nuevo texto aprobado. **Nunca reescribir
una versión existente:** los consentimientos ya guardados conservan la suya, y
eso es justo lo que hay que poder demostrar más adelante.

## Datos tratados

Del formulario: nombre, correo, teléfono y un motivo opcional.

De la atribución: `pageUrl`, `queryString`, `locale`, la marca de tiempo del
cliente y las cinco `utm_*`. Se capturan al abrir la página leyendo
`window.location.search`, se guardan en memoria mientras dura la visita y no se
escriben en ningún sitio: **ni `localStorage`, ni `sessionStorage`, ni
cookies**.

No se usa `useSearchParams` a propósito: obligaría a renderizar en cliente todo
el árbol hasta el `Suspense` más cercano, y el proveedor envuelve una página
que se prerenderiza.

El payload al webhook se construye campo a campo. **Nunca `{ ...body }`**:
TypeScript solo detecta propiedades sobrantes en literales, así que un spread
colaría al webhook cualquier cosa que enviase el cliente. El proyecto viaja con
los valores que resuelve el servidor —`id`, `slug` y `name`—, no con los
descriptivos del navegador.

## Qué nunca entra en los logs

Nombre, correo, teléfono, motivo, IP, `pageUrl`, `queryString`, el payload, la
URL del webhook y el secreto.

Solo se registra: `correlationId`, `projectId`, desenlace y duración.

```json
{
  "event": "interest",
  "correlationId": "…",
  "projectId": "ardeno-720-sherrybrook",
  "outcome": "success",
  "durationMs": 13
}
```

## Protecciones

- **Interruptor**: antes que nada. Apagado, el cuerpo ni se mira.
- **Origen**: debe coincidir con la URL del sitio, que llega ya normalizada
  desde `SITE_URL` en [`src/lib/site.ts`](../src/lib/site.ts) —el mismo origen
  que usan canonical y sitemap, para que no puedan divergir—. La excepción para
  bucle local solo se abre cuando el propio sitio es local, así que en el
  dominio real un origen de bucle se rechaza. Sin cabecera `Origin`, se
  rechaza. Sin CORS abierto y sin `Access-Control-Allow-Origin: *`.
- **Tamaño**: 10 KB, comprobando el `Content-Length` declarado y además los
  bytes que llegan de verdad.
- **Trampa para bots**: campo `company` fuera de pantalla —nunca
  `display: none`, que los bots saltan—, con `tabIndex={-1}`,
  `autocomplete="off"` y el contenedor `aria-hidden`. Si llega relleno, la
  respuesta es un 200 genérico y **no se reenvía nada**.
- **Límite de frecuencia**: 5 intentos cada 10 minutos por IP observada, en
  memoria, con limpieza perezosa y techo de 5.000 claves. Sin IP fiable no se
  limita: una clave global bloquearía a todos por culpa de uno.
- **Proyecto**: se resuelve en el servidor y se comprueban a la vez `id`,
  `slug` y publicación. No se puede fabricar un lead para un proyecto
  inventado o sin publicar.
- **Tiempo de espera** del webhook: 8 segundos.

Sin CAPTCHA. Si el correo basura pasa estas capas, entonces se plantea uno.

### Límites conocidos

- El límite de frecuencia es **best-effort y por réplica**: vive en la memoria
  del proceso. Con una sola instancia, que es lo que hay, cumple. Si algún día
  se replica el proceso habrá que llevarlo a un almacén compartido.
- **Detrás de Traefik hay que verificar en la preview** que la cabecera
  `Origin` llega intacta y que `x-forwarded-for` trae la IP del visitante y no
  la del proxy. Si el proxy no la propaga, el límite deja de discriminar.

## Antes de encenderla

Encender el interruptor **no basta**. Falta, y es bloqueante:

1. ~~**Política de privacidad publicada.**~~ **Hecho.** Vive en
   `/privacy-policy` (ver [privacy-policy.md](privacy-policy.md)).
2. ~~**Texto de consentimiento o casilla aprobados.**~~ **Hecho.** Casilla
   obligatoria enlazada a la política; ver [Consentimiento](#consentimiento).
3. **Webhook de n8n** en la instancia de Ardeno, con su secreto.
4. **BBDD de contactos/leads** definida, con sus propiedades.
5. **Persona receptora** del aviso y por qué canal.

Quedan los tres últimos, y son los que impiden encender el interruptor:
sin webhook ni base de datos al otro lado, un envío correcto acabaría en un
`upstream_error` y el dato se perdería.

## Deduplicación

**No se implementa en la API web, y es deliberado.** La deduplicación será por
correo normalizado a nivel de contacto, y el interés por proyecto se guardará
como relación o registro asociado. Ese trabajo corresponde a n8n y a la base de
datos, que son los que tienen el histórico; el endpoint no lo tiene y no debe
inventárselo.

## Mantener el interruptor apagado

- `.env.example` trae `ARDENO_LEAD_CAPTURE_ENABLED=false`. Que siga así.
- No definas la variable en el entorno de producción hasta cumplir los cinco
  puntos de arriba.
- Para probar en local, pasa las variables en la propia línea de comandos y
  **no las escribas en `.env.local`**: así no se quedan encendidas por
  descuido.

```bash
ARDENO_LEAD_CAPTURE_ENABLED=true \
ARDENO_LEAD_WEBHOOK_URL=http://127.0.0.1:4999/hook \
ARDENO_LEAD_WEBHOOK_SECRET=… \
npx next start --hostname 127.0.0.1
```

Usa siempre un receptor local y datos ficticios. Nunca datos reales de personas.
