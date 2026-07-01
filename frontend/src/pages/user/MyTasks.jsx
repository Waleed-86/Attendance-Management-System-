import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ListChecks, Calendar } from "lucide-react";
import Card from "../../components/ui/Card";
import Spinner from "../../components/ui/Spinner";
import Badge from "../../components/ui/Badge";
import PriorityBadge from "../../components/ui/PriorityBadge";
import { useToast } from "../../context/ToastContext";
import { taskApi } from "../../api/task";

const statusFilters = ["", "pending", "in_progress", "submitted", "approved", "rejected"];

export default function MyTasks() {
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const { showToast } = useToast();

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await taskApi.myTasks(statusFilter ? { status: statusFilter } : {});
      setTasks(res.data.data);
    } catch (err) {
      showToast(err.response?.data?.message || "Unable to load tasks.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink-900">My Tasks</h1>
      <p className="mt-1 text-sm text-ink-600">
        View and respond to tasks assigned to you.
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        {statusFilters.map((s) => (
          <button
            key={s || "all"}
            onClick={() => setStatusFilter(s)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium capitalize transition-colors ${
              statusFilter === s
                ? "bg-brand-600 text-white"
                : "bg-white border border-ink-100 text-ink-600 hover:bg-ink-50"
            }`}
          >
            {s ? s.replace("_", " ") : "All"}
          </button>
        ))}
      </div>

      <div className="mt-5 flex flex-col gap-3">
        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner />
          </div>
        ) : tasks.length === 0 ? (
          <Card className="flex flex-col items-center justify-center py-16 text-center">
            <ListChecks className="text-ink-400" size={26} />
            <p className="mt-3 text-sm font-medium text-ink-700">No tasks found</p>
            <p className="text-sm text-ink-400">
              Tasks assigned to you will appear here.
            </p>
          </Card>
        ) : (
          tasks.map((t) => (
            <Link key={t.id} to={`/tasks/${t.id}`}>
              <Card className="hover:border-brand-300 transition-colors">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-ink-900">{t.title}</span>
                      <Badge status={t.status} />
                      <PriorityBadge priority={t.priority} />
                    </div>
                    <div className="mt-1.5 flex items-center gap-1.5 text-sm text-ink-500">
                      <Calendar size={14} />
                      Due {new Date(t.due_date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}