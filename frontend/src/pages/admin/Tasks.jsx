import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { PlusCircle, Calendar, CheckCircle2, XCircle, ClipboardList } from "lucide-react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Spinner from "../../components/ui/Spinner";
import Badge from "../../components/ui/Badge";
import PriorityBadge from "../../components/ui/PriorityBadge";
import { useToast } from "../../context/ToastContext";
import { adminTaskApi } from "../../api/task";

const statusFilters = ["", "pending", "in_progress", "submitted", "approved", "rejected"];

export default function AdminTasks() {
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [meta, setMeta] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [reviewingId, setReviewingId] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const { showToast } = useToast();

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await adminTaskApi.list(statusFilter ? { status: statusFilter } : {});
      setTasks(res.data.data);
      setMeta(res.data.meta);
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

  const handleReview = async (id, status) => {
    setActionLoading(true);
    try {
      await adminTaskApi.review(id, { status, admin_feedback: feedback });
      showToast(`Task ${status} successfully.`);
      setReviewingId(null);
      setFeedback("");
      fetchTasks();
    } catch (err) {
      showToast(err.response?.data?.message || "Unable to update task.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900">Tasks</h1>
          <p className="mt-1 text-sm text-ink-600">
            Assign tasks and review employee submissions.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {meta && (
            <div className="rounded-lg bg-amber-50 px-3.5 py-2 text-sm font-medium text-amber-700">
              {meta.submitted_count} awaiting review
            </div>
          )}
          <Link to="/admin/tasks/create">
            <Button>
              <PlusCircle size={16} />
              Assign task
            </Button>
          </Link>
        </div>
      </div>

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
            <ClipboardList className="text-ink-400" size={26} />
            <p className="mt-3 text-sm font-medium text-ink-700">No tasks found</p>
          </Card>
        ) : (
          tasks.map((t) => (
            <Card key={t.id}>
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex-1 min-w-[240px]">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-ink-900">{t.title}</span>
                    <Badge status={t.status} />
                    <PriorityBadge priority={t.priority} />
                  </div>
                  <div className="mt-1.5 flex items-center gap-1.5 text-sm text-ink-500">
                    <Calendar size={14} />
                    Due {new Date(t.due_date).toLocaleDateString()} · Assigned to{" "}
                    {t.assignee.name}
                  </div>

                  {t.latest_submission && (
                    <div className="mt-2 rounded-lg bg-ink-50 px-3 py-2 text-sm text-ink-700">
                      <span className="font-medium text-ink-800">Response: </span>
                      {t.latest_submission.response}
                    </div>
                  )}
                </div>

                {t.status === "submitted" && (
                  <div className="flex flex-col gap-2 w-full sm:w-64">
                    {reviewingId === t.id ? (
                      <>
                        <textarea
                          rows={2}
                          placeholder="Add feedback (optional)..."
                          value={feedback}
                          onChange={(e) => setFeedback(e.target.value)}
                          className="w-full rounded-lg border border-ink-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                        />
                        <div className="flex gap-2">
                          <Button
                            loading={actionLoading}
                            onClick={() => handleReview(t.id, "approved")}
                            className="flex-1"
                          >
                            <CheckCircle2 size={16} />
                            Approve
                          </Button>
                          <Button
                            variant="danger"
                            loading={actionLoading}
                            onClick={() => handleReview(t.id, "rejected")}
                            className="flex-1"
                          >
                            <XCircle size={16} />
                            Reject
                          </Button>
                        </div>
                        <button
                          onClick={() => {
                            setReviewingId(null);
                            setFeedback("");
                          }}
                          className="text-xs text-ink-400 hover:text-ink-600"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <Button variant="secondary" onClick={() => setReviewingId(t.id)}>
                        Review submission
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}