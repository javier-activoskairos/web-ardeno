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
 * Todos los CTA de la ficha abren este mismo modal, igual que en el design
 * system. Deliberadamente NO hay envío: no existe endpoint configurado, así
 * que el formulario valida en local y después declara con honestidad que la
 * integración está pendiente. Nunca simula un envío correcto.
 *
 * Lo introducido vive solo en el estado de React mientras el modal está
 * abierto y se descarta al cerrarlo: no se persiste, no se registra y no sale
 * del navegador.
 */

type InterestContextValue = { open: () => void };

const InterestContext = createContext<InterestContextValue | null>(null);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const EMPTY_VALUES = { name: "", email: "", phone: "", reason: "" };

type FieldName = keyof typeof EMPTY_VALUES;
type Errors = Partial<Record<FieldName, string>>;

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
  projectName,
  children,
}: {
  projectName: string;
  children: ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [values, setValues] = useState(EMPTY_VALUES);
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);

  const panelRef = useRef<HTMLDivElement | null>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  // Referencias a los controles obligatorios: permiten llevar el foco al
  // primer campo inválido sin depender de que React ya haya pintado el DOM.
  const inputRefs = useRef<Partial<Record<FieldName, HTMLInputElement | null>>>(
    {},
  );

  const ids = useId();
  const fieldId = useCallback((name: FieldName) => `${ids}-${name}`, [ids]);
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
    setSubmitted(false);
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

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

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
      setSubmitted(false);
      inputRefs.current[firstInvalid]?.focus();
      return;
    }

    // No hay endpoint. No se envía nada y no se finge un envío correcto.
    setSubmitted(true);
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
            <button
              type="button"
              className="ar-modal__close"
              onClick={close}
              aria-label="Close"
            >
              ✕
            </button>

            <p className="ar-eyebrow">{projectName}</p>
            <h2
              id={titleId}
              className="ar-display"
              style={{ marginTop: "1rem" }}
            >
              Interested in this project?
            </h2>
            <p className="ar-body" style={{ marginTop: 12, maxWidth: "42ch" }}>
              Leave your details and our team will share the latest verified
              project information.
            </p>

            <form
              className="ar-form"
              noValidate
              onSubmit={onSubmit}
              style={{ marginTop: "1.75rem" }}
            >
              {submitted ? (
                <div className="ar-alert" role="alert">
                  We cannot send your request yet. The enquiry integration is
                  not configured for this project.
                  <span className="mt-2 block border-t border-[rgba(154,59,48,0.22)] pt-2 text-[0.6875rem] text-[var(--w-ink-2)]">
                    Nothing was sent or stored. Please contact the Ardeno team
                    directly in the meantime.
                  </span>
                </div>
              ) : null}

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

              <ArdenoButton
                type="submit"
                variant="primary"
                className="mt-1 self-start"
              >
                Express interest
              </ArdenoButton>

              <p className="ar-modal__note">
                No enquiry is transmitted or stored while the integration is
                pending. Nothing you type here leaves your browser.
              </p>
            </form>
          </div>
        </div>
      ) : null}
    </InterestContext.Provider>
  );
}
