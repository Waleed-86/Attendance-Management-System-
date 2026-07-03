import { useState, useEffect } from "react";
import {
  Users,
  CalendarCheck,
  CalendarClock,
  Clock,
  ClipboardList,
  ClipboardCheck,
  ClipboardX,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import Card from "../../components/ui/Card";
import StatCard from "../../components/ui/StatCard";
import Spinner from "../../components/ui/Spinner";
import { useToast } from "../../context/ToastContext";
import { dashboardApi } from "../../api/dashboard";

const GRADE_COLORS = {
  A: "#1f8377",
  B: "#3b82f6",
  C: "#f5a524",
  D: "#fb923c",
  F: "#ef4444",
};

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const { showToast } = useToast();

  useEffect(() => {
    dashboardApi
      .adminStats()
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

  const { cards, attendance_trend, grade_distribution } = data;
  const nonZeroGrades = grade_distribution.filter((g) => g.count > 0);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink-900">Admin Dashboard</h1>
      <p className="mt-1 text-sm text-ink-600">
        Overview of attendance, leave, and task activity across your team.
      </p>

      <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total users" value={cards.total_users} icon={Users} accent="brand" />
        <StatCard label="Present today" value={cards.present_today} icon={CalendarCheck} accent="brand" />
        <StatCard label="Total leave requests" value={cards.total_leave_requests} icon={CalendarClock} accent="blue" />
        <StatCard label="Pending leaves" value={cards.pending_leaves} icon={Clock} accent="amber" />
      </div>

      <div className="mt-4 grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard label="Total tasks" value={cards.total_tasks} icon={ClipboardList} accent="blue" />
        <StatCard label="Pending tasks" value={cards.pending_tasks} icon={ClipboardX} accent="amber" />
        <StatCard label="Completed tasks" value={cards.completed_tasks} icon={ClipboardCheck} accent="brand" />
      </div>

      <div className="mt-6 grid lg:grid-cols-2 gap-5">
        <Card>
          <h3 className="font-display font-semibold text-ink-900">
            Attendance — last 7 days
          </h3>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendance_trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eceeee" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#8a9291" }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#8a9291" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: "1px solid #eceeee", fontSize: 13 }}
                  labelFormatter={(label, payload) => payload?.[0]?.payload?.date || label}
                />
                <Bar dataKey="present" fill="#1f8377" radius={[4, 4, 0, 0]} name="Present" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <h3 className="font-display font-semibold text-ink-900">
            Grade distribution
          </h3>
          <div className="mt-4 h-64 flex items-center justify-center">
            {nonZeroGrades.length === 0 ? (
              <p className="text-sm text-ink-400">No attendance data yet to calculate grades.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={nonZeroGrades}
                    dataKey="count"
                    nameKey="grade"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                  >
                    {nonZeroGrades.map((entry) => (
                      <Cell key={entry.grade} fill={GRADE_COLORS[entry.grade]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #eceeee", fontSize: 13 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="mt-2 flex flex-wrap justify-center gap-3">
            {grade_distribution.map((g) => (
              <div key={g.grade} className="flex items-center gap-1.5 text-xs text-ink-600">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: GRADE_COLORS[g.grade] }}
                />
                Grade {g.grade}: {g.count}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}