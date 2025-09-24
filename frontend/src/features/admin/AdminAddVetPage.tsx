import { useState } from "react";
import AdminLayout from "./AdminLayout";
import Breadcrumbs from "../../components/Breadcrumbs";
import { createVet } from "./api";

export default function AdminAddVetPage() {
  // form state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // ui state
  const [submitting, setSubmitting] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  // messages
  const [globalErr, setGlobalErr] = useState<string | null>(null);
  const [fieldErrs, setFieldErrs] = useState<{
    fullName?: string;
    email?: string;
    password?: string;
  }>({});
  const [success, setSuccess] = useState<{ email: string } | null>(null);

  // mini validation
  const validate = () => {
    const errs: typeof fieldErrs = {};
    const mail = email.trim().toLowerCase();
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!fullName.trim()) errs.fullName = "Full name is required.";
    if (!emailRe.test(mail)) errs.email = "Enter a valid email address.";
    if (password.length < 8)
      errs.password = "Password must be at least 8 characters.";

    setFieldErrs(errs);
    return Object.keys(errs).length === 0;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalErr(null);
    setSuccess(null);
    if (!validate()) return;

    setSubmitting(true);
    const body = {
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      password,
    };
    const res = await createVet(body, { timeoutMs: 10000 });
    setSubmitting(false);

    if (res.ok) {
      setSuccess({ email: res.data.email });
      setFullName("");
      setEmail("");
      setPassword("");
      return;
    }

    // map errors
    if (res.code === "email_in_use") {
      setFieldErrs({ email: "This email is already in use." });
      return;
    }
    if (res.code === "validation_failed") {
      setGlobalErr(
        res.detail || "Validation failed. Check the inputs and try again."
      );
      return;
    }
    if (res.code === "unauthorized") {
      setGlobalErr("Your session has expired. Please log in again.");
      return;
    }
    if (res.code === "forbidden") {
      setGlobalErr("You do not have permission to perform this action.");
      return;
    }
    if (res.code === "timeout") {
      setGlobalErr("The request timed out. Please try again.");
      return;
    }
    if (res.code === "network") {
      setGlobalErr(
        "Cannot reach the server. Check your connection and try again."
      );
      return;
    }

    setGlobalErr(res.detail || "Create vet failed. Please try again.");
  };

  return (
    <AdminLayout>
      <Breadcrumbs
        items={[
          { label: "Admin", to: "/admin" },
          { label: "Vets", to: "/admin" },
          { label: "Create" },
        ]}
      />

      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
        Create Vet Account
      </h1>
      <p className="text-gray-600 mb-6">
        (Admin only) Add a new veterinarian to the system.
      </p>

      {/* success banner */}
      {success && (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-green-800">
          Vet account created for{" "}
          <span className="font-medium">{success.email}</span>.
          <span className="ml-2">Share the temporary password securely.</span>
        </div>
      )}

      {/* error banner */}
      {globalErr && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-800">
          {globalErr}
        </div>
      )}

      <form
        onSubmit={onSubmit}
        className="bg-white border rounded-xl p-6 shadow-sm max-w-3xl"
        noValidate
      >
        {/* Full name */}
        <div className="mb-4">
          <label
            className="block mb-2 text-sm font-medium text-gray-900"
            htmlFor="fullName"
          >
            Full name
          </label>
          <input
            id="fullName"
            type="text"
            className={`bg-gray-50 border ${
              fieldErrs.fullName ? "border-red-400" : "border-gray-300"
            } text-gray-900 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-3`}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Dr. Jane Vet"
            required
          />
          {fieldErrs.fullName && (
            <p className="mt-1 text-xs text-red-600">{fieldErrs.fullName}</p>
          )}
        </div>

        {/* Email */}
        <div className="mb-4">
          <label
            className="block mb-2 text-sm font-medium text-gray-900"
            htmlFor="email"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            className={`bg-gray-50 border ${
              fieldErrs.email ? "border-red-400" : "border-gray-300"
            } text-gray-900 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-3`}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="jane.vet@example.com"
            required
          />
          {fieldErrs.email && (
            <p className="mt-1 text-xs text-red-600">{fieldErrs.email}</p>
          )}
        </div>

        {/* Password */}
        <div className="mb-6">
          <label
            className="block mb-2 text-sm font-medium text-gray-900"
            htmlFor="password"
          >
            Temporary password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPwd ? "text" : "password"}
              className={`bg-gray-50 border ${
                fieldErrs.password ? "border-red-400" : "border-gray-300"
              } text-gray-900 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-3 pr-24`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min 8 characters"
              required
            />
            <button
              type="button"
              onClick={() => setShowPwd((v) => !v)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-gray-600 hover:text-gray-900 px-2 py-1"
            >
              {showPwd ? "Hide" : "Show"}
            </button>
          </div>
          {fieldErrs.password && (
            <p className="mt-1 text-xs text-red-600">{fieldErrs.password}</p>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-3 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-60"
          >
            {submitting ? "Creating…" : "Create Vet"}
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={() => {
              setFullName("");
              setEmail("");
              setPassword("");
              setFieldErrs({});
              setGlobalErr(null);
              setSuccess(null);
            }}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Reset
          </button>
        </div>
      </form>
    </AdminLayout>
  );
}
