# Flujo de captación en n8n

El extremo receptor de [`docs/lead-capture.md`](../lead-capture.md): lo que pasa
después de que `/api/interest` reenvíe un lead.

```
/api/interest  ──POST + Bearer──▶  n8n (webhook)
                                     │  normalizar · email en minúsculas
                                     ▼
                                  buscar en [AG] - Leads por email
                                     │
                          ┌──────────┴──────────┐
                     ya existe                no existe
                          │                      │
                    actualizar              crear lead
                          └──────────┬──────────┘
                                     ▼
                                   200 OK
```

El blueprint vive en [`lead-capture.workflow.json`](lead-capture.workflow.json)
y se versiona aquí a propósito: un flujo que solo existe dentro de n8n es un
flujo que nadie puede revisar ni restaurar.

## Instalación

### 1. Importar

En n8n: **Workflows → Add workflow**, y con el lienzo vacío pegar el contenido
del JSON (`Ctrl/Cmd + V`). Aparecen los nueve nodos ya conectados.

### 2. Credencial del webhook (Header Auth)

Protege el webhook: sin ella, cualquiera que descubra la URL puede escribir
leads en el Notion de Ardeno.

- Nodo **Webhook** → **Credential for Header Auth** → _Create new_.
- Name: `Ardeno — secreto del webhook de leads`
- **Name:** `Authorization`
- **Value:** `Bearer <secreto>` — el mismo que la web envíe en
  `ARDENO_LEAD_WEBHOOK_SECRET`. Genéralo con `openssl rand -base64 32`.

El `Bearer ` va incluido en el valor, con su espacio: la web manda la cabecera
entera y n8n compara la cadena completa.

### 3. Credencial de Notion

- Cualquier nodo HTTP → **Predefined Credential Type: Notion API** → _Create new_.
- Name: `Notion Ardeno — leads`
- **Internal Integration Secret:** el token `ntn_…` de la integración
  `n8n Leads Ardeno` del workspace de Ardeno.

La integración tiene que estar conectada a la base `[AG] - Leads`
(**•••** → _Connections_), o todas las llamadas devolverán 404.

### 4. Id de la base de datos

Nodo **Configuracion** → sustituir `PEGA_AQUI_EL_ID_DE_LA_BBDD` por los 32
caracteres de la URL de la base. Es el único sitio donde se escribe: los demás
nodos lo arrastran.

### 5. Activar

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

**Nodos HTTP Request contra la API de Notion, no el nodo de Notion.** El cuerpo
de cada llamada queda a la vista y no depende de cómo una versión del nodo
traduzca las propiedades. La versión de la API va fijada en la cabecera
`Notion-Version`, así que una actualización de Notion no cambia el
comportamiento por su cuenta.

**Deduplicación por email normalizado.** Minúsculas y sin espacios, en el nodo
`Normalizar`. El endpoint web no deduplica a propósito —no tiene el histórico—:
esto es trabajo de aquí.

**El motivo no se pisa.** Un segundo envío del mismo email apila el texto nuevo
debajo del anterior con su fecha, y suma uno a `Envíos`. Quedarse solo con la
última frase sería tirar el contexto que hace útil un lead repetido.

**El estado solo se escribe al crear.** Si alguien ya movió el lead a
«Contactado», un envío posterior no puede devolverlo a «Nuevo».

**Sin consentimiento no se guarda.** El nodo `Normalizar` corta la ejecución si
`consent.accepted` no es `true`, aunque el endpoint ya lo valide: este webhook
es alcanzable por su cuenta y no puede fiarse de quien le llame.

## Pendiente

- **Error Workflow.** En _Settings_ del flujo hay que apuntar uno que avise
  cuando una ejecución falle. Sin él, un fallo de Notion se pierde en silencio
  y el lead no llega a ninguna parte.
- **Aviso al equipo.** Hoy el lead solo se guarda; no se avisa a nadie. Decidido
  así para tener la cadena en pie antes. Requiere credencial de correo.
- **Copias de la base de n8n.** Los flujos y las credenciales viven en el
  Postgres del servicio `n8n-db`. Todavía no se vuelca a ningún sitio.
