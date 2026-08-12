import { useState } from "react";
import { updateFulfillment } from "../../services/daysApi";

function StockTable({ stock = [], onSuccess }) {
  const [editingBeer, setEditingBeer] = useState(null);
  const [quantity, setQuantity] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function startEditing(item) {
    setEditingBeer(item.beer);
    setQuantity(String(item.fulfilled ?? 0));
    setError("");
  }

  function cancelEditing() {
    setEditingBeer(null);
    setQuantity("");
    setError("");
  }

  async function saveFulfillment(beerId) {
    const value = Number(quantity);

    if (!Number.isInteger(value) || value < 0) {
      setError("Quantity must be a non-negative whole number.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      await updateFulfillment(beerId, value);

      setEditingBeer(null);
      setQuantity("");

      if (onSuccess) {
        await onSuccess();
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-5 py-4">
        <h2 className="font-semibold text-slate-900">Today's Stock</h2>

        <p className="mt-1 text-sm text-slate-500">
          Current stock position for each beer.
        </p>
      </div>

      {error && (
        <div className="border-b border-red-200 bg-red-50 px-5 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px] text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-5 py-3 text-left font-medium text-slate-500">
                Beer
              </th>

              <th className="px-5 py-3 text-right font-medium text-slate-500">
                Morning
              </th>

              <th className="px-5 py-3 text-right font-medium text-slate-500">
                Fulfilled
              </th>

              <th className="px-5 py-3 text-right font-medium text-slate-500">
                Available
              </th>

              <th className="px-5 py-3 text-right font-medium text-slate-500">
                Evening
              </th>

              <th className="px-5 py-3 text-right font-medium text-slate-500">
                Sold
              </th>

              <th className="px-5 py-3 text-right font-medium text-slate-500">
                Action
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {stock.map((item) => {
              const available = (item.morning ?? 0) + (item.fulfilled ?? 0);

              const isEditing = editingBeer === item.beer;

              // Once evening stock exists, fulfillment is locked.
              const canEdit = item.evening === null;

              return (
                <tr key={item.beer}>
                  <td className="px-5 py-4 font-medium text-slate-900">
                    {item.name}
                  </td>

                  <td className="px-5 py-4 text-right">{item.morning}</td>

                  <td className="px-5 py-4 text-right">
                    {isEditing ? (
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={quantity}
                        onChange={(event) => setQuantity(event.target.value)}
                        disabled={saving}
                        className="w-24 rounded-lg border border-slate-300 px-3 py-2 text-right outline-none focus:border-slate-500"
                      />
                    ) : (
                      item.fulfilled
                    )}
                  </td>

                  <td className="px-5 py-4 text-right font-medium">
                    {isEditing
                      ? (item.morning ?? 0) + Number(quantity || 0)
                      : available}
                  </td>

                  <td className="px-5 py-4 text-right">
                    {item.evening ?? "—"}
                  </td>

                  <td className="px-5 py-4 text-right">{item.sold ?? "—"}</td>

                  <td className="px-5 py-4 text-right">
                    {isEditing ? (
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => saveFulfillment(item.beer)}
                          disabled={saving}
                          className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white hover:bg-slate-800 disabled:opacity-50"
                        >
                          {saving ? "Saving..." : "Save"}
                        </button>

                        <button
                          type="button"
                          onClick={cancelEditing}
                          disabled={saving}
                          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : canEdit ? (
                      <button
                        type="button"
                        onClick={() => startEditing(item)}
                        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                      >
                        Edit
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400">Locked</span>
                    )}
                  </td>
                </tr>
              );
            })}

            {stock.length === 0 && (
              <tr>
                <td
                  colSpan="7"
                  className="px-5 py-10 text-center text-slate-500"
                >
                  No stock recorded.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default StockTable;
