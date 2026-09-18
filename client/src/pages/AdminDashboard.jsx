import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AppLayout from "../components/layout/AppLayout";
import { getCurrentUser } from "../services/api";
import { getCurrentDay } from "../services/daysApi";
import { getBeers } from "../services/beersApi";
import { useLanguage } from "../i18n/context.js";

function StatCard({ label, value, sub, color = "slate" }) {
  const colors = {
    slate: "bg-slate-50 border-slate-200 text-slate-900",
    green: "bg-green-50 border-green-200 text-green-900",
    blue: "bg-blue-50 border-blue-200 text-blue-900",
    amber: "bg-amber-50 border-amber-200 text-amber-900",
  };
  return (
    <div className={`rounded-xl border p-5 ${colors[color]}`}>
      <p className="text-xs font-medium uppercase tracking-wide opacity-60">{label}</p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
      {sub && <p className="mt-1 text-xs opacity-60">{sub}</p>}
    </div>
  );
}

function AdminDashboard() {
  const { t } = useLanguage();
  const user = getCurrentUser();
  const [dayStatus, setDayStatus] = useState("loading");
  const [beerCount, setBeerCount] = useState(null);
  const [dayData, setDayData] = useState(null);

  useEffect(() => {
    // Load current day status
    getCurrentDay()
      .then((res) => {
        setDayStatus("open");
        setDayData(res.data);
      })
      .catch((err) => {
        if (err.code === "DAY_ALREADY_CLOSED") setDayStatus("closed");
        else if (err.code === "NO_OPEN_DAY") setDayStatus("not_started");
        else setDayStatus("error");
      });

    // Load beer count
    getBeers()
      .then((res) => setBeerCount((res.data || []).filter((b) => b.active).length))
      .catch(() => setBeerCount("—"));
  }, []);

  const dayStatusBadge = {
    open: { label: t("common.open"), cls: "bg-emerald-100 text-emerald-700" },
    closed: { label: t("common.closed"), cls: "bg-slate-100 text-slate-600" },
    not_started: { label: t("common.notStarted"), cls: "bg-amber-100 text-amber-700" },
    loading: { label: t("common.loading"), cls: "bg-slate-100 text-slate-500" },
    error: { label: t("common.unknown"), cls: "bg-red-100 text-red-600" },
  }[dayStatus];

  const quickActions = [
    { label: t("nav.dailyRecord"), icon: "📋", to: "/daily", desc: t("dashboard.dailyRecordDesc") },
    { label: t("nav.beerManagement"), icon: "🍺", to: "/beers", desc: t("dashboard.beerManagementDesc") },
    { label: t("nav.inventory"), icon: "📦", to: "/inventory", desc: t("dashboard.inventoryDesc") },
    { label: t("nav.history"), icon: "📅", to: "/history", desc: t("dashboard.historyDesc") },
  ];

  return (
    <AppLayout title={t("dashboard.adminTitle")} description={t("dashboard.adminDescription")} activePath="/admin">
      <div className="space-y-6">

        {/* Business Profile */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{t("dashboard.activeBusiness")}</p>
              <h2 className="mt-1 text-2xl font-bold text-slate-900">
                {user?.business?.name || "—"}
              </h2>
              {user?.business?.location && (
                <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                  <span>📍</span>
                  {user.business.location}
                </p>
              )}
            </div>

            <div className="text-right">
              <p className="text-xs text-slate-400">{t("auth.loggedInAs")}</p>
              <p className="text-sm font-semibold text-slate-900">{user?.username}</p>
              <span className="mt-1 inline-flex rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium capitalize text-blue-700">
                {t(`auth.role.${user?.role}`)}
              </span>
            </div>
          </div>
        </div>

        {/* KPI Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard
            label={t("dashboard.todaysDayStatus")}
            value={
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${dayStatusBadge.cls}`}>
                {dayStatusBadge.label}
              </span>
            }
          />
          <StatCard
            label={t("dashboard.activeBeers")}
            value={beerCount ?? "—"}
            sub={t("dashboard.inYourCatalogue")}
            color="blue"
          />
          {dayData && dayStatus === "open" ? (
            <StatCard
              label={t("dashboard.cratesSoldToday")}
              value={dayData.totals?.sold ?? "—"}
              sub={dayData.totals?.expectedSales
                ? t("dashboard.expectedInThousands", { value: (dayData.totals.expectedSales / 1000).toFixed(0) })
                : t("dashboard.eveningStockNotRecorded")}
              color="green"
            />
          ) : (
            <StatCard
              label={t("dashboard.cratesSoldToday")}
              value="—"
              sub={dayStatus === "closed" ? t("dashboard.dayIsClosed") : t("dashboard.dayNotOpen")}
            />
          )}
        </div>

        {/* Quick Actions */}
        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
            {t("dashboard.quickActions")}
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {quickActions.map((action) => (
              <Link
                key={action.to}
                to={action.to}
                className="group flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-900 hover:shadow-md"
              >
                <span className="text-2xl">{action.icon}</span>
                <p className="mt-3 font-semibold text-slate-900 group-hover:text-slate-900">
                  {action.label}
                </p>
                <p className="mt-1 text-xs text-slate-500">{action.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

export default AdminDashboard;