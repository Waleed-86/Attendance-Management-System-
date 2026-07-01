import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { ArrowLeft } from "lucide-react";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { useToast } from "../../context/ToastContext";
import { adminTaskApi } from "../../api/task";

export default function CreateTask() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [users, setUsers] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({ defaultValues: { priority: "medium" } });

  useEffect(() => {
    adminTaskApi
      .assignableUsers()
      .then((res) => setUsers(res.data.data))
      .catch(() => showToast("Unable to load users list.", "error"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = async (data) => {
    if (!data.description || data.description.trim() === "" || data.description === "<p>&nbsp;</p>") {
      showToast("Task description cannot be empty.", "error");
      return;
    }
    setSubmitting(true);
    try {
      await adminTaskApi.create(data);
      showToast("Task assigned successfully.");
      navigate("/admin/tasks");
    } catch (err) {
      showToast(
        err.response?.data?.message ||
          Object.values(err.response?.data?.errors || {})[0]?.[0] ||
          "Unable to create task.",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <button
        onClick={() => navigate("/admin/tasks")}
        className="flex items-center gap-1.5 text-sm text-ink-600 hover:text-ink-900"
      >
        <ArrowLeft size={16} />
        Back to tasks
      </button>

      <h1 className="mt-4 font-display text-2xl font-bold text-ink-900">
        Assign a new task
      </h1>

      <Card className="mt-5">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input
            label="Task title"
            placeholder="e.g. Prepare monthly attendance summary"
            error={errors.title?.message}
            {...register("title", {
              required: "Title is required",
              minLength: { value: 3, message: "Title is too short" },
            })}
          />

          <div>
            <label className="text-sm font-medium text-ink-800">Description</label>
            <div className="mt-1.5">
              <Controller
                name="description"
                control={control}
                rules={{ required: "Description is required" }}
                render={({ field }) => (
                  <CKEditor
                    editor={ClassicEditor}
                    data=""
                    onChange={(_, editor) => field.onChange(editor.getData())}
                  />
                )}
              />
            </div>
            {errors.description && (
              <span className="text-xs text-red-600">{errors.description.message}</span>
            )}
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-ink-800">Due date</label>
              <input
                type="date"
                min={new Date().toISOString().split("T")[0]}
                className="rounded-lg border border-ink-100 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-400"
                {...register("due_date", { required: "Due date is required" })}
              />
              {errors.due_date && (
                <span className="text-xs text-red-600">{errors.due_date.message}</span>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-ink-800">Priority</label>
              <select
                className="rounded-lg border border-ink-100 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-400"
                {...register("priority", { required: true })}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-ink-800">Assign to</label>
            <select
              className="rounded-lg border border-ink-100 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-400"
              {...register("assigned_to", { required: "Please select a user" })}
            >
              <option value="">Select an employee</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role})
                </option>
              ))}
            </select>
            {errors.assigned_to && (
              <span className="text-xs text-red-600">{errors.assigned_to.message}</span>
            )}
          </div>

          <Button type="submit" loading={submitting} className="self-start">
            Assign task
          </Button>
        </form>
      </Card>
    </div>
  );
}