import { CheckCircle2 } from "lucide-react";

export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left branding panel */}
      <div className="hidden lg:flex flex-col justify-between bg-brand-800 text-white p-10">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-lg bg-white/15 flex items-center justify-center">
            <CheckCircle2 size={20} />
          </div>
          <span className="font-display font-bold text-lg">AttendX</span>
        </div>
        <div>
          <h1 className="font-display text-4xl font-extrabold leading-tight max-w-md">
            Attendance, leave &amp; tasks — one clean system.
          </h1>
          <p className="mt-4 text-brand-100 max-w-sm">
            Mark attendance, track leave, and manage your team's daily
            workflow in one place.
          </p>
        </div>
        <p className="text-xs text-brand-200">
          &copy; {new Date().getFullYear()} AttendX. All rights reserved.
        </p>
      </div>

      {/* Right form panel */}
      <div className="flex items-center justify-center p-6 sm:p-10 bg-ink-50">
        <div className="w-full max-w-sm">
          <h2 className="font-display text-2xl font-bold text-ink-900">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-1.5 text-sm text-ink-600">{subtitle}</p>
          )}
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}