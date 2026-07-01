import clsx from "clsx";

const styles = {
  low: "bg-ink-100 text-ink-600",
  medium: "bg-amber-50 text-amber-700",
  high: "bg-red-50 text-red-700",
};

export default function PriorityBadge({ priority }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
        styles[priority] || "bg-ink-100 text-ink-700"
      )}
    >
      {priority} priority
    </span>
  );
}