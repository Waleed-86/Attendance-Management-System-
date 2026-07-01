import clsx from "clsx";

export default function Card({ children, className, ...props }) {
  return (
    <div
      className={clsx(
        "rounded-xl border border-ink-100 bg-white p-5 shadow-sm",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}