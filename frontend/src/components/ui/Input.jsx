import { forwardRef } from "react";
import clsx from "clsx";

const Input = forwardRef(({ label, error, className, ...props }, ref) => {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-ink-800">{label}</label>
      )}
      <input
        ref={ref}
        className={clsx(
          "w-full rounded-lg border px-3.5 py-2.5 text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-500/40 transition-colors",
          error
            ? "border-red-400 focus:border-red-500"
            : "border-ink-100 focus:border-brand-400",
          className
        )}
        {...props}
      />
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
});

Input.displayName = "Input";
export default Input;