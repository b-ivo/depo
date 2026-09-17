import { useEffect, useState } from "react";
import { getBeers } from "../../services/beersApi";
import { createInitialStock } from "../../services/initialStockApi";

function InitialStockSetup({ onSuccess }) {
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
        // Default all quantities to 0
        const initial = {};
        activeBeers.forEach((b) => { initial[b._id] = ""; });
        setQuantities(initial);
      } catch (err) {
        setError("Failed to load beers: " + err.message);
      } finally {
        setBeersLoading(false);
      }
    };
    load();
  }, []);

  function handleQuantityChange(beerId, value) {
    setQuantities((prev) => ({ ...prev, [beerId]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    // Validate all quantities
    for (const beer of beers) {
      const val = quantities[beer._id];
      const num = Number(val);
      if (val === "" || !Number.isInteger(num) || num < 0) {
        setError(`Please enter a valid non-negative quantity for ${beer.name}.`);
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
      setError(err.message || "Failed to create initial stock.");
    } finally {
      setLoading(false);
    }
  }

  if (beersLoading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm text-slate-500">Loading beers...</p>
      </div>
    );
  }

  if (beers.length === 0) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-8 text-center shadow-sm">
        <h2 className="text-lg font-semibold text-amber-900">No Active Beers</h2>
        <p className="mt-2 text-sm text-amber-700">
          You need to add active beers before setting up initial stock.
        </p>
        <a
          href="/beers"
          className="mt-6 inline-block rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          Go to Beer Management
        </a>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-6 py-5">
        <h2 className="text-xl font-semibold text-slate-900">Set Up Initial Stock</h2>
        <p className="mt-1 text-sm text-slate-500">
          Enter the morning stock quantities for your first business day.
          This only needs to be done once.
        </p>
      </div>

      {error && (
        <div className="border-b border-red-200 bg-red-50 px-6 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Date selector */}
        <div>
          <label
            htmlFor="initial-date"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Start Date
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

        {/* Beer quantities */}
        <div>
          <h3 className="mb-3 text-sm font-semibold text-slate-700 uppercase tracking-wide">
            Morning Quantities (crates)
          </h3>
          <div className="space-y-3">
            {beers.map((beer) => (
              <div key={beer._id} className="flex items-center gap-4">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-900">{beer.name}</p>
                  <p className="text-xs text-slate-500">
                    {(beer.price || 0).toLocaleString()} RWF / crate
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
          {loading ? "Creating Initial Stock..." : "Create Initial Business Day"}
        </button>
      </form>
    </div>
  );
}

export default InitialStockSetup;
