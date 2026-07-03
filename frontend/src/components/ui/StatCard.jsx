import Card from "./Card";

export default function StatCard({ label, value, icon: Icon, accent = "brand" }) {
  const accents = {
    brand: "bg-brand-50 text-brand-600",
    amber: "bg-amber-50 text-amber-600",
    blue: "bg-blue-50 text-blue-600",
    red: "bg-red-50 text-red-600",
  };

  return (
    <Card className="flex items-center gap-4">
      <div className={`h-11 w-11 rounded-lg flex items-center justify-center shrink-0 ${accents[accent]}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-xs text-ink-400">{label}</p>
        <p className="mt-0.5 font-display text-xl font-bold text-ink-900">{value}</p>
      </div>
    </Card>
  );
}