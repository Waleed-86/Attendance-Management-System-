import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { PlusCircle, X, MessageSquare } from "lucide-react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Spinner from "../../components/ui/Spinner";
import Badge from "../../components/ui/Badge";
import { useToast } from "../../context/ToastContext";
import { leaveApi } from "../../api/leave";

const leaveTypes = [
  { value: "sick", label: "Sick leave" },
  { value: "casual", label: "Casual leave" },
  { value: "annual", label: "Annual leave" },
  { value: "emergency", label: "Emergency leave" },
  { value: "other", label: "Other" },
];

export default function Leave() {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [leaves, setLeaves] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const { showToast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm();
  const fromDate = watch("from_date");

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const res = await leaveApi.myLeaves(
        statusFilter ? { status: statusFilter } : {}
      );
      setLeaves(res.data.data);
    } catch (err) {
      showToast(
        err.response?.data?.message || "Unable to load leave history.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      await leaveApi.submit(data);
      showToast("Leave request submitted successfully.");
      reset();
      setShowForm(false);
      fetchLeaves();
    } catch (err) {
      showToast(
        err.response?.data?.message ||
          Object.values(err.response?.data?.errors || {})[0]?.[0] ||
          "Unable to submit leave request.",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900">
            Leave
          </h1>
          <p className="mt-1 text-sm text-ink-600">
            Submit and track your leave requests.
          </p>
        </div>
        <Button onClick={() => setShowForm((v) => !v)}>
          {showForm ? <X size={16} /> : <PlusCircle size={16} />}
          {showForm ? "Cancel" : "Apply for leave"}
        </Button>
      </div>

      {showForm && (
        <Card className="mt-5">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-medium text-ink-800">
                Leave type
              </label>
              <select
                className="mt-1.5 w-full rounded-lg border border-ink-100 px-3.5 py-2.5 text-sm text-ink-900 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-400"
                {...register("leave_type", { required: "Leave type is required" })}
              >
                <option value="">Select leave type</option>
                {leaveTypes.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
              {errors.leave_type && (
                <span className="text-xs text-red-600">
                  {errors.leave_type.message}
                </span>
              )}
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-ink-800">
                  From date
                </label>
                <input
                  type="date"
                  min={new Date().toISOString().split("T")[0]}
                  className="rounded-lg border border-ink-100 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-400"
                  {...register("from_date", { required: "Start date is required" })}
                />
                {errors.from_date && (
                  <span className="text-xs text-red-600">
                    {errors.from_date.message}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-ink-800">
                  To date
                </label>
                <input
                  type="date"
                  min={fromDate || new Date().toISOString().split("T")[0]}
                  className="rounded-lg border border-ink-100 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-400"
                  {...register("to_date", { required: "End date is required" })}
                />
                {errors.to_date && (
                  <span className="text-xs text-red-600">
                    {errors.to_date.message}
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-ink-800">Reason</label>
              <textarea
                rows={3}
                placeholder="Briefly explain the reason for your leave..."
                className="rounded-lg border border-ink-100 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-400"
                {...register("reason", {
                  required: "Reason is required",
                  minLength: { value: 10, message: "Please provide more detail (min 10 characters)" },
                })}
              />
              {errors.reason && (
                <span className="text-xs text-red-600">{errors.reason.message}</span>
              )}
            </div>

            <Button type="submit" loading={submitting} className="self-start">
              Submit request
            </Button>
          </form>
        </Card>
      )}

      <div className="mt-6 flex gap-2">
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

      <div className="mt-4 flex flex-col gap-3">
        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner />
          </div>
        ) : leaves.length === 0 ? (
          <Card className="flex flex-col items-center justify-center py-16 text-center">
            <MessageSquare className="text-ink-400" size={26} />
            <p className="mt-3 text-sm font-medium text-ink-700">
              No leave requests
            </p>
            <p className="text-sm text-ink-400">
              Your leave requests will appear here.
            </p>
          </Card>
        ) : (
          leaves.map((l) => (
            <Card key={l.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-ink-900 capitalize">
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
                        Admin comment:{" "}
                      </span>
                      {l.admin_comment}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}