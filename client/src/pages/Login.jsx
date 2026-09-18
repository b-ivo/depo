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

      // Go to dashboard
      if (data.data.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      <form
        onSubmit={handleLogin}
        className="w-full max-w-md bg-gray-800 p-8 rounded-2xl"
      >
        <h1 className="text-3xl font-bold text-white text-center mb-2">
          {t("auth.title")}
        </h1>

        <p className="text-gray-400 text-center mb-8">{t("auth.subtitle")}</p>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-400 p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <div className="mb-4">
          <label className="block text-white mb-2">{t("auth.email")}</label>

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("auth.enterEmail")}
            className="w-full h-11 px-4 rounded-lg bg-gray-700 text-white outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-6">
          <label className="block text-white mb-2">{t("auth.password")}</label>

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t("auth.enterPassword")}
            className="w-full h-11 px-4 rounded-lg bg-gray-700 text-white outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-11 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg transition"
        >
          {loading ? t("auth.loggingIn") : t("auth.login")}
        </button>
      </form>
    </div>
  );
}
