import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { apiRequest } from "../services/api";
import { useLanguage } from "../i18n/context.js";
import LanguageSwitcher from "../i18n/LanguageSwitcher.jsx";

export default function Login() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");

    if (!email || !password) {
      setError(t("auth.emailAndPasswordRequired"));
      return;
    }

    try {
      setLoading(true);

      const data = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email,
          password,
        }),
      });

      console.log("Login response:", data);

      // Client portal is for staff only — block admin/superadmin
      if (data.data.role === "admin" || data.data.role === "superadmin") {
        setError("ADMIN_PORTAL");
        return;
      }

      // Save JWT
      localStorage.setItem("token", data.data.token);

      // Save user info
      localStorage.setItem(
        "user",
        JSON.stringify({
          id: data.data.id,
          email: data.data.email,
          username: data.data.username,
          role: data.data.role,
          businessId: data.data.businessId,
          business: data.data.business,
        }),
      );

      // Go to dashboard (staff only)
      navigate("/");
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white">{t("auth.title")}</h1>
          <p className="mt-2 text-slate-400">{t("auth.subtitle")}</p>
        </div>

        <div className="rounded-2xl bg-white p-8 shadow-xl">
          <div className="flex justify-end mb-2">
            <LanguageSwitcher />
          </div>

          <h2 className="text-2xl font-bold text-slate-900">{t("auth.login")}</h2>
          <p className="mt-1 text-sm text-slate-500">{t("auth.subtitle")}</p>

        {error && (
          <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3">
            {error === "ADMIN_PORTAL" ? (
              <div>
                <p className="text-sm font-medium text-amber-800">{t("login.adminMustUseAdmin")}</p>
                <p className="mt-1 text-xs text-amber-700">Staff area is for staff only. Admins belong on the admin portal.</p>
                <a href="http://localhost:5174/login" className="mt-2 inline-flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800">
                  {t("login.goToAdmin")} →
                </a>
              </div>
            ) : (
              <p className="text-sm text-red-700">{error}</p>
            )}
          </div>
        )}

          <form onSubmit={handleLogin} className="mt-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700">{t("auth.email")}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("auth.enterEmail")}
                className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">{t("auth.password")}</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t("auth.enterPassword")}
                className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-slate-900 px-4 py-3 font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? t("auth.loggingIn") : t("auth.login")}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
