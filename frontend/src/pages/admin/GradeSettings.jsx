import { useState, useEffect } from "react";
import { Save } from "lucide-react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Spinner from "../../components/ui/Spinner";
import { useToast } from "../../context/ToastContext";
import { gradeSettingApi } from "../../api/report";

export default function GradeSettings() {
  const [loading, setLoading] = useState(true);
  const [grades, setGrades] = useState([]);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  const fetchGrades = async () => {
    setLoading(true);
    try {
      const res = await gradeSettingApi.list();
      setGrades(res.data.data);
    } catch (err) {
      showToast(err.response?.data?.message || "Unable to load grade settings.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGrades();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateField = (id, field, value) => {
    setGrades((prev) =>
      prev.map((g) => (g.id === id ? { ...g, [field]: value } : g))
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await gradeSettingApi.update(
        grades.map((g) => ({
          id: g.id,
          min_days: Number(g.min_days),
          max_days: g.max_days === "" || g.max_days === null ? null : Number(g.max_days),
        }))
      );
      showToast("Grading thresholds updated.");
    } catch (err) {
      showToast(err.response?.data?.message || "Unable to save changes.", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-2xl font-bold text-ink-900">Grading Settings</h1>
      <p className="mt-1 text-sm text-ink-600">
        Configure the present-day thresholds used to calculate attendance grades.
      </p>

      <Card className="mt-5">
        <div className="flex flex-col gap-4">
          {grades.map((g) => (
            <div key={g.id} className="flex items-center gap-3">
              <span className="w-8 text-center font-display font-bold text-ink-900">
                {g.grade}
              </span>
              <div className="flex items-center gap-2 text-sm text-ink-600">
                <span>Min</span>
                <input
                  type="number"
                  min={0}
                  value={g.min_days}
                  onChange={(e) => updateField(g.id, "min_days", e.target.value)}
                  className="w-20 rounded-lg border border-ink-100 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                />
                <span>days — Max</span>
                <input
                  type="number"
                  min={0}
                  value={g.max_days ?? ""}
                  placeholder="No limit"
                  onChange={(e) => updateField(g.id, "max_days", e.target.value)}
                  className="w-24 rounded-lg border border-ink-100 px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                />
                <span>days</span>
              </div>
            </div>
          ))}
        </div>

        <Button onClick={handleSave} loading={saving} className="mt-5">
          <Save size={16} />
          Save thresholds
        </Button>
      </Card>
    </div>
  );
}