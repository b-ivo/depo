function InventoryFilters({
  beers = [],
  selectedBeer,
  selectedDate,
  onBeerChange,
  onDateChange,
  onClear,
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h2 className="font-semibold text-slate-900">Filter Inventory</h2>

        <p className="mt-1 text-sm text-slate-500">
          View movements for a specific beer or day.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label
            htmlFor="inventory-beer"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Beer
          </label>

          <select
            id="inventory-beer"
            value={selectedBeer}
            onChange={(event) => onBeerChange(event.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          >
            <option value="">All beers</option>

            {beers.map((beer) => (
              <option key={beer._id} value={beer._id}>
                {beer.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="inventory-date"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Date
          </label>

          <input
            id="inventory-date"
            type="date"
            value={selectedDate}
            onChange={(event) => onDateChange(event.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          />
        </div>

        <div className="flex items-end">
          <button
            type="button"
            onClick={onClear}
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Clear Filters
          </button>
        </div>
      </div>
    </div>
  );
}

export default InventoryFilters;
