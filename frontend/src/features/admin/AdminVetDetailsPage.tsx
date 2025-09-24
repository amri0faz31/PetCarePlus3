import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";
import Breadcrumbs from "../../components/Breadcrumbs";
import { fetchVetById, type VetDetails } from "./vetDetailsApi";

export default function AdminVetDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<VetDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      const res = await fetchVetById(id);
      if (!alive) return;

      if (res.ok) setData(res.data);
      else {
        if (res.code === "not_found") setError("Vet not found.");
        else if (res.code === "unauthorized")
          setError("Session expired. Please log in again.");
        else if (res.code === "forbidden")
          setError("You don’t have permission to view this page.");
        else if (res.code === "timeout")
          setError("The request timed out. Try again.");
        else if (res.code === "network")
          setError("Cannot reach the server. Check your connection.");
        else setError(res.detail || "Failed to load vet. Please try again.");
      }
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, [id]);

  return (
    <AdminLayout>
      <Breadcrumbs
        items={[
          { label: "Admin", to: "/admin" },
          { label: "Vets", to: "/admin/vets" },
          { label: "Details" },
        ]}
      />

      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Vet Details
        </h1>
        <Link
          to="/admin/vets"
          className="text-sm px-4 py-2 rounded-lg border bg-white hover:bg-gray-50"
        >
          ← Back to list
        </Link>
      </div>

      {loading && (
        <div className="bg-white border rounded-xl p-6 shadow-sm">
          <p className="text-gray-600">Loading vet…</p>
        </div>
      )}

      {!loading && error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-800">
          {error}
        </div>
      )}

      {!loading && !error && data && (
        <div className="bg-white border rounded-xl p-6 shadow-sm space-y-4">
          <div>
            <div className="text-xs uppercase text-gray-500">Full name</div>
            <div className="text-gray-900 text-lg">{data.fullName || "—"}</div>
          </div>
          <div>
            <div className="text-xs uppercase text-gray-500">Email</div>
            <div className="text-gray-900">{data.email || "—"}</div>
          </div>
          {/* future: actions (reset password, deactivate, etc.) */}
        </div>
      )}
    </AdminLayout>
  );
}
