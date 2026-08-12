"use client";

import React, { useCallback, useEffect, useRef, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

const NOOP_SUBSCRIBE = () => () => {};

/**
 * True once React has hydrated on the client.
 *
 * `createPortal` needs a real DOM node, which does not exist during SSR. This
 * reads `false` on the server and `true` on the client without a
 * setState-in-effect round trip.
 */
function useIsClient(): boolean {
  return useSyncExternalStore(
    NOOP_SUBSCRIBE,
    () => true,
    () => false,
  );
}

const SIZES = {
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
} as const;

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  /** `id` of the element that titles the dialog, for `aria-labelledby`. */
  labelledBy: string;
  /** `id` of the element that describes the dialog, for `aria-describedby`. */
  describedBy?: string;
  size?: keyof typeof SIZES;
  /**
   * When false the backdrop and Escape no longer close the dialog — used while
   * a transaction is in flight so the borrower cannot dismiss it mid-signature.
   */
  dismissible?: boolean;
  children: React.ReactNode;
}

/**
 * Accessible dialog rendered into a portal on `document.body`.
 *
 * Handles the behaviour a `<div>` overlay does not give you for free: focus is
 * moved into the panel on open, Tab is trapped inside it, Escape closes it,
 * the page behind is locked from scrolling, and focus returns to the trigger
 * on close.
 */
export default function Modal({
  open,
  onClose,
  labelledBy,
  describedBy,
  size = "lg",
  dismissible = true,
  children,
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const isClient = useIsClient();

  const requestClose = useCallback(() => {
    if (dismissible) onClose();
  }, [dismissible, onClose]);

  // Remember the trigger, move focus into the panel, and restore it on close.
  useEffect(() => {
    if (!open) return;

    previouslyFocused.current = document.activeElement as HTMLElement | null;
    const firstFocusable = panelRef.current?.querySelector<HTMLElement>(
      FOCUSABLE_SELECTOR,
    );
    (firstFocusable ?? panelRef.current)?.focus();

    return () => previouslyFocused.current?.focus?.();
  }, [open]);

  // Stop the page behind the dialog from scrolling.
  useEffect(() => {
    if (!open) return;

    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
    };
  }, [open]);

  // Escape to dismiss, Tab cycling clamped to the panel's focusable elements.
  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.stopPropagation();
        requestClose();
        return;
      }

      if (event.key !== "Tab") return;

      const focusable = Array.from(
        panelRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR) ?? [],
      ).filter((element) => element.offsetParent !== null);

      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && (active === first || !panelRef.current?.contains(active))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown, true);
    return () => document.removeEventListener("keydown", onKeyDown, true);
  }, [open, requestClose]);

  if (!isClient || !open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end justify-center p-0 sm:items-center sm:p-6">
      <div
        className="absolute inset-0 bg-[#050810]/80 backdrop-blur-sm"
        onClick={requestClose}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        aria-describedby={describedBy}
        tabIndex={-1}
        className={`relative w-full ${SIZES[size]} max-h-[92vh] overflow-y-auto rounded-t-3xl border border-white/10 bg-[#111a2b] shadow-2xl shadow-black/60 outline-none sm:rounded-3xl`}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}
