import React, { useEffect, useState } from "react";
import { getMe, updateMe } from "../admin/usersApi"; // or "../auth/meApi" if you split

function OwnerProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");

  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const me = await getMe();
        if (!active) return;
        setFullName(me.fullName ?? "");
        setEmail(me.email ?? "");
      } catch (e: any) {
        setErr("Failed to load your profile.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    setErr(null);

    const body: any = {};
    if (fullName.trim()) body.fullName = fullName.trim();
    if (email.trim()) body.email = email.trim().toLowerCase();

    const res = await updateMe(body);
    if (!res.ok) {
      if (res.code === "unauthorized")
        setErr("Session expired. Please log in again.");
      else if (res.code === "conflict") setErr("That email is already in use.");
      else setErr("Could not save. Please try again.");
      setSaving(false);
      return;
    }
    setMsg("Profile updated.");
    setSaving(false);
  };

  if (loading) return <section className="p-6">Loading...</section>;
  if (err && !saving)
    return <section className="p-6 text-red-600">{err}</section>;

  return (
    <section className="p-6 max-w-xl">
      <h1 className="text-2xl font-bold mb-4">My Profile</h1>
      {msg && <div className="mb-3 text-green-600">{msg}</div>}
      {err && <div className="mb-3 text-red-600">{err}</div>}

      <form className="space-y-4" onSubmit={onSubmit} noValidate>
        <div>
          <label className="block text-sm font-medium mb-1">Full name</label>
          <input
            className="w-full border rounded px-3 py-2"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Your full name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            className="w-full border rounded px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </div>

        <button
          disabled={saving}
          className="bg-blue-600 text-white rounded px-4 py-2 disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save changes"}
        </button>
      </form>
    </section>
  );
}

export default OwnerProfilePage;
