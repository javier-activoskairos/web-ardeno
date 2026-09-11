"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  ArdenoButton,
  ArdenoField,
  ArdenoInput,
  ArdenoTextarea,
} from "./primitives";

/**
 * Formulario de captación — "Contact us".
 *
 * Es el único sitio del proyecto donde vive la lógica de envío: validación,
 * trampa para bots, atribución de campaña, estados y llamada a
 * `/api/interest`. Lo usan las dos superficies de conversión —el modal que
 * abre la cabecera y el bloque en línea del cierre de la ficha— y por eso está
 * aquí y no dentro de ninguna de las dos: una segunda copia sería una segunda
 * validación que se olvidaría de actualizar.
 *
 * El endpoint nace apagado: mientras el interruptor del servidor esté en
 * `false` responde `unconfigured` y el formulario lo dice con todas las
 * letras. Nunca se simula un envío correcto — el éxito solo se muestra tras un
 * 200 de verdad.
 *
 * Lo que se escribe vive en el estado de React y se descarta al desmontar. No
 * se persiste nada: ni `localStorage`, ni `sessionStorage`, ni cookies.
 */

/** Los cinco estados del envío. `unconfigured` es el de hoy. */
export type InterestSubmitState =
  | "idle"
  | "pending"
  | "success"
  | "error"
  | "unconfigured";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const EMPTY_VALUES = { name: "", email: "", phone: "", reason: "" };

type FieldName = keyof typeof EMPTY_VALUES;
type Errors = Partial<Record<FieldName, string>>;

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

export function InterestForm({
  projectId,
  projectSlug,
  autoFocus = false,
  successAction,
  onStateChange,
  className,
}: {
  projectId: string;
  projectSlug: string;
  /** El modal lleva el foco al primer campo al abrirse; la sección no. */
  autoFocus?: boolean;
  /** Control extra tras la confirmación —«Close» en el modal—. */
  successAction?: ReactNode;
  /** Permite al contenedor ajustar su propio copy sin duplicar el estado. */
  onStateChange?: (state: InterestSubmitState) => void;
  className?: string;
}) {
  const [values, setValues] = useState(EMPTY_VALUES);
  const [errors, setErrors] = useState<Errors>({});
  const [state, setState] = useState<InterestSubmitState>("idle");

  // Guarda inmediata contra el doble envío: el estado de React llega tarde si
  // alguien pulsa dos veces seguidas.
  const sendingRef = useRef(false);
  const utmRef = useRef<Utm>(EMPTY_UTM);
  const honeypotRef = useRef<HTMLInputElement | null>(null);
  const successRef = useRef<HTMLParagraphElement | null>(null);
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

  /*
   * Atribución al montar, no al enviar: el visitante puede navegar y perder
   * los parámetros por el camino. Se lee `window.location.search` a mano
   * porque `useSearchParams` obligaría a renderizar en cliente todo el árbol
   * hasta el `Suspense` más cercano —y este formulario vive dentro de una
   * página que se prerenderiza—. No se persiste en ningún sitio.
   */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const captured = { ...EMPTY_UTM };
    for (const key of UTM_KEYS) {
      captured[key] = cap(params.get(key) ?? "", MAX_UTM);
    }
    utmRef.current = captured;
  }, []);

  useEffect(() => {
    if (!autoFocus) return;
    const timer = window.setTimeout(() => inputRefs.current.name?.focus(), 30);
    return () => window.clearTimeout(timer);
  }, [autoFocus]);

  // Tras el éxito el formulario desaparece: el foco tiene que ir a algún
  // sitio, y ese sitio es la confirmación.
  useEffect(() => {
    if (state === "success") successRef.current?.focus();
    onStateChange?.(state);
  }, [state, onStateChange]);

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

  if (state === "success") {
    return (
      <div className="ar-success">
        {/* Recibe el foco al confirmarse el envío y se anuncia como estado.
            `tabIndex={-1}` lo hace enfocable sin meterlo en el orden de
            tabulación: el siguiente Tab va al control que venga después. */}
        <p className="ar-body" role="status" tabIndex={-1} ref={successRef}>
          Your enquiry has been received. Our team will be in touch shortly.
        </p>
        {successAction}
      </div>
    );
  }

  return (
    <form className={className ?? "ar-form"} noValidate onSubmit={onSubmit}>
      {state === "unconfigured" ? (
        <div className="ar-alert" role="alert">
          We cannot process your request yet. The enquiry integration is not
          configured for this project.
          <span className="mt-2 block border-t border-[rgba(154,59,48,0.22)] pt-2 text-[var(--w-ink-2)] text-[var(--w-s-14)]">
            Your request was not forwarded to the Ardeno team or stored. Please
            contact Ardeno directly in the meantime.
          </span>
        </div>
      ) : null}

      {state === "error" ? (
        <div className="ar-alert" role="alert">
          We could not send your request. Please try again.
        </div>
      ) : null}

      {/* Trampa para bots: fuera de pantalla, nunca oculta con
          `display:none`, fuera del orden de tabulación y fuera del árbol de
          accesibilidad. Quien la rellene recibe un éxito genérico y su envío
          no se reenvía a ningún sitio. */}
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

      <ArdenoField id={fieldId("name")} label="Name" error={errors.name}>
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
        <ArdenoField id={fieldId("email")} label="Email" error={errors.email}>
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

        <ArdenoField id={fieldId("phone")} label="Phone" error={errors.phone}>
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

      {/* Las dos superficies del formulario son claras, así que el CTA medido
          del sitio real se puede usar tal cual en ambas. */}
      <ArdenoButton
        type="submit"
        variant="brand"
        className="mt-1 self-start"
        disabled={state === "pending"}
        aria-busy={state === "pending"}
      >
        {state === "pending" ? "Sending…" : "Contact us"}
      </ArdenoButton>

      {/* Acompaña al formulario en idle, pending y error. En `unconfigured`
          sobra: su propio aviso ya explica qué ha pasado con la petición. */}
      {state === "unconfigured" ? null : (
        <p className="ar-modal__note">
          Nothing is stored in your browser. When submission is available, your
          details are sent to the Ardeno team to respond to your enquiry.
        </p>
      )}
    </form>
  );
}
