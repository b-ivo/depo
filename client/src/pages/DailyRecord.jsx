import { useState } from "react";
import AppLayout from "../components/layout/AppLayout";
import InitialStockSetup from "../components/daily/InitialStockSetup";
import StockTable from "../components/daily/StockTable";
import FulfillmentForm from "../components/daily/FulfillmentForm";
import EveningStockForm from "../components/daily/EveningStockForm";
import PaymentSection from "../components/daily/PaymentSection";
import CloseDaySection from "../components/daily/CloseDaySection";
import AddBeerToDay from "../components/daily/AddBeerToDay";

import { startBusinessDay } from "../services/daysApi";
import { useCurrentDay } from "../hooks/useCurrentDay";
import { useLanguage } from "../i18n/context.js";

function DailyRecord() {
  const { t } = useLanguage();
  const { day, loading, error, errorCode, refresh } = useCurrentDay();

  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState("");
  const [showInitialSetup, setShowInitialSetup] = useState(false);

  async function handleStartDay() {
    try {
      setStarting(true);
      setStartError("");
      await startBusinessDay();
      await refresh();
    } catch (err) {
      const msg = err.message || "";
      // Backend says initial stock hasn't been set up yet
      if (
        msg.toLowerCase().includes("initial stock") ||
        msg.toLowerCase().includes("no previous business day")
      ) {
        setShowInitialSetup(true);
      } else {
        setStartError(msg || t("daily.unableToLoad"));
      }
    } finally {
      setStarting(false);
    }
  }

  async function handleInitialStockSuccess() {
    setShowInitialSetup(false);
    await refresh();
  }

  // Loading
  if (loading) {
    return (
      <AppLayout title={t("daily.title")} description={t("daily.description")} activePath="/daily">
        <div className="flex min-h-64 items-center justify-center">
          <p className="text-sm text-slate-500">{t("daily.loadingRecord")}</p>
        </div>
      </AppLayout>
    );
  }

  // Initial stock setup flow
  if (showInitialSetup) {
    return (
      <AppLayout title={t("daily.title")} description={t("daily.description")} activePath="/daily">
        <InitialStockSetup onSuccess={handleInitialStockSuccess} />
      </AppLayout>
    );
  }

  // Already closed
  if (!day && errorCode === "DAY_ALREADY_CLOSED") {
    return (
      <AppLayout title={t("daily.title")} description={t("daily.description")} activePath="/daily">
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <span className="text-xl text-green-700">âœ“</span>
          </div>
          <h2 className="mt-4 text-xl font-semibold text-slate-900">{t("dashboard.businessDayClosed")}</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
            {t("daily.alreadyClosedDesc")}
          </p>
          <a
            href="/history"
            className="mt-6 inline-block rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            {t("dashboard.viewHistory")}
          </a>
        </div>
      </AppLayout>
    );
  }

  // Not started
  if (!day && errorCode === "NO_OPEN_DAY") {
    return (
      <AppLayout title={t("daily.title")} description={t("daily.description")} activePath="/daily">
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
            <span className="text-xl">+</span>
          </div>
          <h2 className="mt-4 text-xl font-semibold text-slate-900">{t("dashboard.businessDayNotStarted")}</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
            {t("daily.notStartedDesc")}
          </p>

          {startError && (
            <div className="mx-auto mt-4 max-w-md rounded-lg border border-red-200 bg-red-50 p-4 text-left">
              <p className="text-sm text-red-600">{startError}</p>
            </div>
          )}

          <button
            type="button"
            onClick={handleStartDay}
            disabled={starting}
            className="mt-6 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {starting ? t("daily.startingBusinessDay") : t("daily.startBusinessDay")}
          </button>
        </div>
      </AppLayout>
    );
  }

  // Unexpected error
  if (error) {
    return (
      <AppLayout title={t("daily.title")} description={t("daily.description")} activePath="/daily">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6">
          <h2 className="font-semibold text-red-800">{t("daily.unableToLoad")}</h2>
          <p className="mt-2 text-sm text-red-600">{error}</p>
          <button
            type="button"
            onClick={refresh}
            className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            {t("common.tryAgain")}
          </button>
        </div>
      </AppLayout>
    );
  }

  if (!day) return null;

  return (
    <AppLayout title={t("daily.title")} description={t("daily.description")} activePath="/daily">
      <div className="space-y-6">
        {/* Date header */}
        <div className="rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
          <p className="text-sm text-slate-500">{t("common.businessDay")}</p>
          <h2 className="mt-1 text-lg font-bold text-slate-900">
            {new Date(day.date).toLocaleDateString("en-RW", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </h2>
          <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            {t("common.open")}
          </span>
        </div>

        {/* Stock table */}
        <StockTable stock={day.stock} onSuccess={refresh} />

        {/* Fulfillment & add beer row */}
        <div className="grid gap-6 lg:grid-cols-2">
          <FulfillmentForm stock={day.stock} onSuccess={refresh} />
          <AddBeerToDay onSuccess={refresh} />
        </div>

        {/* Evening stock */}
        <EveningStockForm stock={day.stock} onSuccess={refresh} />

        {/* Payments */}
        <PaymentSection day={day} onSuccess={refresh} />

        {/* Close day */}
        <CloseDaySection day={day} onSuccess={refresh} />
      </div>
    </AppLayout>
  );
}

export default DailyRecord;
