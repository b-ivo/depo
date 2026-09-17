import AppLayout from "../components/layout/AppLayout";

function AdminDashboard() {
  return (
    <AppLayout
      title="Admin Dashboard"
      description="Manage Mini DEPO system and users"
      activePath="/admin"
    >
      <div className="space-y-6">
        {/* Welcome */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">
            Welcome, Admin
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            This is the administration area of Mini DEPO.
          </p>
        </div>

        {/* Admin sections */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="font-semibold text-slate-900">
              Users
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Manage staff accounts and access.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="font-semibold text-slate-900">
              Beers
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Manage beer types and prices.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="font-semibold text-slate-900">
              Reports
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Review business records and activity.
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

export default AdminDashboard;