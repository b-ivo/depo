import { useEffect, useState } from "react";
import { updateBeer } from "../../services/beersApi";

function BeerEditForm({ beer, onSuccess, onCancel }) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (beer) {
      setName(beer.name || "");
      setPrice(beer.price ?? "");
      setError("");
    }
  }, [beer]);

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");

    const trimmedName = name.trim();
    const numericPrice = Number(price);

    if (!trimmedName) {
      setError("Beer name is required.");
      return;
    }

    if (price === "" || !Number.isFinite(numericPrice) || numericPrice < 0) {
      setError("Price must be a valid non-negative number.");
      return;
    }

    try {
      setLoading(true);

      const response = await updateBeer(beer._id, {
        name: trimmedName,
        price: numericPrice,
      });

      onSuccess?.(response.data);
    } catch (error) {
      setError(error.message || "Failed to update beer.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-slate-900">Edit Beer</h2>

        <p className="mt-1 text-sm text-slate-500">
          Update the beer name or selling price.
        </p>
      </div>

      {error && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-3">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label
            htmlFor="edit-beer-name"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Beer Name
          </label>

          <input
            id="edit-beer-name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            disabled={loading}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
          />
        </div>

        <div>
          <label
            htmlFor="edit-beer-price"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Price per Crate
          </label>

          <input
            id="edit-beer-price"
            type="number"
            min="0"
            step="1"
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            disabled={loading}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:bg-slate-100"
          />
        </div>

        <div className="flex flex-wrap justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default BeerEditForm;
