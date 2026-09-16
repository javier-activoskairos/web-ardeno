# Flujo de captación en n8n

El extremo receptor de [`docs/lead-capture.md`](../lead-capture.md): lo que pasa
después de que `/api/interest` reenvíe un lead.

```
/api/interest  ──POST + Bearer──▶  n8n (webhook)
                                     │  normalizar · email en minúsculas
                                     ▼
                            buscar en [ADO] - Contacts por email
                                     │
                          ┌──────────┴──────────┐
                     ya existe                no existe
                    actualizar              crear contacto
                          └──────────┬──────────┘
                                     ▼
                            buscar el proyecto por slug
                                     ▼
                     crear un Follow-up enlazado a ambos
                                     ▼
                                   200 OK
```

El blueprint vive en [`lead-capture.workflow.json`](lead-capture.workflow.json)
y se versiona aquí a propósito: un flujo que solo existe dentro de n8n es un
flujo que nadie puede revisar ni restaurar.

## Dónde acaban los datos

En el CRM que Ardeno ya tiene, no en una tabla aparte. Las tres bases viven en
`ADO - BBDDs`, dentro del workspace de Mintech:

| Base                           | Qué guarda                                                                  |
| ------------------------------ | --------------------------------------------------------------------------- |
| `[ADO] - Contacts`             | La persona, deduplicada por email                                           |
| `[ADO] - Follow-ups`           | **Un registro por envío**, con el motivo, la atribución y el consentimiento |
| `[ADO] - Real Estate Projects` | El proyecto, enlazado por `Slug`                                            |

**Un Follow-up por envío, no uno por persona.** Cinco consultas de la misma
dirección son cinco Follow-ups bajo el mismo contacto: el historial sale solo,
sin apilar texto dentro de un campo ni pisar lo anterior.

## Instalación

### 1. Importar

En n8n: **Workflows → Add workflow**, y con el lienzo vacío pegar el contenido
del JSON (`Ctrl/Cmd + V`). Aparecen los trece nodos ya conectados, y los id de
las tres bases ya vienen puestos en el nodo `Configuracion`.

### 2. Credencial del webhook (Header Auth)

Protege el webhook: sin ella, cualquiera que descubra la URL puede escribir en
el CRM de Ardeno.

- Nodo **Webhook** → **Credential for Header Auth** → _Create new_.
- Name: `Ardeno — secreto del webhook de leads`
- **Name:** `Authorization`
- **Value:** `Bearer <secreto>` — el mismo que la web envíe en
  `ARDENO_LEAD_WEBHOOK_SECRET`. Genéralo con `openssl rand -base64 32`.

El `Bearer ` va incluido en el valor, con su espacio: la web manda la cabecera
entera y n8n compara la cadena completa.

### 3. Credencial de Notion

- Cualquier nodo HTTP → **Predefined Credential Type: Notion API** → _Create new_.
- Name: `Notion Ardeno — CRM`
- **Internal Integration Secret:** el token `ntn_…` de una integración interna
  del workspace de Mintech.

La integración tiene que estar conectada a las **tres** bases (**•••** →
_Connections_ en cada una), o las llamadas devolverán 404.

### 4. Activar

Interruptor **Active** arriba a la derecha. Copiar la **Production URL** del
nodo Webhook.

## Cómo la llama la web

```
ARDENO_LEAD_WEBHOOK_URL=http://ardeno_n8n:5678/webhook/ardeno-lead
```

**Dirección interna, no la pública.** Los dos servicios viven en la misma red
de Docker del VPS, así que el lead nunca sale a internet: no atraviesa Traefik,
no pasa por TLS y no queda expuesto a nadie que descubra el dominio de n8n. El
dominio público de n8n es solo para entrar a la interfaz.

Mientras se prueba, n8n distingue dos URL: `/webhook-test/ardeno-lead` solo
responde con **Execute workflow** pulsado, y `/webhook/ardeno-lead` es la de
verdad y exige el flujo activo.

## Decisiones

**`Status` y `Source` solo se escriben al crear el contacto.** Si alguien del
equipo ya movió a alguien a «Customer», un formulario posterior no puede
devolverlo a «Interested»; y si entró por referido, la web no puede reescribir
su origen. El teléfono y el nombre sí se refrescan: son el dato más reciente
que ha dado la propia persona, y un valor vacío nunca pisa uno que ya existe.

**El nombre se parte por el primer espacio.** El CRM separa `Name` y
`Last Name`; el formulario pide un solo campo. Acierta en la mayoría y no
inventa nada: lo que llegó entero sigue estando en `Full Name`.

**El proyecto se enlaza por slug.** Si ese slug no aparece en el CRM, la
relación se deja vacía y el nombre queda en el título del Follow-up. Mejor un
lead sin relación que un lead colgado del proyecto equivocado.

**Nodos HTTP Request contra la API de Notion, no el nodo de Notion.** El cuerpo
de cada llamada queda a la vista y no depende de cómo una versión del nodo
traduzca las propiedades. La versión de la API va fijada en la cabecera
`Notion-Version`.

**Sin consentimiento no se guarda.** El nodo `Normalizar` corta la ejecución si
`consent.accepted` no es `true`, aunque el endpoint ya lo valide: este webhook
es alcanzable por su cuenta y no puede fiarse de quien le llame.

## Propiedades añadidas a `[ADO] - Follow-ups`

La base existía con título, fecha, cliente y sellos de auditoría. Se le
añadieron catorce propiedades, **sin tocar ni borrar ninguna de las que ya
tenía**: `Type`, `Notes`, `Project` (relación con `Enquiries` en el lado del
proyecto), `Page URL`, `Language`, las cinco `UTM *`, `Consent`,
`Consent date`, `Consent version` y `Correlation ID`.

## Pendiente

- **Error Workflow.** En _Settings_ del flujo hay que apuntar uno que avise
  cuando una ejecución falle. Sin él, un fallo de Notion se pierde en silencio
  y el lead no llega a ninguna parte.
- **Aviso al equipo.** Hoy el lead solo se guarda; no se avisa a nadie.
  Requiere credencial de correo.
- **Copias de la base de n8n.** Los flujos y las credenciales viven en el
  Postgres del servicio `n8n-db`. Todavía no se vuelca a ningún sitio.
