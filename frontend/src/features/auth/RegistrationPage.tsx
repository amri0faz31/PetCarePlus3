import React, { useState } from "react";

// tiny local helper — you can move this to src/features/auth/api.ts later
const BASE = (import.meta as any).env?.VITE_API_BASE_URL as string | undefined;

type RegisterOwnerResult =
  | { ok: true }
  | { ok: false; code: "email_in_use" | "failed" };

async function registerOwner(body: {
  fullName: string;
  email: string;
  password: string;
}): Promise<RegisterOwnerResult> {
  if (!BASE) {
    console.error("VITE_API_BASE_URL is not set");
    return { ok: false, code: "failed" };
  }
  const res = await fetch(`${BASE}/api/auth/register-owner`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (res.status === 201) return { ok: true };
  if (res.status === 409) return { ok: false, code: "email_in_use" };
  return { ok: false, code: "failed" };
}

function RegistrationPage() {
  // form state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [agree, setAgree] = useState(false);

  // ui state
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setEmailError(null);
    setPasswordError(null);

    // --- client-side validation (mirror server rules) ---
    const name = fullName.trim();
    const mail = email.trim().toLowerCase();

    if (name.length < 2) {
      setFormError("Please enter your full name.");
      return;
    }
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(mail)) {
      setEmailError("Enter a valid email address.");
      return;
    }
    // min 8 chars, include at least one letter and one number
    const policy = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
    if (!policy.test(password)) {
      setPasswordError(
        "Password must be at least 8 characters and include a letter and a number."
      );
      return;
    }
    if (password !== confirm) {
      setPasswordError("Passwords do not match.");
      return;
    }
    if (!agree) {
      setFormError("You must accept the Terms and Conditions.");
      return;
    }

    // --- call API ---
    setSubmitting(true);
    const result = await registerOwner({
      fullName: name,
      email: mail,
      password,
    });
    setSubmitting(false);

    if (result.ok) {
      // simple success UX; you can replace with a toast
      alert("Account created. Please log in.");
      window.location.assign("/login");
      return;
    }

    if (result.code === "email_in_use") {
      setEmailError("An account with this email already exists.");
      return;
    }

    setFormError(
      "Registration failed. Please check your details and try again."
    );
  };

  return (
    <section className="bg-white min-h-screen flex flex-col sm:flex-row">
      <div className="hidden sm:flex w-1/2 items-center justify-end pl-4 pr-4">
        <img
          src="./Petcare_cover_image.jpg"
          alt="Login illustration"
          className="w-4/5 h-auto max-h-[70%] object-contain rounded-xl"
        />
      </div>

      <div className="w-full sm:w-1/2 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-2xl bg-white rounded-xl shadow-md border p-6 sm:p-8">
          <a
            href="#"
            className="flex items-center mb-8 text-5xl font-bold text-gray-900"
          >
            <img className="w-16 h-16 mr-3" src="./logo.jpg" alt="logo" />
            PetCare+
          </a>

          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
            Create an account
          </h1>

          <form className="space-y-5" onSubmit={onSubmit} noValidate>
            {formError && (
              <div className="text-red-600 text-sm">{formError}</div>
            )}

            <div>
              <label
                htmlFor="full-name"
                className="block mb-2 text-sm font-medium text-gray-900"
              >
                Full name
              </label>
              <input
                type="text"
                id="full-name"
                placeholder="Full Name"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg
                  focus:ring-blue-600 focus:border-blue-600 block w-full p-3"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block mb-2 text-sm font-medium text-gray-900"
              >
                Your email
              </label>
              <input
                type="email"
                id="email"
                placeholder="example@email.com"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg
                  focus:ring-blue-600 focus:border-blue-600 block w-full p-3"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {emailError && (
                <p className="mt-1 text-xs text-red-600">{emailError}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block mb-2 text-sm font-medium text-gray-900"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                placeholder="••••••••"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg
                  focus:ring-blue-600 focus:border-blue-600 block w-full p-3"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div>
              <label
                htmlFor="confirm-password"
                className="block mb-2 text-sm font-medium text-gray-900"
              >
                Confirm password
              </label>
              <input
                type="password"
                id="confirm-password"
                placeholder="••••••••"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg
                  focus:ring-blue-600 focus:border-blue-600 block w-full p-3"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
              {passwordError && (
                <p className="mt-1 text-xs text-red-600">{passwordError}</p>
              )}
            </div>

            <div className="flex items-start">
              <input
                id="terms"
                type="checkbox"
                className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-blue-300"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                required
              />
              <label
                htmlFor="terms"
                className="ml-2 text-sm font-light text-gray-500"
              >
                I accept the{" "}
                <a
                  href="#"
                  className="font-medium text-blue-600 hover:underline"
                >
                  Terms and Conditions
                </a>
              </label>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60
                focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg
                text-sm px-5 py-3 text-center"
            >
              {submitting ? "Creating account..." : "Create an account"}
            </button>

            <p className="text-sm font-light text-gray-500 text-center">
              Already have an account?{" "}
              <a
                href="/login"
                className="font-medium text-blue-600 hover:underline"
              >
                Login here
              </a>
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}

export default RegistrationPage;
