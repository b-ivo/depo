import { useEffect, useState } from "react";
import AppLayout from "../components/layout/AppLayout";
import { apiRequest } from "../services/api";
import { useLanguage } from "../i18n/context.js";

export default function Profile() {
  const { t } = useLanguage();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await apiRequest("/auth/me");

        setUser(data.data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleChangePassword = async (e) => {
    e.preventDefault();

    setPasswordMessage("");
    setPasswordError("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError(t("profile.allFieldsRequired"));
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError(t("profile.minLength"));
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError(t("profile.mismatch"));
      return;
    }

    try {
      setPasswordLoading(true);

      const data = await apiRequest("/auth/change-password", {
        method: "PATCH",
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      setPasswordMessage(data.message);

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      setPasswordError(error.message);
    } finally {
      setPasswordLoading(false);
    }
  };

  if (loading) {
    return (
      <AppLayout title={t("profile.title")} description={t("profile.description")}>
        <div className="flex items-center justify-center py-20">
          <p className="text-slate-500">{t("profile.loading")}</p>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout title={t("profile.title")} description={t("profile.description")}>
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-red-600">{error}</p>
        </div>
      </AppLayout>
    );
  }

  const initials = user.username ? user.username.charAt(0).toUpperCase() : "?";

  return (
    <AppLayout title={t("profile.title")} description={t("profile.description")}>
      <div className="space-y-6">
        {/* Profile Card */}
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          {/* Profile Header */}
          <div className="flex items-center gap-5 border-b border-slate-200 p-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-900 text-3xl font-bold text-white">
              {initials}
            </div>

            <div>
              <h2 className="text-2xl font-semibold text-slate-900">
                {user.username}
              </h2>

              <p className="text-sm text-slate-500">{user.email}</p>
            </div>
          </div>

          {/* Account Information */}
          <div className="p-6">
            <h3 className="mb-5 text-lg font-semibold text-slate-900">
              {t("profile.accountInformation")}
            </h3>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-lg bg-slate-50 p-4">
                <p className="mb-1 text-sm text-slate-500">{t("profile.username")}</p>

                <p className="font-medium text-slate-900">{user.username}</p>
              </div>

              <div className="rounded-lg bg-slate-50 p-4">
                <p className="mb-1 text-sm text-slate-500">{t("auth.email")}</p>

                <p className="break-all font-medium text-slate-900">
                  {user.email}
                </p>
              </div>
              <div className="rounded-lg bg-slate-50 p-4">
                <p className="mb-1 text-sm text-slate-500">{t("profile.accountStatus")}</p>

                <span
                  className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium ${
                    user.active
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${
                      user.active ? "bg-green-500" : "bg-red-500"
                    }`}
                  />

                  {user.active ? t("common.active") : t("common.inactive")}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Change Password */}
        <section className="rounded-xl border border-slate-200 bg-white p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-slate-900">
              {t("profile.changingPassword")}
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              {t("profile.changePasswordDesc")}
            </p>
          </div>

          {passwordError && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
              {passwordError}
            </div>
          )}

          {passwordMessage && (
            <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-600">
              {passwordMessage}
            </div>
          )}

          <form onSubmit={handleChangePassword} className="max-w-xl space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                {t("profile.currentPassword")}
              </label>

              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder={t("profile.enterCurrentPassword")}
                className="h-11 w-full rounded-lg border border-slate-300 bg-white px-4 text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                {t("profile.newPassword")}
              </label>

              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder={t("profile.enterNewPassword")}
                className="h-11 w-full rounded-lg border border-slate-300 bg-white px-4 text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                {t("profile.confirmNewPassword")}
              </label>

              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={t("profile.confirmPassword")}
                className="h-11 w-full rounded-lg border border-slate-300 bg-white px-4 text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
            </div>

            <button
              type="submit"
              disabled={passwordLoading}
              className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {passwordLoading ? t("profile.changing") : t("profile.changingPassword")}
            </button>
          </form>
        </section>
      </div>
    </AppLayout>
  );
}
