import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, MessageSquareText } from "lucide-react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Spinner from "../../components/ui/Spinner";
import Badge from "../../components/ui/Badge";
import PriorityBadge from "../../components/ui/PriorityBadge";
import { useToast } from "../../context/ToastContext";
import { taskApi } from "../../api/task";

export default function TaskDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [task, setTask] = useState(null);
  const [response, setResponse] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchTask = async () => {
    setLoading(true);
    try {
      const res = await taskApi.show(id);
      setTask(res.data.data);
    } catch (err) {
      showToast(err.response?.data?.message || "Task not found.", "error");
      navigate("/tasks");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTask();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (response.trim().length < 5) {
      showToast("Please write a more detailed response.", "error");
      return;
    }
    setSubmitting(true);
    try {
      const res = await taskApi.submit(id, { response });
      setTask(res.data.data);
      setResponse("");
      showToast("Task submitted successfully.");
    } catch (err) {
      showToast(err.response?.data?.message || "Unable to submit task.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }

  if (!task) return null;

  const canSubmit = ["pending", "in_progress", "rejected"].includes(task.status);

  return (
    <div className="max-w-2xl">
      <button
        onClick={() => navigate("/tasks")}
        className="flex items-center gap-1.5 text-sm text-ink-600 hover:text-ink-900"
      >
        <ArrowLeft size={16} />
        Back to my tasks
      </button>

      <Card className="mt-4">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge status={task.status} />
          <PriorityBadge priority={task.priority} />
        </div>
        <h1 className="mt-3 font-display text-xl font-bold text-ink-900">
          {task.title}
        </h1>
        <div className="mt-1.5 flex items-center gap-1.5 text-sm text-ink-500">
          <Calendar size={14} />
          Due {new Date(task.due_date).toLocaleDateString()}
          {task.creator && <> · Assigned by {task.creator.name}</>}
        </div>

        <div
          className="mt-4 prose prose-sm max-w-none text-ink-700"
          dangerouslySetInnerHTML={{ __html: task.description }}
        />
      </Card>

      {task.latest_submission && (
        <Card className="mt-4">
          <h3 className="font-display font-semibold text-ink-900 flex items-center gap-1.5">
            <MessageSquareText size={16} />
            Your response
          </h3>
          <p className="mt-2 text-sm text-ink-700 whitespace-pre-wrap">
            {task.latest_submission.response}
          </p>
          {task.latest_submission.admin_feedback && (
            <div className="mt-3 rounded-lg bg-ink-50 px-3 py-2 text-sm text-ink-600">
              <span className="font-medium text-ink-700">Admin feedback: </span>
              {task.latest_submission.admin_feedback}
            </div>
          )}
        </Card>
      )}

      {canSubmit && (
        <Card className="mt-4">
          <h3 className="font-display font-semibold text-ink-900">
            {task.status === "rejected" ? "Resubmit your response" : "Submit your response"}
          </h3>
          <form onSubmit={handleSubmit} className="mt-3 flex flex-col gap-3">
            <textarea
              rows={5}
              placeholder="Describe what you completed..."
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              className="rounded-lg border border-ink-100 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-400"
            />
            <Button type="submit" loading={submitting} className="self-start">
              Submit
            </Button>
          </form>
        </Card>
      )}
    </div>
  );
}