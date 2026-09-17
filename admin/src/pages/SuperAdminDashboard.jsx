import { useEffect, useState } from "react";
import api from "../services/api";

function SuperAdminDashboard() {
  const [businesses, setBusinesses] = useState([]);
  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setError("");

        const [businessesResponse, usersResponse] =
          await Promise.all([
            api.get("/businesses"),
            api.get("/users"),
          ]);

        setBusinesses(businessesResponse.data.data);
        setUsers(usersResponse.data.data);
      } catch (error) {
        console.error(error);

        setError(
          error.response?.data?.message ||
            "Failed to load dashboard data.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const activeBusinesses = businesses.filter(
    (business) => business.active,
  );

  const inactiveBusinesses = businesses.filter(
    (business) => !business.active,
  );

  const activeUsers = users.filter(
    (user) => user.active,
  );

  const inactiveUsers = users.filter(
    (user) => !user.active,
  );

  if (loading) {
    return (
      <div className="flex min-h-full items-center justify-center p-8">
        <p className="text-sm text-slate-500">
          Loading dashboard...
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* =========================
          HEADER
      ========================= */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
          Superadmin Dashboard
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          System-wide overview of Mini DEPO.
        </p>
      </div>

      {/* =========================
          ERROR
      ========================= */}
      {error && (
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* =========================
          BUSINESS STATISTICS
      ========================= */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* TOTAL BUSINESSES */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Total Businesses
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            {businesses.length}
          </p>
        </div>

        {/* ACTIVE BUSINESSES */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Active Businesses
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            {activeBusinesses.length}
          </p>
        </div>

        {/* INACTIVE BUSINESSES */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Inactive Businesses
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            {inactiveBusinesses.length}
          </p>
        </div>
      </div>

      {/* =========================
          USER STATISTICS
      ========================= */}
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* TOTAL USERS */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Total Users
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            {users.length}
          </p>
        </div>

        {/* ACTIVE USERS */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Active Users
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            {activeUsers.length}
          </p>
        </div>

        {/* INACTIVE USERS */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Inactive Users
          </p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            {inactiveUsers.length}
          </p>
        </div>
      </div>

      {/* =========================
          RECENT BUSINESSES
      ========================= */}
      <div className="mt-8 rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-5">
          <h2 className="font-semibold text-slate-900">
            Businesses
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Businesses currently registered in Mini DEPO.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-6 py-4 font-medium text-slate-500">
                  Name
                </th>

                <th className="px-6 py-4 font-medium text-slate-500">
                  Location
                </th>

                <th className="px-6 py-4 font-medium text-slate-500">
                  Status
                </th>
              </tr>
            </thead>

            <tbody>
              {businesses.map((business) => (
                <tr
                  key={business._id}
                  className="border-b border-slate-100 last:border-0"
                >
                  <td className="px-6 py-4 font-medium text-slate-900">
                    {business.name}
                  </td>

                  <td className="px-6 py-4 text-slate-600">
                    {business.location}
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                        business.active
                          ? "bg-green-100 text-green-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {business.active
                        ? "Active"
                        : "Inactive"}
                    </span>
                  </td>
                </tr>
              ))}

              {businesses.length === 0 && (
                <tr>
                  <td
                    colSpan="3"
                    className="px-6 py-8 text-center text-slate-500"
                  >
                    No businesses found.
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

export default SuperAdminDashboard;