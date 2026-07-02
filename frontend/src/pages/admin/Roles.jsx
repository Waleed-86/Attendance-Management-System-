import { useState, useEffect } from "react";
import { PlusCircle, Trash2, Edit3, Shield, X, Save } from "lucide-react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Spinner from "../../components/ui/Spinner";
import { useToast } from "../../context/ToastContext";
import { roleApi } from "../../api/role";

export default function Roles() {
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState([]);
  const [permissionGroups, setPermissionGroups] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [editingRole, setEditingRole] = useState(null); // null = creating new
  const [name, setName] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await roleApi.list();
      setRoles(res.data.data.roles);
      setPermissionGroups(res.data.data.permissions);
    } catch (err) {
      showToast(
        err.response?.data?.message || "Unable to load roles.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreateForm = () => {
    setEditingRole(null);
    setName("");
    setSelectedPermissions([]);
    setShowForm(true);
  };

  const openEditForm = (role) => {
    setEditingRole(role);
    setName(role.name);
    setSelectedPermissions(role.permissions.map((p) => p.id));
    setShowForm(true);
  };

  const togglePermission = (id) => {
    setSelectedPermissions((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    if (!editingRole && name.trim().length < 2) {
      showToast("Please enter a role name.", "error");
      return;
    }
    if (selectedPermissions.length === 0) {
      showToast("Please select at least one permission.", "error");
      return;
    }

    setSaving(true);
    try {
      if (editingRole) {
        await roleApi.update(editingRole.id, {
          permissions: selectedPermissions,
        });
        showToast("Role updated successfully.");
      } else {
        await roleApi.create({ name, permissions: selectedPermissions });
        showToast("Role created successfully.");
      }
      setShowForm(false);
      fetchData();
    } catch (err) {
      showToast(
        err.response?.data?.message || "Unable to save role.",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (role) => {
    if (!confirm(`Delete role "${role.name}"? This cannot be undone.`)) return;
    try {
      await roleApi.destroy(role.id);
      showToast("Role deleted successfully.");
      fetchData();
    } catch (err) {
      showToast(
        err.response?.data?.message || "Unable to delete role.",
        "error"
      );
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900">
            Roles & Permissions
          </h1>
          <p className="mt-1 text-sm text-ink-600">
            Manage roles and configure what each role can access.
          </p>
        </div>
        {!showForm && (
          <Button onClick={openCreateForm}>
            <PlusCircle size={16} />
            New role
          </Button>
        )}
      </div>

      {showForm && (
        <Card className="mt-5">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-semibold text-ink-900">
              {editingRole ? `Edit "${editingRole.name}" permissions` : "Create new role"}
            </h3>
            <button onClick={() => setShowForm(false)} className="text-ink-400 hover:text-ink-600">
              <X size={18} />
            </button>
          </div>

          {!editingRole && (
            <div className="mt-4 max-w-sm">
              <Input
                label="Role name"
                placeholder="e.g. Team Lead"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}
          {editingRole?.is_system && (
            <p className="mt-3 text-xs text-ink-400">
              This is a system role — its name is fixed, but you can still edit its permissions.
            </p>
          )}

          <div className="mt-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Object.entries(permissionGroups).map(([group, perms]) => (
              <div key={group}>
                <h4 className="text-xs font-semibold uppercase tracking-wide text-ink-400 mb-2">
                  {group}
                </h4>
                <div className="flex flex-col gap-2">
                  {perms.map((perm) => (
                    <label
                      key={perm.id}
                      className="flex items-center gap-2 text-sm text-ink-700 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedPermissions.includes(perm.id)}
                        onChange={() => togglePermission(perm.id)}
                        className="rounded border-ink-300 text-brand-600 focus:ring-brand-500/40"
                      />
                      {perm.label}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <Button onClick={handleSave} loading={saving} className="mt-6">
            <Save size={16} />
            {editingRole ? "Save changes" : "Create role"}
          </Button>
        </Card>
      )}

      <div className="mt-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {roles.map((role) => (
          <Card key={role.id}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-lg bg-brand-50 flex items-center justify-center">
                  <Shield className="text-brand-600" size={16} />
                </div>
                <div>
                  <p className="font-medium text-ink-900">{role.name}</p>
                  <p className="text-xs text-ink-400">
                    {role.users_count} user{role.users_count !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => openEditForm(role)}
                  className="p-1.5 rounded-md text-ink-400 hover:bg-ink-50 hover:text-ink-700"
                >
                  <Edit3 size={15} />
                </button>
                {!role.is_system && (
                  <button
                    onClick={() => handleDelete(role)}
                    className="p-1.5 rounded-md text-ink-400 hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            </div>
            <p className="mt-3 text-xs text-ink-500">
              {role.permissions.length} permission
              {role.permissions.length !== 1 ? "s" : ""} granted
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}