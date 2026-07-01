import { Loader2 } from "lucide-react";

export default function Spinner({ size = 24, fullPage = false }) {
  if (fullPage) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-ink-50">
        <Loader2 size={32} className="animate-spin text-brand-600" />
      </div>
    );
  }
  return <Loader2 size={size} className="animate-spin text-brand-600" />;
}