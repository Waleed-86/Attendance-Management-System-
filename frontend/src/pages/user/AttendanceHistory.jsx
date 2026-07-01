import { useState, useEffect } from "react";
import { History } from "lucide-react";
import Card from "../../components/ui/Card";
import Spinner from "../../components/ui/Spinner";
import { useToast } from "../../context/ToastContext";
import { attendanceApi } from "../../api/attendance";

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function AttendanceHistory() {
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState([]);
  const [meta, setMeta] = useState(null);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const { showToast } = useToast();

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await attendanceApi.history({ month, year });
      setRecords(res.data.data);
      setMeta(res.data.meta);
    } catch (err) {
      showToast(
        err.response?.data?.message || "Unable to load attendance history.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, year]);

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink-900">
        Attendance History
      </h1>
      <p className="mt-1 text-sm text-ink-600">
        View your daily attendance records by month.
      </p>

      <div className="mt-5 flex gap-3">
        <select
          value={month}
          onChange={(e) => setMonth(Number(e.target.value))}
          className="rounded-lg border border-ink-100 bg-white px-3 py-2 text-sm text-ink-800 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
        >
          {months.map((m, i) => (
            <option key={m} value={i + 1}>
              {m}
            </option>
          ))}
        </select>
        <select
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="rounded-lg border border-ink-100 bg-white px-3 py-2 text-sm text-ink-800 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
        >
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      {meta && (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-lg">
          <Card className="py-3">
            <p className="text-xs text-ink-400">Present days</p>
            <p className="mt-1 text-xl font-display font-bold text-brand-600">
              {meta.present_count}
            </p>
          </Card>
          <Card className="py-3">
            <p className="text-xs text-ink-400">Total records</p>
            <p className="mt-1 text-xl font-display font-bold text-ink-900">
              {meta.total}
            </p>
          </Card>
        </div>
      )}

      <Card className="mt-5 overflow-hidden !p-0">
        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner />
          </div>
        ) : records.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <History className="text-ink-400" size={26} />
            <p className="mt-3 text-sm font-medium text-ink-700">
              No attendance records
            </p>
            <p className="text-sm text-ink-400">
              No attendance found for {months[month - 1]} {year}.
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-ink-50 text-ink-500 text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left px-5 py-3 font-medium">Date</th>
                <th className="text-left px-5 py-3 font-medium">Time</th>
                <th className="text-left px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {records.map((r) => (
                <tr key={r.id}>
                  <td className="px-5 py-3 text-ink-800">
                    {new Date(r.date).toLocaleDateString(undefined, {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                    })}
                  </td>
                  <td className="px-5 py-3 text-ink-600">
                    {new Date(`1970-01-01T${r.time}`).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="px-5 py-3">
                    <span className="inline-flex items-center rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700 capitalize">
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}