import { Construction } from "lucide-react";

export default function ComingSoon({ title }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-ink-100 bg-white py-20 text-center">
      <Construction className="text-ink-400" size={28} />
      <h3 className="mt-3 font-display font-semibold text-ink-800">
        {title}
      </h3>
      <p className="mt-1 text-sm text-ink-400">
        This module is being built in the next phase.
      </p>
    </div>
  );
}