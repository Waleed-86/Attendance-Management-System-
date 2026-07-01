import { Link } from "react-router-dom";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-ink-50 text-center px-4">
      <FileQuestion size={40} className="text-ink-400" />
      <h1 className="font-display text-2xl font-bold text-ink-900">
        Page not found
      </h1>
      <p className="text-ink-600">
        The page you're looking for doesn't exist or was moved.
      </p>
      <Link
        to="/"
        className="mt-2 font-medium text-brand-600 hover:text-brand-700"
      >
        Back to home
      </Link>
    </div>
  );
}