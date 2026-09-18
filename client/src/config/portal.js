// Static portal URLs — single source of truth, not hard-coded per component.
// Override via Vite env: VITE_CLIENT_URL / VITE_ADMIN_URL (set in .env)
export const CLIENT_URL = import.meta.env.VITE_CLIENT_URL || "http://localhost:5173";
export const ADMIN_URL = import.meta.env.VITE_ADMIN_URL || "http://localhost:5174";
export const CLIENT_LOGIN_URL = `${CLIENT_URL}/login`;
export const ADMIN_LOGIN_URL = `${ADMIN_URL}/login`;
