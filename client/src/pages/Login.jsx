import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { apiRequest } from "../services/api";
import { useLanguage } from "../i18n/context.js";
import LanguageSwitcher from "../i18n/LanguageSwitcher.jsx";
import { ADMIN_LOGIN_URL } from "../config/portal.js";

function Login() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

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
                <a href={ADMIN_LOGIN_URL} className="mt-2 inline-flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-800">
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
              <div className="relative mt-2">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t("auth.enterPassword")}
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 pr-12 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-200"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={
                    showPassword
                      ? t("login.hidePassword")
                      : t("login.showPassword")
                  }
                  title={
                    showPassword
                      ? t("login.hidePassword")
                      : t("login.showPassword")
                  }
                  className="absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-r-lg text-slate-500 transition hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                >
                  <EyeIcon open={showPassword} />
                </button>
              </div>
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

function EyeIcon({ open }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden="true"
    >
      {open ? (
        <>
          <path d="M2.4 12S5.9 5.5 12 5.5 21.6 12 21.6 12 18.1 18.5 12 18.5 2.4 12 2.4 12Z" />
          <circle cx="12" cy="12" r="3.1" />
        </>
      ) : (
        <>
          <path d="M9.9 5.8A9.6 9.6 0 0 1 12 5.5c6.1 0 9.6 6.5 9.6 6.5a17 17 0 0 1-3.3 4.2" />
          <path d="M6.3 7.8A16.9 16.9 0 0 0 2.4 12S5.9 18.5 12 18.5a9.4 9.4 0 0 0 3.9-.8" />
          <path d="M9.9 9.9a3.1 3.1 0 0 0 4.3 4.3" />
          <path d="M3.5 3.5l17 17" />
        </>
      )}
    </svg>
  );
}

export default Login;
