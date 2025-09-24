import React, { useEffect, useState } from "react";
import { fetchAdminUsers, updateUser } from "./usersApi";
import type { UserListItem } from "./usersApi";
import { useParams, useNavigate } from "react-router-dom";

function AdminUserEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [user, setUser] = useState<UserListItem | null>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [accountStatus, setAccountStatus] = useState<"Active" | "Inactive">(
    "Active"
  );

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const run = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);

      let found: UserListItem | undefined;
      for (let p = 1; p <= 3 && !found; p++) {
        const res = await fetchAdminUsers({ page: p, pageSize: 20 });
        if (!res.ok) {
          setError(`Failed to load user: ${res.code}`);
          setLoading(false);
          return;
        }
        found = res.items.find((u) => u.id === id);
      }

      if (!active) return;

      if (!found) {
        setError("User not found.");
        setLoading(false);
        return;
      }

      setUser(found);
      setFullName(found.fullName ?? "");
      setEmail(found.email ?? "");
      setAccountStatus(found.isActive ? "Active" : "Inactive");
      setLoading(false);
    };
    run();
    return () => {
      active = false;
    };
  }, [id]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setSaving(true);
    setSaveMsg(null);
    setError(null);

    const body: any = {};
    if (fullName.trim() && fullName !== (user?.fullName ?? ""))
      body.fullName = fullName.trim();
    if (email.trim() && email !== (user?.email ?? ""))
      body.email = email.trim().toLowerCase();
    if ((accountStatus === "Active") !== !!user?.isActive)
      body.accountStatus = accountStatus;

    if (Object.keys(body).length === 0) {
      setSaveMsg("Nothing to update.");
      setSaving(false);
      return;
    }

    const res = await updateUser(id, body);
    if (!res.ok) {
      if (res.code === "conflict") setError("That email is already in use.");
      else if (res.code === "not_found") setError("User not found.");
      else if (res.code === "forbidden")
        setError("You do not have permission.");
      else if (res.code === "unauthorized")
        setError("Session expired. Please log in again.");
      else setError("Update failed. Please try again.");
      setSaving(false);
      return;
    }

    setUser({
      id: res.user.id,
      fullName: res.user.fullName,
      email: res.user.email,
      roles: res.user.roles,
      isActive: res.user.isActive,
      accountStatus: res.user.accountStatus,
    });
    setSaveMsg("Saved!");
    setSaving(false);
  };

  if (loading)
    return (
      <section className="p-6 text-gray-600 text-lg font-medium">
        Loading...
      </section>
    );
  if (error)
    return (
      <section className="p-6 text-red-600 text-lg font-medium">{error}</section>
    );
  if (!user) return <section className="p-6 text-gray-500">No user.</section>;

  return (
    <section className="p-6 max-w-3xl mx-auto bg-white rounded-lg shadow-md">
      <button
        className="mb-6 text-blue-600 hover:text-blue-800 font-medium transition"
        onClick={() => navigate(-1)}
      >
        ← Back
      </button>

      <h1 className="text-3xl font-bold mb-6 text-gray-800">Edit User</h1>

      <form className="space-y-6" onSubmit={onSubmit}>
        {saveMsg && (
          <div className="p-3 bg-green-100 text-green-800 rounded">{saveMsg}</div>
        )}
        {error && (
          <div className="p-3 bg-red-100 text-red-800 rounded">{error}</div>
        )}

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">
            Full Name
          </label>
          <input
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Full name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">
            Email
          </label>
          <input
            type="email"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={email}
            readOnly
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">
            Account Status
          </label>
          <select
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={accountStatus}
            onChange={(e) =>
              setAccountStatus(e.target.value as "Active" | "Inactive")
            }
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Note: you cannot deactivate your own admin account.
          </p>
        </div>

        <button
          disabled={saving}
          className="w-full bg-blue-600 text-white rounded-lg px-6 py-3 font-medium hover:bg-blue-700 transition disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </section>
  );
}

export default AdminUserEditPage;
