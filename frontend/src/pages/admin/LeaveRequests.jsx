import { useState, useEffect } from "react";
import { CheckCircle2, XCircle, Search, MessageSquare } from "lucide-react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Spinner from "../../components/ui/Spinner";
import Badge from "../../components/ui/Badge";
import { useToast } from "../../context/ToastContext";
import { adminLeaveApi } from "../../api/leave";

export default function AdminLeaveRequests() {
  const [loading, setLoading] = useState(true);
  const [leaves, setLeaves] = useState([]);
  const [meta, setMeta] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [reviewingId, setReviewingId] = useState(null);
  const [comment, setComment] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const { showToast } = useToast();

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (search) params.search = search;
      const res = await adminLeaveApi.list(params);
      setLeaves(res.data.data);
      setMeta(res.data.meta);
    } catch (err) {
      showToast(
        err.response?.data?.message || "Unable to load leave requests.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(fetchLeaves, 300); // debounce search
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, search]);

  const handleReview = async (id, status) => {
    setActionLoading(true);
    try {
      await adminLeaveApi.review(id, { status, admin_comment: comment });
      showToast(`Leave request ${status} successfully.`);
      setReviewingId(null);
      setComment("");
      fetchLeaves();
    } catch (err) {
      showToast(
        err.response?.data?.message || "Unable to update leave request.",
        "error"
      );
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900">
            Leave Requests
          </h1>
          <p className="mt-1 text-sm text-ink-600">
            Review and respond to employee leave requests.
          </p>
        </div>
        {meta && (
          <div className="rounded-lg bg-amber-50 px-3.5 py-2 text-sm font-medium text-amber-700">
            {meta.pending_count} pending
          </div>
        )}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400"
          />
          <input
            type="text"
            placeholder="Search by employee name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-ink-100 bg-white pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-400"
          />
        </div>
        <div className="flex gap-2">
          {["", "pending", "approved", "rejected"].map((s) => (
            <button
              key={s || "all"}
              onClick={() => setStatusFilter(s)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-medium capitalize transition-colors ${
                statusFilter === s
                  ? "bg-brand-600 text-white"
                  : "bg-white border border-ink-100 text-ink-600 hover:bg-ink-50"
              }`}
            >
              {s || "All"}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3">
        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner />
          </div>
        ) : leaves.length === 0 ? (
          <Card className="flex flex-col items-center justify-center py-16 text-center">
            <MessageSquare className="text-ink-400" size={26} />
            <p className="mt-3 text-sm font-medium text-ink-700">
              No leave requests found
            </p>
          </Card>
        ) : (
          leaves.map((l) => (
            <Card key={l.id}>
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex-1 min-w-[240px]">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-ink-900">
                      {l.user.name}
                    </span>
                    <span className="text-ink-300">•</span>
                    <span className="text-sm text-ink-600 capitalize">
                      {l.leave_type} leave
                    </span>
                    <Badge status={l.status} />
                  </div>
                  <p className="mt-1 text-sm text-ink-600">
                    {new Date(l.from_date).toLocaleDateString()} –{" "}
                    {new Date(l.to_date).toLocaleDateString()} ·{" "}
                    {l.days_count} day{l.days_count > 1 ? "s" : ""}
                  </p>
                  <p className="mt-2 text-sm text-ink-700">{l.reason}</p>

                  {l.admin_comment && (
                    <div className="mt-2 rounded-lg bg-ink-50 px-3 py-2 text-sm text-ink-600">
                      <span className="font-medium text-ink-700">
                        Your comment:{" "}
                      </span>
                      {l.admin_comment}
                    </div>
                  )}
                </div>

                {l.status === "pending" && (
                  <div className="flex flex-col gap-2 w-full sm:w-64">
                    {reviewingId === l.id ? (
                      <>
                        <textarea
                          rows={2}
                          placeholder="Add a comment (optional)..."
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          className="w-full rounded-lg border border-ink-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                        />
                        <div className="flex gap-2">
                          <Button
                            variant="primary"
                            loading={actionLoading}
                            onClick={() => handleReview(l.id, "approved")}
                            className="flex-1"
                          >
                            <CheckCircle2 size={16} />
                            Approve
                          </Button>
                          <Button
                            variant="danger"
                            loading={actionLoading}
                            onClick={() => handleReview(l.id, "rejected")}
                            className="flex-1"
                          >
                            <XCircle size={16} />
                            Reject
                          </Button>
                        </div>
                        <button
                          onClick={() => {
                            setReviewingId(null);
                            setComment("");
                          }}
                          className="text-xs text-ink-400 hover:text-ink-600"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <Button
                        variant="secondary"
                        onClick={() => setReviewingId(l.id)}
                      >
                        Review request
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