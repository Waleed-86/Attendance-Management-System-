import { useState, useEffect } from "react";
import {
  PlusCircle,
  Search,
  Edit3,
  Trash2,
  Users as UsersIcon,
  X,
} from "lucide-react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Spinner from "../../components/ui/Spinner";
import Modal from "../../components/ui/Modal";
import { useToast } from "../../context/ToastContext";
import { adminUserApi } from "../../api/user";
import { roleApi } from "../../api/role";

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  password: "",
  role: "",
  is_active: true,
};

export default function AdminUsers() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;
      const res = await adminUserApi.list(params);
      setUsers(res.data.data);
    } catch (err) {
      showToast(
        err.response?.data?.message || "Unable to load users.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    roleApi
      .list()
      .then((res) => setRoles(res.data.data.roles))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const timeout = setTimeout(fetchUsers, 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, roleFilter]);

  const openAddModal = () => {
    setEditingUser(null);
    setForm(emptyForm);
    setErrors({});
    setModalOpen(true);
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setForm({
      name: user.name,
      email: user.email,
      phone: user.phone || "",
      password: "",
      role: user.role,
      is_active: user.is_active,
    });
    setErrors({});
    setModalOpen(true);
  };

  const handleSave = async () => {
    setErrors({});

    if (!editingUser && (!form.password || form.password.length < 8)) {
      setErrors({ password: "Password must be at least 8 characters." });
      return;
    }

    setSaving(true);
    try {
      if (editingUser) {
        const payload = { ...form };
        if (!payload.password) delete payload.password;
        await adminUserApi.update(editingUser.id, payload);
        showToast("User updated successfully.");
      } else {
        await adminUserApi.create(form);
        showToast("User created successfully.");
      }
      setModalOpen(false);
      fetchUsers();
    } catch (err) {
      if (err.response?.status === 422) {
        setErrors(
          Object.fromEntries(
            Object.entries(err.response.data.errors || {}).map(([k, v]) => [
              k,
              v[0],
            ])
          )
        );
      } else {
        showToast(
          err.response?.data?.message || "Unable to save user.",
          "error"
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (user) => {
    if (!confirm(`Delete user "${user.name}"? This cannot be undone.`)) return;
    try {
      await adminUserApi.destroy(user.id);
      showToast("User deleted successfully.");
      fetchUsers();
    } catch (err) {
      showToast(
        err.response?.data?.message || "Unable to delete user.",
        "error"
      );
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900">
            Users
          </h1>
          <p className="mt-1 text-sm text-ink-600">
            View, add, edit, and manage system users.
          </p>
        </div>
        <Button onClick={openAddModal}>
          <PlusCircle size={16} />
          Add user
        </Button>
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
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="rounded-lg border border-ink-100 bg-white px-3 py-2.5 text-sm text-ink-800 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
        >
          <option value="">All roles</option>
          {roles.map((r) => (
            <option key={r.id} value={r.slug}>
              {r.name}
            </option>
          ))}
        </select>
      </div>

      <Card className="mt-5 overflow-hidden !p-0">
        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner />
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <UsersIcon className="text-ink-400" size={26} />
            <p className="mt-3 text-sm font-medium text-ink-700">
              No users found
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-ink-50 text-ink-500 text-xs uppercase tracking-wide">
                <tr>
                  <th className="text-left px-5 py-3 font-medium">Name</th>
                  <th className="text-left px-5 py-3 font-medium">Email</th>
                  <th className="text-left px-5 py-3 font-medium">Phone</th>
                  <th className="text-left px-5 py-3 font-medium">Role</th>
                  <th className="text-left px-5 py-3 font-medium">Status</th>
                  <th className="text-right px-5 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {users.map((u) => (
                  <tr key={u.id}>
                    <td className="px-5 py-3 text-ink-800 font-medium">
                      {u.name}
                    </td>
                    <td className="px-5 py-3 text-ink-600">{u.email}</td>
                    <td className="px-5 py-3 text-ink-600">{u.phone || "—"}</td>
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700 capitalize">
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          u.is_active
                            ? "bg-brand-50 text-brand-700"
                            : "bg-red-50 text-red-700"
                        }`}
                      >
                        {u.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => openEditModal(u)}
                          className="p-1.5 rounded-md text-ink-400 hover:bg-ink-50 hover:text-ink-700"
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(u)}
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
          title={editingUser ? "Edit user" : "Add new user"}
          onClose={() => setModalOpen(false)}
        >
          <div className="flex flex-col gap-4">
            <Input
              label="Full name"
              value={form.name}
              error={errors.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <Input
              label="Email"
              type="email"
              value={form.email}
              error={errors.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <Input
              label="Phone"
              value={form.phone}
              error={errors.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
            <Input
              label={editingUser ? "New password (leave blank to keep current)" : "Password"}
              type="password"
              value={form.password}
              error={errors.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-ink-800">Role</label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="rounded-lg border border-ink-100 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-400"
              >
                <option value="">Select a role</option>
                {roles.map((r) => (
                  <option key={r.id} value={r.slug}>
                    {r.name}
                  </option>
                ))}
              </select>
              {errors.role && (
                <span className="text-xs text-red-600">{errors.role}</span>
              )}
            </div>

            <label className="flex items-center gap-2 text-sm text-ink-700 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) =>
                  setForm({ ...form, is_active: e.target.checked })
                }
                className="rounded border-ink-300 text-brand-600 focus:ring-brand-500/40"
              />
              Account active
            </label>

            <Button onClick={handleSave} loading={saving} className="mt-1">
              {editingUser ? "Save changes" : "Create user"}
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}