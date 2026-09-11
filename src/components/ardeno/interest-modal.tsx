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
import { InterestForm, type InterestSubmitState } from "./interest-form";
import { ArdenoButton, type ArdenoButtonVariant } from "./primitives";

/**
 * Modal de captación — la vía rápida.
 *
 * La ficha tiene dos superficies de conversión: este modal, que abre el CTA de
 * la cabecera desde cualquier punto del scroll, y el formulario en línea del
 * cierre, para quien llega hasta abajo. Las dos montan el mismo
 * `<InterestForm>`: una sola validación, un solo endpoint y un solo copy.
 *
 * Aquí solo vive lo que es propio de un diálogo: apertura, cierre, trampa de
 * foco, Escape, bloqueo del scroll de fondo y devolución del foco a quien lo
 * abrió.
 */

type InterestContextValue = { open: () => void };

const InterestContext = createContext<InterestContextValue | null>(null);

/** Dispara el modal compartido. Debe usarse dentro de <InterestProvider>. */
export function InterestButton({
  variant = "light",
  children = "Contact us",
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
  const [state, setState] = useState<InterestSubmitState>("idle");

  const panelRef = useRef<HTMLDivElement | null>(null);
  const openerRef = useRef<HTMLElement | null>(null);

  const ids = useId();
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
    setState("idle");
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

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown, true);
    };
  }, [isOpen, close]);

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
                {state === "success"
                  ? "Thank you."
                  : "Interested in this project?"}
              </h2>
              {state === "success" ? null : (
                <p className="ar-body ar-modal__intro">
                  Leave your details and our team will share the latest verified
                  project information.
                </p>
              )}

              <InterestForm
                projectId={projectId}
                projectSlug={projectSlug}
                className="ar-form ar-modal__form"
                autoFocus
                onStateChange={setState}
                successAction={
                  <ArdenoButton
                    variant="brand"
                    onClick={close}
                    className="self-start"
                  >
                    Close
                  </ArdenoButton>
                }
              />
            </div>
          </div>
        </div>
      ) : null}
    </InterestContext.Provider>
  );
}
