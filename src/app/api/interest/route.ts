import { getPublicProject } from "@/lib/projects";

/**
 * Captación de interés — POST /api/interest
 *
 * Nace apagada. Sin `ARDENO_LEAD_CAPTURE_ENABLED === "true"` responde
 * `unconfigured` y no toca el payload más allá de rechazarlo: no valida, no
 * reenvía y no llama a nadie. Aunque haya webhook configurado.
 *
 * El motivo no es técnico: no hay política de privacidad aprobada. Ver
 * `docs/lead-capture.md` antes de tocar el interruptor.
 *
 * Nada de lo que escribe una persona llega a los logs. Solo se registra el
 * identificador de correlación, el proyecto, el desenlace y la duración.
 */

/* ------------------------------------------------------------------ Límites */

const MAX_BODY_BYTES = 10 * 1024;

const MAX = {
  name: 120,
  email: 254,
  phone: 40,
  reason: 2000,
  url: 2048,
  utm: 200,
  locale: 8,
} as const;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const LOCALE_RE = /^[a-z]{2}(-[A-Z]{2})?$/;

/** Las únicas claves de atribución que se aceptan. */
const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
] as const;

type UtmKey = (typeof UTM_KEYS)[number];

const WEBHOOK_TIMEOUT_MS = 8000;

/* --------------------------------------------------------------- Respuestas */

type Outcome =
  | "success"
  | "invalid_request"
  | "unsupported_media_type"
  | "rate_limited"
  | "upstream_error"
  | "unconfigured";

const STATUS: Record<Outcome, number> = {
  success: 200,
  invalid_request: 400,
  unsupported_media_type: 415,
  rate_limited: 429,
  upstream_error: 502,
  unconfigured: 503,
};

/** Cuerpo mínimo: un estado y una referencia de soporte. Nada personal. */
function reply(outcome: Outcome, correlationId: string): Response {
  return Response.json(
    { status: outcome, correlationId },
    { status: STATUS[outcome] },
  );
}

/* ------------------------------------------------------------- Rate limit */

/**
 * Protección de mínimos, en memoria y por réplica: 5 intentos cada 10 minutos.
 * Sirve para una sola instancia, que es lo que hay. Si algún día se replica el
 * proceso habrá que moverla a un almacén compartido — está anotado en
 * `docs/lead-capture.md`.
 *
 * Sin IP fiable no se limita: una clave global bloquearía a todo el mundo por
 * culpa de un solo abusador.
 */
const RATE_MAX_ATTEMPTS = 5;
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX_KEYS = 5000;

const attempts = new Map<string, number[]>();

function clientKey(request: Request): string | null {
  const forwarded = request.headers.get("x-forwarded-for");
  const candidate =
    forwarded?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip")?.trim();
  return candidate ? candidate : null;
}

function isRateLimited(key: string | null): boolean {
  if (!key) return false;

  const now = Date.now();
  const cutoff = now - RATE_WINDOW_MS;

  // Limpieza perezosa: sin temporizadores que mantener vivos.
  for (const [entry, times] of attempts) {
    const alive = times.filter((t) => t > cutoff);
    if (alive.length === 0) attempts.delete(entry);
    else attempts.set(entry, alive);
  }

  // Techo duro: el mapa no puede crecer sin fin.
  if (!attempts.has(key) && attempts.size >= RATE_MAX_KEYS) {
    const oldest = attempts.keys().next();
    if (!oldest.done) attempts.delete(oldest.value);
  }

  const times = attempts.get(key) ?? [];
  if (times.length >= RATE_MAX_ATTEMPTS) return true;

  attempts.set(key, [...times, now]);
  return false;
}

/* ----------------------------------------------------------------- Origen */

const LOOPBACK = new Set(["localhost", "127.0.0.1", "[::1]", "::1"]);

/**
 * El origen debe coincidir con el del sitio. La excepción para bucle local
 * solo se abre cuando el propio sitio es local, así que en producción, sobre
 * el dominio real, un origen de bucle se rechaza igual que cualquier otro.
 *
 * Detrás de Traefik hay que verificar en la preview que el `Origin` llega
 * intacto y que `x-forwarded-for` trae la IP del visitante.
 */
function isAllowedOrigin(origin: string | null, siteUrl: string): boolean {
  if (!origin) return false;
  try {
    const site = new URL(siteUrl);
    const incoming = new URL(origin);
    if (incoming.origin === site.origin) return true;
    return LOOPBACK.has(site.hostname) && LOOPBACK.has(incoming.hostname);
  } catch {
    return false;
  }
}

/* ------------------------------------------------------------- Validación */

type CleanLead = {
  name: string;
  email: string;
  phone: string;
  reason: string;
  projectId: string;
  projectSlug: string;
  pageUrl: string;
  queryString: string;
  locale: string;
  clientSubmittedAt: string;
};

function text(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > max ? null : trimmed;
}

function readUtm(value: unknown): Record<UtmKey, string> | null {
  const out = {} as Record<UtmKey, string>;
  if (value === undefined || value === null) {
    for (const key of UTM_KEYS) out[key] = "";
    return out;
  }
  if (typeof value !== "object" || Array.isArray(value)) return null;

  const source = value as Record<string, unknown>;
  // Lista blanca: cualquier clave que no esté aquí se descarta en silencio.
  for (const key of UTM_KEYS) {
    const raw = source[key];
    if (raw === undefined || raw === null) {
      out[key] = "";
      continue;
    }
    const clean = text(raw, MAX.utm);
    if (clean === null) return null;
    out[key] = clean;
  }
  return out;
}

/* ------------------------------------------------------------------- POST */

export async function POST(request: Request): Promise<Response> {
  const started = Date.now();
  const correlationId = crypto.randomUUID();

  const done = (outcome: Outcome, projectId: string | null = null) => {
    // Solo metadatos. Ni un dato personal, ni la URL, ni la IP.
    console.info(
      JSON.stringify({
        event: "interest",
        correlationId,
        projectId,
        outcome,
        durationMs: Date.now() - started,
      }),
    );
    return reply(outcome, correlationId);
  };

  const captureEnabled = process.env.ARDENO_LEAD_CAPTURE_ENABLED === "true";
  const webhookUrl = process.env.ARDENO_LEAD_WEBHOOK_URL;
  const webhookSecret = process.env.ARDENO_LEAD_WEBHOOK_SECRET;

  // Interruptor primero: apagado, ni se mira el cuerpo.
  if (!captureEnabled || !webhookUrl || !webhookSecret) {
    return done("unconfigured");
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  if (!isAllowedOrigin(request.headers.get("origin"), siteUrl)) {
    return done("invalid_request");
  }

  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("application/json")) {
    return done("unsupported_media_type");
  }

  const declaredLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > MAX_BODY_BYTES) {
    return done("invalid_request");
  }

  if (isRateLimited(clientKey(request))) return done("rate_limited");

  const raw = await request.text();
  // El `content-length` puede mentir o no venir: se mide lo que ha llegado.
  if (new TextEncoder().encode(raw).length > MAX_BODY_BYTES) {
    return done("invalid_request");
  }

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return done("invalid_request");
  }
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return done("invalid_request");
  }
  const input = body as Record<string, unknown>;

  // Trampa: si viene relleno, éxito genérico y nada se reenvía.
  const honeypot = input.company;
  if (typeof honeypot === "string" && honeypot.trim() !== "") {
    return done("success");
  }

  const utm = readUtm(input.utm);
  if (!utm) return done("invalid_request");

  const name = text(input.name, MAX.name);
  const email = text(input.email, MAX.email);
  const phone = text(input.phone, MAX.phone);
  const reason = text(input.reason ?? "", MAX.reason);
  const projectId = text(input.projectId, 200);
  const projectSlug = text(input.projectSlug, 200);
  const pageUrl = text(input.pageUrl ?? "", MAX.url);
  const queryString = text(input.queryString ?? "", MAX.url);
  const locale = text(input.locale ?? "", MAX.locale);
  const clientSubmittedAt = text(input.submittedAt ?? "", 40);

  if (
    !name ||
    !email ||
    !phone ||
    reason === null ||
    !projectId ||
    !projectSlug ||
    pageUrl === null ||
    queryString === null ||
    locale === null ||
    clientSubmittedAt === null
  ) {
    return done("invalid_request");
  }
  if (!EMAIL_RE.test(email)) return done("invalid_request");
  if (locale !== "" && !LOCALE_RE.test(locale)) return done("invalid_request");

  // El proyecto lo resuelve el servidor. `getPublicProject` ya filtra por
  // publicación; la triple comprobación deja la intención por escrito.
  const project = await getPublicProject(projectSlug);
  if (!project || project.id !== projectId || !project.published) {
    return done("invalid_request");
  }

  const lead: CleanLead = {
    name,
    email,
    phone,
    reason,
    projectId,
    projectSlug,
    pageUrl,
    queryString,
    locale,
    clientSubmittedAt,
  };

  /* Payload construido campo a campo. Nunca `{ ...body }`: TypeScript solo
     detecta propiedades sobrantes en literales, así que un spread colaría al
     webhook cualquier cosa que mandase el cliente. El proyecto va con los
     valores del servidor, no con los descriptivos del navegador. */
  const payload = {
    correlationId,
    submittedAt: new Date().toISOString(),
    project: {
      id: project.id,
      slug: project.slug,
      name: project.name,
    },
    contact: {
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
    },
    reason: lead.reason,
    attribution: {
      pageUrl: lead.pageUrl,
      queryString: lead.queryString,
      locale: lead.locale,
      clientSubmittedAt: lead.clientSubmittedAt,
      utm_source: utm.utm_source,
      utm_medium: utm.utm_medium,
      utm_campaign: utm.utm_campaign,
      utm_content: utm.utm_content,
      utm_term: utm.utm_term,
    },
  };

  try {
    const upstream = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${webhookSecret}`,
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(WEBHOOK_TIMEOUT_MS),
    });
    if (!upstream.ok) return done("upstream_error", project.id);
  } catch {
    // Ni la URL ni el error entran en el log: podrían llevar el secreto.
    return done("upstream_error", project.id);
  }

  return done("success", project.id);
}
