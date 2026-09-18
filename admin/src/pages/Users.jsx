import { useEffect, useState } from "react";
import api from "../services/api";
import Modal from "../components/Modal";
import { useLanguage } from "../i18n/context.js";
import { getAdminUser } from "../utils/auth";

function RoleBadge({ role }) {
  const styles = {
    superadmin: "bg-purple-100 text-purple-700",
    admin: "bg-blue-100 text-blue-700",
    staff: "bg-slate-100 text-slate-600",
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium capitalize ${styles[role] || styles.staff}`}
    >
      {role}
    </span>
  );
}

function Users() {
  const { t } = useLanguage();
  const currentUser = getAdminUser();
  const isSuperAdmin = currentUser?.role === "superadmin";

  const [users, setUsers] = useState([]);
  const [businesses, setBusinesses] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showAdd, setShowAdd] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [confirmUser, setConfirmUser] = useState(null);

  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState("");

  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    password: "",
    role: "staff",
    businessId: "",
  });

  useEffect(() => {
    const load = async () => {
      try {
        setError("");

        const [usersRes, businessesRes] = await Promise.all([
          api.get("/users"),
          isSuperAdmin ? api.get("/businesses") : Promise.resolve(null),
        ]);

        setUsers(usersRes.data.data);

        if (isSuperAdmin) {
          setBusinesses(businessesRes.data.data);
        }
      } catch (err) {
      setError(
        err.response?.data?.message || t("users.failedToLoad"),
      );
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [isSuperAdmin]);

  const resetNewUser = () => {
    const firstActive = businesses.find((b) => b.active);

    setNewUser({
      username: "",
      email: "",
      password: "",
      role: "staff",
      businessId: firstActive?._id || "",
    });
  };

  const openAdd = () => {
    setActionError("");
    resetNewUser();
    setShowAdd(true);
  };

  const openEdit = (user) => {
    setActionError("");
    setEditingUser({
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
    });
  };

  const handleCreate = async (e) => {
    e.preventDefault();

    setBusy(true);
    setActionError("");

    try {
      const payload = {
        username: newUser.username,
        email: newUser.email,
        password: newUser.password,
        role: newUser.role,
      };

      if (isSuperAdmin) {
        payload.businessId = newUser.businessId;
      }

      const res = await api.post("/users", payload);

      setUsers((prev) => [res.data.data, ...prev]);
      setShowAdd(false);
    } catch (err) {
      setActionError(
        err.response?.data?.message || t("users.createFailed"),
      );
    } finally {
      setBusy(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    setBusy(true);
    setActionError("");

    try {
      const res = await api.patch(`/users/${editingUser.id}`, {
        username: editingUser.username,
        email: editingUser.email,
        role: editingUser.role,
      });

      setUsers((prev) =>
        prev.map((u) =>
          u._id === res.data.data._id ? res.data.data : u,
        ),
      );

      setEditingUser(null);
    } catch (err) {
      setActionError(
        err.response?.data?.message || t("users.updateFailed"),
      );
    } finally {
      setBusy(false);
    }
  };

  const handleToggle = async () => {
    setBusy(true);
    setActionError("");

    try {
      const res = await api.patch(`/users/${confirmUser._id}/status`, {
        active: !confirmUser.active,
      });

      setUsers((prev) =>
        prev.map((u) =>
          u._id === res.data.data._id ? res.data.data : u,
        ),
      );

      setConfirmUser(null);
    } catch (err) {
      setActionError(
        err.response?.data?.message || t("users.updateStatusFailed"),
      );
    } finally {
      setBusy(false);
    }
  };

  const canManage = (user) => {
    if (isSuperAdmin) {
      return user._id !== currentUser?.id;
    }

    return user.role === "staff";
  };

  const inputClass =
    "mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-900";

  const buttonClass =
    "rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60";

  const tableColumns = [
    { key: "user", label: t("users.thUser") },
    { key: "role", label: t("users.thRole") },
    ...(isSuperAdmin ? [{ key: "business", label: t("users.thBusiness") }] : []),
    { key: "status", label: t("users.thStatus") },
    { key: "actions", label: t("users.thActions") },
  ];

  if (loading) {
    return (
      <div className="flex min-h-full items-center justify-center p-8">
        <p className="text-sm text-slate-500">{t("users.loading")}</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
                <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
                  {t("users.title")}
                </h1>

          <p className="mt-1 text-sm text-slate-500">
          {isSuperAdmin
            ? t("users.descriptionSuper")
            : t("users.descriptionBusiness")}
          </p>
        </div>

        <button onClick={openAdd} className={buttonClass}>
          {t("users.newUser")}
        </button>
      </div>

      {error && (
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mt-8 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                {tableColumns.map((col) => (
                  <th key={col.key} className="px-6 py-4 font-medium text-slate-500">
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {users.map((user) => (
                <tr
                  key={user._id}
                  className="border-b border-slate-100 last:border-0"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-700">
                        {user.username?.charAt(0).toUpperCase()}
                      </div>

                      <div className="min-w-0">
                        <p className="flex items-center gap-2 font-medium text-slate-900">
                          <span className="truncate">
                            {user.username}
                          </span>

                          {user._id === currentUser?.id && (
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-500">
                              You
                            </span>
                          )}
                        </p>

                        <p className="truncate text-xs text-slate-500">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <RoleBadge role={user.role} />
                  </td>

                  {isSuperAdmin && (
                    <td className="px-6 py-4 text-slate-600">
                      {user.businessId?.name || "—"}
                    </td>
                  )}

                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                        user.active
                          ? "bg-green-100 text-green-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {user.active ? t("common.active") : t("common.inactive")}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    {canManage(user) ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEdit(user)}
                          className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => {
                            setActionError("");
                            setConfirmUser(user);
                          }}
                          className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                            user.active
                              ? "border-red-200 text-red-600 hover:bg-red-50"
                              : "border-green-200 text-green-600 hover:bg-green-50"
                          }`}
                        >
                          {user.active ? t("common.deactivate") : t("common.activate")}
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">
                        —
                      </span>
                    )}
                  </td>
                </tr>
              ))}

              {users.length === 0 && (
                <tr>
                  <td
                    colSpan={isSuperAdmin ? 5 : 4}
                    className="px-6 py-8 text-center text-slate-500"
                  >
                    {t("users.noFound")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAdd && (
        <Modal title={t("users.new")} onClose={() => setShowAdd(false)}>
          <form onSubmit={handleCreate} className="space-y-5">
            {actionError && (
              <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                {actionError}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700">
                {t("users.username")}
              </label>

              <input
                type="text"
                value={newUser.username}
                onChange={(e) =>
                  setNewUser({ ...newUser, username: e.target.value })
                }
                required
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                {t("users.email")}
              </label>

              <input
                type="email"
                value={newUser.email}
                onChange={(e) =>
                  setNewUser({ ...newUser, email: e.target.value })
                }
                required
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                {t("users.password")}
              </label>

              <input
                type="password"
                value={newUser.password}
                onChange={(e) =>
                  setNewUser({ ...newUser, password: e.target.value })
                }
                required
                minLength="8"
                className={inputClass}
              />

              <p className="mt-1 text-xs text-slate-500">
                {t("users.minLength")}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                {t("users.role")}
              </label>

              <select
                value={newUser.role}
                onChange={(e) =>
                  setNewUser({ ...newUser, role: e.target.value })
                }
                className={inputClass}
              >
                {isSuperAdmin ? (
                  <>
                    <option value="admin">{t("users.roleAdmin")}</option>
                    <option value="staff">{t("users.roleStaff")}</option>
                  </>
                ) : (
                  <option value="staff">{t("users.roleStaff")}</option>
                )}
              </select>
            </div>

            {isSuperAdmin && (
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  {t("users.business")}
                </label>

                <select
                  value={newUser.businessId}
                  onChange={(e) =>
                    setNewUser({
                      ...newUser,
                      businessId: e.target.value,
                    })
                  }
                  required
                  className={inputClass}
                >
                  <option value="">{t("users.selectBusiness")}</option>

                  {businesses
                    .filter((business) => business.active)
                    .map((business) => (
                      <option key={business._id} value={business._id}>
                        {business.name}
                      </option>
                    ))}
                </select>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAdd(false)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={busy}
                className={buttonClass}
              >
                {busy ? t("users.creating") : t("users.create")}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {editingUser && (
        <Modal
        title={t("users.editTitle")}
        onClose={() => setEditingUser(null)}
        >
          <form onSubmit={handleUpdate} className="space-y-5">
            {actionError && (
              <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                {actionError}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700">
                {t("users.username")}
              </label>

              <input
                type="text"
                value={editingUser.username}
                onChange={(e) =>
                  setEditingUser({
                    ...editingUser,
                    username: e.target.value,
                  })
                }
                required
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                {t("users.email")}
              </label>

              <input
                type="email"
                value={editingUser.email}
                onChange={(e) =>
                  setEditingUser({
                    ...editingUser,
                    email: e.target.value,
                  })
                }
                required
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                {t("users.role")}
              </label>

              {isSuperAdmin ? (
                <select
                  value={editingUser.role}
                  onChange={(e) =>
                    setEditingUser({
                      ...editingUser,
                      role: e.target.value,
                    })
                  }
                  className={inputClass}
                >
                  <option value="admin">{t("users.roleAdmin")}</option>
                  <option value="staff">{t("users.roleStaff")}</option>
                  {editingUser.role === "superadmin" && (
                    <option value="superadmin">
                      {t("users.roleSuperKeep")}
                    </option>
                  )}
                </select>
              ) : (
                <select
                  value="staff"
                  disabled
                  className={`${inputClass} bg-slate-50 text-slate-400`}
                >
                  <option value="staff">{t("users.roleStaff")}</option>
                </select>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={busy}
                className={buttonClass}
              >
                  {busy ? t("users.saving") : t("users.saveChanges")}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {confirmUser && (
      <Modal
        title={
          confirmUser.active ? t("users.deactivateTitle") : t("users.activateTitle")
        }
          onClose={() => setConfirmUser(null)}
        >
          <p className="text-sm text-slate-600">
            {t("users.confirmBody", {
              action: confirmUser.active ? t("common.deactivate").toLowerCase() : t("common.activate").toLowerCase(),
              username: confirmUser.username,
              warning: confirmUser.active ? t("users.noLongerSignIn") : "",
            })}
          </p>

          {actionError && (
            <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              {actionError}
            </div>
          )}

          <div className="mt-6 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setConfirmUser(null)}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
            >
              {t("common.cancel")}
            </button>

            <button
              type="button"
              onClick={handleToggle}
              disabled={busy}
              className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${
                confirmUser.active
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
                  {busy ? t("common.saving") : t("common.confirm")}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default Users;