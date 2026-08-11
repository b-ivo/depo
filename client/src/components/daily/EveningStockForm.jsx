import { useEffect, useState } from "react";
import { recordEveningStock } from "../../services/daysApi";

function EveningStockForm({ stock = [], onSuccess }) {
  const [eveningStock, setEveningStock] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const initialStock = {};

    stock.forEach((item) => {
      initialStock[item.beer] = item.evening ?? "";
    });

    setEveningStock(initialStock);
  }, [stock]);

  function handleChange(beerId, value) {
    setEveningStock((previous) => ({
      ...previous,
      [beerId]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    const payload = [];

    for (const item of stock) {
      const value = eveningStock[item.beer];

      if (value === "" || value === undefined) {
        setError(`Please enter evening stock for ${item.name}.`);
        return;
      }

      const evening = Number(value);

      if (!Number.isInteger(evening) || evening < 0) {
        setError(
          `Evening stock for ${item.name} must be a non-negative whole number.`,
        );
        return;
      }

      payload.push({
        beer: item.beer,
        evening,
      });
    }

    try {
      setLoading(true);

      await recordEveningStock(payload);

      setSuccess("Evening stock recorded successfully.");

      onSuccess?.();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  if (stock.length === 0) {
    return null;
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-5 py-4">
        <h2 className="font-semibold text-slate-900">Evening Stock</h2>

        <p className="mt-1 text-sm text-slate-500">
          Enter the crates remaining at the end of the day.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-5 py-3 text-left font-medium text-slate-500">
                  Beer
                </th>

                <th className="px-5 py-3 text-right font-medium text-slate-500">
                  Available
                </th>

                <th className="px-5 py-3 text-right font-medium text-slate-500">
                  Evening Stock
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {stock.map((item) => {
                const available = item.morning + item.fulfilled;

                return (
                  <tr key={item.beer}>
                    <td className="px-5 py-4 font-medium text-slate-900">
                      {item.name}
                    </td>

                    <td className="px-5 py-4 text-right">{available}</td>

                    <td className="px-5 py-4 text-right">
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={eveningStock[item.beer] ?? ""}
                        onChange={(event) =>
                          handleChange(item.beer, event.target.value)
                        }
                        className="w-28 rounded-lg border border-slate-300 px-3 py-2 text-right outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-200 p-5">
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Evening Stock"}
          </button>

          {error && (
            <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="mt-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
              {success}
            </div>
          )}
        </div>
      </form>
    </div>
  );
}

export default EveningStockForm;
