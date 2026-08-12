import BeerStatusButton from "./BeerStatusButton";

function BeerTable({ beers = [], onAdd, onEdit, onStatusChanged }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 px-5 py-4">
        <div>
          <h2 className="font-semibold text-slate-900">Beers</h2>

          <p className="mt-1 text-sm text-slate-500">
            Products currently configured in the depot
          </p>
        </div>

        <button
          type="button"
          onClick={onAdd}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          Add Beer
        </button>
      </div>

      {beers.length === 0 ? (
        <div className="p-8 text-center">
          <p className="text-sm text-slate-500">
            No beers have been added yet.
          </p>

          <button
            type="button"
            onClick={onAdd}
            className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white"
          >
            Add Your First Beer
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-5 py-3 text-left font-medium text-slate-500">
                  Name
                </th>

                <th className="px-5 py-3 text-right font-medium text-slate-500">
                  Price
                </th>

                <th className="px-5 py-3 text-center font-medium text-slate-500">
                  Status
                </th>

                <th className="px-5 py-3 text-right font-medium text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {beers.map((beer) => (
                <tr key={beer._id}>
                  <td className="px-5 py-4 font-medium text-slate-900">
                    {beer.name}
                  </td>

                  <td className="px-5 py-4 text-right">
                    {beer.price?.toLocaleString()} RWF
                  </td>

                  <td className="px-5 py-4 text-center">
                    <span
                      className={
                        beer.active
                          ? "rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700"
                          : "rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500"
                      }
                    >
                      {beer.active ? "Active" : "Inactive"}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-4">
                      <button
                        type="button"
                        onClick={() => onEdit(beer)}
                        className="text-sm font-medium text-slate-700 hover:text-slate-900"
                      >
                        Edit
                      </button>

                      <BeerStatusButton
                        beer={beer}
                        onSuccess={onStatusChanged}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default BeerTable;
