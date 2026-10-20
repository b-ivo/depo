import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { getCrateLoanSummary } from "../../services/crateLoansApi";
import { useLanguage } from "../../i18n/context.js";

/*
  Empty crates of the depot: how many are available, and how many
  borrowers are still holding.
*/
function EmptyCratesCard() {
  const { t } = useLanguage();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const response = await getCrateLoanSummary();

        if (!cancelled) {
          setSummary(response.data);
        }
      } catch {
        // The card must never break the dashboard.
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
  }, [t]);

  const inDepot = summary?.emptyCratesInDepot ?? 0;
  const outWithBorrowers = summary?.outstandingCrates ?? 0;
  const openLoans = summary?.outstandingLoans ?? 0;
  const perBeer = summary?.perBeer ?? [];

  const total = inDepot + outWithBorrowers;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            {t("loans.cratesCardTitle")}
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {t("loans.cratesCardDesc")}
          </p>
        </div>

        <Link
          to="/admin/loans"
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          {t("nav.crateLoans")}
        </Link>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <Metric
          label={t("loans.cratesTotal")}
          value={loading ? "—" : total}
          tone="text-slate-900"
        />

        <Metric
          label={t("loans.summaryEmptyCrates")}
          value={loading ? "—" : inDepot}
          tone="text-emerald-700"
        />

        <Metric
          label={t("loans.cratesWithBorrowers")}
          value={loading ? "—" : outWithBorrowers}
          tone={outWithBorrowers > 0 ? "text-amber-700" : "text-slate-900"}
          hint={
            openLoans > 0
              ? t("loans.cratesOpenLoans", { count: openLoans })
              : null
          }
        />
      </div>

      {perBeer.length > 0 ? (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[420px] text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="py-2 text-left font-medium text-slate-500">
                  {t("loans.beerType")}
                </th>

                <th className="py-2 text-right font-medium text-slate-500">
                  {t("loans.summaryEmptyCrates")}
                </th>

                <th className="py-2 text-right font-medium text-slate-500">
                  {t("loans.cratesWithBorrowers")}
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-50">
              {perBeer.map((item) => (
                <tr key={String(item.beer)}>
                  <td className="py-2 font-medium text-slate-900">
                    {item.name}
                  </td>

                  <td className="py-2 text-right text-emerald-700">
                    {item.inDepot}
                  </td>

                  <td
                    className={`py-2 text-right font-medium ${
                      item.outWithBorrowers > 0
                        ? "text-amber-700"
                        : "text-slate-400"
                    }`}
                  >
                    {item.outWithBorrowers || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}

function Metric({ label, value, tone, hint }) {
  return (
    <div className="rounded-lg bg-slate-50 p-4">
      <p className="text-sm text-slate-500">{label}</p>

      <p className={`mt-2 text-lg font-bold ${tone}`}>{value}</p>

      {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
    </div>
  );
}

export default EmptyCratesCard;
