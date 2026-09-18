import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import LanguageSwitcher from "../i18n/LanguageSwitcher.jsx";
import { useLanguage } from "../i18n/context.js";

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
        setError(t("login.accessDenied"));
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
            <div className="mt-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
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