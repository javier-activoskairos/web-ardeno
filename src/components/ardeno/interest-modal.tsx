"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  ArdenoButton,
  ArdenoField,
  ArdenoInput,
  ArdenoTextarea,
  type ArdenoButtonVariant,
} from "./primitives";

/**
 * Modal único de captación — "Express interest".
 *
 * Todos los CTA de la ficha abren este mismo modal. El envío va a
 * `/api/interest`, que nace apagado: mientras el interruptor del servidor esté
 * en `false` responde `unconfigured` y el modal lo dice con todas las letras.
 * Nunca se simula un envío correcto — el éxito solo se muestra tras un 200.
 *
 * Lo que se escribe vive en el estado de React mientras el modal está abierto
 * y se descarta al cerrarlo. No se persiste nada: ni `localStorage`, ni
 * `sessionStorage`, ni cookies.
 */

type InterestContextValue = { open: () => void };

const InterestContext = createContext<InterestContextValue | null>(null);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const EMPTY_VALUES = { name: "", email: "", phone: "", reason: "" };

type FieldName = keyof typeof EMPTY_VALUES;
type Errors = Partial<Record<FieldName, string>>;

/** Los cinco estados del envío. `unconfigured` es el de hoy. */
type SubmitState = "idle" | "pending" | "success" | "error" | "unconfigured";

const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
] as const;

type Utm = Record<(typeof UTM_KEYS)[number], string>;

const EMPTY_UTM: Utm = {
  utm_source: "",
  utm_medium: "",
  utm_campaign: "",
  utm_content: "",
  utm_term: "",
};

const MAX_UTM = 200;
const MAX_URL = 2048;

const cap = (value: string, max: number) => value.slice(0, max);

/** Dispara el modal compartido. Debe usarse dentro de <InterestProvider>. */
export function InterestButton({
  variant = "light",
  children = "Express interest",
}: {
  variant?: ArdenoButtonVariant;
  children?: ReactNode;
}) {
  const context = useContext(InterestContext);

  if (!context) {
    throw new Error("InterestButton debe usarse dentro de InterestProvider.");
  }

  return (
    <ArdenoButton variant={variant} onClick={context.open}>
      {children}
    </ArdenoButton>
  );
}

export function InterestProvider({
  projectId,
  projectSlug,
  projectName,
  children,
}: {
  projectId: string;
  projectSlug: string;
  projectName: string;
  children: ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [values, setValues] = useState(EMPTY_VALUES);
  const [errors, setErrors] = useState<Errors>({});
  const [state, setState] = useState<SubmitState>("idle");

  // Guarda inmediata contra el doble envío: el estado de React llega tarde si
  // alguien pulsa dos veces seguidas.
  const sendingRef = useRef(false);
  const utmRef = useRef<Utm>(EMPTY_UTM);
  const honeypotRef = useRef<HTMLInputElement | null>(null);

  /*
   * Atribución al montar, no al enviar: el visitante puede navegar y perder
   * los parámetros por el camino. Se lee `window.location.search` a mano
   * porque `useSearchParams` obligaría a renderizar en cliente todo el árbol
   * hasta el `Suspense` más cercano —y este proveedor envuelve la página
   * entera, que se prerenderiza—. No se persiste en ningún sitio.
   */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const captured = { ...EMPTY_UTM };
    for (const key of UTM_KEYS) {
      captured[key] = cap(params.get(key) ?? "", MAX_UTM);
    }
    utmRef.current = captured;
  }, []);

  const panelRef = useRef<HTMLDivElement | null>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  // Referencias a los controles obligatorios: permiten llevar el foco al
  // primer campo inválido sin depender de que React ya haya pintado el DOM.
  const inputRefs = useRef<Partial<Record<FieldName, HTMLInputElement | null>>>(
    {},
  );

  const ids = useId();
  const fieldId = useCallback(
    (name: FieldName | "company") => `${ids}-${name}`,
    [ids],
  );
  const titleId = `${ids}-title`;

  const open = useCallback(() => {
    openerRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    // Nada de lo introducido sobrevive al cierre.
    setValues(EMPTY_VALUES);
    setErrors({});
    setState("idle");
    sendingRef.current = false;
    openerRef.current?.focus();
  }, []);

  // Escape, trampa de foco y bloqueo del scroll de fondo.
  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        close();
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;

      const focusables = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input, textarea, select, [tabindex]:not([tabindex="-1"])',
      );
      if (focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown, true);
    const focusTimer = window.setTimeout(
      () => inputRefs.current.name?.focus(),
      30,
    );

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown, true);
      window.clearTimeout(focusTimer);
    };
  }, [isOpen, close]);

  const setField =
    (name: FieldName) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { value } = event.target;
      setValues((current) => ({ ...current, [name]: value }));
      setErrors((current) => ({ ...current, [name]: undefined }));
    };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (sendingRef.current) return;

    const nextErrors: Errors = {};
    if (!values.name.trim()) nextErrors.name = "Please enter your name.";
    if (!values.email.trim()) {
      nextErrors.email = "Please enter your email.";
    } else if (!EMAIL_RE.test(values.email.trim())) {
      nextErrors.email = "Please enter a valid email address.";
    }
    if (!values.phone.trim())
      nextErrors.phone = "Please enter your phone number.";

    setErrors(nextErrors);

    const firstInvalid = (["name", "email", "phone"] as const).find(
      (field) => nextErrors[field],
    );

    if (firstInvalid) {
      setState("idle");
      inputRefs.current[firstInvalid]?.focus();
      return;
    }

    sendingRef.current = true;
    setState("pending");

    try {
      const response = await fetch("/api/interest", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          projectId,
          projectSlug,
          name: values.name.trim(),
          email: values.email.trim(),
          phone: values.phone.trim(),
          reason: values.reason.trim(),
          // La trampa viaja tal cual: el servidor decide qué hacer con ella.
          company: honeypotRef.current?.value ?? "",
          pageUrl: cap(window.location.href, MAX_URL),
          queryString: cap(window.location.search, MAX_URL),
          locale: document.documentElement.lang,
          submittedAt: new Date().toISOString(),
          utm: utmRef.current,
        }),
      });

      if (response.status === 503) {
        setState("unconfigured");
        return;
      }
      if (!response.ok) {
        setState("error");
        return;
      }

      // El éxito solo se pinta tras un 200 de verdad.
      setState("success");
      setValues(EMPTY_VALUES);
      setErrors({});
    } catch {
      setState("error");
    } finally {
      sendingRef.current = false;
    }
  };

  const contextValue = useMemo<InterestContextValue>(() => ({ open }), [open]);

  return (
    <InterestContext.Provider value={contextValue}>
      {children}

      {isOpen ? (
        <div
          className="ar-modal"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) close();
          }}
        >
          <div
            className="ar-modal__panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            ref={panelRef}
          >
            {/* Cabecera fija: en móvil el cuerpo scrollea por debajo y el
                control de cierre sigue siempre a la vista. */}
            <div className="ar-modal__head">
              <p className="ar-eyebrow">{projectName}</p>
              <button
                type="button"
                className="ar-modal__close"
                onClick={close}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="ar-modal__body">
              <h2 id={titleId} className="ar-display ar-modal__title">
                Interested in this project?
              </h2>
              <p className="ar-body ar-modal__intro">
                Leave your details and our team will share the latest verified
                project information.
              </p>

              <form
                className="ar-form ar-modal__form"
                noValidate
                onSubmit={onSubmit}
              >
                {state === "unconfigured" ? (
                  <div className="ar-alert" role="alert">
                    We cannot send your request yet. The enquiry integration is
                    not configured for this project.
                    <span className="mt-2 block border-t border-[rgba(154,59,48,0.22)] pt-2 text-[var(--w-ink-2)] text-[var(--w-s-14)]">
                      Nothing was sent or stored. Please contact the Ardeno team
                      directly in the meantime.
                    </span>
                  </div>
                ) : null}

                {state === "error" ? (
                  <div className="ar-alert" role="alert">
                    We could not send your request. Please try again.
                  </div>
                ) : null}

                {state === "success" ? (
                  <div className="ar-note" role="status">
                    Thank you. Our team will be in touch shortly.
                  </div>
                ) : null}

                {/* Trampa para bots: fuera de pantalla, nunca oculta con
                    `display:none`, fuera del orden de tabulación y fuera del
                    árbol de accesibilidad. Quien la rellene recibe un éxito
                    genérico y su envío no se reenvía a ningún sitio. */}
                <div className="ar-hp" aria-hidden="true">
                  <label htmlFor={fieldId("company")}>Company</label>
                  <input
                    id={fieldId("company")}
                    name="company"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    ref={honeypotRef}
                    defaultValue=""
                  />
                </div>

                <ArdenoField
                  id={fieldId("name")}
                  label="Name"
                  error={errors.name}
                >
                  <ArdenoInput
                    id={fieldId("name")}
                    name="name"
                    type="text"
                    autoComplete="name"
                    value={values.name}
                    onChange={setField("name")}
                    ref={(el) => {
                      inputRefs.current.name = el;
                    }}
                    aria-invalid={errors.name ? "true" : undefined}
                    aria-describedby={
                      errors.name ? `${fieldId("name")}-error` : undefined
                    }
                  />
                </ArdenoField>

                <div className="ar-row2">
                  <ArdenoField
                    id={fieldId("email")}
                    label="Email"
                    error={errors.email}
                  >
                    <ArdenoInput
                      id={fieldId("email")}
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={values.email}
                      onChange={setField("email")}
                      ref={(el) => {
                        inputRefs.current.email = el;
                      }}
                      aria-invalid={errors.email ? "true" : undefined}
                      aria-describedby={
                        errors.email ? `${fieldId("email")}-error` : undefined
                      }
                    />
                  </ArdenoField>

                  <ArdenoField
                    id={fieldId("phone")}
                    label="Phone"
                    error={errors.phone}
                  >
                    <ArdenoInput
                      id={fieldId("phone")}
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      value={values.phone}
                      onChange={setField("phone")}
                      ref={(el) => {
                        inputRefs.current.phone = el;
                      }}
                      aria-invalid={errors.phone ? "true" : undefined}
                      aria-describedby={
                        errors.phone ? `${fieldId("phone")}-error` : undefined
                      }
                    />
                  </ArdenoField>
                </div>

                <ArdenoField
                  id={fieldId("reason")}
                  label="Why are you interested in this project?"
                  optional
                >
                  <ArdenoTextarea
                    id={fieldId("reason")}
                    name="reason"
                    rows={3}
                    value={values.reason}
                    onChange={setField("reason")}
                  />
                </ArdenoField>

                {/* Superficie clara: es el único sitio de la ficha donde el CTA
                  medido del sitio real se puede usar tal cual. */}
                <ArdenoButton
                  type="submit"
                  variant="brand"
                  className="mt-1 self-start"
                  disabled={state === "pending"}
                  aria-busy={state === "pending"}
                >
                  {state === "pending" ? "Sending…" : "Express interest"}
                </ArdenoButton>

                {/* Tiene que ser cierto en los cinco estados. La promesa de
                    que no se envía nada solo vale con la captación apagada, y
                    eso ya lo dice su propio aviso; aquí queda lo que se cumple
                    siempre. */}
                <p className="ar-modal__note">
                  Your details are only sent to the Ardeno team when you submit
                  this form. Nothing is saved in your browser.
                </p>
              </form>
            </div>
          </div>
        </div>
      ) : null}
    </InterestContext.Provider>
  );
}
