import { useState, useEffect } from "react";
import { FileDown, FileText, FileSpreadsheet, BarChart3 } from "lucide-react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Spinner from "../../components/ui/Spinner";
import { useToast } from "../../context/ToastContext";
import { reportApi } from "../../api/report";
import { adminUserApi } from "../../api/user";

const gradeColors = {
  A: "bg-brand-50 text-brand-700",
  B: "bg-blue-50 text-blue-700",
  C: "bg-amber-50 text-amber-700",
  D: "bg-orange-50 text-orange-700",
  F: "bg-red-50 text-red-700",
};

export default function Reports() {
  const [reportType, setReportType] = useState("system");
  const [users, setUsers] = useState([]);
  const [userId, setUserId] = useState("");
  const [fromDate, setFromDate] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split("T")[0]
  );
  const [toDate, setToDate] = useState(new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [rows, setRows] = useState(null);
  const { showToast } = useToast();

  useEffect(() => {
    adminUserApi
      .list({})
      .then((res) => setUsers(res.data.data))
      .catch(() => {});
  }, []);

  const handleGenerate = async () => {
    if (reportType === "individual" && !userId) {
      showToast("Please select a user.", "error");
      return;
    }
    setLoading(true);
    setRows(null);
    try {
      if (reportType === "individual") {
        const res = await reportApi.individual({
          user_id: userId,
          from_date: fromDate,
          to_date: toDate,
        });
        setRows([res.data.data]);
      } else {
        const res = await reportApi.system({ from_date: fromDate, to_date: toDate });
        setRows(res.data.data);
      }
    } catch (err) {
      showToast(
        err.response?.data?.message || "Unable to generate report.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format) => {
    if (reportType === "individual" && !userId) {
      showToast("Please select a user.", "error");
      return;
    }
    setExporting(true);
    try {
      await reportApi.export({
        type: reportType,
        format,
        user_id: reportType === "individual" ? userId : undefined,
        from_date: fromDate,
        to_date: toDate,
      });
      showToast("Report downloaded.");
    } catch (err) {
      showToast(
        err.response?.data?.message || "Unable to export report.",
        "error"
      );
    } finally {
      setExporting(false);
    }
  };

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink-900">Reports</h1>
      <p className="mt-1 text-sm text-ink-600">
        Generate attendance reports for individual employees or the whole team.
      </p>

      <Card className="mt-5">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-ink-800">Report type</label>
            <select
              value={reportType}
              onChange={(e) => {
                setReportType(e.target.value);
                setRows(null);
              }}
              className="rounded-lg border border-ink-100 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-400"
            >
              <option value="system">Complete system report</option>
              <option value="individual">Individual report</option>
            </select>
          </div>

          {reportType === "individual" && (
            <div className="flex flex-col gap-1.5 min-w-[200px]">
              <label className="text-sm font-medium text-ink-800">Employee</label>
              <select
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="rounded-lg border border-ink-100 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-400"
              >
                <option value="">Select employee</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-ink-800">From date</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="rounded-lg border border-ink-100 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-400"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-ink-800">To date</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="rounded-lg border border-ink-100 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-400"
            />
          </div>

          <Button onClick={handleGenerate} loading={loading}>
            <BarChart3 size={16} />
            Generate
          </Button>
        </div>

        {rows && (
          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant="secondary" loading={exporting} onClick={() => handleExport("pdf")}>
              <FileText size={16} />
              Export PDF
            </Button>
            <Button variant="secondary" loading={exporting} onClick={() => handleExport("excel")}>
              <FileSpreadsheet size={16} />
              Export Excel
            </Button>
            <Button variant="secondary" loading={exporting} onClick={() => handleExport("csv")}>
              <FileDown size={16} />
              Export CSV
            </Button>
          </div>
        )}
      </Card>

      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : rows ? (
        <Card className="mt-5 overflow-hidden !p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-ink-50 text-ink-500 text-xs uppercase tracking-wide">
                <tr>
                  <th className="text-left px-5 py-3 font-medium">Employee</th>
                  <th className="text-left px-5 py-3 font-medium">Present</th>
                  <th className="text-left px-5 py-3 font-medium">Absent</th>
                  <th className="text-left px-5 py-3 font-medium">Leave</th>
                  <th className="text-left px-5 py-3 font-medium">Percentage</th>
                  <th className="text-left px-5 py-3 font-medium">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {rows.map((r) => (
                  <tr key={r.user.id}>
                    <td className="px-5 py-3 text-ink-800 font-medium">
                      {r.user.name}
                    </td>
                    <td className="px-5 py-3 text-ink-600">{r.present}</td>
                    <td className="px-5 py-3 text-ink-600">{r.absent}</td>
                    <td className="px-5 py-3 text-ink-600">{r.leave}</td>
                    <td className="px-5 py-3 text-ink-600">{r.percentage}%</td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${gradeColors[r.grade]}`}
                      >
                        {r.grade}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : null}
    </div>
  );
}