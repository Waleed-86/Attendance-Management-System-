import { useState, useEffect } from "react";
import { PlusCircle, Search, Edit3, Trash2, CalendarCheck } from "lucide-react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Spinner from "../../components/ui/Spinner";
import Modal from "../../components/ui/Modal";
import { useToast } from "../../context/ToastContext";
import { adminAttendanceApi } from "../../api/attendance";

const statusOptions = ["present", "absent", "leave"];

const emptyForm = { user_id: "", date: "", time: "", status: "present" };

export default function AdminAttendance() {
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState([]);
  const [meta, setMeta] = useState(null);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const res = await adminAttendanceApi.list(params);
      setRecords(res.data.data);
      setMeta(res.data.meta);
    } catch (err) {
      showToast(
        err.response?.data?.message || "Unable to load attendance records.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    adminAttendanceApi
      .users()
      .then((res) => setUsers(res.data.data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const timeout = setTimeout(fetchRecords, 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, statusFilter]);

  const openAddModal = () => {
    setEditingRecord(null);
    setForm({
      ...emptyForm,
      date: new Date().toISOString().split("T")[0],
      time: new Date().toTimeString().slice(0, 5),
    });
    setModalOpen(true);
  };

  const openEditModal = (record) => {
    setEditingRecord(record);
    setForm({
      user_id: record.user.id,
      date: record.date,
      time: record.time.slice(0, 5),
      status: record.status,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!editingRecord && !form.user_id) {
      showToast("Please select a user.", "error");
      return;
    }
    if (!form.date || !form.time) {
      showToast("Please fill in date and time.", "error");
      return;
    }

    setSaving(true);
    try {
      if (editingRecord) {
        await adminAttendanceApi.update(editingRecord.id, {
          date: form.date,
          time: form.time,
          status: form.status,
        });
        showToast("Attendance record updated.");
      } else {
        await adminAttendanceApi.create(form);
        showToast("Attendance record added.");
      }
      setModalOpen(false);
      fetchRecords();
    } catch (err) {
      showToast(
        err.response?.data?.message || "Unable to save attendance record.",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (record) => {
    if (
      !confirm(
        `Delete attendance record for ${record.user.name} on ${record.date}?`
      )
    )
      return;
    try {
      await adminAttendanceApi.destroy(record.id);
      showToast("Attendance record deleted.");
      fetchRecords();
    } catch (err) {
      showToast(
        err.response?.data?.message || "Unable to delete record.",
        "error"
      );
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900">
            Attendance Management
          </h1>
          <p className="mt-1 text-sm text-ink-600">
            View, add, edit, and manage attendance records for all users.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {meta && (
            <div className="rounded-lg bg-brand-50 px-3.5 py-2 text-sm font-medium text-brand-700">
              {meta.present_today} present today
            </div>
          )}
          <Button onClick={openAddModal}>
            <PlusCircle size={16} />
            Add record
          </Button>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400"
          />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-ink-100 bg-white pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-400"
          />
        </div>
        <div className="flex gap-2">
          {["", ...statusOptions].map((s) => (
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

      <Card className="mt-5 overflow-hidden !p-0">
        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner />
          </div>
        ) : records.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <CalendarCheck className="text-ink-400" size={26} />
            <p className="mt-3 text-sm font-medium text-ink-700">
              No attendance records found
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-ink-50 text-ink-500 text-xs uppercase tracking-wide">
                <tr>
                  <th className="text-left px-5 py-3 font-medium">User</th>
                  <th className="text-left px-5 py-3 font-medium">Date</th>
                  <th className="text-left px-5 py-3 font-medium">Time</th>
                  <th className="text-left px-5 py-3 font-medium">Status</th>
                  <th className="text-right px-5 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {records.map((r) => (
                  <tr key={r.id}>
                    <td className="px-5 py-3 text-ink-800">{r.user.name}</td>
                    <td className="px-5 py-3 text-ink-600">
                      {new Date(r.date).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3 text-ink-600">
                      {new Date(`1970-01-01T${r.time}`).toLocaleTimeString(
                        [],
                        { hour: "2-digit", minute: "2-digit" }
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700 capitalize">
                        {r.status}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => openEditModal(r)}
                          className="p-1.5 rounded-md text-ink-400 hover:bg-ink-50 hover:text-ink-700"
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(r)}
                          className="p-1.5 rounded-md text-ink-400 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {modalOpen && (
        <Modal
          title={editingRecord ? "Edit attendance record" : "Add attendance record"}
          onClose={() => setModalOpen(false)}
        >
          <div className="flex flex-col gap-4">
            {!editingRecord && (
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-ink-800">User</label>
                <select
                  value={form.user_id}
                  onChange={(e) => setForm({ ...form, user_id: e.target.value })}
                  className="rounded-lg border border-ink-100 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-400"
                >
                  <option value="">Select a user</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.email})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-ink-800">Date</label>
              <input
                type="date"
                max={new Date().toISOString().split("T")[0]}
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="rounded-lg border border-ink-100 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-400"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-ink-800">Time</label>
              <input
                type="time"
                value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
                className="rounded-lg border border-ink-100 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-400"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-ink-800">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="rounded-lg border border-ink-100 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-400"
              >
                {statusOptions.map((s) => (
                  <option key={s} value={s} className="capitalize">
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <Button onClick={handleSave} loading={saving} className="mt-1">
              {editingRecord ? "Save changes" : "Add record"}
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}