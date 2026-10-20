import { useState } from "react";
import { recordEmptyCrateCount } from "../../services/crateLoansApi";
import { useLanguage } from "../../i18n/context.js";

function formatDate(value) {
  if (!value) {
    return null;
  }

  return new Date(value).toLocaleDateString();
}

function EmptyCrateStock({ emptyCrates, beers, onCounted }) {
  const { t } = useLanguage();
  const [showCountForm, setShowCountForm] = useState(false);
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const total = emptyCrates.reduce((sum, item) => sum + item.quantity, 0);

  function updateCount(beer, value) {
    setCounts((current) => ({ ...current, [beer]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");

    const lines = beers
      .filter((beer) => counts[beer._id] !== undefined && counts[beer._id] !== "")
      .map((beer) => ({
        beer: beer._id,
        quantity: Number(counts[beer._id]),
      }));

    if (lines.length === 0) {
      setError(t("loans.cratesInvalid"));
      return;
    }

    if (lines.some((line) => !Number.isInteger(line.quantity) || line.quantity < 0)) {
      setError(t("loans.cratesInvalid"));
      return;
    }

    try {
      setLoading(true);

      const response = await recordEmptyCrateCount({ lines });

      setShowCountForm(false);
      setCounts({});

      onCounted?.(response.data);
    } catch (submitError) {
      setError(submitError.message || t("loans.countFailed"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
        <div>
          <h2 className="font-semibold text-slate-900">
            {t("loans.emptyCratesTitle")}
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {t("loans.emptyCratesDesc")}
          </p>
        </div>

        <div className="text-right">
          <p className="text-xs text-slate-500">
            {t("loans.summaryEmptyCrates")}
          </p>

          <p className="text-lg font-semibold text-slate-900">{total}</p>
        </div>
      </div>

      {error && (
        <div className="border-b border-red-200 bg-red-50 px-5 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {emptyCrates.length === 0 ? (
        <div className="px-5 py-10 text-center">
          <p className="text-sm text-slate-500">{t("loans.noEmptyCrates")}</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[420px] text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-5 py-3 text-left font-medium text-slate-500">
                  {t("loans.beer")}
                </th>

                <th className="px-5 py-3 text-right font-medium text-slate-500">
                  {t("loans.available")}
                </th>

                <th className="px-5 py-3 text-right font-medium text-slate-500">
                  {t("loans.lastCounted")}
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {emptyCrates.map((item) => (
                <tr key={item._id}>
                  <td className="px-5 py-4 font-medium text-slate-900">
                    {item.name}
                  </td>

                  <td className="px-5 py-4 text-right">{item.quantity}</td>

                  <td className="px-5 py-4 text-right text-slate-500">
                    {formatDate(item.countedOn) ?? t("loans.neverCounted")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="border-t border-slate-200 px-5 py-4">
        {!showCountForm ? (
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => setShowCountForm(true)}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              {t("loans.countTitle")}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-sm text-slate-500">{t("loans.countDesc")}</p>

            <div className="space-y-3">
              {beers.map((beer) => {
                const current = emptyCrates.find(
                  (item) => item.beer === beer._id,
                );

                return (
                  <div
                    key={beer._id}
                    className="grid gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 sm:grid-cols-[1fr_10rem] sm:items-center"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-900">
                        {beer.name}
                      </p>

                      <p className="text-xs text-slate-500">
                        {t("loans.available")}: {current?.quantity ?? 0}
                      </p>
                    </div>

                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={
                        counts[beer._id] ??
                        (current ? String(current.quantity) : "")
                      }
                      onChange={(event) =>
                        updateCount(beer._id, event.target.value)
                      }
                      disabled={loading}
                      aria-label={`${beer.name} ${t("loans.countEmptyCrates")}`}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
                    />
                  </div>
                );
              })}
            </div>

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowCountForm(false);
                  setCounts({});
                  setError("");
                }}
                disabled={loading}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                {t("common.cancel")}
              </button>

              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? t("loans.saving") : t("loans.saveCount")}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default EmptyCrateStock;
