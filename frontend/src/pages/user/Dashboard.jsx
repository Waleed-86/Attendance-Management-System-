import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  CalendarCheck,
  CalendarX,
  CalendarClock,
  Award,
  ListChecks,
  Clock,
  CheckCircle2,
} from "lucide-react";
import Card from "../../components/ui/Card";
import StatCard from "../../components/ui/StatCard";
import Spinner from "../../components/ui/Spinner";
import Badge from "../../components/ui/Badge";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { dashboardApi } from "../../api/dashboard";

const gradeColors = {
  A: "text-brand-600",
  B: "text-blue-600",
  C: "text-amber-600",
  D: "text-orange-600",
  F: "text-red-600",
};

export default function Dashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const { showToast } = useToast();

  useEffect(() => {
    dashboardApi
      .userStats()
      .then((res) => setData(res.data.data))
      .catch((err) =>
        showToast(err.response?.data?.message || "Unable to load dashboard.", "error")
      )
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }

  if (!data) return null;

  const { cards, recent_attendance, leave_status } = data;

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink-900">
        Welcome back, {user?.name?.split(" ")[0]}
      </h1>
      <p className="mt-1 text-sm text-ink-600">
        Here's a summary of your attendance and tasks.
      </p>

      <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Present days" value={cards.present_days} icon={CalendarCheck} accent="brand" />
        <StatCard label="Absent days" value={cards.absent_days} icon={CalendarX} accent="red" />
        <StatCard label="Leave days" value={cards.leave_days} icon={CalendarClock} accent="amber" />
        <Card className="flex items-center gap-4">
          <div className="h-11 w-11 rounded-lg bg-ink-100 flex items-center justify-center shrink-0">
            <Award size={20} className={gradeColors[cards.grade] || "text-ink-600"} />
          </div>
          <div>
            <p className="text-xs text-ink-400">Attendance grade</p>
            <p className={`mt-0.5 font-display text-xl font-bold ${gradeColors[cards.grade] || "text-ink-900"}`}>
              {cards.grade}
            </p>
          </div>
        </Card>
      </div>

      <div className="mt-4 grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard label="Assigned tasks" value={cards.assigned_tasks} icon={ListChecks} accent="blue" />
        <StatCard label="Pending tasks" value={cards.pending_tasks} icon={Clock} accent="amber" />
        <StatCard label="Completed tasks" value={cards.completed_tasks} icon={CheckCircle2} accent="brand" />
      </div>

      <div className="mt-6 grid lg:grid-cols-2 gap-5">
        <Card>
          <div className="flex items-center justify-between">
            <h3 className="font-display font-semibold text-ink-900">Recent attendance</h3>
            <Link to="/attendance-history" className="text-xs font-medium text-brand-600 hover:text-brand-700">
              View all
            </Link>
          </div>
          <div className="mt-3 flex flex-col divide-y divide-ink-100">
            {recent_attendance.length === 0 ? (
              <p className="py-6 text-center text-sm text-ink-400">No attendance records yet.</p>
            ) : (
              recent_attendance.map((r) => (
                <div key={r.id} className="flex items-center justify-between py-2.5 text-sm">
                  <span className="text-ink-700">
                    {new Date(r.date).toLocaleDateString(undefined, {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                  <span className="text-ink-500">
                    {new Date(`1970-01-01T${r.time}`).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  <Badge status={r.status === "present" ? "approved" : r.status} />
                </div>
              ))
            )}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <h3 className="font-display font-semibold text-ink-900">Leave status overview</h3>
            <Link to="/leave" className="text-xs font-medium text-brand-600 hover:text-brand-700">
              View all
            </Link>
          </div>
          <div className="mt-4 flex flex-col gap-3">
            {[
              { label: "Pending", value: leave_status.pending, color: "bg-amber-500" },
              { label: "Approved", value: leave_status.approved, color: "bg-brand-500" },
              { label: "Rejected", value: leave_status.rejected, color: "bg-red-500" },
            ].map((item) => {
              const total = leave_status.pending + leave_status.approved + leave_status.rejected || 1;
              const pct = Math.round((item.value / total) * 100);
              return (
                <div key={item.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-ink-700">{item.label}</span>
                    <span className="text-ink-500">{item.value}</span>
                  </div>
                  <div className="h-2 rounded-full bg-ink-100 overflow-hidden">
                    <div className={`h-full ${item.color}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}