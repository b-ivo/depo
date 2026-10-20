import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getCrateLoanSummary } from "../../services/crateLoansApi";
import { useLanguage } from "../../i18n/context.js";

function OverdueLoansCard() {
  const { t } = useLanguage();
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const response = await getCrateLoanSummary();

        if (!cancelled) {
          setSummary(response.data);
        }
      } catch {
        // The badge must never break the dashboard.
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [t]);

  const overdueLoans = summary?.overdueLoans ?? 0;
  const overdueCrates = summary?.overdueCrates ?? 0;

  return (
    <div
      className={`mb-6 rounded-xl border p-5 shadow-sm ${
        overdueLoans > 0
          ? "border-red-300 bg-red-50"
          : "border-slate-200 bg-white"
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h2
            className={`text-base font-semibold ${
              overdueLoans > 0 ? "text-red-800" : "text-slate-900"
            }`}
          >
            {t("loans.summaryOverdueLoans")}
          </h2>

          <p
            className={`mt-1 text-sm ${
              overdueLoans > 0 ? "text-red-700" : "text-slate-500"
            }`}
          >
            {overdueLoans > 0
              ? t("loans.overdueAlert", {
                  count: overdueLoans,
                  days: summary?.overdueDays ?? 3,
                })
              : t("loans.noOverdue")}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span
            className={`rounded-full px-3 py-1.5 text-sm font-semibold ${
              overdueLoans > 0
                ? "bg-red-600 text-white"
                : "bg-emerald-100 text-emerald-800"
            }`}
          >
            {overdueCrates}
          </span>

          <Link
            to="/admin/loans"
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            {t("nav.crateLoans")}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default OverdueLoansCard;
