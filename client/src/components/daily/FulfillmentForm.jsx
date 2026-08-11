import { useState } from "react";
import { recordFulfillment } from "../../services/daysApi";

function FulfillmentForm({ stock = [], onSuccess }) {
  const [beer, setBeer] = useState("");
  const [quantity, setQuantity] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!beer) {
      setError("Please select a beer.");
      return;
    }

    if (quantity === "") {
      setError("Please enter a quantity.");
      return;
    }

    const parsedQuantity = Number(quantity);

    if (!Number.isInteger(parsedQuantity) || parsedQuantity <= 0) {
      setError("Quantity must be a positive whole number.");
      return;
    }

    try {
      setLoading(true);

      await recordFulfillment(beer, parsedQuantity);

      setSuccess("Fulfillment recorded successfully.");

      setQuantity("");

      onSuccess?.();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <h2 className="font-semibold text-slate-900">Fulfill Stock</h2>

        <p className="mt-1 text-sm text-slate-500">
          Record additional crates brought into today's stock.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid gap-4 sm:grid-cols-[1fr_180px_auto]"
      >
        <div>
          <label
            htmlFor="fulfillment-beer"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Beer
          </label>

          <select
            id="fulfillment-beer"
            value={beer}
            onChange={(event) => setBeer(event.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          >
            <option value="">Select beer</option>

            {stock.map((item) => (
              <option key={item.beer} value={item.beer}>
                {item.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="fulfillment-quantity"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Quantity
          </label>

          <input
            id="fulfillment-quantity"
            type="number"
            min="1"
            step="1"
            value={quantity}
            onChange={(event) => setQuantity(event.target.value)}
            placeholder="0"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          />
        </div>

        <div className="flex items-end">
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            {loading ? "Saving..." : "Add Stock"}
          </button>
        </div>
      </form>

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
  );
}

export default FulfillmentForm;
