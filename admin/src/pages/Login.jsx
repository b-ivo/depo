import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import LanguageSwitcher from "../i18n/LanguageSwitcher.jsx";
import { useLanguage } from "../i18n/context.js";
import { CLIENT_LOGIN_URL } from "../config/portal.js";

function Login() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      const user = response.data.data;

      if (user.role !== "admin" && user.role !== "superadmin") {
        setError("STAFF_PORTAL");
        return;
      }

      localStorage.setItem("adminToken", user.token);
      localStorage.setItem("adminUser", JSON.stringify(user));

      if (user.role === "superadmin") {
        navigate("/superadmin");
      } else {
        navigate("/admin");
      }
    } catch (error) {
      setError(
        error.response?.data?.message ||
          t("login.failed"),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white">
            {t("auth.title")}
          </h1>

          <p className="mt-2 text-slate-400">
            {t("portal.logoSubtitle")}
          </p>
        </div>

        <div className="rounded-2xl bg-white p-8 shadow-xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                {t("login.title")}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {t("login.description")}
              </p>
            </div>

            <LanguageSwitcher />
          </div>

          {error && (
            <div className={`mt-5 rounded-lg px-4 py-3 text-sm ${error === "STAFF_PORTAL" ? "bg-amber-50 border border-amber-200 text-amber-800" : "bg-red-50 text-red-700"}`}>
              {error === "STAFF_PORTAL" ? (
                <div>
                  <p className="font-medium">{t("login.staffMustUseClient")}</p>
                  <p className="mt-1 text-xs text-amber-700">This portal is for admins only. Staff should use the client portal.</p>
                  <a href={CLIENT_LOGIN_URL} className="mt-2 inline-flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800">
                    {t("login.goToClient")} →
                  </a>
                </div>
              ) : (
                error
              )}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="mt-6 space-y-5"
          >
            <div>
              <label className="block text-sm font-medium text-slate-700">
                {t("auth.email")}
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                placeholder="admin@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                {t("auth.password")}
              </label>

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-900"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-slate-900 px-4 py-3 font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? t("login.signingIn") : t("login.title")}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;