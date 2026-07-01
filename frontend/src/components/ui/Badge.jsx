import clsx from "clsx";

const styles = {
  pending: "bg-ink-100 text-ink-600",
  in_progress: "bg-blue-50 text-blue-700",
  submitted: "bg-amber-50 text-amber-700",
  approved: "bg-brand-50 text-brand-700",
  rejected: "bg-red-50 text-red-700",
};

const labels = {
  in_progress: "In progress",
};

export default function Badge({ status }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
        styles[status] || "bg-ink-100 text-ink-700"
      )}
    >
      {labels[status] || status}
    </span>
  );
}