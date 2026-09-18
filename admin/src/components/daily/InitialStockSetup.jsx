import { useEffect, useState } from "react";
import { getBeers } from "../../services/beersApi";
import { createInitialStock } from "../../services/initialStockApi";
import { useLanguage } from "../../i18n/context.js";

function InitialStockSetup({ onSuccess }) {
  const { t } = useLanguage();
  const [beers, setBeers] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [loading, setLoading] = useState(false);
  const [beersLoading, setBeersLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getBeers();
        const activeBeers = (res.data || []).filter((b) => b.active);
        setBeers(activeBeers);
        const initial = {};
        activeBeers.forEach((b) => { initial[b._id] = ""; });
        setQuantities(initial);
      } catch (err) {
        setError(t("daily.initStockFailedToLoadBeers") + err.message);
      } finally {
        setBeersLoading(false);
      }
    };
    load();
  }, [t]);

  function handleQuantityChange(beerId, value) {
    setQuantities((prev) => ({ ...prev, [beerId]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    for (const beer of beers) {
      const val = quantities[beer._id];
      const num = Number(val);
      if (val === "" || !Number.isInteger(num) || num < 0) {
        setError(t("daily.initStockEnterValidQuantity", { name: beer.name }));
        return;
      }
    }

    const stock = beers.map((b) => ({
      beer: b._id,
      quantity: Number(quantities[b._id]),
    }));

    try {
      setLoading(true);
      await createInitialStock(date, stock);
      onSuccess?.();
    } catch (err) {
      setError(err.message || t("daily.initStockFailedToCreate"));
    } finally {
      setLoading(false);
    }
  }

  if (beersLoading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm text-slate-500">{t("daily.initStockLoadingBeers")}</p>
      </div>
    );
  }

  if (beers.length === 0) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-8 text-center shadow-sm">
        <h2 className="text-lg font-semibold text-amber-900">{t("daily.initStockNoActiveBeers")}</h2>
        <p className="mt-2 text-sm text-amber-700">
          {t("daily.initStockAddActiveFirst")}
        </p>
        <a
          href="/admin/beers"
          className="mt-6 inline-block rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          {t("daily.initStockGoToBeers")}
        </a>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-6 py-5">
        <h2 className="text-xl font-semibold text-slate-900">{t("daily.initStockTitle")}</h2>
        <p className="mt-1 text-sm text-slate-500">
          {t("daily.initStockDesc")}
          This only needs to be done once.
        </p>
      </div>

      {error && (
        <div className="border-b border-red-200 bg-red-50 px-6 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div>
          <label
            htmlFor="initial-date"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            {t("daily.initStockStartDate")}
          </label>
          <input
            id="initial-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            disabled={loading}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
          />
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold text-slate-700 uppercase tracking-wide">
            {t("daily.initStockMorningQuantities")}
          </h3>
          <div className="space-y-3">
            {beers.map((beer) => (
              <div key={beer._id} className="flex items-center gap-4">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-900">{beer.name}</p>
                  <p className="text-xs text-slate-500">
                    {t("daily.initStockPerCrate", { value: (beer.price || 0).toLocaleString() })}
                  </p>
                </div>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={quantities[beer._id] ?? ""}
                  onChange={(e) => handleQuantityChange(beer._id, e.target.value)}
                  placeholder="0"
                  disabled={loading}
                  className="w-28 rounded-lg border border-slate-300 px-3 py-2 text-right text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
                />
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? t("daily.initStockCreating") : t("daily.initStockCreateDay")}
        </button>
      </form>
    </div>
  );
}

export default InitialStockSetup;