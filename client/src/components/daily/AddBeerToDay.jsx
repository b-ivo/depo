import { useEffect, useState } from "react";
import { getBeers } from "../../services/beersApi";
import { addBeerToCurrentDay } from "../../services/daysApi";

function AddBeerToDay({ stock = [], onSuccess }) {
  const [beers, setBeers] = useState([]);
  const [selectedBeer, setSelectedBeer] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingBeers, setLoadingBeers] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function loadBeers() {
      try {
        setLoadingBeers(true);

        const response = await getBeers();

        setBeers(response.data || []);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoadingBeers(false);
      }
    }

    loadBeers();
  }, []);

  const existingBeerIds = new Set(stock.map((item) => item.beer?.toString()));

  const availableBeers = beers.filter((beer) => !existingBeerIds.has(beer._id));

  async function handleSubmit(event) {
    event.preventDefault();

    if (!selectedBeer) {
      setError("Please select a beer.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      await addBeerToCurrentDay(selectedBeer);

      setSelectedBeer("");
      setSuccess("Beer added to today's stock.");

      if (onSuccess) {
        await onSuccess();
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div>
        <h2 className="font-semibold text-slate-900">
          Add Beer to Today's Stock
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Use this when a new beer is introduced during the business day.
        </p>
      </div>

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          {success}
        </div>
      )}

      {availableBeers.length === 0 && !loadingBeers ? (
        <p className="mt-4 text-sm text-slate-500">
          All active beers are already part of today's stock.
        </p>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end"
        >
          <div className="flex-1">
            <label
              htmlFor="add-beer"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Beer
            </label>

            <select
              id="add-beer"
              value={selectedBeer}
              onChange={(event) => setSelectedBeer(event.target.value)}
              disabled={loadingBeers || loading}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-500"
            >
              <option value="">
                {loadingBeers ? "Loading beers..." : "Select a beer"}
              </option>

              {availableBeers.map((beer) => (
                <option key={beer._id} value={beer._id}>
                  {beer.name}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={!selectedBeer || loading || loadingBeers}
            className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Adding..." : "Add Beer"}
          </button>
        </form>
      )}
    </div>
  );
}

export default AddBeerToDay;
