import React from "react";

const VARIANTS = {
  primary:
    "bg-gradient-to-r from-sky-500 to-sky-600 text-white hover:shadow-lg hover:shadow-sky-500/25 disabled:hover:shadow-none",
  success:
    "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:shadow-lg hover:shadow-emerald-500/25 disabled:hover:shadow-none",
  secondary: "border border-white/10 bg-white/5 text-slate-100 hover:bg-white/10",
  danger: "border border-rose-500/30 bg-rose-500/10 text-rose-200 hover:bg-rose-500/20",
  ghost: "text-slate-300 hover:bg-white/5 hover:text-white",
} as const;

const SIZES = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2.5 text-sm",
  lg: "px-6 py-3.5 text-base",
} as const;

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof VARIANTS;
  size?: keyof typeof SIZES;
  busy?: boolean;
  block?: boolean;
}

export default function Button({
  variant = "primary",
  size = "md",
  busy = false,
  block = false,
  disabled,
  className = "",
  children,
  type = "button",
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || busy}
      aria-busy={busy || undefined}
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTS[variant]} ${SIZES[size]} ${block ? "w-full" : ""} ${className}`}
      {...rest}
    >
      {busy && <span className="h-4 w-4 animate-spin rounded-full border-2 border-current/30 border-t-current" />}
      {children}
    </button>
  );
}
