import { useEffect, useState } from "react";
import api from "../services/api";
import { getAdminUser } from "../utils/auth";
import { useLanguage } from "../i18n/context.js";

function Profile() {
  const { t } = useLanguage();
  const currentUser = getAdminUser();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [formError, setFormError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setError("");

        const res = await api.get("/auth/me");

        setProfile(res.data.data);

        const stored = getAdminUser();

        if (stored) {
          localStorage.setItem(
            "adminUser",
            JSON.stringify({
              ...stored,
              username: res.data.data.username,
              email: res.data.data.email,
            }),
          );
        }
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to load profile.",
        );
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const handleChangePassword = async (e) => {
    e.preventDefault();

    setMessage("");
    setFormError("");

    if (form.newPassword.length < 8) {
      setFormError("New password must be at least 8 characters.");
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setFormError("New passwords do not match.");
      return;
    }

    setBusy(true);

    try {
      await api.patch("/auth/change-password", {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });

      setMessage("Password changed successfully.");

      setForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      setFormError(
        err.response?.data?.message || "Failed to change password.",
      );
    } finally {
      setBusy(false);
    }
  };

  const inputClass =
    "mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-900";

  const buttonClass =
    "rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60";

  if (loading) {
    return (
      <div className="flex min-h-full items-center justify-center p-8">
        <p className="text-sm text-slate-500">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
          Profile
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Your account details and password.
        </p>
      </div>

      {error && (
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {profile && (
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="font-semibold text-slate-900">
              Account details
            </h2>

            <dl className="mt-6 space-y-4 text-sm">
              <div>
                <dt className="text-slate-500">Username</dt>

                <dd className="mt-1 font-medium text-slate-900">
                  {profile.username}
                </dd>
              </div>

              <div>
                <dt className="text-slate-500">Email</dt>

                <dd className="mt-1 font-medium text-slate-900">
                  {profile.email}
                </dd>
              </div>

              <div>
                <dt className="text-slate-500">Role</dt>

                <dd className="mt-1 capitalize text-slate-900">
                  {profile.role}
                </dd>
              </div>

              {profile.business && (
                <div>
                  <dt className="text-slate-500">Business</dt>

                  <dd className="mt-1 font-medium text-slate-900">
                    {profile.business.name}
                    <span className="ml-2 text-sm font-normal text-slate-500">
                      {profile.business.location}
                    </span>
                  </dd>
                </div>
              )}
            </dl>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="font-semibold text-slate-900">
              Change password
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {currentUser?.username || ""}
            </p>

            {message && (
              <div className="mt-5 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
                {message}
              </div>
            )}

            {formError && (
              <div className="mt-5 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                {formError}
              </div>
            )}

            <form
              onSubmit={handleChangePassword}
              className="mt-6 space-y-5"
            >
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Current password
                </label>

                <input
                  type="password"
                  value={form.currentPassword}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      currentPassword: e.target.value,
                    })
                  }
                  required
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  New password
                </label>

                <input
                  type="password"
                  value={form.newPassword}
                  onChange={(e) =>
                    setForm({ ...form, newPassword: e.target.value })
                  }
                  required
                  minLength="8"
                  className={inputClass}
                />

                <p className="mt-1 text-xs text-slate-500">
                  At least 8 characters.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Confirm new password
                </label>

                <input
                  type="password"
                  value={form.confirmPassword}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      confirmPassword: e.target.value,
                    })
                  }
                  required
                  minLength="8"
                  className={inputClass}
                />
              </div>

              <button
                type="submit"
                disabled={busy}
                className={buttonClass}
              >
                {busy ? "Updating..." : "Update password"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;