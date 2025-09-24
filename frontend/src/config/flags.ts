const raw = (import.meta.env.VITE_FEATURE_AUTH_ROUTING ?? "")
  .toString()
  .toLowerCase();
export const FEATURE_AUTH_ROUTING = raw === "true"; // default false if missing
