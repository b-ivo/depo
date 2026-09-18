import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { getAdminUser } from "../utils/auth";
import { useLanguage } from "../i18n/context.js";

function AdminDashboard() {
  const { t } = useLanguage();
  const currentUser = getAdminUser();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setError("");

        const res = await api.get("/users");

        setUsers(res.data.data);
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to load dashboard data.",
        );
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const activeUsers = users.filter((user) => user.active);
  const inactiveUsers = users.filter((user) => user.active === false);

  if (loading) {
    return (
      <div className="flex min-h-full items-center justify-center p-8">
        <p className="text-sm text-slate-500">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
          Admin Dashboard
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Overview of {currentUser?.business?.name || "your business"}.
        </p>
      </div>

      {error && (
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {currentUser?.business && (
        <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Business
          </p>

          <p className="mt-2 text-xl font-bold text-slate-900">
            {currentUser.business.name}
          </p>

          <p className="mt-1 text-sm text-slate-600">
            {currentUser.business.location}
          </p>
        </div>
      )}

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Total Users
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            {users.length}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Active Users
          </p>

          <p className="mt-2 text-3xl font-bold text-green-600">
            {activeUsers.length}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Inactive Users
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-400">
            {inactiveUsers.length}
          </p>
        </div>
      </div>

      <div className="mt-8 rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <h2 className="font-semibold text-slate-900">
              Recent users
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Staff members in your business.
            </p>
          </div>

          <Link
            to="/admin/users"
            className="text-sm font-medium text-slate-900 hover:underline"
          >
            View all
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-6 py-4 font-medium text-slate-500">
                  User
                </th>

                <th className="px-6 py-4 font-medium text-slate-500">
                  Role
                </th>

                <th className="px-6 py-4 font-medium text-slate-500">
                  Status
                </th>
              </tr>
            </thead>

            <tbody>
              {users.slice(0, 8).map((user) => (
                <tr
                  key={user._id}
                  className="border-b border-slate-100 last:border-0"
                >
                  <td className="px-6 py-4">
                    <p className="font-medium text-slate-900">
                      {user.username}
                    </p>

                    <p className="text-xs text-slate-500">
                      {user.email}
                    </p>
                  </td>

                  <td className="px-6 py-4">
                    <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium capitalize text-slate-600">
                      {user.role}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                        user.active
                          ? "bg-green-100 text-green-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {user.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                </tr>
              ))}

              {users.length === 0 && (
                <tr>
                  <td
                    colSpan="3"
                    className="px-6 py-8 text-center text-slate-500"
                  >
                    No users in this business yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;