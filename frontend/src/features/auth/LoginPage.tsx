import React, { useState } from "react";

// ---- tiny helpers (you can move these to a shared auth/api module later)
const BASE = (import.meta as any).env?.VITE_API_BASE_URL as string | undefined;
const TOKEN_KEY = "APP_AT";
const setToken = (t: string) => localStorage.setItem(TOKEN_KEY, t);

// API result types
type LoginPayload = {
  accessToken: string;
  expiresAt?: string;
  user?: { id: string; role?: string; fullName?: string; email?: string };
};
type LoginOk = { ok: true; data: LoginPayload };
type LoginErr = {
  ok: false;
  code: "invalid" | "inactive" | "failed" | "network";
};

// call POST /api/auth/login
async function loginApi(body: {
  email: string;
  password: string;
}): Promise<LoginOk | LoginErr> {
  if (!BASE) return { ok: false, code: "failed" };
  try {
    const res = await fetch(`${BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.status === 200) {
      const data = (await res.json()) as LoginPayload; // { accessToken, user: { role } }
      if (!data?.accessToken) return { ok: false, code: "failed" };
      return { ok: true, data };
    }
    if (res.status === 401) return { ok: false, code: "invalid" };
    if (res.status === 403) return { ok: false, code: "inactive" };
    return { ok: false, code: "failed" };
  } catch (e) {
    console.error("login error", e);
    return { ok: false, code: "network" };
  }
}

// ---- component
function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setEmailError(null);

    // basic client checks
    const mail = email.trim().toLowerCase();
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(mail)) {
      setEmailError("Enter a valid email address.");
      return;
    }
    if (password.length < 1) {
      setFormError("Enter your password.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await loginApi({ email: mail, password });
      if (!res.ok) {
        if (res.code === "invalid") {
          setFormError("Email or password is incorrect.");
          return;
        }
        if (res.code === "inactive") {
          setFormError("This account is inactive. Please contact support.");
          return;
        }
        if (res.code === "network") {
          setFormError(
            "Cannot reach the server. Check your connection and try again."
          );
          return;
        }
        setFormError("Login failed. Please try again.");
        return;
      }

      // store token
      setToken(res.data.accessToken);
      localStorage.setItem(
        "APP_ROLE",
        (res.data.user?.role ?? "").toUpperCase()
      );

      if (remember) {
        // (optional) persist a refresh token later
      }

      // route by role directly from login payload
      const rawRole = res.data.user?.role ?? "";
      const role = String(rawRole).toUpperCase();

      // one-time log to verify
      console.log("login user.role =", rawRole);

      if (role === "ADMIN") {
        window.location.assign("/admin");
      } else if (role === "VET" || role === "VETERINARIAN") {
        window.location.assign("/vet");
      } else {
        window.location.assign("/owner"); // default for Owner/unknown
      }
    } catch (err) {
      console.error(err);
      setFormError("Unexpected error. Please try again.");
    } finally {
      setSubmitting(false);
    }
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
            Login to your account
          </h1>

          <form className="space-y-5" onSubmit={onSubmit} noValidate>
            {formError && (
              <div className="text-red-600 text-sm">{formError}</div>
            )}

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

            <div className="flex items-center justify-between">
              <div className="flex items-start">
                <input
                  id="remember"
                  type="checkbox"
                  className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-blue-300"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                <label
                  htmlFor="remember"
                  className="ml-2 text-sm font-light text-gray-500"
                >
                  Remember me
                </label>
              </div>
              <a
                href="#"
                className="text-sm font-medium text-blue-600 hover:underline"
              >
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60
                focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg
                text-sm px-5 py-3 text-center"
            >
              {submitting ? "Logging in..." : "Login"}
            </button>

            <p className="text-sm font-light text-gray-500 text-center">
              Don’t have an account?{" "}
              <a
                href="/register"
                className="font-medium text-blue-600 hover:underline"
              >
                Register here
              </a>
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}

export default LoginPage;
