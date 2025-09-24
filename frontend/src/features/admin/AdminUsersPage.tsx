import { useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";
import Breadcrumbs from "../../components/Breadcrumbs";
import { fetchAdminUsers, setUserActive, type UserListItem } from "./usersApi";
import { Link, useNavigate } from "react-router-dom";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    const ctrl = new AbortController();

    async function load() {
      setLoading(true);
      setError(null);
      const res = await fetchAdminUsers({
        page: 1,
        pageSize: 10,
        signal: ctrl.signal,
      });
      if (!active) return;

      if (!res.ok) {
        setError(`Failed to load users: ${res.code}`);
        setUsers([]);
      } else {
        setUsers(res.items);
      }
      setLoading(false);
    }
    load();

    return () => {
      active = false;
      ctrl.abort();
    };
  }, []);

  async function onToggleActive(u: UserListItem) {
    const nextActive = !u.isActive;
    const verb = nextActive ? "activate" : "deactivate";
    if (!confirm(`Are you sure you want to ${verb} "${u.fullName ?? u.email}"?`))
      return;

    try {
      setBusyId(u.id);

      // optimistic update
      setUsers((prev) =>
        prev.map((x) =>
          x.id === u.id
            ? {
                ...x,
                isActive: nextActive,
                accountStatus: nextActive ? "Active" : "Inactive",
              }
            : x
        )
      );

      const res = await setUserActive(u.id, nextActive);
      if (!res.ok) {
        // revert on failure
        setUsers((prev) =>
          prev.map((x) =>
            x.id === u.id
              ? {
                  ...x,
                  isActive: !nextActive,
                  accountStatus: !nextActive ? "Active" : "Inactive",
                }
              : x
          )
        );
        alert(
          res.code === "forbidden"
            ? "You are not allowed to do that."
            : res.code === "unauthorized"
            ? "Session expired. Please log in again."
            : res.code === "conflict"
            ? "Update conflict."
            : "Failed to update status."
        );
      }
    } finally {
      setBusyId(null);
    }
  }

  return (
    <AdminLayout>
      <Breadcrumbs
        items={[{ label: "Admin", to: "/admin" }, { label: "Users" }]}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
        <h1 className="text-2xl sm:text-3xl font-bold text-blue-800">Users</h1>
        <div className="flex gap-3">
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 rounded-lg border bg-white hover:bg-gray-50 text-gray-700 shadow text-sm"
          >
            ← Back
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="bg-white border rounded-xl p-6 shadow-sm mb-4">
          <p className="text-gray-600">Loading users…</p>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-800 shadow">
          {error}
        </div>
      )}

      {/* Empty */}
      {!loading && !error && users.length === 0 && (
        <div className="bg-white border rounded-xl p-6 shadow-sm">
          <p className="text-gray-700">No users found.</p>
        </div>
      )}

      {/* Table */}
      {!loading && !error && users.length > 0 && (
        <div className="bg-white border rounded-xl shadow overflow-hidden">
          <table className="min-w-full text-left text-gray-700">
            <thead className="bg-blue-50 text-gray-600">
              <tr>
                <th className="px-6 py-3 font-medium">Full Name</th>
                <th className="px-6 py-3 font-medium">Email</th>
                <th className="px-6 py-3 font-medium">Roles</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr
                  key={u.id}
                  className="border-t hover:bg-blue-50 transition"
                >
                  <td className="px-6 py-3">{u.fullName || "—"}</td>
                  <td className="px-6 py-3">{u.email || "—"}</td>
                  <td className="px-6 py-3">{u.roles.join(", ")}</td>
                  <td className="px-6 py-3">
                    <span
                      className={`px-2 py-1 rounded text-white text-sm ${
                        u.isActive ? "bg-green-500" : "bg-red-500"
                      }`}
                    >
                      {u.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-3 flex gap-3">
                    <Link
                      to={`/admin/users/${u.id}`}
                      className="px-3 py-1 rounded-lg text-sm text-white shadow bg-yellow-500 hover:bg-yellow-600"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => onToggleActive(u)}
                      disabled={busyId === u.id}
                      className={`px-3 py-1 rounded-lg text-sm text-white shadow ${
                        u.isActive
                          ? "bg-amber-600 hover:bg-amber-700"
                          : "bg-green-600 hover:bg-green-700"
                      } disabled:opacity-60`}
                    >
                      {busyId === u.id
                        ? "Saving..."
                        : u.isActive
                        ? "Deactivate"
                        : "Activate"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}
