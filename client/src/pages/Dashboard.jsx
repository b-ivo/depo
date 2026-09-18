import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import AppLayout from "../components/layout/AppLayout";
import CurrentDayCard from "../components/dashboard/CurrentDayCard";
import DashboardSummary from "../components/dashboard/DashboardSummary";
import StockOverview from "../components/dashboard/StockOverview";

import { getCurrentDay } from "../services/daysApi";
import { useLanguage } from "../i18n/context.js";

function Dashboard() {
  const { t } = useLanguage();

  const [day, setDay] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [errorCode, setErrorCode] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setLoading(true);
        setError("");
        setErrorCode("");

        const response = await getCurrentDay();

        if (!cancelled) {
          setDay(response.data);
        }
      } catch (error) {
        if (!cancelled) {
          setDay(null);
          setError(error.message || t("dashboard.unableToLoad"));
          setErrorCode(error.code || "");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [reloadKey, t]);

  return (
    <AppLayout
      title={t("dashboard.title")}
      description={t("dashboard.description")}
      activePath="/"
    >
      {/* Loading */}
      {loading && (
        <div className="flex min-h-64 items-center justify-center rounded-xl border border-slate-200 bg-white">
          <p className="text-sm text-slate-500">{t("dashboard.loading")}</p>
        </div>
      )}

      {/* Today's business day has not been started */}
      {!loading && errorCode === "NO_OPEN_DAY" && (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">
            {t("dashboard.businessDayNotStarted")}
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
            {t("dashboard.startBeforeManaging")}
          </p>

          <Link
            to="/daily"
            className="mt-6 inline-block rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            {t("daily.startBusinessDay")}
          </Link>
        </div>
      )}

      {/* Today's business day has already been closed */}
      {!loading && errorCode === "DAY_ALREADY_CLOSED" && (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-700">
            ✓
          </div>

          <h2 className="mt-4 text-xl font-semibold text-slate-900">
            {t("dashboard.businessDayClosed")}
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
            {t("dashboard.alreadyCompleted")}
          </p>

          <Link
            to="/history"
            className="mt-6 inline-block rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            {t("dashboard.viewHistory")}
          </Link>
        </div>
      )}

      {/* Unexpected error */}
      {!loading &&
        error &&
        errorCode !== "NO_OPEN_DAY" &&
        errorCode !== "DAY_ALREADY_CLOSED" && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6">
            <h2 className="font-semibold text-red-800">
              {t("dashboard.unableToLoad")}
            </h2>

            <p className="mt-2 text-sm text-red-600">{error}</p>

            <button
              type="button"
              onClick={() => setReloadKey((key) => key + 1)}
              className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              {t("common.tryAgain")}
            </button>
          </div>
        )}

      {/* Open business day */}
      {!loading && !error && day && (
        <div className="space-y-6">
          {/* Current business day */}
          <CurrentDayCard day={day} />

          {/* Financial and sales summary */}
          <DashboardSummary day={day} />

          {/* Stock */}
          <StockOverview day={day} />

          {/* Quick actions */}
          <div>
            <h2 className="mb-3 text-lg font-semibold text-slate-900">
              {t("dashboard.quickActions")}
            </h2>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/daily"
                className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                {t("dashboard.manageTodaysRecord")}
              </Link>

              <Link
                to="/history"
                className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                {t("dashboard.viewHistory")}
              </Link>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}

export default Dashboard;
