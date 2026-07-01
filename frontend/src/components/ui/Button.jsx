import { Loader2 } from "lucide-react";
import clsx from "clsx";

export default function Button({
  children,
  variant = "primary",
  loading = false,
  className,
  disabled,
  ...props
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed";

  const variants = {
    primary:
      "bg-brand-600 text-white hover:bg-brand-700 focus:ring-brand-500",
    secondary:
      "bg-white text-ink-800 border border-ink-100 hover:bg-ink-50 focus:ring-brand-500",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    ghost: "text-ink-600 hover:bg-ink-100 focus:ring-brand-500",
  };

  return (
    <button
      className={clsx(base, variants[variant], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 size={16} className="animate-spin" />}
      {children}
    </button>
  );
}